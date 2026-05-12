/**
 * Socket.IO Handler
 * Manages real-time bidding, notifications, and auction rooms
 */

const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');

// Track online users per auction room: { auctionId: Set<socketId> }
const auctionRooms = new Map();

// Track socket → user mapping
const socketUserMap = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Authenticate socket ─────────────────────────────────────────────────────
    socket.on('authenticate', ({ userId }) => {
      if (userId) {
        socketUserMap.set(socket.id, userId);
        socket.join(`user:${userId}`); // Personal room for notifications
        console.log(`✅ User ${userId} authenticated on socket ${socket.id}`);
      }
    });

    // ── Join Auction Room ───────────────────────────────────────────────────────
    socket.on('join_auction', async ({ auctionId }) => {
      socket.join(`auction:${auctionId}`);

      // Track bidder count
      if (!auctionRooms.has(auctionId)) {
        auctionRooms.set(auctionId, new Set());
      }
      auctionRooms.get(auctionId).add(socket.id);

      const count = auctionRooms.get(auctionId).size;
      io.to(`auction:${auctionId}`).emit('viewer_count', { count });

      console.log(`👀 Socket ${socket.id} joined auction ${auctionId} | Viewers: ${count}`);
    });

    // ── Leave Auction Room ──────────────────────────────────────────────────────
    socket.on('leave_auction', ({ auctionId }) => {
      socket.leave(`auction:${auctionId}`);

      if (auctionRooms.has(auctionId)) {
        auctionRooms.get(auctionId).delete(socket.id);
        const count = auctionRooms.get(auctionId).size;
        io.to(`auction:${auctionId}`).emit('viewer_count', { count });
      }
    });

    // ── Handle Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from all auction rooms
      auctionRooms.forEach((sockets, auctionId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          const count = sockets.size;
          io.to(`auction:${auctionId}`).emit('viewer_count', { count });
        }
      });

      socketUserMap.delete(socket.id);
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Broadcast a new bid to all clients in an auction room
 */
const broadcastNewBid = (io, auctionId, bidData) => {
  io.to(`auction:${auctionId}`).emit('new_bid', bidData);
};

/**
 * Send outbid notification to a specific user
 */
const notifyOutbid = (io, userId, auctionId, newBid) => {
  io.to(`user:${userId}`).emit('notification', {
    type: 'outbid',
    title: '⚡ You have been outbid!',
    message: `Someone placed a higher bid of ₹${newBid.toLocaleString()}`,
    auctionId,
  });
};

/**
 * Notify winner when auction ends
 */
const notifyWinner = (io, winnerId, auctionId, amount) => {
  io.to(`user:${winnerId}`).emit('notification', {
    type: 'auction_won',
    title: '🏆 You won the auction!',
    message: `Congratulations! You won with a bid of ₹${amount.toLocaleString()}`,
    auctionId,
  });
};

/**
 * Broadcast auction ended to all viewers in room
 */
const broadcastAuctionEnded = (io, auctionId, winnerData) => {
  io.to(`auction:${auctionId}`).emit('auction_ended', winnerData);
};

/**
 * Broadcast "ending soon" warning (5 minutes left)
 */
const broadcastEndingSoon = (io, auctionId) => {
  io.to(`auction:${auctionId}`).emit('auction_ending_soon', {
    message: '⏳ Auction ending in 5 minutes!',
    auctionId,
  });
};

module.exports = {
  initSocket,
  broadcastNewBid,
  notifyOutbid,
  notifyWinner,
  broadcastAuctionEnded,
  broadcastEndingSoon,
};
