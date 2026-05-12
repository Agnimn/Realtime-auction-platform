/**
 * Admin Controller
 * Manage users, auctions, monitor activity
 */

const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAuctions, activeAuctions, totalBids, bannedUsers, endedAuctions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Auction.countDocuments({ isRemoved: false }),
      Auction.countDocuments({ status: 'active', isRemoved: false }),
      Bid.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Auction.countDocuments({ status: 'ended' }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalAuctions, activeAuctions, totalBids, bannedUsers, endedAuctions } });
  } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban an admin.' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`, isBanned: user.isBanned });
  } catch (error) { next(error); }
};

const getAllAuctions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query).populate('seller', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    res.json({ success: true, auctions, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

const removeAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found.' });
    auction.isRemoved = true;
    auction.status = 'cancelled';
    await auction.save();
    await Notification.create({ recipient: auction.seller, type: 'system', title: '⚠️ Auction Removed', message: `Your auction "${auction.title}" was removed by an admin.`, auction: auction._id });
    res.json({ success: true, message: 'Auction removed successfully.' });
  } catch (error) { next(error); }
};

const toggleFeatureAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found.' });
    auction.isFeatured = !auction.isFeatured;
    await auction.save();
    res.json({ success: true, message: `Auction ${auction.isFeatured ? 'featured' : 'unfeatured'}.`, isFeatured: auction.isFeatured });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats, getAllUsers, toggleBanUser, getAllAuctions, removeAuction, toggleFeatureAuction };
