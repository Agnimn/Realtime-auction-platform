/**
 * Auction Model
 * Stores all auction details, product info, bid tracking
 */

const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Auction title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics', 'Fashion', 'Art', 'Collectibles',
        'Jewelry', 'Vehicles', 'Real Estate', 'Sports',
        'Books', 'Home & Garden', 'Toys', 'Other'
      ],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      }
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startingBid: {
      type: Number,
      required: [true, 'Starting bid is required'],
      min: [0, 'Starting bid cannot be negative'],
    },
    bidIncrement: {
      type: Number,
      required: [true, 'Bid increment is required'],
      min: [1, 'Bid increment must be at least 1'],
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    currentWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startTime: {
      type: Date,
      required: [true, 'Auction start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Auction end time is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'ended', 'cancelled'],
      default: 'upcoming',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    winningBid: {
      type: Number,
      default: null,
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    watchedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    // Payment status after auction ends
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Virtual: Is auction currently live?
auctionSchema.virtual('isLive').get(function () {
  const now = new Date();
  return this.status === 'active' && now >= this.startTime && now <= this.endTime;
});

// Index for faster queries
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
