import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppShell>
        <DashboardPage />
      </AppShell>
    ),
  },
  {
    path: "/docs",
    element: (
      <AppShell>
        <PlaceholderPage title="Soạn thảo tài liệu" />
      </AppShell>
    ),
  },
  {
    path: "/team",
    element: (
      <AppShell>
        <PlaceholderPage title="Đội ngũ" />
      </AppShell>
    ),
  },
  {
    path: "/slides",
    element: (
      <AppShell>
        <PlaceholderPage title="Trình chiếu" />
      </AppShell>
    ),
  },
  {
    path: "/calendar",
    element: (
      <AppShell>
        <PlaceholderPage title="Lịch làm việc" />
      </AppShell>
    ),
  },
  {
    path: "/messages",
    element: (
      <AppShell>
        <PlaceholderPage title="Tin nhắn" />
      </AppShell>
    ),
  },
  {
    path: "/storage",
    element: (
      <AppShell>
        <PlaceholderPage title="Kho lưu trữ" />
      </AppShell>
    ),
  },
  {
    path: "/w/:slug",
    element: (
      <AppShell>
        <PlaceholderPage />
      </AppShell>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
