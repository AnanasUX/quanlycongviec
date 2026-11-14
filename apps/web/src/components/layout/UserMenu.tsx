import { ChevronDown, Moon, Sun, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { currentUserFixture } from "../../data/fixtures";
import { useUI } from "../../context/UIContext";

export function UserMenu() {
  const navigate = useNavigate();
  const { theme, toggleTheme, notify } = useUI();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="popover-anchor">
      <button
        type="button"
        className="profile-button"
        onClick={() => setShowDropdown((open) => !open)}
        aria-label="Hồ sơ người dùng"
      >
        <span>{currentUserFixture.initials}</span>
        <ChevronDown size={14} />
      </button>

      {showDropdown && (
        <div className="notification-popover" style={{ width: "200px", padding: "10px", right: 0 }}>
          <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
            <strong>{currentUserFixture.name}</strong>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              {currentUserFixture.email}
            </p>
          </div>
          <button
            type="button"
            className="nav-item"
            style={{ width: "100%", justifyContent: "flex-start", marginTop: "6px" }}
            onClick={() => {
              toggleTheme();
              setShowDropdown(false);
              notify(`Chế độ: ${theme === "light" ? "Tối" : "Sáng"}`);
            }}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span>
          </button>
          <button
            type="button"
            className="nav-item"
            style={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => {
              setShowDropdown(false);
              navigate("/settings");
            }}
          >
            <Settings size={16} />
            <span>Cài đặt cá nhân</span>
          </button>
          <button
            type="button"
            className="nav-item"
            style={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => {
              setShowDropdown(false);
              navigate("/admin");
            }}
          >
            <Shield size={16} />
            <span>Quản trị hệ thống</span>
          </button>
        </div>
      )}
    </div>
  );
}
