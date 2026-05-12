import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

/**
 * Derive the Socket.IO server URL.
 * - Uses VITE_SOCKET_URL env variable if set (production / deployment)
 * - Falls back to dynamic hostname detection for local development
 */
const getSocketUrl = () => {
  // If the env variable is set, always use it (works for production builds)
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // Fallback: local development — backend runs on port 5000
  const hostname = window.location.hostname; // e.g. "localhost" or "192.168.1.5"
  return `http://${hostname}:5000`;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = getSocketUrl();
      console.log(`🔌 Connecting socket to: ${socketUrl}`);

      const newSocket = io(socketUrl, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity, // Keep trying on mobile
        transports: ["websocket", "polling"], // Try websocket first, fall back to polling
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        newSocket.emit("authenticate", { userId: user._id });
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
