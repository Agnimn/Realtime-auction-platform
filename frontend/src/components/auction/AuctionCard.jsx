import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Countdown from 'react-countdown';

const AuctionCard = ({ auction }) => {
  const isEnded =
    auction.status === 'ended' || new Date(auction.endTime) < new Date();

  // Custom renderer for the countdown timer
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <span className="text-red-400 font-medium">Auction Ended</span>;
    } else {
      return (
        <span className="text-primary-300 font-medium font-mono text-sm">
          {days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group flex flex-col h-full"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-850">
        <img 
          src={auction.images && auction.images.length > 0 ? auction.images[0].url : 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={auction.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-dark-border shadow-lg">
          <Countdown date={new Date(auction.endTime)} renderer={renderer} />
        </div>
        {/* Winner badge overlay for ended auctions */}
        {isEnded && auction.winner && (
          <div className="absolute bottom-0 left-0 right-0 py-2 px-3 flex items-center gap-2"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            }}
          >
            <span className="text-sm">🏆</span>
            <span className="text-xs text-emerald-400 font-medium truncate">
              Won by {auction.winner.name || 'Unknown'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
            {auction.title}
          </h3>
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">
          {auction.description}
        </p>

        <div className="mt-auto pt-4 border-t border-dark-border flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {isEnded ? 'Final Bid' : 'Current Bid'}
            </p>
            <p className="text-xl font-display font-bold text-accent-500">
              ${auction.currentBid.toLocaleString()}
            </p>
          </div>
          
          <Link to={`/auction/${auction._id}`}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isEnded
                  ? 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border-gray-500/30'
                  : 'bg-primary-500/10 hover:bg-primary-500 text-primary-400 hover:text-white border-primary-500/30 hover:border-primary-500'
              }`}
            >
              {isEnded ? 'View Result' : 'Place Bid'}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AuctionCard;
