/**
 * Auction Routes
 */

const express = require('express');
const router = express.Router();
const {
  createAuction, getAuctions, getAuctionById,
  updateAuction, deleteAuction, toggleWatchlist,
  getMyAuctions, getWonAuctions,
} = require('../controllers/auction.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { uploadAuctionImages } = require('../middleware/upload.middleware');

router.get('/', optionalAuth, getAuctions);
router.post('/create', protect, uploadAuctionImages, createAuction);
router.get('/my-auctions', protect, getMyAuctions);
router.get('/won', protect, getWonAuctions);
router.get('/:id', optionalAuth, getAuctionById);
router.put('/:id', protect, uploadAuctionImages, updateAuction);
router.delete('/:id', protect, deleteAuction);
router.post('/:id/watchlist', protect, toggleWatchlist);

module.exports = router;
