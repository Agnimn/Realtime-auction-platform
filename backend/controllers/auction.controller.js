/**
 * Auction Controller
 * CRUD + search/filter/sort for auctions
 */

const Auction = require("../models/Auction");
const User = require("../models/User");
const Bid = require("../models/Bid");
const Notification = require("../models/Notification");
const cloudinary = require("../utils/cloudinary");
const { completeAuction } = require("../utils/auctionCompletion");
// ── Create Auction ────────────────────────────────────────────────────────────
const createAuction = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      startingBid,
      bidIncrement,
      startTime,
      endTime,
    } = req.body;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    // Process uploaded images
    const images = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    const now = new Date();
    const status =
      now > start || Math.abs(now - start) < 1000 ? "active" : "upcoming";

    const auction = await Auction.create({
      title,
      description,
      category,
      images,
      seller: req.user._id,
      startingBid: Number(startingBid),
      bidIncrement: Number(bidIncrement),
      currentBid: Number(startingBid),
      startTime: start,
      endTime: end,
      status,
    });

    // Increment seller's auctionsCreated count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { auctionsCreated: 1 },
    });

    // Populate seller for response
    await auction.populate("seller", "name profileImage");

    res.status(201).json({
      success: true,
      message: "Auction created successfully!",
      auction,
    });
  } catch (error) {
    next(error);
  }
};

// ── Get All Auctions (with filters, search, sort, pagination) ────────────────
const getAuctions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = "active",
      search,
      sort = "latest",
      minBid,
      maxBid,
    } = req.query;

    const query = { isRemoved: false };

    // Status filter
    if (status && status !== "all") query.status = status;

    // Category filter
    if (category && category !== "all") query.category = category;

    // Price range
    if (minBid)
      query.currentBid = { ...query.currentBid, $gte: Number(minBid) };
    if (maxBid)
      query.currentBid = { ...query.currentBid, $lte: Number(maxBid) };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    const sortOptions = {
      latest: { createdAt: -1 },
      ending_soon: { endTime: 1 },
      highest_bid: { currentBid: -1 },
      lowest_bid: { currentBid: 1 },
      most_bids: { totalBids: -1 },
    };
    const sortQuery = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Auction.countDocuments(query);

    const auctions = await Auction.find(query)
      .populate("seller", "name profileImage")
      .populate("currentWinner", "name")
      .populate("winner", "name profileImage")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      auctions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Auction ────────────────────────────────────────────────────────
const getAuctionById = async (req, res, next) => {
  try {
    let auction = await Auction.findById(req.params.id)
      .populate("seller", "name email profileImage auctionsCreated")
      .populate("currentWinner", "name profileImage")
      .populate("winner", "name profileImage");

    if (!auction || auction.isRemoved) {
      return res
        .status(404)
        .json({ success: false, message: "Auction not found." });
    }

    // Check if auction has ended and complete it if needed
    const now = new Date();
    if (now > auction.endTime && auction.status !== "ended") {
      const io = req.app.get("io");
      await completeAuction(io, auction._id);

      // Reload auction after completion (ensures winner is populated for UI)
      auction = await Auction.findById(req.params.id)
        .populate("seller", "name email profileImage auctionsCreated")
        .populate("currentWinner", "name profileImage")
        .populate("winner", "name profileImage");
    }

    // Increment view count
    await Auction.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get bid history (last 20)
    const bids = await Bid.find({ auction: req.params.id })
      .populate("bidder", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, auction, bids });
  } catch (error) {
    next(error);
  }
};

// ── Update Auction ────────────────────────────────────────────────────────────
const updateAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Auction not found." });
    }

    // Only seller or admin can update
    if (
      auction.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Can't edit an active auction with bids
    if (auction.status === "active" && auction.totalBids > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit an auction with existing bids.",
      });
    }

    const {
      title,
      description,
      category,
      startingBid,
      bidIncrement,
      startTime,
      endTime,
    } = req.body;

    if (title) auction.title = title;
    if (description) auction.description = description;
    if (category) auction.category = category;
    if (startingBid) {
      auction.startingBid = Number(startingBid);
      auction.currentBid = Number(startingBid);
    }
    if (bidIncrement) auction.bidIncrement = Number(bidIncrement);
    if (startTime) auction.startTime = new Date(startTime);
    if (endTime) auction.endTime = new Date(endTime);

    // Handle new images
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const img of auction.images) {
        if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
      }
      auction.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    await auction.save();
    await auction.populate("seller", "name profileImage");

    res.json({
      success: true,
      message: "Auction updated successfully.",
      auction,
    });
  } catch (error) {
    next(error);
  }
};

// ── Delete Auction ────────────────────────────────────────────────────────────
const deleteAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Auction not found." });
    }

    if (
      auction.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Soft delete (keep record)
    auction.isRemoved = true;
    auction.status = "cancelled";
    await auction.save();

    res.json({ success: true, message: "Auction deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ── Toggle Watchlist ──────────────────────────────────────────────────────────
const toggleWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const auctionId = req.params.id;

    const idx = user.watchlist.indexOf(auctionId);
    let action;
    if (idx === -1) {
      user.watchlist.push(auctionId);
      await Auction.findByIdAndUpdate(auctionId, {
        $addToSet: { watchedBy: req.user._id },
      });
      action = "added";
    } else {
      user.watchlist.splice(idx, 1);
      await Auction.findByIdAndUpdate(auctionId, {
        $pull: { watchedBy: req.user._id },
      });
      action = "removed";
    }

    await user.save();
    res.json({
      success: true,
      message: `Auction ${action} from watchlist.`,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// ── Get My Auctions ───────────────────────────────────────────────────────────
const getMyAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({
      seller: req.user._id,
      isRemoved: false,
    })
      .populate("winner", "name profileImage")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, auctions });
  } catch (error) {
    next(error);
  }
};

// ── Get Won Auctions ──────────────────────────────────────────────────────────
const getWonAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({ winner: req.user._id })
      .populate("seller", "name profileImage")
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, auctions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  toggleWatchlist,
  getMyAuctions,
  getWonAuctions,
};
