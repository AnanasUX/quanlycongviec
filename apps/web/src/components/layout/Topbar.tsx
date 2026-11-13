import { CircleHelp, Menu } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  const { setShowMobileNav, notify } = useUI();

  return (
    <header className="topbar">
      <button
        type="button"
        className="mobile-menu"
        onClick={() => setShowMobileNav(true)}
        aria-label="Mở menu"
      >
        <Menu size={21} />
      </button>
      <GlobalSearch />
      <div className="top-actions">
        <NotificationCenter />
        <button
          type="button"
          className="icon-button"
          aria-label="Trợ giúp"
          onClick={() => notify("Trung tâm trợ giúp")}
        >
          <CircleHelp size={19} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
