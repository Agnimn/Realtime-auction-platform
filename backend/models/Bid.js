/**
 * Bid Model
 * Records every bid placed on an auction
 */

const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative'],
    },
    isWinning: {
      type: Boolean,
      default: false,
    },
    isAutoBid: {
      type: Boolean,
      default: false,
    },
    // IP tracking for anti-fraud
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for auction-based lookups
bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ bidder: 1 });

module.exports = mongoose.model('Bid', bidSchema);
