/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Get public user profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name profileImage auctionsCreated auctionsWon totalBids createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const auctions = await Auction.find({ seller: req.params.id, isRemoved: false, status: { $in: ['active', 'ended'] } })
      .select('title images currentBid status endTime totalBids').limit(6).lean();
    res.json({ success: true, user, auctions });
  } catch (error) { next(error); }
});

// Get watchlist
router.get('/me/watchlist', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'watchlist',
      select: 'title images currentBid status endTime totalBids seller',
      populate: { path: 'seller', select: 'name' },
    });
    res.json({ success: true, watchlist: user.watchlist });
  } catch (error) { next(error); }
});

module.exports = router;
