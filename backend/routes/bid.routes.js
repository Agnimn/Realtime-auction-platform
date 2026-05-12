/**
 * Bid Routes
 */

const express = require('express');
const router = express.Router();
const { placeBid, getBidHistory, getMyBids, setAutoBid } = require('../controllers/bid.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/place', protect, placeBid);
router.get('/my-bids', protect, getMyBids);
router.post('/auto-bid', protect, setAutoBid);
router.get('/:auctionId', getBidHistory);

module.exports = router;
