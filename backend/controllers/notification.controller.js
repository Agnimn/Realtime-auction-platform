/**
 * Notification Controller
 */

const Notification = require('../models/Notification');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('auction', 'title images')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getMyNotifications, markAsRead, markOneRead, deleteNotification };
