import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-40 glass border-b border-dark-border/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center shadow-[0_0_15px_rgba(192,64,235,0.5)] group-hover:shadow-[0_0_25px_rgba(192,64,235,0.7)] transition-shadow">
              <span className="text-white font-bold text-lg leading-none">
                B
              </span>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              BidSphere
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/explore"
              className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
            >
              Explore
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-dark-800 rounded-full py-1.5 px-3 border border-dark-border">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {user.name}
                    </span>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-850 border-b border-dark-border"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              <Link
                to="/explore"
                className="text-gray-300 hover:text-primary-400 py-2 block font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-primary-400 py-2 block font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="pt-4 border-t border-dark-border flex flex-col space-y-3">
                    <span className="text-sm text-gray-400">
                      Logged in as{" "}
                      <span className="text-white font-semibold">
                        {user.name}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-dark-border flex flex-col space-y-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
