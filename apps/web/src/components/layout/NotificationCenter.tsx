import { useState } from "react";
import { Bell, CheckCircle2, MessageSquare, X } from "lucide-react";
import { notificationItemsFixture } from "../../data/fixtures";

export function NotificationCenter() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="popover-anchor">
      <button
        type="button"
        className="icon-button notification-button"
        onClick={() => setShowNotifications((open) => !open)}
        aria-label="Thông báo"
      >
        <Bell size={19} />
        <span />
      </button>
      {showNotifications && (
        <div className="notification-popover">
          <div className="popover-heading">
            <strong>Thông báo</strong>
            <button type="button" onClick={() => setShowNotifications(false)}>
              <X size={16} />
            </button>
          </div>
          {notificationItemsFixture.map((item) => (
            <div className="notice" key={item.id}>
              <span className={`notice-icon ${item.color}`}>
                {item.type === "task" ? <CheckCircle2 size={16} /> : <MessageSquare size={16} />}
              </span>
              <p>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
