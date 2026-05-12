/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markOneRead, deleteNotification } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getMyNotifications);
router.patch('/mark-all-read', markAsRead);
router.patch('/:id/read', markOneRead);
router.delete('/:id', deleteNotification);

module.exports = router;
