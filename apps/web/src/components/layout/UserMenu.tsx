import { ChevronDown, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useUI } from "../../context/UIContext";

export function UserMenu() {
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
        <span>MA</span>
        <ChevronDown size={14} />
      </button>

      {showDropdown && (
        <div className="notification-popover" style={{ width: "200px", padding: "10px", right: 0 }}>
          <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
            <strong>Minh Anh</strong>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              minhanh@workspace.vn
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
              notify("Cài đặt tài khoản");
            }}
          >
            <span>Cài đặt cá nhân</span>
          </button>
        </div>
      )}
    </div>
  );
}
