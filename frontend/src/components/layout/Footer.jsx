import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-border mt-auto pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">B</span>
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">BidSphere</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              The premier destination for real-time online auctions. Discover rare items, place bids instantly, and win big with our secure, live-updating platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/explore" className="hover:text-primary-400 transition-colors">Explore Auctions</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-dark-border/50 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} BidSphere. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
