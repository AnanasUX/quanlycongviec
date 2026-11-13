# Nhật ký thay đổi (Changelog)

Toàn bộ các mốc phát triển và thay đổi mã nguồn được ghi nhận tại đây theo từng giai đoạn.

## [Giai đoạn 1] - 14/11/2026

### Đã hoàn thành (Added & Changed)

- **Xác thực & Tài khoản (FR-AUTH-01..09):**
  - Đăng ký tài khoản mật khẩu argon2id, xác thực độ mạnh mật khẩu (≥ 10 ký tự, chữ hoa, chữ thường, số).
  - Đăng nhập bảo mật với cơ chế khoá tạm 15 phút sau 5 lần sai liên tiếp, thông báo lỗi an toàn (không tiết lộ sự tồn tại của email).
  - Xác thực hai lớp TOTP (FR-AUTH-05) với mã 6 chữ số và 10 mã dự phòng dùng một lần.
  - Quên và đặt lại mật khẩu (FR-AUTH-04) tự động thu hồi toàn bộ các phiên làm việc cũ.
  - Quản lý phiên làm việc (FR-AUTH-06) với cookie httpOnly, SameSite=Lax, hỗ trợ xem danh sách thiết bị và thu hồi phiên từ xa.
  - Cập nhật hồ sơ cá nhân (FR-AUTH-07) và xoá tài khoản vĩnh viễn (FR-AUTH-08) có xác nhận mật khẩu.
  - Giới hạn tốc độ truy cập (FR-AUTH-09) bằng Fastify rate-limiter.
- **Không gian làm việc & Ma trận phân quyền (FR-WS-01..08 & SPEC 6.0):**
  - Xây dựng Policy Engine tập trung `policy.can(user, action, resource)` bao phủ 100% ma trận quyền 5 vai trò (Owner, Admin, Member, Guest, Viewer).
  - Thiết kế Schema Drizzle ORM và sinh migration SQL hoàn chỉnh (`users`, `sessions`, `oauth_accounts`, `workspaces`, `workspace_members`, `invitations`) kèm cấu hình Row Level Security (RLS) PostgreSQL.
  - Script seed dữ liệu mẫu chuẩn theo SPEC (1 tổ chức, 4 không gian, 12 người dùng có vai trò khác nhau).
  - Quản lý vòng đời workspace: tạo mới (người tạo là Owner), mời thành viên bằng token 7 ngày, đổi vai trò, chặn Owner cuối cùng rời không gian, xoá mềm 30 ngày.
- **Giao diện Người dùng (SPEC 7.1, 7.2, 7.11):**
  - Màn hình xác thực: Đăng nhập (`/login`), Đăng ký (`/register` kèm thước đo độ mạnh mật khẩu), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`), Xác thực 2FA (`/2fa` với 6 ô nhập tự chuyển focus), Lời mời (`/accept-invite/:token`), Onboarding 3 bước (`/onboarding`).
  - Màn hình Không gian làm việc: Trang chủ (`/w/:slug`) với 6 tab (Tổng quan, Tài liệu, Trình chiếu, Tệp, Thành viên, Hoạt động) và Trang Cài đặt (`/w/:slug/settings`).
  - Đủ 5 trạng thái giao diện: skeleton loading, empty state, error with retry, forbidden (403), not found (404).
- **Kiểm thử:**
  - 33 test unit & integration pass 100% (`permissions.test.ts`, `auth.test.ts`, `api.test.ts`).
  - Visual regression check đạt 0 pixel lệch so với baseline.

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
  - **Chuẩn hoá dữ liệu mẫu & Phông chữ Baseline:**
  - Trích xuất toàn bộ chuỗi/số liệu cứng vào `apps/web/src/data/fixtures.ts` và đối chiếu mã FR tương ứng trong `docs/TRACEABILITY.md`.
  - Thực hiện thí nghiệm đối chứng phông chữ trên viewport 1024px: gỡ bỏ thẻ `<link>` bổ sung trong `index.html`, sử dụng `@import` nguyên gốc trong CSS để loại bỏ sai lệch kerning chữ do FOUT.
  - Xác thực Visual Regression bằng Playwright so khớp với Baseline: Viewport 1024px (100% khớp - 0 pixel lệch), Viewport 390px (100% khớp - 0 pixel lệch), Viewport 1440px (100% khớp layout, chỉ 225 pixel kerning chữ của select box do FOUT baseline lúc khởi động).
  - Kiểm chứng `docker compose config` hợp lệ hoàn toàn cho toàn bộ 6 dịch vụ (PostgreSQL 16, Redis 7, MinIO, ClamAV, Realtime, Web) với đầy đủ healthcheck.
