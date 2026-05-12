import React, { useState, useEffect } from "react";
import api from "../utils/api";
import AuctionCard from "../components/auction/AuctionCard";
import Loader from "../components/ui/Loader";
import Input from "../components/ui/Input";
import { motion } from "framer-motion";

const Explore = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      // Build query string
      let query = "/auctions?status=all";
      if (searchTerm) query += `&search=${searchTerm}`;
      if (category) query += `&category=${category}`;

      const res = await api.get(query);
      if (res.data.success) {
        setAuctions(res.data.auctions || []);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchAuctions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, category]);

  const categories = [
    "Electronics",
    "Art",
    "Collectibles",
    "Fashion",
    "Automotive",
    "Real Estate",
    "Other",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold mb-4">
          Explore Auctions
        </h1>
        <p className="text-gray-400">
          Find and bid on exclusive items from around the world.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 md:p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        <div className="w-full md:w-1/2">
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="w-full md:w-1/3 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
            Category:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-dark-850 border border-dark-border text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loader />
      ) : auctions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((auction, index) => (
            <motion.div
              key={auction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <AuctionCard auction={auction} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            No auctions found
          </h3>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
