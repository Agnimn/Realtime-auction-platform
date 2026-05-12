/**
 * BidSphere – Main Express Server
 * Entry point: sets up Express, Socket.IO, MongoDB, and all routes
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const auctionRoutes = require('./routes/auction.routes');
const bidRoutes = require('./routes/bid.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import socket handler
const { initSocket } = require('./utils/socket');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In development, allow any origin so mobile devices on the same network can connect
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL
  : (origin, callback) => callback(null, true); // Allow all origins in dev

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// ─── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Socket.IO Setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket handlers (pass io to be used in controllers)
initSocket(io);
app.set('io', io); // Make io accessible in route handlers

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BidSphere API is running ' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const Auction = require('./models/Auction');
const { completeAuction } = require('./utils/auctionCompletion');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ─── Auction Completion Scheduler ──────────────────────────────────────────────
// Checks every 10 seconds for:
//   1. 'upcoming' auctions whose startTime has passed → mark 'active'
//   2. 'active' auctions whose endTime has passed → complete & broadcast winner
const startAuctionScheduler = () => {
  setInterval(async () => {
    try {
      const now = new Date();

      // 1. Activate upcoming auctions whose start time has arrived
      await Auction.updateMany(
        { status: 'upcoming', startTime: { $lte: now }, isRemoved: false },
        { $set: { status: 'active' } }
      );

      // 2. Complete expired active auctions
      const expiredAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: now },
        isRemoved: false,
      }).select('_id');

      for (const auction of expiredAuctions) {
        await completeAuction(io, auction._id);
      }
    } catch (err) {
      console.error('Auction scheduler error:', err.message);
    }
  }, 10 * 1000); // Every 10 seconds
  console.log(' ⏰ Auction scheduler started (10s interval)');
};

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(` BidSphere server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    startAuctionScheduler();
  });
});
