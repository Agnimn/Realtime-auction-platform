/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleBanUser, getAllAuctions, removeAuction, toggleFeatureAuction } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly); // All admin routes are protected

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/ban', toggleBanUser);
router.get('/auctions', getAllAuctions);
router.delete('/auctions/:auctionId', removeAuction);
router.patch('/auctions/:auctionId/feature', toggleFeatureAuction);

module.exports = router;
