import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

/**
 * Renders in-app socket notifications and stores latest ones in local state.
 * DB persistence already happens in backend Notification model.
 */
const NotificationsPanel = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    const onNotification = (data) => {
      const payload = {
        id: `${Date.now()}`,
        type: data?.type,
        title: data?.title || "Notification",
        message: data?.message || "",
        createdAt: new Date().toISOString(),
      };

      setItems((prev) => [payload, ...prev].slice(0, 20));

      if (data?.type === "auction_won") {
        toast.success(data?.title || "Auction won");
      }
    };

    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
    };
  }, [socket, user]);

  if (!user) return null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">Notifications</h3>
        <span className="text-sm text-gray-400">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications yet.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {items.map((n) => (
            <div
              key={n.id}
              className="border border-dark-border rounded-lg p-3"
            >
              <p className="text-white font-medium text-sm">{n.title}</p>
              {n.message ? (
                <p className="text-gray-400 text-xs mt-1 whitespace-pre-line">
                  {n.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
