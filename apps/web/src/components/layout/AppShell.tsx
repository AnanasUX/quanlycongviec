import type { ReactNode } from "react";
import { useUI } from "../../context/UIContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toast } from "../shared/Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const { showMobileNav, setShowMobileNav } = useUI();

  return (
    <div className="app-shell">
      <Sidebar />

      {showMobileNav && (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Đóng menu"
          onClick={() => setShowMobileNav(false)}
        />
      )}

      <main className="main">
        <Topbar />
        {children}
      </main>

      <Toast />
    </div>
  );
}
