import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import NotificationsPanel from "./NotificationsPanel";

const NotificationsBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-dark-800 transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a6 6 0 00-6 6v2.586L2.293 12.293A1 1 0 003 14h14a1 1 0 00.707-1.707l-1.707-1.707V8a6 6 0 00-6-6z" />
          <path d="M4 14a6 6 0 0012 0H4z" />
        </svg>
        <span className="absolute top-1 right-1 w-2 h-2 bg-primary-400 rounded-full" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-0 translate-y-[-8px] w-[320px] max-w-[90vw]"
          >
            <NotificationsPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBell;
