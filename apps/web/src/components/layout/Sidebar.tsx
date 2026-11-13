import { NavLink } from "react-router-dom";
import { ChevronRight, Cloud, Grid2X2, Plus, X } from "lucide-react";
import { mainNavigation, workspaceNavigation } from "../../data/mock";
import { storageUsageFixture } from "../../data/fixtures";
import { useUI } from "../../context/UIContext";

export function Sidebar({ activeLabel }: { activeLabel?: string }) {
  const { showMobileNav, setShowMobileNav, setShowWorkspaceModal, notify } = useUI();

  return (
    <aside className={`sidebar ${showMobileNav ? "sidebar-open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <Grid2X2 size={17} />
        </span>
        <strong>Workspace</strong>
        <button
          className="mobile-close"
          onClick={() => setShowMobileNav(false)}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="nav-list" aria-label="Điều hướng chính">
        {mainNavigation.map(({ label, icon: Icon, path, badge }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              isActive || activeLabel === label ? "nav-item active" : "nav-item"
            }
            onClick={() => {
              setShowMobileNav(false);
              if (label !== "Tổng quan") notify(`Đã chuyển đến ${label}`);
            }}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {badge && <b className="nav-badge">{badge}</b>}
          </NavLink>
        ))}
      </nav>

      <div className="nav-section-label">Không gian làm việc</div>
      <nav className="nav-list workspace-nav" aria-label="Không gian làm việc">
        {workspaceNavigation.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              isActive || activeLabel === label ? "nav-item active" : "nav-item"
            }
            onClick={() => {
              setShowMobileNav(false);
              notify(`Đã chuyển đến ${label}`);
            }}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="nav-item add-space"
          onClick={() => setShowWorkspaceModal(true)}
        >
          <Plus size={17} />
          <span>Tạo không gian mới</span>
        </button>
      </nav>

      <div
        className="storage-card"
        onClick={() => notify("Đang mở trang Kho lưu trữ > Dung lượng")}
        style={{ cursor: "pointer" }}
      >
        <div className="storage-row">
          <Cloud size={17} />
          <div>
            <span>{storageUsageFixture.label}</span>
            <strong>{storageUsageFixture.displayUsage}</strong>
          </div>
          <ChevronRight size={15} />
        </div>
        <div className="storage-track">
          <span />
        </div>
      </div>
    </aside>
  );
}
