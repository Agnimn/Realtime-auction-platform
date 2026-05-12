import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import AuctionCard from "../components/auction/AuctionCard";
import Loader from "../components/ui/Loader";
import api from "../utils/api";

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get("/auctions?status=active&limit=4");
        if (res.data.success) {
          setFeaturedAuctions(res.data.auctions || []);
        }
      } catch (error) {
        console.error("Failed to fetch auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient pt-20 pb-32">
        {/* Abstract background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-glow blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-500"
            >
              Discover & Bid on <br className="hidden md:block" /> Extraordinary
              Items
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 mb-10 font-light"
            >
              Experience the thrill of real-time auctions.{" "}
              <br className="hidden md:block" />
              Join our community and win exclusive items today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link to="/explore">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10">
                  Explore Auctions
                </Button>
              </Link>
              {/* <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10"
                >
                  Create Account
                </Button>
              </Link> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Live Now
              </h2>
              <p className="text-gray-400">
                Bid on these hot items before time runs out.
              </p>
            </div>
            <Link
              to="/explore"
              className="text-primary-400 hover:text-primary-300 font-medium hidden sm:block"
            >
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : featuredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAuctions.map((auction, index) => (
                <motion.div
                  key={auction._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <AuctionCard auction={auction} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No active auctions
              </h3>
              <p className="text-gray-400">Check back later for new items.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/explore">
              <Button variant="outline" className="w-full">
                View all auctions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-dark-850 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">
              Your journey to winning rare items in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              {
                title: "Register",
                desc: "Create an account securely to get started on BidSphere.",
                icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
              },
              {
                title: "Find Items",
                desc: "Browse through our extensive catalog of exclusive products.",
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
              },
              {
                title: "Place Bid",
                desc: "Engage in real-time bidding wars and secure your victory.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-6 text-primary-400">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={step.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
