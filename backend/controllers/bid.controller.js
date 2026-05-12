/**
 * Bid Controller
 * Place bids, retrieve bid history, auto-bid logic
 */

const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  broadcastNewBid,
  notifyOutbid,
  notifyWinner,
  broadcastAuctionEnded,
} = require("../utils/socket");
const { sendOutbidEmail, sendAuctionWonEmail } = require("../utils/sendEmail");

// ── Place a Bid ────────────────────────────────────────────────────────────────
const placeBid = async (req, res, next) => {
  try {
    const { auctionId, amount } = req.body;
    const io = req.app.get("io");

    // Fetch auction
    const auction = await Auction.findById(auctionId).populate(
      "currentWinner",
      "name",
    );

    if (!auction || auction.isRemoved) {
      return res
        .status(404)
        .json({ success: false, message: "Auction not found." });
    }

    const now = new Date();

    // Check auction is active
    if (auction.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: `Auction is ${auction.status}.` });
    }

    // Check timing
    if (now < auction.startTime) {
      return res
        .status(400)
        .json({ success: false, message: "Auction has not started yet." });
    }
    if (now > auction.endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Auction has already ended." });
    }

    // Can't bid on your own auction
    if (auction.seller.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot bid on your own auction.",
        });
    }

    // Validate bid amount
    const minBid = auction.currentBid + auction.bidIncrement;
    if (Number(amount) < minBid) {
      return res.status(400).json({
        success: false,
        message: `Minimum bid is ₹${minBid.toLocaleString()}`,
        minBid,
      });
    }

    const previousWinner = auction.currentWinner;

    // Save bid record
    const bid = await Bid.create({
      auction: auctionId,
      bidder: req.user._id,
      amount: Number(amount),
      ipAddress: req.ip,
    });

    // Mark previous winning bid as not winning
    if (previousWinner) {
      await Bid.updateMany(
        { auction: auctionId, isWinning: true },
        { isWinning: false },
      );
    }
    bid.isWinning = true;
    await bid.save();

    // Update auction
    auction.currentBid = Number(amount);
    auction.currentWinner = req.user._id;
    auction.totalBids += 1;
    await auction.save();

    // Increment user's total bids
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalBids: 1 } });

    // Populate bidder for broadcast
    await bid.populate("bidder", "name profileImage");

    // ── Broadcast new bid to auction room ────────────────────────────────────
    const bidData = {
      _id: bid._id,
      amount: bid.amount,
      bidder: bid.bidder,
      auctionId,
      createdAt: bid.createdAt,
      currentBid: auction.currentBid,
      totalBids: auction.totalBids,
    };
    broadcastNewBid(io, auctionId, bidData);

    // ── Notify previous winner that they were outbid ──────────────────────────
    if (
      previousWinner &&
      previousWinner._id.toString() !== req.user._id.toString()
    ) {
      notifyOutbid(
        io,
        previousWinner._id.toString(),
        auctionId,
        Number(amount),
      );

      // Save outbid notification to DB
      await Notification.create({
        recipient: previousWinner._id,
        type: "outbid",
        title: "⚡ You have been outbid!",
        message: `${req.user.name} placed a bid of ₹${Number(amount).toLocaleString()} on "${auction.title}"`,
        auction: auctionId,
      });

      // Send outbid email
      const prevWinnerUser = await User.findById(previousWinner._id);
      if (prevWinnerUser && prevWinnerUser.email) {
        await sendOutbidEmail(
          prevWinnerUser.email,
          prevWinnerUser.name,
          auction.title,
          Number(amount),
        );
      }
    }

    // ── Check for auto-bid from other users ──────────────────────────────────
    await processAutoBids(io, auction, req.user._id);

    res.status(201).json({
      success: true,
      message: "Bid placed successfully!",
      bid: bidData,
    });
  } catch (error) {
    next(error);
  }
};

// ── Auto-Bid Processor ─────────────────────────────────────────────────────────
const processAutoBids = async (io, auction, currentBidderId) => {
  try {
    const users = await User.find({
      "autoBidSettings.auctionId": auction._id,
      "autoBidSettings.isActive": true,
      _id: { $ne: currentBidderId }, // Exclude current bidder
    });

    for (const user of users) {
      const setting = user.autoBidSettings.find(
        (s) => s.auctionId.toString() === auction._id.toString() && s.isActive,
      );

      if (!setting) continue;

      const nextBidAmount = auction.currentBid + auction.bidIncrement;
      if (setting.maxBid >= nextBidAmount) {
        // Place auto-bid
        const autoBid = await Bid.create({
          auction: auction._id,
          bidder: user._id,
          amount: nextBidAmount,
          isAutoBid: true,
        });

        await Bid.updateMany(
          { auction: auction._id, isWinning: true },
          { isWinning: false },
        );
        autoBid.isWinning = true;
        await autoBid.save();

        const prevWinner = auction.currentWinner;
        auction.currentBid = nextBidAmount;
        auction.currentWinner = user._id;
        auction.totalBids += 1;
        await auction.save();

        await autoBid.populate("bidder", "name profileImage");

        const bidData = {
          _id: autoBid._id,
          amount: autoBid.amount,
          bidder: autoBid.bidder,
          auctionId: auction._id,
          createdAt: autoBid.createdAt,
          currentBid: auction.currentBid,
          totalBids: auction.totalBids,
          isAutoBid: true,
        };
        broadcastNewBid(io, auction._id.toString(), bidData);

        // Notify outbid
        if (prevWinner && prevWinner.toString() !== user._id.toString()) {
          notifyOutbid(
            io,
            prevWinner.toString(),
            auction._id.toString(),
            nextBidAmount,
          );
        }
      }
    }
  } catch (err) {
    console.error("Auto-bid error:", err);
  }
};

// ── Get Bid History for an Auction ─────────────────────────────────────────────
const getBidHistory = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Bid.countDocuments({ auction: auctionId });

    const bids = await Bid.find({ auction: auctionId })
      .populate("bidder", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      bids,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get My Active Bids ─────────────────────────────────────────────────────────
const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({
        path: "auction",
        select: "title images currentBid status endTime winner",
        populate: [
          { path: "seller", select: "name" },
          { path: "winner", select: "name profileImage" }
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bids });
  } catch (error) {
    next(error);
  }
};

// ── Set Auto-Bid ───────────────────────────────────────────────────────────────
const setAutoBid = async (req, res, next) => {
  try {
    const { auctionId, maxBid } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Auction is not active." });
    }

    if (Number(maxBid) <= auction.currentBid) {
      return res.status(400).json({
        success: false,
        message: `Max bid must be greater than current bid of ₹${auction.currentBid}`,
      });
    }

    const user = await User.findById(req.user._id);
    const existingIdx = user.autoBidSettings.findIndex(
      (s) => s.auctionId.toString() === auctionId,
    );

    if (existingIdx !== -1) {
      user.autoBidSettings[existingIdx].maxBid = Number(maxBid);
      user.autoBidSettings[existingIdx].isActive = true;
    } else {
      user.autoBidSettings.push({
        auctionId,
        maxBid: Number(maxBid),
        isActive: true,
      });
    }

    await user.save();
    res.json({ success: true, message: "Auto-bid configured successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeBid, getBidHistory, getMyBids, setAutoBid };
