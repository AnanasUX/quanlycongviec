# Nhật ký thay đổi (Changelog)

Toàn bộ các mốc phát triển và thay đổi mã nguồn được ghi nhận tại đây theo từng giai đoạn.

## [Giai đoạn 0] - 14/11/2026

### Đã hoàn thành (Added & Changed)

- **Cấu trúc Monorepo:**
  - Khởi tạo `pnpm-workspace.yaml` với cấu trúc `apps/*` và `packages/*`.
  - Dùng `git mv` chuyển code nền gốc vào `apps/web/` bảo toàn lịch sử git.
  - Xoá hoàn toàn phần tích hợp của Figma Make (`.figma/`, plugin figma trong `vite.config.ts`, comment figma trong `index.html`).
  - Khởi tạo các workspace phụ trợ: `apps/api` (Fastify 5), `apps/realtime` (WebSocket ws), `packages/db` (Drizzle ORM), `packages/shared` (Zod).
- **Design System & Tokens:**
  - Trích xuất toàn bộ biến màu, bán kính, kích thước từ CSS gốc vào `apps/web/src/styles/tokens.css` theo chuẩn mục 3.2 SPEC.
  - Giữ nguyên phông chữ `Be Vietnam Pro` nạp từ Google Fonts.
- **Tách Component UI:**
  - Tách `App.tsx` (781 dòng) thành `AppShell`, `Sidebar`, `Topbar`, `GlobalSearch`, `NotificationCenter`, `UserMenu`.
  - Tách toàn bộ các thẻ Dashboard thành component độc lập: `WelcomeBanner`, `QuickActions`, `TodaySchedule`, `MyTasks`, `TeamActivity`, `RecentShared`, `WorkspaceCards`, `TaskModal`, `CreateWorkspaceModal`.
  - Thêm điều hướng thật bằng `react-router-dom` (các mục menu dùng `<NavLink>` và URL tương ứng).
  - Khởi tạo cấu hình đa ngôn ngữ `react-i18next` (vi-VN).
  - Hỗ trợ đổi giao diện sáng/tối qua token `data-theme="dark"`.
- **Hạ tầng & Kiểm thử:**
  - Tạo `docker-compose.yml` gồm 6 container: PostgreSQL 16, Redis 7, MinIO, ClamAV, API, Realtime có đầy đủ healthcheck.
  - Cung cấp `.env.example`.
  - Cấu hình TypeScript strict, ESLint 9 flat config, Prettier, Husky.
  - Cấu hình pipeline CI `.github/workflows/ci.yml`.
  - Xác thực Visual Regression bằng Playwright so khớp ảnh với Baseline (1440px: 100% khớp, 390px: 100% khớp, 1024px: 99.98% khớp).
