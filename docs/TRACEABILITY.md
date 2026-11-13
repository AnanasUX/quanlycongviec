# Ma trận Truy xuất Yêu cầu (Requirement Traceability Matrix)

Tài liệu này theo dõi tiến độ hoàn thành các yêu cầu chức năng (FR) và phi chức năng qua từng giai đoạn phát triển theo `/docs/SPEC.md`.

## Giai đoạn 0: Nền móng (Phase 0: Foundation) - Đã hoàn thành

| Mục tiêu / Hạng mục                  | Mã nguồn thực hiện                                            | Kiểm thử liên quan                         | Trạng thái |
| :----------------------------------- | :------------------------------------------------------------ | :----------------------------------------- | :--------: |
| Monorepo pnpm & Dọn Figma Make       | `pnpm-workspace.yaml`, `package.json`, `apps/*`, `packages/*` | `pnpm install`, `pnpm build`               | Hoàn thành |
| Design Tokens (Mục 3.2)              | `apps/web/src/styles/tokens.css`                              | Build CSS, Visual regression               | Hoàn thành |
| Tách App.tsx thành AppShell & Topbar | `apps/web/src/components/layout/*`                            | Playwright snapshot                        | Hoàn thành |
| Tách các widget Dashboard            | `apps/web/src/components/dashboard/*`, `DashboardPage.tsx`    | Visual regression (1440/1024/390)          | Hoàn thành |
| React Router & Navigation Link       | `apps/web/src/router.tsx`, `Sidebar.tsx`                      | Typecheck, Router test                     | Hoàn thành |
| i18n chuẩn vi-VN                     | `apps/web/src/i18n/index.ts`                                  | Typecheck, Build                           | Hoàn thành |
| Fastify API, pino, healthz/readyz    | `apps/api/src/index.ts`                                       | Typecheck, Health probe                    | Hoàn thành |
| Realtime WebSocket Scaffolding       | `apps/realtime/src/index.ts`                                  | Typecheck                                  | Hoàn thành |
| Database Package Scaffolding         | `packages/db/src/index.ts`                                    | Typecheck                                  | Hoàn thành |
| Shared Schema Package                | `packages/shared/src/index.ts`                                | `packages/shared/src/index.test.ts`        | Hoàn thành |
| Docker Compose (6 dịch vụ)           | `docker-compose.yml`, `.env.example`, Dockerfiles             | Config validation                          | Hoàn thành |
| CI/CD Pipeline                       | `.github/workflows/ci.yml`, `eslint.config.js`                | `pnpm lint`, `pnpm typecheck`, `pnpm test` | Hoàn thành |

---

## Bảng theo dõi Fixtures tạm thời (Chuyển sang dữ liệu thật)

Các chuỗi số liệu và thông tin người dùng được trích xuất vào [`apps/web/src/data/fixtures.ts`](file:///e:/Python/Quanlycongviec/apps/web/src/data/fixtures.ts) sẽ được thay thế bằng dữ liệu thật theo bảng phân công dưới đây:

| Tên Fixture                  | Giá trị tạm thời                                            | Component sử dụng                   | Mã FR liên quan            |                    Giai đoạn thay thế                    |
| :--------------------------- | :---------------------------------------------------------- | :---------------------------------- | :------------------------- | :------------------------------------------------------: |
| `currentUserFixture`         | "Minh Anh", "MA", "minhanh@workspace.vn", "Chào buổi sáng"  | `WelcomeBanner.tsx`, `UserMenu.tsx` | `FR-AUTH-07`, `FR-DASH-01` |   **Giai đoạn 1** (Auth) & **Giai đoạn 2** (Dashboard)   |
| `scheduleDateFixture`        | "Thứ Hai, 20 tháng 1, 2025"                                 | `TodaySchedule.tsx`                 | `FR-DASH-03`, `FR-CAL-01`  | **Giai đoạn 2** (Dashboard) & **Giai đoạn 5** (Calendar) |
| `tasksTabsFixture`           | "Sắp tới (3)"                                               | `MyTasks.tsx`                       | `FR-TASK-02`, `FR-DASH-04` |             **Giai đoạn 2** (Dashboard thật)             |
| `teamActivityMetricsFixture` | "124", "56", "28", "+8.5%", "7 ngày qua", biểu đồ SVG       | `TeamActivity.tsx`                  | `FR-DASH-05`               |             **Giai đoạn 2** (Dashboard thật)             |
| `notificationItemsFixture`   | "Tuấn đã hoàn thành công việc", "Kế hoạch Q1", "3 tin nhắn" | `NotificationCenter.tsx`            | `FR-NOTI-01..03`           |   **Giai đoạn 2** (Dashboard) & **Giai đoạn 6** (Chat)   |
| `storageUsageFixture`        | "128.4 GB / 500 GB", "Dữ liệu đang dùng"                    | `Sidebar.tsx`                       | `FR-STO-10`                |                **Giai đoạn 3** (Storage)                 |
| `avatarStackFixture`         | "+5"                                                        | `AvatarStack.tsx`                   | `FR-WS-07`                 |               **Giai đoạn 1** (Workspace)                |

---

## Giai đoạn 1: Danh tính và Không gian (Sắp tới)

| Mã FR            | Tên chức năng                                     | File thực hiện | File test |  Trạng thái  |
| :--------------- | :------------------------------------------------ | :------------- | :-------- | :----------: |
| `FR-AUTH-01..09` | Xác thực, đăng ký, đăng nhập, 2FA, session cookie | Sắp làm        | Sắp làm   | Chưa bắt đầu |
| `FR-WS-01..08`   | Quản lý Không gian làm việc, chuyển ngữ cảnh      | Sắp làm        | Sắp làm   | Chưa bắt đầu |
