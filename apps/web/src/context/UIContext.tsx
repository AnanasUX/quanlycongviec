import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type UIContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  showMobileNav: boolean;
  setShowMobileNav: (open: boolean) => void;
  toast: string;
  notify: (msg: string) => void;
  showTaskModal: boolean;
  setShowTaskModal: (open: boolean) => void;
  showWorkspaceModal: boolean;
  setShowWorkspaceModal: (open: boolean) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        showMobileNav,
        setShowMobileNav,
        toast,
        notify,
        showTaskModal,
        setShowTaskModal,
        showWorkspaceModal,
        setShowWorkspaceModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
