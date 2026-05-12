/**
 * Notification Model
 * Stores in-app notifications for users
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'outbid',          // "You have been outbid"
        'auction_won',     // "You won the auction"
        'auction_lost',    // "You lost the auction"
        'auction_ending',  // "Auction ending soon"
        'auction_created', // "Your auction is live"
        'auction_ended',   // "Your auction has ended"
        'bid_placed',      // "A new bid was placed on your auction"
        'system',          // Admin/system message
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast user-based notification fetching
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
