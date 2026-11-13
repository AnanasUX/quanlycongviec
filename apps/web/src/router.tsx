import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { TwoFactorPage } from "./pages/auth/TwoFactorPage";
import { AcceptInvitePage } from "./pages/auth/AcceptInvitePage";
import { OnboardingPage } from "./pages/auth/OnboardingPage";
import { WorkspaceDetailPage } from "./pages/workspace/WorkspaceDetailPage";
import { WorkspaceSettingsPage } from "./pages/workspace/WorkspaceSettingsPage";

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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/2fa",
    element: <TwoFactorPage />,
  },
  {
    path: "/accept-invite/:token",
    element: <AcceptInvitePage />,
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />,
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
        <WorkspaceDetailPage />
      </AppShell>
    ),
  },
  {
    path: "/w/:slug/settings",
    element: (
      <AppShell>
        <WorkspaceSettingsPage />
      </AppShell>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
