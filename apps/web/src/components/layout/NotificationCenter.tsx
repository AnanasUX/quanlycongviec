import { useState } from "react";
import { Bell, CheckCircle2, MessageSquare, X } from "lucide-react";

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
          <div className="notice">
            <span className="notice-icon purple">
              <CheckCircle2 size={16} />
            </span>
            <p>
              <strong>Tuấn đã hoàn thành một công việc</strong>
              <small>Hoàn thiện kế hoạch Q1 · 5 phút trước</small>
            </p>
          </div>
          <div className="notice">
            <span className="notice-icon blue">
              <MessageSquare size={16} />
            </span>
            <p>
              <strong>Bạn có 3 tin nhắn mới</strong>
              <small>Trong nhóm Dự án Sản phẩm</small>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
