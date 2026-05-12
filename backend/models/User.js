/**
 * User Model
 * Stores user credentials, profile info, roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    watchlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }
    ],
    // Stats
    auctionsCreated: { type: Number, default: 0 },
    auctionsWon: { type: Number, default: 0 },
    totalBids: { type: Number, default: 0 },
    // Auto-bid settings
    autoBidSettings: [
      {
        auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
        maxBid: { type: Number },
        isActive: { type: Boolean, default: true },
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
