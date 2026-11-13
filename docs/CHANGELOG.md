# Nhật ký thay đổi (Changelog)

Toàn bộ các mốc phát triển và thay đổi mã nguồn được ghi nhận tại đây theo từng giai đoạn.

## [Giai đoạn 1] - 14/11/2026 (Đang chờ nghiệm thu)

### Đã hoàn thành (Added & Changed)

- **Xác thực & Tài khoản (FR-AUTH-01..09):**
  - Đăng ký tài khoản mật khẩu argon2id, xác thực độ mạnh mật khẩu (≥ 10 ký tự, chữ hoa, chữ thường, số).
  - Đăng nhập bảo mật với cơ chế khoá tạm 15 phút sau 5 lần sai liên tiếp, tự động mở lại sau 15 phút (đã kiểm chứng qua thời gian giả lập).
  - Cookie phiên `session_token` có đủ cờ `httpOnly`, `SameSite=Lax`, `Path=/`, và `Secure` trong production.
  - Xác thực hai lớp TOTP (FR-AUTH-05) với mã 6 chữ số và 10 mã dự phòng dùng một lần.
  - Quên và đặt lại mật khẩu (FR-AUTH-04) tự động thu hồi toàn bộ các phiên làm việc cũ.
  - Quản lý phiên làm việc (FR-AUTH-06) hỗ trợ xem danh sách thiết bị và thu hồi phiên từ xa.
  - Cập nhật hồ sơ cá nhân (FR-AUTH-07) và xoá tài khoản vĩnh viễn (FR-AUTH-08) có xác nhận mật khẩu.
  - Giới hạn tốc độ truy cập (FR-AUTH-09) trả về 429 `RATE_LIMITED` chuẩn theo SPEC 8.3.
  - Google OAuth (FR-AUTH-03) hoàn thiện Schema & UI (đánh dấu Một phần do chưa kết nối callback từ máy chủ Google bên ngoài).
- **Không gian làm việc & Ma trận phân quyền (FR-WS-01..08 & SPEC 6.0):**
  - Xây dựng Policy Engine tập trung `policy.can(user, action, resource)` bao phủ 100% ma trận quyền 5 vai trò (Owner, Admin, Member, Guest, Viewer).
  - Thiết kế Schema Drizzle ORM và sinh migration SQL hoàn chỉnh (`users`, `sessions`, `oauth_accounts`, `workspaces`, `workspace_members`, `invitations`).
  - Cấu hình Row Level Security (RLS) PostgreSQL với hàm helper `SECURITY DEFINER` và `FORCE ROW LEVEL SECURITY`, đã kiểm thử SQL trực tiếp cô lập thành công dữ liệu giữa người dùng workspace A và workspace B.
  - Seed dữ liệu mẫu chuẩn theo SPEC: 1 tổ chức (Công ty Workspace), 4 không gian làm việc, 12 người dùng đủ 5 vai trò, 48 liên kết thành viên.
  - Quản lý vòng đời workspace: tạo mới (người tạo là Owner), mời thành viên bằng token 7 ngày, đổi vai trò, chặn Owner cuối cùng rời không gian, xoá mềm 30 ngày.
- **Giao diện Người dùng (SPEC 7.1, 7.2, 7.11):**
  - Màn hình xác thực: Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`), Xác thực 2FA (`/2fa`), Lời mời (`/accept-invite/:token`), Onboarding 3 bước (`/onboarding`).
  - Màn hình Không gian làm việc: Trang chủ (`/w/:slug`) và Trang Cài đặt (`/w/:slug/settings`).
  - Chụp màn hình kiểm tra giao diện ở 3 độ phân giải (1440, 1024, 390 px) lưu tại `docs/design/phase1/`.
- **Kiểm thử:**
  - 38 bài test pass 100% (Permissions: 9 tests, Auth: 8 tests, API Fastify: 16 tests, RLS PostgreSQL: 3 tests, Shared schema: 2 tests).

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
