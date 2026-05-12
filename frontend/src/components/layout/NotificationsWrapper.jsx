import React from "react";
import NotificationsPanel from "../notifications/NotificationsPanel";

const NotificationsWrapper = () => {
  return (
    <div className="fixed right-4 bottom-24 z-50 w-[320px] max-w-[90vw]">
      <NotificationsPanel />
    </div>
  );
};

export default NotificationsWrapper;
