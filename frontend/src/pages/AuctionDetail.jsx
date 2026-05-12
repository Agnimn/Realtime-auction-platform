import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Countdown from "react-countdown";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

/* ─── Winner Announcement Modal ───────────────────────────────────────────── */
const WinnerBanner = ({ winner, winningAmount, isCurrentUser }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
    className="glass-card p-8 text-center overflow-hidden relative"
    style={{
      background:
        "linear-gradient(135deg, rgba(192,64,235,0.15) 0%, rgba(249,115,22,0.12) 50%, rgba(16,185,129,0.10) 100%)",
      border: "1px solid rgba(192,64,235,0.35)",
      boxShadow: "0 0 60px rgba(192,64,235,0.15), 0 0 120px rgba(249,115,22,0.08)",
    }}
  >
    {/* Decorative glow rings */}
    <div
      className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(192,64,235,0.25) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
      }}
    />

    {/* Trophy icon */}
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring" }}
      className="text-6xl mb-3"
    >
      🏆
    </motion.div>

    <motion.h2
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-2xl md:text-3xl font-display font-bold mb-2"
      style={{
        background: "linear-gradient(135deg, #c040eb, #f97316, #10b981)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Auction Ended!
    </motion.h2>

    {winner ? (
      <>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-sm uppercase tracking-widest mb-4"
        >
          {isCurrentUser ? "Congratulations, you won!" : "Winner"}
        </motion.p>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Winner avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg"
            style={{
              background: isCurrentUser
                ? "linear-gradient(135deg, #c040eb, #f97316)"
                : "linear-gradient(135deg, #374151, #1f2937)",
              border: isCurrentUser
                ? "3px solid rgba(192,64,235,0.6)"
                : "3px solid rgba(107,114,128,0.4)",
              boxShadow: isCurrentUser
                ? "0 0 30px rgba(192,64,235,0.3)"
                : "none",
            }}
          >
            {winner.profileImage ? (
              <img
                src={winner.profileImage}
                alt={winner.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white">
                {winner.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          {/* Winner name */}
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {isCurrentUser ? `🎉 ${winner.name}` : winner.name}
          </h3>

          {/* Winning amount */}
          {winningAmount && (
            <div
              className="mt-2 px-6 py-3 rounded-xl"
              style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.3)",
              }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Winning Bid
              </p>
              <p className="text-2xl md:text-3xl font-display font-bold text-accent-500">
                ${winningAmount.toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>

        {isCurrentUser && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-emerald-400 text-sm mt-4 font-medium"
          >
            ✨ You are the winner of this auction!
          </motion.p>
        )}
      </>
    ) : (
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-400 text-lg"
      >
        No bids were placed on this auction.
      </motion.p>
    )}
  </motion.div>
);

/* ─── Main AuctionDetail Component ────────────────────────────────────────── */
const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const [showWinnerBanner, setShowWinnerBanner] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch auction details from API
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        if (res.data.success) {
          setAuction(res.data.auction);
          if (res.data.bids) {
            setBids(res.data.bids);
          }
          // Show winner banner if auction already ended
          if (
            res.data.auction.status === "ended" ||
            new Date(res.data.auction.endTime) < new Date()
          ) {
            setShowWinnerBanner(true);
          }
        }
      } catch (error) {
        console.error("Error fetching auction:", error);
        toast.error("Failed to load auction details");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [id, navigate]);

  // Handle countdown completing client-side
  const handleCountdownComplete = useCallback(() => {
    // Re-fetch auction from server to trigger completion
    const refetch = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        if (res.data.success) {
          setAuction(res.data.auction);
          if (res.data.bids) setBids(res.data.bids);
          setShowWinnerBanner(true);
        }
      } catch (err) {
        console.error("Error refetching after countdown:", err);
      }
    };
    // Small delay to let the server scheduler potentially fire first
    setTimeout(refetch, 2000);
  }, [id]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !auction) return;

    // Join the auction room
    socket.emit("join_auction", { auctionId: id });

    // Listen for new bids
    const handleNewBid = (newBid) => {
      setBids((prev) => [newBid, ...prev]);
      setAuction((prev) => ({
        ...prev,
        currentBid: newBid.amount,
        totalBids: newBid.totalBids || (prev.totalBids || 0) + 1,
      }));

      if (newBid.bidder?._id !== user?._id) {
        toast(`New bid: $${newBid.amount.toLocaleString()}`, { icon: "🔔" });
      }
    };

    // Listen for auction end — THIS is what every viewer receives
    const handleAuctionEnded = (data) => {
      const winnerData = data?.winner?.name
        ? data.winner
        : data?.winner
          ? { ...data.winner, name: data.winner.name || "Unknown" }
          : null;

      setAuction((prev) => ({
        ...prev,
        status: "ended",
        winner: winnerData,
        winningBid: data?.winningAmount || prev?.currentBid,
      }));
      setShowWinnerBanner(true);

      // Show a toast to all viewers
      if (winnerData) {
        const isMe = user?._id === winnerData._id;
        if (isMe) {
          toast.success("🏆 Congratulations! You won this auction!", {
            duration: 6000,
          });
        } else {
          toast(`Auction ended! Winner: ${winnerData.name}`, {
            icon: "🏆",
            duration: 5000,
          });
        }
      } else {
        toast("Auction has ended with no bids.", { icon: "⏰", duration: 4000 });
      }
    };

    socket.on("new_bid", handleNewBid);
    socket.on("auctionEnded", handleAuctionEnded);

    return () => {
      socket.emit("leave_auction", { auctionId: id });
      socket.off("new_bid", handleNewBid);
      socket.off("auctionEnded", handleAuctionEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, auction?._id, id, user?._id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to bid");
      return navigate("/login");
    }

    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= auction.currentBid) {
      return toast.error("Bid must be higher than current bid");
    }

    setPlacingBid(true);
    try {
      const res = await api.post("/bids/place", { auctionId: id, amount });
      if (res.data.success) {
        toast.success("Bid placed successfully!");
        setBidAmount("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const handleDeleteAuction = async () => {
    if (!window.confirm("Are you sure you want to delete this auction? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await api.delete(`/auctions/${id}`);
      if (res.data.success) {
        toast.success("Auction deleted successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete auction");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!auction) return null;

  const isEnded =
    auction.status === "ended" || new Date(auction.endTime) < new Date();
  const winnerObj = auction.winner || auction.currentWinner || null;
  const winAmount = auction.winningBid || auction.currentBid || 0;
  const isCurrentUserWinner =
    user && winnerObj && user._id === (winnerObj._id || winnerObj);
  const isSeller =
    user && (user._id === auction.seller?._id || user._id === auction.seller);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Image */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card overflow-hidden aspect-[4/3] relative flex items-center justify-center bg-dark-900"
          >
            <img
              src={
                auction.images?.[0]?.url ||
                "https://via.placeholder.com/800x600"
              }
              alt={auction.title}
              className="object-contain w-full h-full p-4"
            />
            {isEnded && (
              <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-widest transform -rotate-12">
                  Auction Ended
                </span>
              </div>
            )}
          </motion.div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-display font-bold mb-4">Description</h3>
            <p className="text-gray-400 whitespace-pre-line leading-relaxed">
              {auction.description}
            </p>
          </div>
        </div>

        {/* Right Column - Details & Bidding */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-primary-500/20 text-primary-400 text-xs px-3 py-1 rounded-full font-medium border border-primary-500/30">
                {auction.category}
              </span>
              {isEnded && (
                <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full font-medium border border-red-500/30">
                  Ended
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {auction.title}
            </h1>
            <p className="text-gray-400 flex items-center">
              Listed by{" "}
              <span className="text-white ml-2 font-medium">
                {auction.seller?.name || "Unknown"}
              </span>
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border-primary-500/30 shadow-[0_0_30px_rgba(192,64,235,0.1)]">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                {isEnded ? "Final Bid" : "Current Highest Bid"}
              </p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={auction.currentBid}
                  initial={{ opacity: 0, y: -20, color: "#c040eb" }}
                  animate={{ opacity: 1, y: 0, color: "#f97316" }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl font-display font-bold"
                >
                  ${auction.currentBid?.toLocaleString?.() || "0"}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                {isEnded ? "Status" : "Time Remaining"}
              </p>
              <div className="text-2xl font-mono font-bold text-white bg-dark-900 px-4 py-2 rounded-lg border border-dark-border">
                {isEnded ? (
                  <span className="text-red-500">Ended</span>
                ) : (
                  <Countdown
                    date={new Date(auction.endTime)}
                    onComplete={handleCountdownComplete}
                    renderer={({
                      days,
                      hours,
                      minutes,
                      seconds,
                      completed,
                    }) => {
                      if (completed)
                        return <span className="text-red-500">00:00:00</span>;
                      return (
                        <span>
                          {days > 0 && `${days}d `}
                          {hours}h {minutes}m {seconds}s
                        </span>
                      );
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─── Winner Banner / Bid Form ──────────────────────────────── */}
          <AnimatePresence mode="wait">
            {isEnded && showWinnerBanner ? (
              <WinnerBanner
                key="winner-banner"
                winner={winnerObj}
                winningAmount={winAmount}
                isCurrentUser={isCurrentUserWinner}
              />
            ) : isEnded ? (
              <motion.div
                key="ended-simple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 text-center"
              >
                <p className="text-red-400 font-bold text-lg">
                  This auction has ended.
                </p>
              </motion.div>
            ) : user?._id ===
              (auction.seller?._id || auction.seller) ? (
              <div className="glass-card p-6 text-center border border-primary-500/20">
                <p className="text-primary-400 font-medium">
                  This is your auction.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Sellers cannot place bids on their own listings.
                </p>
                <button
                  onClick={handleDeleteAuction}
                  disabled={deleting}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {deleting ? 'Deleting...' : 'Delete Auction'}
                </button>
              </div>
            ) : (
              <div className="glass-card p-6">
                <form onSubmit={handlePlaceBid} className="flex space-x-4">
                  <div className="flex-grow">
                    <Input
                      type="number"
                      min={
                        auction.currentBid + (auction.bidIncrement || 1)
                      }
                      step="any"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min. $${(auction.currentBid + (auction.bidIncrement || 1)).toLocaleString()}`}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={placingBid}
                  >
                    Place Bid
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  By placing a bid, you commit to buying this item if you win.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* ─── Delete Button for Seller ───────────────────────────────── */}
          {isEnded && isSeller && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5 flex items-center justify-between"
              style={{
                border: '1px solid rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.05)',
              }}
            >
              <div>
                <p className="text-sm font-medium text-gray-300">Remove this auction</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  This will permanently hide the auction from all listings.
                </p>
              </div>
              <button
                onClick={handleDeleteAuction}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                {deleting ? 'Deleting...' : 'Delete Auction'}
              </button>
            </motion.div>
          )}

          {/* Bid History */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-display font-bold mb-4 flex items-center justify-between">
              Bid History
              <span className="text-sm font-normal text-gray-400 bg-dark-900 px-3 py-1 rounded-full border border-dark-border">
                {bids.length} Bids
              </span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              <AnimatePresence>
                {bids.length > 0 ? (
                  bids.map((bid, i) => (
                    <motion.div
                      key={bid._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex justify-between items-center p-3 rounded-lg border ${i === 0 ? "bg-primary-500/10 border-primary-500/30" : "bg-dark-850 border-dark-border"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-dark-900 flex items-center justify-center font-bold text-xs">
                          {bid.bidder?.name
                            ? bid.bidder.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {bid.bidder?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(bid.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-bold ${i === 0 ? "text-primary-400" : "text-gray-300"}`}
                      >
                        ${bid.amount.toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No bids yet. Be the first!
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionDetail;
