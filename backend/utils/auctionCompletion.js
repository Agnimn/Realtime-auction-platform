/**
 * Auction Completion Handler
 * Handles auction end logic and sends winner notifications
 */

const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendAuctionWonEmail } = require("./sendEmail");

/**
 * Mark auction as completed and notify winner
 */
const completeAuction = async (io, auctionId) => {
  try {
    const auction = await Auction.findById(auctionId)
      .populate("currentWinner", "name email profileImage")
      .populate("seller", "name email profileImage");

    if (!auction || auction.isRemoved) {
      console.log(`❌ Auction ${auctionId} not found`);
      return false;
    }

    // Check if auction should be completed
    const now = new Date();
    if (now < auction.endTime || auction.status === "ended") {
      return false; // Not yet ended or already completed
    }

    // Determine winner (highest bid). Tie-breaker: latest bid.
    const topBids = await Bid.find({ auction: auctionId })
      .sort({ amount: -1, createdAt: -1 })
      .limit(1)
      .populate("bidder", "name email profileImage");

    const topBid = topBids.length > 0 ? topBids[0] : null;
    const winnerUser = topBid?.bidder || auction.currentWinner;
    const winningAmount = topBid?.amount ?? auction.currentBid;

    // Update auction status — use 'ended' to match model enum
    auction.status = "ended";
    auction.winner = winnerUser?._id || null;
    auction.winningBid = winningAmount;
    await auction.save();

    // Socket notification — broadcast winner to ALL viewers in the room
    if (io) {
      const winnerData = {
        auctionId: auction._id,
        winningAmount,
        winner: winnerUser
          ? {
              _id: winnerUser._id,
              name: winnerUser.name,
              profileImage: winnerUser.profileImage,
            }
          : null,
      };

      io.to(`auction:${auction._id}`).emit("auctionEnded", winnerData);

      // Winner in personal notification room
      if (winnerUser) {
        io.to(`user:${winnerUser._id}`).emit("notification", {
          type: "auction_won",
          title: "🏆 You won the auction!",
          message: `Congratulations! You won "${auction.title}" with a bid of $${winningAmount.toLocaleString()}`,
          auctionId: auction._id,
        });
      }
    }

    if (!winnerUser) return true; // Auction ended with no bids

    // Save DB notification
    await Notification.create({
      recipient: winnerUser._id,
      type: "auction_won",
      title: "🏆 You won the auction!",
      message: `Congratulations! You won "${auction.title}" with a bid of $${winningAmount.toLocaleString()}`,
      auction: auctionId,
    });

    // Send email notification
    if (winnerUser.email) {
      await sendAuctionWonEmail(
        winnerUser.email,
        winnerUser.name,
        auction.title,
        winningAmount,
      );
    }

    console.log(
      `✅ Auction ${auctionId} ended. Winner: ${winnerUser?.name}`,
    );
    return true;
  } catch (error) {
    console.error(`❌ Error completing auction ${auctionId}:`, error);
    return false;
  }
};

module.exports = { completeAuction };
