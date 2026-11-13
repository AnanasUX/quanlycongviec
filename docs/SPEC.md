# Workspace – Master Prompt, Kế hoạch & Đặc tả hệ thống

Phiên bản 1.0 · 13/11/2026 · Dùng để triển khai bằng Antigravity

**Cập nhật 13/11/2026:** tài liệu đã được đối chiếu với code giao diện Figma Make (React 19 + Vite + Tailwind v4). Công nghệ frontend, phông chữ và token ở các mục 2, 3, 4 và 10 đã chỉnh theo code; mục 3.3 và 3.4 giải thích cách ghép code với đặc tả để Antigravity triển khai đúng.

## Mục lục

1. Cách dùng tài liệu với Antigravity
2. Master Prompt (dán vào Antigravity)
3. Phân tích giao diện hiện có & Design System
4. Kiến trúc & công nghệ
5. Kế hoạch triển khai theo giai đoạn
6. Đặc tả chức năng chi tiết (SRS)
7. Giao diện bổ sung cho các phân hệ lõi
8. Mô hình dữ liệu & API
9. Yêu cầu phi chức năng & đảm bảo ổn định
10. Chuỗi prompt theo từng giai đoạn
11. Checklist nghiệm thu

## 1. Cách dùng tài liệu với Antigravity

1. Tạo repo mới, đặt file này vào `/docs/SPEC.md`, ảnh giao diện vào `/docs/design/dashboard.png`.
2. Mở Antigravity, chọn **Planning mode**, dán **Master Prompt** (mục 2) làm chỉ dẫn gốc. Nếu Antigravity hỗ trợ file quy tắc cho workspace (ví dụ `.agent/rules` hoặc `GEMINI.md`), hãy lưu Master Prompt ở đó để mọi agent đều tuân theo.
3. Chạy **từng giai đoạn** ở mục 10, không giao cả hệ thống trong một lần. Mỗi giai đoạn: yêu cầu agent lập Implementation Plan → bạn duyệt → agent code → agent tự chạy test và dùng browser agent chụp ảnh màn hình đối chiếu với thiết kế.
4. Sau mỗi giai đoạn, commit và gắn tag (`phase-1-done`...). Nếu agent lệch hướng, quay lại tag gần nhất thay vì sửa chồng.
5. Không gộp giai đoạn. Lỗi nhỏ ở nền tảng (auth, phân quyền, DB) sẽ nhân lên ở mọi phân hệ phía sau.

## 2. Master Prompt (dán vào Antigravity)

```
VAI TRÒ  
Bạn là đội kỹ sư full-stack senior (kiến trúc sư, frontend, backend, QA, DevOps) đang xây dựng WORKSPACE: nền tảng làm việc cộng tác bằng tiếng Việt gồm Tổng quan, Soạn thảo tài liệu, Đội ngũ, Trình chiếu, Lịch làm việc, Tin nhắn, Kho lưu trữ và các Không gian làm việc (Công ty, Dự án Sản phẩm, Marketing, Nhân sự...).  
  
NGUỒN SỰ THẬT (đọc trước khi làm bất cứ việc gì)  
1. /docs/design/dashboard.png: giao diện Tổng quan đã duyệt; /apps/web là code nền (Figma Make) đã hiện thực giao diện đó và là nguồn sự thật cho giao diện. Giữ nguyên bố cục, màu, bo góc, khoảng cách, font, tên class CSS khi tách component (SPEC mục 3.3, 3.4). Mọi màn hình mới phải cùng ngôn ngữ thiết kế.  
2. /docs/SPEC.md: đặc tả chức năng (mã FR-xxx), mô hình dữ liệu, API, tiêu chí nghiệm thu.  
Nếu mâu thuẫn: SPEC.md (hành vi, dữ liệu) > code nền /apps/web (giao diện) > ảnh thiết kế > suy đoán. Không tự ý bớt chức năng. Nếu thiếu thông tin, ghi giả định vào /docs/ASSUMPTIONS.md rồi tiếp tục, không dừng hỏi vụn vặt.  
  
CÔNG NGHỆ (cố định, không đổi nếu không có lý do được ghi lại trong /docs/ADR)  
- Monorepo pnpm: apps/web = CODE NỀN ĐÃ CÓ (React 19 + Vite + Tailwind CSS v4 + lucide-react, TypeScript strict; xem SPEC mục 3.3, KHÔNG viết lại, KHÔNG chuyển sang Next.js; thêm React Router + TanStack Query), apps/api (Node 22 + Fastify, REST /api/v1), apps/realtime (Node + WebSocket/Hocuspocus cho Yjs), packages/db, packages/shared.  
- UI: giữ Tailwind CSS v4 + lucide-react + CSS thuần đã có trong code nền; font Be Vietnam Pro. Chỉ thêm Radix UI (headless) cho hộp thoại, menu, popover khi cần. Hỗ trợ sáng/tối.  
- Dữ liệu: PostgreSQL + Drizzle ORM (migration có phiên bản), Redis (cache, pub/sub, rate limit, presence), BullMQ (job nền).  
- Soạn thảo: TipTap + Yjs. Trình chiếu: editor canvas tự xây, xuất .pptx bằng pptxgenjs.  
- Lưu trữ tệp: S3-compatible (MinIO khi dev), upload presigned, chia nhỏ (multipart) cho tệp lớn, quét virus bằng ClamAV.  
- Xác thực: email + mật khẩu (argon2id), Google OAuth, 2FA TOTP, session cookie httpOnly. Phân quyền RBAC theo từng không gian.  
- i18n: react-i18next, mặc định vi-VN, sẵn sàng thêm en-US. Múi giờ mặc định Asia/Ho_Chi_Minh, lưu UTC trong DB.  
- Kiểm thử: Vitest (unit), Playwright (E2E), axe (a11y). Container hoá bằng Docker Compose (web, realtime, postgres, redis, minio, clamav).  
  
NGUYÊN TẮC BẮT BUỘC  
1. Làm theo giai đoạn trong SPEC.md mục 5 và 10. Chỉ làm giai đoạn được giao.  
2. Trước khi code: xuất Implementation Plan (file nào, bảng nào, endpoint nào, rủi ro). Chờ tôi duyệt.  
3. Mọi chức năng phải có: validate đầu vào (zod), kiểm tra quyền phía server, trạng thái loading / rỗng / lỗi, thông báo tiếng Việt, test tự động.  
4. Không dùng dữ liệu giả cứng trong UI cuối cùng. Dữ liệu mẫu chỉ nằm trong script seed (pnpm db:seed).  
5. Không bao giờ tin client: phân quyền, giới hạn dung lượng, kiểm tra loại tệp đều làm ở server.  
6. Không lưu bí mật trong repo. Dùng .env.example, kiểm tra biến môi trường khi khởi động.  
7. Mọi thay đổi schema qua migration. Không sửa tay DB.  
8. Truy cập DB phân trang bằng cursor, có index cho cột lọc/sắp xếp. Cấm N+1.  
9. Lỗi phải được ghi log có cấu trúc (pino) kèm requestId; không nuốt lỗi.  
10. Accessibility: điều hướng bàn phím, focus rõ, tương phản AA, aria-label tiếng Việt.  
  
ĐỊNH NGHĨA HOÀN THÀNH (DoD) cho mỗi giai đoạn  
- pnpm lint, pnpm typecheck, pnpm test, pnpm e2e đều xanh.  
- docker compose up chạy được từ máy sạch, có hướng dẫn README.  
- Ảnh chụp màn hình các màn hình mới khớp ngôn ngữ thiết kế (dùng browser agent so với dashboard.png).  
- Cập nhật /docs/CHANGELOG.md và đánh dấu FR đã xong trong /docs/TRACEABILITY.md.  
- Walkthrough ngắn: đã làm gì, cách kiểm tra, việc còn tồn.  
  
ĐẦU RA MỖI LẦN BÀN GIAO  
(1) Danh sách FR hoàn thành, (2) kết quả test, (3) việc chưa làm và lý do, (4) rủi ro còn lại.
```

## 3. Phân tích giao diện hiện có & Design System

### 3.1 Danh mục thành phần trên màn hình Tổng quan

| Khu vực | Thành phần | Hành vi cần có |
| --- | --- | --- |
| Thanh bên trái | Logo Workspace; menu: Tổng quan, Soạn thảo, Đội ngũ, Trình chiếu, Lịch làm việc, Tin nhắn (huy hiệu số chưa đọc), Kho lưu trữ | Mục đang chọn tô nền tím nhạt; huy hiệu cập nhật realtime |
| Thanh bên trái | Nhóm KHÔNG GIAN LÀM VIỆC: Công ty, Dự án Sản phẩm, Marketing, Nhân sự, Tạo không gian mới | Chuyển ngữ cảnh không gian; dữ liệu mọi trang lọc theo không gian đang chọn |
| Thanh bên trái (đáy) | Dung lượng: 128.4 GB / 500 GB, thanh tiến độ | Bấm vào mở trang Kho lưu trữ > Dung lượng; cảnh báo khi trên 80% |
| Thanh trên | Ô tìm kiếm (Ctrl K), chuông thông báo (chấm đỏ), trợ giúp, avatar | Command palette; trung tâm thông báo; menu tài khoản |
| Banner | Lời chào theo giờ (Chào buổi sáng, Minh Anh) + slogan | Chào theo giờ trong ngày và tên người dùng |
| Lối tắt | Soạn thảo, Đội ngũ, Trình chiếu, Lịch làm việc, Tin nhắn, Kho lưu trữ + nút Tạo không gian mới | Mỗi lối tắt mở hộp thoại tạo nhanh hoặc đi tới phân hệ |
| Thẻ | Lịch làm việc hôm nay (3 sự kiện, màu theo loại) | Xem lịch, menu ba chấm: sửa, xoá, tham gia họp |
| Thẻ | Công việc của tôi (tab Đang thực hiện, Sắp tới (3), Đã hoàn thành; Thêm công việc) | CRUD công việc, đổi tab, trạng thái rỗng |
| Thẻ | Hoạt động của nhóm (7 ngày qua; 124 tài liệu tạo, 56 lượt chỉnh sửa, 28 lượt chia sẻ; biểu đồ đường T2–CN) | Bộ lọc 7/30/90 ngày; số liệu kèm % so với kỳ trước |
| Thẻ | Tài liệu được chia sẻ gần đây (biểu tượng màu theo loại, người sửa, thời gian tương đối) | Mở tài liệu; Xem tất cả |
| Thẻ | Không gian làm việc của bạn (số thành viên, số tài liệu, avatar xếp chồng +n, thẻ Tạo không gian mới) | Mở không gian; menu ba chấm: cài đặt, rời đi |

Lưu ý: màn hình mẫu hiển thị ngày 20/01/2025 và dữ liệu giả. Hệ thống thật phải lấy ngày/giờ hiện tại và dữ liệu từ DB.

### 3.2 Design tokens (lấy từ src/index.css của code nền, dùng làm chuẩn cho mọi màn hình mới)

| Token | Giá trị trong code (`src/index.css`) | Ghi chú |
| --- | --- | --- |
| `--primary` / `--primary-dark` | #6C5CE7 / #5546D4 | Nút chính, mục menu đang chọn, tab gạch chân / trạng thái nhấn |
| `--primary-soft` | #EFECFF | Nền mục chọn, banner |
| `--canvas` | #F7F8FC | Nền trang |
| `--surface` / `--border` | #FFFFFF / #E9E9F1 | Thẻ (panel) viền 1px |
| `--ink` / `--muted` | #16152A / #77768B | Tiêu đề / mô tả |
| `--shadow` | 0 8px 30px rgba(34, 31, 65, 0.07) | Đổ bóng rất nhẹ |
| Màu loại nội dung | Xanh dương #4D9BF5 (tài liệu), Xanh lá #39BB83 (đội ngũ), Cam #F3A43C (trình chiếu), Tím #806EE9 (lịch), Xanh trời #46A4DC (tin nhắn), Cyan #42B9DC (lưu trữ) | Biểu tượng lối tắt và tài liệu |
| Màu vạch sự kiện lịch | #6C5CE7, #36B37E, #F59E0B | Theo loại sự kiện |
| Phông chữ | Be Vietnam Pro 400/500/600/700; cỡ gốc 13px | Nạp từ Google Fonts |
| Bán kính | Panel 12px, banner 13px, nút và ô nhập 9px, hộp thoại 16px, avatar tròn |  |
| Kích thước khung | Sidebar 220px; nội dung tối đa 1500px; popover thông báo 325px; hộp thoại 430px |  |
| Điểm ngắt | 1180px, 820px, 600px | ≤1180: lưới 2 cột, lối tắt 3 cột; ≤820: sidebar thành ngăn kéo |
| Lưới Tổng quan | Hàng trên 0.95fr / 1.05fr / 1fr; hàng dưới 0.8fr / 2fr; lối tắt 6 cột + nút |  |

Yêu cầu: toàn bộ token khai báo một nơi (`apps/web/src/styles/tokens.css`), không hard-code màu trong component.

### 3.3 Code nền hiện có (Figma Make) và cách khớp với đặc tả

File `Thiết_Kế_Giao_Diện_Và_Hệ_Thống.zip` là code của giao diện Tổng quan. Nó là **nguồn sự thật cho giao diện**; tài liệu này là nguồn sự thật cho **hành vi, dữ liệu và các màn hình còn thiếu**.

**Hiện trạng (đọc trực tiếp từ code)**

| Hạng mục | Nội dung trong code |
| --- | --- |
| Công nghệ | React 19, Vite 8, TypeScript 5.7 strict, Tailwind CSS v4, lucide-react. Chưa có router, thư viện dữ liệu, test, ESLint |
| Cấu trúc | 3 file nguồn: `src/App.tsx` (780 dòng, cả giao diện trong một component), `src/index.css` (CSS thuần theo tên class như `.sidebar`, `.panel`, `.modal`), `src/main.tsx` |
| Phạm vi | Chỉ màn hình Tổng quan. Các mục menu khác chỉ hiện thông báo nổi “Đã chuyển đến …” |
| Dữ liệu | Toàn bộ là hằng số trong `App.tsx`: lịch, tài liệu, không gian, 3 công việc, số liệu 124/56/28, biểu đồ SVG vẽ tay |
| Tương tác có sẵn | Đổi mục menu (chỉ đổi state), tìm kiếm lọc trong mảng mock, popover thông báo, thêm và tích hoàn thành công việc (mất khi tải lại), hộp thoại tạo không gian (chỉ hiện thông báo), ngăn kéo sidebar trên di động |
| Phần dành riêng cho Figma Make | Thư mục `.figma/`, `vite.config.ts` có plugin riêng của Figma Make, `AGENTS.md` mô tả môi trường Figma Make, `index.html` có các thẻ chú thích `<!-- figma:… -->` |

**Đối chiếu với đặc tả bản đầu và quyết định áp dụng**

| Hạng mục | Code hiện có | Đặc tả bản đầu | Quyết định |
| --- | --- | --- | --- |
| Frontend | Vite + React (SPA) | Next.js 15 | Giữ Vite + React; thêm React Router và TanStack Query; backend tách thành `apps/api` (Fastify) |
| Phông chữ | Be Vietnam Pro | Plus Jakarta Sans | Be Vietnam Pro |
| Component | CSS thuần + lucide-react | shadcn/ui | Giữ CSS hiện có; chỉ thêm Radix UI (headless) cho hộp thoại, menu, popover |
| Tên token | `--canvas`, `--ink`, `--border` | `--bg-page`, `--text` | Dùng tên trong code (bảng 3.2) |
| Bán kính thẻ | 12px | 16px | 12px |
| Hoạt động nhóm | Chọn 7 hoặc 30 ngày | 7, 30, 90 ngày | Thêm 90 ngày (FR-DASH-05) |
| Sáng/tối | Chưa có | Có | Thêm bằng token ở giai đoạn 0 |
| i18n | Chuỗi tiếng Việt viết cứng | next-intl | react-i18next, tách chuỗi ở giai đoạn 0 |

**Điểm chưa đúng hoặc chưa hoàn chỉnh trong prototype (phải sửa khi làm thật)**

* Tab “Sắp tới (3)” lọc giống hệt “Đang thực hiện” (chỉ tách theo đã/chưa hoàn thành) và con số (3) viết cứng. Theo FR-TASK-02 phải lọc theo hạn trong 7 ngày tới và đếm thật.
* Lời chào “Chào buổi sáng”, ngày “Thứ Hai, 20 tháng 1, 2025” viết cứng (FR-DASH-01, FR-DASH-03).
* Avatar “+5”, số thành viên và số tài liệu viết cứng (FR-WS-07). Dung lượng 128.4 / 500 GB viết cứng (FR-STO-10).
* Biểu đồ hoạt động là SVG vẽ tay: 8 điểm cho 7 nhãn T2–CN, không đổi theo bộ lọc (FR-DASH-05).
* Ô tìm kiếm hiển thị Ctrl K nhưng không có xử lý phím; tìm bằng `includes` nên phân biệt dấu (FR-SRCH-01, FR-SRCH-02).
* Hộp thoại chưa đóng bằng Esc, chưa giữ focus; nút Trợ giúp, hồ sơ, menu ba chấm, “Xem lịch”, “Xem tất cả” chỉ hiện thông báo (mục 7.11 và FR-SET-05).
* Điều hướng dùng `button`, chưa là liên kết nên không mở tab mới, không dùng được nút Back/Forward.

**Ánh xạ phần trong** `App.tsx` **sang component mới và FR**

| Phần trong App.tsx | Component sau khi tách | FR liên quan |
| --- | --- | --- |
| `mainNavigation`, `workspaceNavigation`, `storage-card` | `Sidebar` | FR-WS-02, FR-WS-03, FR-MSG-10, FR-STO-10 |
| `search-wrap`, `search-results` | `GlobalSearch` | FR-SRCH-01..06 |
| `notification-popover` | `NotificationCenter` | FR-NOTI-01..03 |
| `profile-button`, nút Trợ giúp | `UserMenu`, `HelpMenu` | FR-AUTH-07, FR-SET-06 |
| `welcome-card` | `WelcomeBanner` | FR-DASH-01 |
| `quick-actions` | `QuickActions` | FR-DASH-02 |
| `schedule-panel` | `TodaySchedule` | FR-DASH-03, FR-CAL-\* |
| `tasks-panel` + hộp thoại thêm việc | `MyTasks`, `TaskModal` | FR-DASH-04, FR-TASK-01, FR-TASK-02 |
| `activity-panel` | `TeamActivity` | FR-DASH-05 |
| `files-panel` | `RecentShared` | FR-DASH-06 |
| `workspaces-panel` + hộp thoại | `WorkspaceCards`, `CreateWorkspaceModal` | FR-DASH-07, FR-WS-01 |
| `toast` | `ToastProvider` | Trạng thái dùng chung, mục 7.11 |

### 3.4 Quy trình đưa code nền vào Antigravity

1. **Cấu trúc repo.** Giải nén zip vào `apps/web/`; đặt tài liệu này vào `docs/SPEC.md`; đặt ảnh thiết kế vào `docs/design/`.
2. **Dọn phần của Figma Make.** Xoá `.figma/`; thay `vite.config.ts` bằng cấu hình tối thiểu (react, tailwindcss, alias `@`, proxy `/api` sang `apps/api`); bỏ các chú thích `<!-- figma:… -->` trong `index.html` và đặt `lang=vi`; thay `AGENTS.md` của code nền bằng quy tắc của dự án (Master Prompt ở mục 2). Nếu Antigravity của bạn đọc file quy tắc ở gốc repo (AGENTS.md hoặc thư mục rules của nó), hãy đặt Master Prompt ở đó.
3. **Chụp ảnh chuẩn.** Chạy `pnpm dev`, chụp trang Tổng quan ở 1440, 1024 và 390 px, lưu vào `docs/design/baseline/`. Đây là chuẩn hồi quy: sau khi tách component, ảnh phải giống hệt.
4. **Khoá thứ tự ưu tiên nguồn.** Hành vi và dữ liệu theo SPEC.md; giao diện theo code nền; ảnh thiết kế để đối chiếu. Khi tách component không đổi markup, tên class hay giá trị CSS trừ khi SPEC yêu cầu.
5. **Màn hình mới dùng lại mẫu của code nền.** Cùng token, cùng mẫu class (`.panel`, `.section-header`, `.nav-item`, `.modal`, `.primary-button`) và cùng bán kính, khoảng cách ở mục 3.2, để các màn hình mục 7 trông như cùng một sản phẩm.
6. **Giữ SPEC và code đồng bộ.** `docs/TRACEABILITY.md` ánh xạ FR sang file và test; muốn đổi hành vi thì sửa SPEC trước rồi mới giao agent sửa code.

## 4. Kiến trúc & công nghệ

### 4.1 Sơ đồ khối

```
Trình duyệt (React + Vite, TipTap, Canvas Slides)  
   │ HTTPS (REST)        │ WSS (Yjs, presence, chat)  
   ▼                                    ▼  
apps/api (Fastify) ───────────────► apps/realtime (Hocuspocus + Socket)  
   │            │                       │  
   ▼            ▼                       ▼  
PostgreSQL    Redis (cache, pub/sub, rate limit, presence)  
   │            │  
   │            └─► BullMQ workers: thông báo, email, xuất PDF/PPTX,  
   │                quét virus, tạo thumbnail, dọn thùng rác, sao lưu  
   ▼  
S3/MinIO (tệp, phiên bản, thumbnail)   ClamAV   SMTP
```

### 4.2 Cấu trúc thư mục

```
apps/web/                CODE NỀN ĐÃ CÓ: React 19 + Vite + Tailwind v4 (SPA)  
  src/pages/…            trang theo route: auth, dashboard, docs, slides, calendar, messages, storage, team, workspace  
  src/components/…       AppShell, Sidebar, Topbar, thẻ dashboard, modal, toast (tách từ App.tsx)  
  src/lib/api/…          client API và hook TanStack Query  
  src/styles/…           tokens.css + index.css (giữ nguyên giá trị hiện có)  
apps/api/…               Fastify: routes, services, repositories, policies (phân quyền)  
apps/realtime/…          đồng bộ Yjs, presence, gateway chat  
packages/db/…            schema Drizzle, migration, seed  
packages/shared/…        zod schema, kiểu dùng chung, hằng số quyền
```

Quy tắc phân lớp: Route/Action → Service (nghiệp vụ) → Repository (DB) và luôn đi qua `policy.can(user, action, resource)` trước khi chạm dữ liệu.

## 5. Kế hoạch triển khai theo giai đoạn

Ước lượng cho 1 người điều phối + agent. Tổng khoảng 14–18 tuần để đạt bản ổn định đầu tiên.

| GĐ | Tên | Nội dung chính | Thời gian | Điều kiện hoàn thành |
| --- | --- | --- | --- | --- |
| 0 | Nền móng | Monorepo, Docker Compose, CI, design tokens, layout khung (sidebar, topbar), i18n, logging, health check | 1 tuần | `docker compose up` chạy; khung giao diện khớp ảnh |
| 1 | Danh tính & Không gian | Đăng ký/đăng nhập, 2FA, hồ sơ, tạo/sửa không gian, thành viên, vai trò, lời mời | 2 tuần | Phân quyền có test cho mọi vai trò |
| 2 | Tổng quan (dữ liệu thật) | Toàn bộ thẻ trên dashboard chạy bằng API thật, công việc CRUD, thống kê hoạt động | 1 tuần | Dashboard khớp ảnh, 0 dữ liệu giả cứng |
| 3 | Kho lưu trữ | Thư mục, upload multipart, xem trước, phiên bản, thùng rác, hạn mức dung lượng, quét virus | 2 tuần | Upload 2 GB ổn định, tiếp tục được khi đứt mạng |
| 4 | Soạn thảo | Trình soạn thảo TipTap, cộng tác realtime, bình luận, lịch sử phiên bản, chia sẻ, mẫu | 3 tuần | 10 người sửa cùng lúc không mất dữ liệu |
| 5 | Lịch làm việc | Lịch ngày/tuần/tháng, lặp sự kiện, lời mời, phòng họp, nhắc lịch, đồng bộ iCal | 2 tuần | Lặp và múi giờ đúng trong bộ test |
| 6 | Tin nhắn | Kênh, nhắn riêng, luồng trả lời, tệp đính kèm, đã đọc, huy hiệu chưa đọc | 2 tuần | Độ trễ gửi–nhận dưới 300 ms nội bộ |
| 7 | Trình chiếu | Editor slide, mẫu, chuyển trang, chế độ trình chiếu, xuất PDF/PPTX | 3 tuần | Xuất PPTX mở được trong PowerPoint |
| 8 | Đội ngũ & Quản trị | Danh bạ, sơ đồ, vai trò tuỳ chỉnh, nhật ký kiểm toán, báo cáo, cài đặt hệ thống | 1 tuần | Mọi hành động nhạy cảm có audit log |
| 9 | Làm cứng & phát hành | Kiểm thử tải, bảo mật, sao lưu/khôi phục, giám sát, tài liệu vận hành | 1–2 tuần | Đạt toàn bộ mục 9 và 11 |

Thứ tự gợi ý: GĐ 0→1→2 trước (tạo xương sống), sau đó 3→4 (tài liệu và tệp là cốt lõi), rồi 5→6→7→8→9. Có thể chạy song song 5 và 6 nếu dùng nhiều agent, nhưng phải xong GĐ 1 trước.

## 6. Đặc tả chức năng chi tiết (SRS)

Quy ước: **P0** = bắt buộc cho bản đầu, **P1** = quan trọng, **P2** = mở rộng sau. Mã FR dùng để truy vết trong `/docs/TRACEABILITY.md`.

### 6.0 Vai trò và ma trận quyền

| Quyền | Owner | Admin | Member | Guest | Viewer |
| --- | --- | --- | --- | --- | --- |
| Xoá không gian, chuyển quyền sở hữu | ✓ | – | – | – | – |
| Mời/xoá thành viên, đổi vai trò | ✓ | ✓ | – | – | – |
| Cấu hình không gian, quota, tích hợp | ✓ | ✓ | – | – | – |
| Tạo/sửa/xoá nội dung của mình | ✓ | ✓ | ✓ | giới hạn | – |
| Sửa nội dung người khác (khi được chia sẻ quyền sửa) | ✓ | ✓ | ✓ | ✓ | – |
| Xem nội dung được chia sẻ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Xuất dữ liệu, xem nhật ký kiểm toán | ✓ | ✓ | – | – | – |

Quy tắc chung: quyền ở cấp mục (tài liệu, thư mục, sự kiện) có thể **hẹp hơn** nhưng không bao giờ **rộng hơn** quyền của vai trò trong không gian, trừ khi người dùng được mời rõ ràng vào mục đó.

### 6.1 Xác thực và tài khoản (AUTH)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-AUTH-01 | Đăng ký bằng email + mật khẩu | P0 | Mật khẩu ≥ 10 ký tự, kiểm tra độ mạnh; băm argon2id; gửi email xác minh, link hết hạn sau 24 giờ |
| FR-AUTH-02 | Đăng nhập email/mật khẩu | P0 | Khoá tạm 15 phút sau 5 lần sai liên tiếp; thông báo lỗi chung, không lộ email có tồn tại hay không |
| FR-AUTH-03 | Đăng nhập Google OAuth | P1 | Liên kết với tài khoản cùng email đã xác minh |
| FR-AUTH-04 | Quên / đặt lại mật khẩu | P0 | Token dùng một lần, hết hạn 1 giờ; đặt lại xong thu hồi mọi phiên cũ |
| FR-AUTH-05 | Xác thực hai lớp (TOTP) | P1 | Quét QR, 10 mã dự phòng dùng một lần; quản trị có thể bắt buộc 2FA cho cả không gian |
| FR-AUTH-06 | Quản lý phiên | P0 | Cookie httpOnly + SameSite=Lax; xem danh sách thiết bị, đăng xuất từ xa; tự hết hạn sau 30 ngày không hoạt động |
| FR-AUTH-07 | Hồ sơ cá nhân | P0 | Họ tên, avatar (cắt/resize), chức danh, múi giờ, ngôn ngữ; viết tắt avatar (MA) tự sinh khi chưa có ảnh |
| FR-AUTH-08 | Xoá tài khoản | P2 | Xác nhận lại mật khẩu; nội dung chuyển cho Owner không gian hoặc ẩn danh theo lựa chọn |
| FR-AUTH-09 | Giới hạn tốc độ | P0 | Rate limit theo IP và theo tài khoản cho mọi endpoint xác thực (Redis) |

### 6.2 Không gian làm việc (WS)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-WS-01 | Tạo không gian mới (nút ở sidebar, lối tắt và thẻ nét đứt) | P0 | Hộp thoại: tên, biểu tượng + màu, mô tả, mẫu (Trống / Dự án / Marketing / Nhân sự), quyền riêng tư (Riêng tư / Ai có link / Cả tổ chức); người tạo là Owner |
| FR-WS-02 | Danh sách không gian ở sidebar | P0 | Sắp xếp theo thứ tự kéo-thả do người dùng tự đặt; mục đang chọn tô nền; ghi nhớ không gian gần nhất |
| FR-WS-03 | Chuyển không gian | P0 | Đổi ngữ cảnh toàn cục; mọi trang lọc theo không gian; URL dạng `/w/{slug}/…` |
| FR-WS-04 | Mời thành viên | P0 | Mời bằng email hoặc link có hạn dùng; chọn vai trò; thu hồi lời mời; hiển thị trạng thái chờ |
| FR-WS-05 | Quản lý thành viên | P0 | Đổi vai trò, xoá, rời không gian; Owner cuối cùng không thể rời nếu chưa chuyển quyền |
| FR-WS-06 | Cài đặt không gian | P0 | Đổi tên/biểu tượng/mô tả, quyền riêng tư mặc định, quota dung lượng, mẫu mặc định, lưu trữ (archive) và xoá |
| FR-WS-07 | Số liệu thẻ không gian | P0 | Số thành viên, số tài liệu, avatar xếp chồng tối đa 4 + “+n”; cập nhật đúng khi có thay đổi |
| FR-WS-08 | Lưu trữ / xoá mềm không gian | P1 | Xoá mềm 30 ngày, khôi phục được; sau đó xoá vĩnh viễn bằng job nền kèm xoá tệp trên S3 |

### 6.3 Tổng quan (DASH)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-DASH-01 | Lời chào theo giờ | P0 | 05–11h: Chào buổi sáng; 11–13h: Chào buổi trưa; 13–18h: Chào buổi chiều; còn lại: Chào buổi tối; dùng múi giờ người dùng |
| FR-DASH-02 | Lối tắt tạo nhanh (6 mục) | P0 | Soạn thảo → tạo tài liệu trống và mở editor; Đội ngũ → hộp thoại mời; Trình chiếu → tạo bản trình chiếu; Lịch → form sự kiện nhanh; Tin nhắn → soạn tin mới; Kho lưu trữ → hộp thoại tải lên |
| FR-DASH-03 | Thẻ Lịch làm việc hôm nay | P0 | Hiển thị ngày đầy đủ (Thứ Hai, 20 tháng 1, 2025 ở dạng thật theo hôm nay); sự kiện sắp theo giờ, vạch màu theo loại; sự kiện đang diễn ra nổi bật; “Xem lịch” sang trang Lịch; menu ba chấm: Sửa, Xoá, Tham gia; trạng thái rỗng “Hôm nay không có lịch” |
| FR-DASH-04 | Thẻ Công việc của tôi | P0 | Ba tab: Đang thực hiện / Sắp tới (đếm) / Đã hoàn thành; tích để hoàn thành (optimistic update, hoàn tác 5 giây); “Thêm công việc” mở form nhanh; trạng thái rỗng như ảnh |
| FR-DASH-05 | Thẻ Hoạt động của nhóm | P0 | Bộ lọc 7/30/90 ngày; ba chỉ số (tài liệu được tạo, lượt chỉnh sửa, lượt chia sẻ) + % so với kỳ trước (xanh khi tăng, đỏ khi giảm); biểu đồ đường theo ngày; tooltip khi rê chuột; dữ liệu cache Redis 5 phút |
| FR-DASH-06 | Thẻ Tài liệu được chia sẻ gần đây | P0 | Tối đa 4 mục; biểu tượng màu theo loại (doc/xlsx/slide); “Được sửa bởi X · n phút trước” (thời gian tương đối tiếng Việt); “Xem tất cả” sang trang Được chia sẻ |
| FR-DASH-07 | Thẻ Không gian làm việc của bạn | P0 | Một thẻ cho mỗi không gian + thẻ “Tạo không gian mới”; menu ba chấm: Mở, Cài đặt, Rời |
| FR-DASH-08 | Trạng thái tải và lỗi | P0 | Mỗi thẻ có skeleton riêng, lỗi một thẻ không làm hỏng cả trang, có nút “Thử lại” |
| FR-DASH-09 | Tuỳ biến bố cục | P2 | Ẩn/hiện và đổi thứ tự thẻ, lưu theo người dùng |

### 6.4 Tìm kiếm và Command palette (SRCH)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-SRCH-01 | Mở bằng Ctrl/Cmd + K hoặc bấm ô tìm kiếm | P0 | Overlay giữa màn hình, focus tự động, Esc để đóng |
| FR-SRCH-02 | Tìm toàn văn tài liệu, tệp, cuộc trò chuyện, sự kiện, người | P0 | PostgreSQL full-text với từ điển không dấu (unaccent) để “bao cao” khớp “Báo cáo”; kết quả nhóm theo loại; chỉ trả mục người dùng có quyền xem |
| FR-SRCH-03 | Bộ lọc | P1 | Theo loại, không gian, người tạo, khoảng thời gian |
| FR-SRCH-04 | Lệnh nhanh | P1 | Gõ “>” để chạy lệnh: tạo tài liệu, chuyển không gian, đổi giao diện sáng/tối |
| FR-SRCH-05 | Lịch sử tìm kiếm gần đây | P1 | 10 mục gần nhất, xoá được |
| FR-SRCH-06 | Hiệu năng | P0 | Phản hồi dưới 300 ms ở p95 với 100.000 bản ghi; debounce 150 ms |

### 6.5 Thông báo (NOTI)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-NOTI-01 | Chuông + chấm đỏ | P0 | Chấm đỏ khi có thông báo chưa đọc; panel thả xuống nhóm theo Hôm nay / Trước đó |
| FR-NOTI-02 | Loại thông báo | P0 | Được nhắc tên (@), được chia sẻ tài liệu, bình luận mới, lời mời sự kiện, nhắc lịch, giao việc, sắp đến hạn, lời mời vào không gian |
| FR-NOTI-03 | Đánh dấu đã đọc / đọc tất cả | P0 | Đồng bộ giữa các tab và thiết bị qua realtime |
| FR-NOTI-04 | Tuỳ chọn thông báo | P1 | Bật/tắt theo loại và theo kênh (trong ứng dụng, email, đẩy); giờ yên tĩnh |
| FR-NOTI-05 | Email tóm tắt | P2 | Tóm tắt hằng ngày hoặc hằng tuần, huỷ đăng ký bằng một cú nhấp |
| FR-NOTI-06 | Chống trùng và gộp | P1 | Nhiều bình luận trong 2 phút trên cùng tài liệu gộp thành một thông báo |

### 6.6 Soạn thảo tài liệu (DOC)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-DOC-01 | Danh sách tài liệu | P0 | Chế độ lưới/danh sách; tab Của tôi / Được chia sẻ / Gần đây / Yêu thích / Thùng rác; lọc theo không gian, người tạo, loại; sắp xếp; phân trang con trỏ |
| FR-DOC-02 | Tạo tài liệu | P0 | Trống hoặc từ mẫu; tự đặt tên “Tài liệu chưa đặt tên”; thuộc không gian đang chọn |
| FR-DOC-03 | Trình soạn thảo văn bản giàu định dạng | P0 | Tiêu đề H1–H3, in đậm/nghiêng/gạch chân/gạch ngang, màu chữ và nền, danh sách, danh sách việc cần làm, trích dẫn, mã, đường kẻ, bảng, liên kết, ảnh, căn lề |
| FR-DOC-04 | Lệnh gạch chéo “/” | P0 | Menu chèn khối: tiêu đề, bảng, ảnh, tệp từ Kho, mã, trích dẫn, đường kẻ, mục lục |
| FR-DOC-05 | Tự lưu | P0 | Lưu liên tục qua Yjs; chỉ báo “Đang lưu… / Đã lưu”; mất mạng vẫn gõ được (IndexedDB) và tự đồng bộ khi có lại mạng |
| FR-DOC-06 | Cộng tác thời gian thực | P0 | Con trỏ và vùng chọn có màu + tên từng người; avatar người đang xem trên thanh trên; 10 người sửa cùng lúc không xung đột |
| FR-DOC-07 | Bình luận và nhắc tên | P0 | Bình luận gắn vào đoạn chọn, trả lời theo luồng, giải quyết (resolve), @người dùng gửi thông báo |
| FR-DOC-08 | Lịch sử phiên bản | P0 | Snapshot tự động (mỗi 10 phút hoạt động hoặc khi đóng); xem, so sánh, đặt tên, khôi phục phiên bản; không bao giờ ghi đè mất lịch sử |
| FR-DOC-09 | Chia sẻ | P0 | Mời người/nhóm với quyền Xem / Bình luận / Sửa; link chia sẻ có thể đặt mật khẩu và hạn dùng; thu hồi bất kỳ lúc nào |
| FR-DOC-10 | Mẫu tài liệu | P1 | Thư viện mẫu: biên bản họp, kế hoạch dự án, báo cáo, PRD, quy trình; mẫu riêng của không gian |
| FR-DOC-11 | Xuất / nhập | P1 | Xuất PDF, DOCX, Markdown, HTML; nhập DOCX/MD; thực hiện bằng job nền cho tài liệu lớn |
| FR-DOC-12 | Thùng rác và khôi phục | P0 | Xoá mềm 30 ngày; khôi phục nguyên vẹn vị trí, quyền và lịch sử |
| FR-DOC-13 | Mục lục và điều hướng | P1 | Mục lục tự sinh từ tiêu đề ở khung bên phải, bấm để cuộn tới |
| FR-DOC-14 | Tìm và thay thế trong tài liệu | P1 | Ctrl F, thay một hoặc tất cả, phân biệt hoa thường tuỳ chọn |
| FR-DOC-15 | Kiểm tra chính tả tiếng Việt | P2 | Gạch chân lỗi, gợi ý sửa |
| FR-DOC-16 | Ghi chú đọc / chế độ tập trung | P2 | Ẩn thanh công cụ, chỉ còn nội dung |
| FR-DOC-17 | Giới hạn | P0 | Tối đa 1 triệu ký tự mỗi tài liệu, 200 ảnh; cảnh báo trước khi chạm trần |

### 6.7 Trình chiếu (SLD)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-SLD-01 | Danh sách bản trình chiếu | P0 | Lưới thumbnail 16:9 do job nền sinh; lọc/sắp xếp giống tài liệu |
| FR-SLD-02 | Tạo từ mẫu hoặc trống | P0 | Thư viện mẫu có bố cục: Tiêu đề, Tiêu đề + nội dung, Hai cột, Ảnh + chú thích, Biểu đồ, Cảm ơn |
| FR-SLD-03 | Editor canvas | P0 | Thêm/xoá/nhân đôi/sắp xếp trang bằng kéo-thả; thêm văn bản, hình, ảnh, biểu đồ, bảng; chọn, di chuyển, đổi cỡ, xoay, nhóm, căn lề thông minh (guideline), khoá; hoàn tác/làm lại 100 bước |
| FR-SLD-04 | Chủ đề và bố cục | P0 | Đổi chủ đề (màu, phông) áp dụng cho toàn bộ; đổi bố cục từng trang không mất nội dung |
| FR-SLD-05 | Cộng tác realtime | P1 | Dùng Yjs như tài liệu; hiển thị con trỏ và trang đang xem của từng người |
| FR-SLD-06 | Chế độ trình chiếu | P0 | Toàn màn hình, điều hướng phím mũi tên, ghi chú diễn giả ở chế độ presenter, đồng hồ, bút laser |
| FR-SLD-07 | Hiệu ứng chuyển trang và hoạt ảnh | P1 | Mờ dần, trượt, phóng to; hoạt ảnh xuất hiện theo từng ý |
| FR-SLD-08 | Trình chiếu từ xa | P2 | Chia sẻ link xem trực tiếp; người xem theo kịp trang người trình bày |
| FR-SLD-09 | Xuất / nhập | P0 | Xuất PDF và PPTX (pptxgenjs); nhập PPTX cơ bản; kiểm tra mở được bằng PowerPoint |
| FR-SLD-10 | Bình luận, chia sẻ, phiên bản | P1 | Giống FR-DOC-07/08/09 |

### 6.8 Lịch làm việc (CAL)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-CAL-01 | Các chế độ xem | P0 | Ngày, Tuần, Tháng, Lịch biểu (agenda); mini-calendar bên trái; nút Hôm nay; phím tắt D/W/M |
| FR-CAL-02 | Tạo / sửa sự kiện | P0 | Tiêu đề, thời gian (cả ngày tuỳ chọn), múi giờ, địa điểm hoặc link họp, mô tả, màu/loại, người tham dự, tài liệu đính kèm; kéo trên lưới để tạo, kéo-thả/đổi cỡ để sửa |
| FR-CAL-03 | Sự kiện lặp | P0 | Hàng ngày/tuần/tháng/năm, tuỳ chỉnh theo RRULE; sửa “chỉ sự kiện này / sự kiện này và các sự kiện sau / tất cả”; ngoại lệ và xoá một lần lặp |
| FR-CAL-04 | Lời mời và phản hồi | P0 | Có/Không/Có thể; chủ trì xem danh sách phản hồi; gửi thông báo và email khi đổi giờ |
| FR-CAL-05 | Phát hiện xung đột | P0 | Cảnh báo khi trùng giờ với sự kiện khác của chính mình hoặc của người tham dự |
| FR-CAL-06 | Xem lịch rảnh/bận | P1 | Lưới rảnh/bận của nhiều người để chọn giờ chung; gợi ý 3 khung giờ phù hợp |
| FR-CAL-07 | Phòng họp và tài nguyên | P1 | Danh mục phòng (Phòng họp A, B…), sức chứa, thiết bị; đặt phòng không cho trùng, kiểm tra ở tầng DB bằng ràng buộc loại trừ khoảng thời gian |
| FR-CAL-08 | Họp trực tuyến | P2 | Sinh link họp tích hợp hoặc dán link ngoài; nút Tham gia xuất hiện 10 phút trước giờ |
| FR-CAL-09 | Nhắc lịch | P0 | Tuỳ chọn 5/10/30 phút, 1 giờ, 1 ngày trước; gửi qua thông báo trong ứng dụng và email bằng job nền, đúng giờ ±30 giây |
| FR-CAL-10 | Nhiều lịch | P1 | Lịch cá nhân, lịch từng không gian, lịch đội; bật/tắt hiển thị từng lịch; màu riêng |
| FR-CAL-11 | Đồng bộ iCal | P1 | Xuất link .ics chỉ đọc có token; nhập file .ics |
| FR-CAL-12 | Liên kết tài liệu và công việc | P1 | Đính kèm tài liệu vào sự kiện; công việc có hạn hiện trên lịch |
| FR-CAL-13 | Múi giờ | P0 | Lưu UTC; hiển thị theo múi giờ người dùng; sự kiện lặp qua giờ mùa hè vẫn đúng giờ địa phương |

### 6.9 Công việc (TASK)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-TASK-01 | Tạo công việc nhanh | P0 | Tiêu đề, hạn, người thực hiện, không gian, mức ưu tiên, nhãn |
| FR-TASK-02 | Trạng thái | P0 | Chưa làm → Đang thực hiện → Đã hoàn thành; công việc có hạn trong 7 ngày tới vào tab Sắp tới |
| FR-TASK-03 | Trang Công việc đầy đủ | P1 | Dạng danh sách và bảng Kanban kéo-thả; lọc theo người, nhãn, hạn, không gian |
| FR-TASK-04 | Công việc con, mô tả, đính kèm, bình luận | P1 | Tiến độ cha tính từ công việc con |
| FR-TASK-05 | Lặp công việc | P2 | Giống quy tắc RRULE của lịch |
| FR-TASK-06 | Liên kết | P1 | Gắn với tài liệu, sự kiện, tin nhắn; tạo công việc trực tiếp từ một tin nhắn hoặc bình luận |
| FR-TASK-07 | Nhắc hạn | P0 | Nhắc trước hạn 1 ngày và khi quá hạn |

### 6.10 Tin nhắn (MSG)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-MSG-01 | Bố cục 3 cột | P0 | Cột trái: danh sách kênh/nhắn riêng, ô tìm; giữa: luồng tin; phải: thông tin cuộc trò chuyện (tuỳ chọn ẩn) |
| FR-MSG-02 | Kênh | P0 | Kênh công khai và riêng tư của từng không gian; tạo, đổi tên, lưu trữ, thêm/xoá thành viên |
| FR-MSG-03 | Nhắn riêng và nhóm | P0 | 1–1 và nhóm tối đa 50 người; thông báo khi có người mới tham gia |
| FR-MSG-04 | Gửi nhận realtime | P0 | WebSocket; hiển thị đang gõ; tin gửi lỗi có nút gửi lại; thứ tự tin đảm bảo bằng id tăng dần; chống gửi trùng bằng idempotency key |
| FR-MSG-05 | Định dạng tin | P0 | In đậm/nghiêng, mã, danh sách, liên kết có xem trước, emoji, @người, #kênh, @all (cần quyền) |
| FR-MSG-06 | Đính kèm | P0 | Tệp từ máy hoặc chọn từ Kho; ảnh xem trước; tuân thủ quét virus và giới hạn dung lượng |
| FR-MSG-07 | Luồng trả lời (thread) | P1 | Trả lời trong luồng, đếm số trả lời, theo dõi luồng |
| FR-MSG-08 | Phản ứng emoji | P1 | Thêm/bỏ phản ứng, hiện danh sách người phản ứng |
| FR-MSG-09 | Sửa, xoá, ghim, lưu tin | P1 | Sửa trong 24 giờ có nhãn “đã sửa”; xoá để lại dấu “tin đã bị xoá”; ghim theo kênh |
| FR-MSG-10 | Đã đọc và huy hiệu | P0 | Mốc đọc theo từng cuộc trò chuyện; huy hiệu tổng ở sidebar (số 3 trong ảnh) tính đúng, đồng bộ nhiều thiết bị |
| FR-MSG-11 | Tắt tiếng, thông báo | P1 | Tắt tiếng kênh; chỉ thông báo khi được nhắc tên |
| FR-MSG-12 | Tìm trong tin nhắn | P1 | Lọc theo người, kênh, ngày, có tệp |
| FR-MSG-13 | Chia sẻ tài liệu vào chat | P1 | Dán link tài liệu sinh thẻ xem trước, kiểm tra quyền người nhận và gợi ý cấp quyền nếu thiếu |
| FR-MSG-14 | Lưu trữ lịch sử | P1 | Tải tin theo trang con trỏ; không tải toàn bộ lịch sử một lần |

### 6.11 Kho lưu trữ (STO)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-STO-01 | Duyệt thư mục | P0 | Cây thư mục + breadcrumb; lưới/danh sách; chọn nhiều bằng Shift/Ctrl; kéo-thả di chuyển |
| FR-STO-02 | Tải lên | P0 | Kéo-thả nhiều tệp và thư mục; hàng đợi hiển thị tiến độ từng tệp; tải lên multipart chia 8 MB; tạm dừng/tiếp tục; tự thử lại khi lỗi mạng; trùng tên thì hỏi: giữ cả hai / thay thế |
| FR-STO-03 | Kiểm tra tệp phía server | P0 | Kiểm tra magic bytes, không tin phần mở rộng; chặn tệp thực thi; giới hạn kích thước từng tệp (mặc định 5 GB); quét ClamAV, tệp bị nhiễm bị cách ly và báo cho người tải |
| FR-STO-04 | Xem trước | P0 | Ảnh, PDF, video, âm thanh, văn bản, Office (chuyển sang PDF bằng worker); điều hướng giữa các tệp |
| FR-STO-05 | Tải xuống | P0 | Link presigned hết hạn nhanh; chọn nhiều thì nén ZIP streaming |
| FR-STO-06 | Đổi tên, di chuyển, sao chép, sao chép link | P0 | Giữ quyền theo quy tắc kế thừa thư mục |
| FR-STO-07 | Phiên bản tệp | P1 | Tải lên bản mới giữ lịch sử; khôi phục; giới hạn 20 phiên bản (cấu hình) |
| FR-STO-08 | Thùng rác | P0 | Xoá mềm 30 ngày; khôi phục; xoá vĩnh viễn thật sự giải phóng dung lượng |
| FR-STO-09 | Chia sẻ | P0 | Giống FR-DOC-09; link công khai có mật khẩu, hạn dùng, giới hạn lượt tải |
| FR-STO-10 | Dung lượng | P0 | Thanh “Dữ liệu đang dùng 128.4 GB / 500 GB” lấy từ số liệu thật cập nhật khi tải lên/xoá; chi tiết theo loại tệp, theo không gian, theo người; cảnh báo 80% và 95%; chặn tải lên khi đủ 100% |
| FR-STO-11 | Gắn sao, gắn nhãn, tìm kiếm | P1 | Lọc theo loại, người tải, ngày, dung lượng |
| FR-STO-12 | Dọn dẹp tự động | P1 | Job nền xoá phần multipart bỏ dở sau 24 giờ, mồ côi trên S3 so với DB hằng tuần |
| FR-STO-13 | Toàn vẹn dữ liệu | P0 | Lưu checksum SHA-256; kiểm tra khi tải lên; báo lỗi nếu lệch |

### 6.12 Đội ngũ (TEAM)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-TEAM-01 | Danh bạ thành viên | P0 | Bảng: avatar, tên, chức danh, phòng ban, vai trò, trạng thái (trực tuyến/vắng/ngoại tuyến), lần hoạt động cuối; tìm và lọc |
| FR-TEAM-02 | Trang hồ sơ thành viên | P0 | Thông tin liên hệ, tài liệu gần đây, lịch rảnh/bận, nút nhắn tin / mời họp |
| FR-TEAM-03 | Nhóm và phòng ban | P1 | Tạo nhóm (Thiết kế, Kỹ thuật…), gán trưởng nhóm; có thể chia sẻ nội dung cho cả nhóm |
| FR-TEAM-04 | Sơ đồ tổ chức | P1 | Cây báo cáo trực tiếp; kéo-thả đổi người quản lý (chỉ Admin) |
| FR-TEAM-05 | Mời hàng loạt | P1 | Nhập CSV, kiểm tra từng dòng, báo cáo lỗi |
| FR-TEAM-06 | Trạng thái và vắng mặt | P1 | Đặt trạng thái “Đang họp / Nghỉ phép”, tự đồng bộ từ lịch |
| FR-TEAM-07 | Vai trò tuỳ chỉnh | P2 | Tập quyền chi tiết do Admin định nghĩa |
| FR-TEAM-08 | Thống kê đội | P1 | Biểu đồ hoạt động, khối lượng công việc theo người |

### 6.13 Quản trị và kiểm toán (ADM)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-ADM-01 | Nhật ký kiểm toán | P0 | Ghi: đăng nhập, đổi quyền, chia sẻ, xoá, xuất dữ liệu, đổi cài đặt; không sửa/xoá được; lọc theo người/hành động/thời gian; xuất CSV |
| FR-ADM-02 | Chính sách bảo mật | P1 | Bắt buộc 2FA, độ phức tạp mật khẩu, thời hạn phiên, chặn chia sẻ công khai, giới hạn tên miền email |
| FR-ADM-03 | Quota và gói dung lượng | P1 | Đặt quota theo không gian và theo người dùng |
| FR-ADM-04 | Báo cáo sử dụng | P1 | Người dùng hoạt động, nội dung tạo mới, dung lượng, xu hướng |
| FR-ADM-05 | Xuất / xoá dữ liệu | P1 | Xuất toàn bộ dữ liệu một không gian dạng ZIP + JSON; xoá theo yêu cầu |
| FR-ADM-06 | Trang tình trạng hệ thống | P1 | Trạng thái DB, Redis, S3, hàng đợi, độ trễ; chỉ Admin hệ thống thấy |

### 6.14 Cài đặt cá nhân (SET)

| Mã | Chức năng | Ưu tiên | Quy tắc / Tiêu chí nghiệm thu |
| --- | --- | --- | --- |
| FR-SET-01 | Giao diện | P0 | Sáng / Tối / Theo hệ thống; thu gọn sidebar; mật độ hiển thị |
| FR-SET-02 | Ngôn ngữ, múi giờ, định dạng ngày | P0 | Mặc định vi-VN, dd/MM/yyyy, tuần bắt đầu Thứ Hai |
| FR-SET-03 | Thông báo | P1 | Xem FR-NOTI-04 |
| FR-SET-04 | Bảo mật | P0 | Đổi mật khẩu, 2FA, phiên đăng nhập, khoá API cá nhân |
| FR-SET-05 | Phím tắt | P1 | Trang tra cứu phím tắt; mở bằng nút ? ở góc dưới phải |
| FR-SET-06 | Trợ giúp | P1 | Nút ? trên thanh trên: tài liệu hướng dẫn, liên hệ hỗ trợ, báo lỗi kèm ảnh chụp |

## 7. Giao diện bổ sung cho các phân hệ lõi

Giao diện Tổng quan đã có. Phần này đặc tả các màn hình **chưa có** để agent thiết kế cùng ngôn ngữ thị giác (token ở mục 3.2). Mỗi màn hình phải đủ 5 trạng thái: đang tải, bình thường, rỗng, lỗi, không có quyền.

### 7.0 Khung ứng dụng chung (App Shell)

* Sidebar 240px (thu gọn còn 72px chỉ biểu tượng), topbar 64px, nội dung có max-width 1440px, padding 24px.
* Topbar mỗi trang: breadcrumb (Không gian › Phân hệ › Mục), ô tìm Ctrl K, chuông, trợ giúp, avatar.
* Phân hệ nào cũng có thanh tiêu đề trang: tiêu đề, mô tả ngắn, nút hành động chính màu tím ở bên phải.
* Responsive: ≥1280 đầy đủ; 768–1279 sidebar thu gọn; \<768 sidebar thành ngăn kéo, bảng chuyển thành thẻ.
* Nút ? tròn ở góc dưới phải mở trợ giúp và phím tắt.

### 7.1 Màn hình xác thực

| Màn hình | Thành phần |
| --- | --- |
| Đăng nhập | Logo, form email/mật khẩu, “Ghi nhớ tôi”, nút Google, liên kết Quên mật khẩu / Đăng ký; nền gradient tím nhạt giống banner |
| Đăng ký | Họ tên, email, mật khẩu (thanh đo độ mạnh), đồng ý điều khoản |
| Xác minh email, đặt lại mật khẩu | Trạng thái gửi lại sau 60 giây; thông báo thành công/hết hạn |
| Nhập mã 2FA | 6 ô số tự chuyển, link dùng mã dự phòng |
| Chấp nhận lời mời | Hiện tên không gian, người mời, vai trò sẽ nhận |
| Onboarding (lần đầu) | 3 bước: hồ sơ → tạo/tham gia không gian → mời đồng đội; có thể bỏ qua |

### 7.2 Trang chủ của một Không gian (`/w/{slug}`)

```
[Biểu tượng + Tên không gian]   [Mời thành viên] [Cài đặt]  
Tab: Tổng quan | Tài liệu | Trình chiếu | Tệp | Thành viên | Hoạt động  
------------------------------------------------------------  
| Ghim & gần đây (lưới thẻ)        | Thành viên (avatar, trực tuyến) |  
| Công việc của không gian         | Sự kiện sắp tới                 |  
| Dòng hoạt động (ai làm gì, lúc nào, bấm để mở)                   |
```

Cài đặt không gian: các tab Chung, Thành viên và vai trò, Quyền riêng tư, Dung lượng, Tích hợp, Vùng nguy hiểm (lưu trữ, chuyển quyền, xoá).

### 7.3 Soạn thảo

**Danh sách tài liệu**

```
Soạn thảo                               [Tạo tài liệu ▾ (Trống/Từ mẫu/Nhập)]  
Tab: Gần đây | Của tôi | Được chia sẻ | Yêu thích | Thùng rác  
Bộ lọc: Không gian ▾  Người tạo ▾  Thời gian ▾   Sắp xếp ▾   [Lưới|Danh sách]  
[thẻ: thumbnail trang đầu, tên, người sửa, thời gian, ★, ⋯]
```

**Trình soạn thảo**

```
Topbar: ← | Tên tài liệu (sửa trực tiếp) | Đã lưu ✓ | [avatar đang xem] | Lịch sử | Bình luận | [Chia sẻ]  
Thanh công cụ: Hoàn tác | Kiểu đoạn ▾ | B I U S | Màu | Danh sách | Bảng | Ảnh | Liên kết | Căn lề | ⋯  
┌─ Mục lục (trái, ẩn được) ─┬──── Trang A4/khổ rộng ────┬─ Bình luận (phải) ─┐
```

* Ngăn Lịch sử phiên bản trượt từ phải: danh sách phiên bản theo thời gian, xem trước, so sánh, nút Khôi phục.
* Hộp thoại Chia sẻ: ô thêm người/nhóm + quyền, danh sách người có quyền, “Ai có link”, mật khẩu, hạn dùng, sao chép link.

### 7.4 Trình chiếu

```
Editor: Topbar giống tài liệu + [Trình chiếu ▶]  
┌ Dải trang (trái, kéo-thả) ┬ Canvas 16:9 (giữa, zoom) ┬ Bảng thuộc tính (phải) ┐  
  Thanh công cụ trên canvas: Văn bản | Hình | Ảnh | Biểu đồ | Bảng | Bố cục ▾ | Chủ đề ▾  
  Ghi chú diễn giả (dưới canvas)
```

* Chế độ trình chiếu: toàn màn hình, thanh điều khiển ẩn tự động, phím ← → Space Esc.
* Chế độ diễn giả: trang hiện tại + trang kế + ghi chú + đồng hồ.

### 7.5 Lịch làm việc

```
Lịch làm việc    [< >] [Hôm nay]  Tháng 1, 2025   [Ngày|Tuần|Tháng|Biểu]   [+ Sự kiện]  
┌ Mini-calendar ┬────────── Lưới thời gian (có vạch giờ hiện tại) ───────────┐  
│ Lịch của tôi ☑│ Khối sự kiện màu theo loại; kéo để tạo / sửa / đổi cỡ       │  
│ Lịch nhóm   ☑ │                                                            │  
│ Phòng họp   ☑ │                                                            │
```

* Popover sự kiện: tiêu đề, giờ, địa điểm, người tham dự (trạng thái), nút Tham gia, Sửa, Xoá.
* Form sự kiện (hộp thoại bên phải): các trường FR-CAL-02, tab **Tìm giờ chung** (lưới rảnh/bận), phần **Phòng họp**.

### 7.6 Tin nhắn

```
┌ Danh sách (300px) ──┬──────── Luồng tin ─────────────┬ Chi tiết (320px) ┐  
│ [Tìm] [+ Mới]       │ # tên-kênh · 12 thành viên  ⓘ  │ Thành viên       │  
│ Ghim                │ ── Hôm nay ──                  │ Tệp & liên kết   │  
│ Kênh                │ [avatar] Tên  09:12            │ Tin đã ghim      │  
│ Nhắn riêng          │ nội dung … 👍2 · 3 trả lời     │ Tắt tiếng / Rời  │  
│ (huy hiệu chưa đọc) │ [Ô soạn: B I 😀 @ 📎  Gửi ➤]  │                  │
```

* Luồng trả lời mở ngăn bên phải thay cho Chi tiết.
* Dải “Tin chưa đọc” kèm nút nhảy xuống; thanh “đang gõ…”; trạng thái mất kết nối “Đang kết nối lại…”.

### 7.7 Kho lưu trữ

```
Kho lưu trữ                      [Tải lên ▾ (Tệp/Thư mục)] [Thư mục mới]  
Breadcrumb: Dự án Sản phẩm › Thiết kế › 2025  
Tab: Tất cả | Gần đây | Được chia sẻ | Yêu thích | Thùng rác | Dung lượng  
[Bảng: tên | chủ sở hữu | sửa đổi | kích thước | chia sẻ | ⋯]   hoặc lưới thumbnail  
Panel tải lên nổi (góc dưới phải): tên tệp, % tiến độ, tạm dừng, huỷ, thử lại  
Panel chi tiết (phải, khi chọn): xem trước, thông tin, quyền, phiên bản, hoạt động
```

Tab **Dung lượng**: vòng tròn 128.4 / 500 GB, bảng theo loại tệp, theo không gian, theo người, danh sách tệp lớn nhất, nút “Dọn thùng rác”.

### 7.8 Đội ngũ

```
Đội ngũ                          [Mời thành viên] [Tạo nhóm]  
Tab: Thành viên | Nhóm | Sơ đồ tổ chức | Lời mời đang chờ  
Bộ lọc: Phòng ban ▾  Vai trò ▾  Trạng thái ▾   [Tìm tên, email]  
[Bảng: avatar+tên | chức danh | phòng ban | vai trò ▾ | trạng thái | hoạt động cuối | ⋯]  
Ngăn hồ sơ (phải): liên hệ, lịch rảnh/bận, tài liệu chung, [Nhắn tin] [Mời họp]
```

### 7.9 Trang Công việc

```
Công việc                         [+ Thêm công việc]   [Danh sách | Bảng]  
Bộ lọc: Người | Nhãn | Hạn | Không gian | Ưu tiên  
Bảng Kanban: Chưa làm | Đang thực hiện | Đã hoàn thành (kéo-thả thẻ)  
Ngăn chi tiết: mô tả, công việc con, đính kèm, bình luận, liên kết tài liệu/sự kiện
```

### 7.10 Trung tâm thông báo, Cài đặt cá nhân, Quản trị

| Màn hình | Thành phần |
| --- | --- |
| Panel thông báo | Tab Tất cả / Chưa đọc / Nhắc tên; mỗi dòng: avatar, nội dung, thời gian, chấm chưa đọc; nút Đọc tất cả; liên kết tới tuỳ chọn |
| Cài đặt cá nhân | Menu trái: Hồ sơ, Giao diện, Ngôn ngữ & thời gian, Thông báo, Bảo mật, Phiên đăng nhập, Phím tắt, Khoá API |
| Quản trị | Tổng quan, Nhật ký kiểm toán, Bảo mật, Quota, Báo cáo, Tình trạng hệ thống |
| Command palette | Ô nhập lớn, kết quả nhóm theo loại, phím tắt gợi ý ở chân |

### 7.11 Trạng thái dùng chung

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Skeleton đúng hình dạng nội dung, không dùng spinner toàn trang |
| Rỗng | Biểu tượng tròn nền nhạt + một dòng giải thích + nút hành động (như thẻ “Chưa có công việc trong mục này”) |
| Lỗi | Thẻ lỗi thân thiện, mã yêu cầu (requestId) để báo hỗ trợ, nút Thử lại |
| Không có quyền (403) | Giải thích + nút “Yêu cầu quyền truy cập” gửi thông báo cho chủ sở hữu |
| Không tìm thấy (404), lỗi máy chủ (500) | Trang riêng đồng bộ thiết kế |
| Ngoại tuyến | Thanh vàng phía trên “Bạn đang ngoại tuyến, thay đổi sẽ được đồng bộ”; mutation xếp hàng đợi |
| Xác nhận nguy hiểm | Hộp thoại nêu rõ hậu quả; xoá không gian phải gõ lại tên |

## 8. Mô hình dữ liệu và API

### 8.1 Nguyên tắc thiết kế dữ liệu

* Khoá chính UUID v7 (sắp xếp được theo thời gian). Mọi bảng có `created_at`, `updated_at`; bảng nội dung có `deleted_at` (xoá mềm).
* Tài liệu, trình chiếu, tệp và thư mục dùng **một bảng tài nguyên chung** (`items`) để có chung cây thư mục, chia sẻ, thùng rác, tìm kiếm và quota.
* Mọi truy vấn dữ liệu bắt buộc kèm `workspace_id`; bật Row-Level Security của PostgreSQL như lớp phòng thủ thứ hai.
* Thời gian lưu UTC (`timestamptz`); chỉ chuyển múi giờ ở lớp hiển thị.

### 8.2 Các bảng chính

| Nhóm | Bảng | Cột / ràng buộc quan trọng |
| --- | --- | --- |
| Danh tính | `users` | email (unique, lower), password\_hash, name, avatar\_key, timezone, locale, totp\_secret (mã hoá), status |
|  | `sessions` | user\_id, token\_hash, ip, user\_agent, last\_seen\_at, expires\_at |
|  | `oauth_accounts` | provider, provider\_user\_id, user\_id (unique theo cặp provider) |
| Không gian | `workspaces` | slug (unique), name, icon, color, privacy, quota\_bytes, deleted\_at |
|  | `workspace_members` | (workspace\_id, user\_id) unique, role, joined\_at |
|  | `invitations` | workspace\_id, email, role, token\_hash, expires\_at, accepted\_at |
|  | `teams`, `team_members` | Nhóm/phòng ban trong không gian, manager\_id |
| Tài nguyên | `items` | workspace\_id, type (doc/slide/file/folder), parent\_id, name, owner\_id, size\_bytes, mime, storage\_key, checksum, deleted\_at; index (workspace\_id, parent\_id, deleted\_at), GIN cho tìm kiếm |
|  | `item_versions` | item\_id, version\_no, storage\_key hoặc yjs\_state, created\_by, label |
|  | `item_shares` | item\_id, subject\_type (user/team/link), subject\_id, role (view/comment/edit), password\_hash, expires\_at |
|  | `item_favorites`, `item_views` | Yêu thích và gần đây theo người dùng |
|  | `comments` | item\_id, parent\_id, anchor (JSON), body, resolved\_at, author\_id |
|  | `upload_sessions` | item\_id, upload\_id (S3), parts\_done, status, expires\_at |
| Lịch | `calendars` | owner\_type (user/workspace), color |
|  | `events` | calendar\_id, title, starts\_at, ends\_at, all\_day, tz, rrule, room\_id, location, meeting\_url |
|  | `event_attendees` | event\_id, user\_id, response |
|  | `event_exceptions` | event\_id, original\_start, override\_json hoặc cancelled |
|  | `rooms` | workspace\_id, name, capacity; ràng buộc EXCLUDE chống trùng khoảng thời gian cho cùng phòng |
| Công việc | `tasks` | workspace\_id, title, status, priority, due\_at, assignee\_id, parent\_id, rrule |
|  | `task_labels`, `task_links` | Nhãn và liên kết tới item/event/message |
| Tin nhắn | `channels` | workspace\_id, type (public/private/dm/group), name |
|  | `channel_members` | channel\_id, user\_id, last\_read\_message\_id, muted |
|  | `messages` | channel\_id, author\_id, body\_json, thread\_root\_id, idempotency\_key (unique), edited\_at, deleted\_at; index (channel\_id, id desc) |
|  | `message_reactions`, `message_attachments` | Phản ứng, tệp đính kèm |
| Hệ thống | `notifications` | user\_id, type, payload, read\_at; index (user\_id, read\_at, created\_at) |
|  | `notification_prefs` | user\_id, type, channel, enabled |
|  | `activity_events` | workspace\_id, actor\_id, verb, item\_id, created\_at; nguồn cho thẻ Hoạt động của nhóm |
|  | `audit_logs` | Chỉ thêm (append-only), actor, action, target, ip, metadata |
|  | `usage_counters` | workspace\_id, bytes\_used, cập nhật bằng giao dịch cùng lúc tải lên/xoá |
|  | `outbox` | Sự kiện chờ phát đi (thông báo, email, đánh chỉ mục) để đảm bảo không mất |

Chỉ số dashboard 124 / 56 / 28: tính từ `activity_events` theo verb (created, edited, shared) trong cửa sổ 7/30/90 ngày, gom theo ngày múi giờ người dùng, cache 5 phút.

### 8.3 Quy ước API (REST, tiền tố `/api/v1`)

| Quy ước | Nội dung |
| --- | --- |
| Xác thực | Cookie phiên; mutation có CSRF token; khoá API cá nhân dùng header Bearer |
| Phân trang | `?limit=50&cursor=…`; phản hồi `{ data, nextCursor }` |
| Lỗi | `{ error: { code, message, details?, requestId } }`; mã: VALIDATION\_ERROR 422, UNAUTHENTICATED 401, FORBIDDEN 403, NOT\_FOUND 404, CONFLICT 409, RATE\_LIMITED 429, INTERNAL 500; message tiếng Việt |
| Idempotency | Header `Idempotency-Key` cho tạo mới quan trọng (tin nhắn, tải lên, thanh toán nếu có) |
| Xung đột sửa | Dùng `If-Match` + `version` với dữ liệu không qua Yjs (công việc, sự kiện) |
| Phiên bản API | Thêm trường không phá vỡ; xoá/đổi tên cần `/v2` |

### 8.4 Nhóm endpoint

| Nhóm | Endpoint chính |
| --- | --- |
| Auth | POST `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot`, `/auth/reset`, `/auth/2fa/*`; GET `/auth/sessions`; DELETE `/auth/sessions/{id}` |
| Người dùng | GET/PATCH `/me`, GET `/me/notifications`, PATCH `/me/preferences` |
| Không gian | GET/POST `/workspaces`; GET/PATCH/DELETE `/workspaces/{id}`; `/workspaces/{id}/members`, `/invitations`, `/teams` |
| Tổng quan | GET `/workspaces/{id}/dashboard/summary`; `/dashboard/activity?range=7d`; `/dashboard/recent-shared` |
| Tài nguyên | GET `/items?parent=&type=&q=`; POST `/items`; PATCH `/items/{id}` (đổi tên, di chuyển); DELETE (vào thùng rác); POST `/items/{id}/restore`; GET/PUT `/items/{id}/shares`; GET `/items/{id}/versions` |
| Tệp | POST `/uploads` (khởi tạo), GET `/uploads/{id}/parts/{n}/url`, POST `/uploads/{id}/complete`, DELETE `/uploads/{id}`; GET `/items/{id}/download`, `/preview` |
| Tài liệu / Trình chiếu | WebSocket `/collab/{itemId}`; POST `/items/{id}/export?format=`; GET/POST `/items/{id}/comments` |
| Lịch | GET `/events?from=&to=&calendars=`; POST/PATCH/DELETE `/events/{id}?scope=this |
| Công việc | GET/POST `/tasks`; PATCH `/tasks/{id}`; POST `/tasks/{id}/complete` |
| Tin nhắn | GET/POST `/channels`; GET `/channels/{id}/messages?before=`; POST `/channels/{id}/messages`; POST `/channels/{id}/read`; PUT `/messages/{id}/reactions` |
| Tìm kiếm | GET `/search?q=&types=&workspace=` |
| Quản trị | GET `/admin/audit-logs`, `/admin/usage`, `/admin/health`; POST `/admin/export` |
| Hệ thống | GET `/healthz` (sống), `/readyz` (sẵn sàng: DB, Redis, S3) |

### 8.5 Sự kiện thời gian thực (WebSocket)

| Kênh | Sự kiện |
| --- | --- |
| `user:{id}` | notification.new, notification.read, unread.count, upload.scan.done |
| `workspace:{id}` | member.joined, item.created, item.updated, item.deleted, task.updated |
| `channel:{id}` | message.new, message.edited, message.deleted, reaction.changed, typing, presence |
| `collab:{itemId}` | Yjs update, awareness (con trỏ, người đang xem) |

Yêu cầu: xác thực khi bắt tay kết nối, kiểm tra quyền khi đăng ký từng kênh, tự kết nối lại với backoff luỹ thừa + jitter, sau khi nối lại phải đồng bộ phần bị lỡ bằng con trỏ `lastEventId`.

## 9. Yêu cầu phi chức năng và đảm bảo ổn định

### 9.1 Mục tiêu hiệu năng và sẵn sàng

| Chỉ tiêu | Mục tiêu |
| --- | --- |
| Tải trang Tổng quan (LCP) | ≤ 2,0 giây trên mạng 4G, p75 |
| API đọc thường | p95 ≤ 300 ms; API ghi p95 ≤ 500 ms |
| Gửi → nhận tin nhắn | p95 ≤ 300 ms trong nội bộ |
| Độ trễ đồng bộ soạn thảo | p95 ≤ 150 ms giữa hai người |
| Tìm kiếm | p95 ≤ 300 ms với 100.000 bản ghi |
| Sẵn sàng (uptime) | ≥ 99,9% mỗi tháng |
| Dung lượng thiết kế ban đầu | 1.000 người dùng, 200 người đồng thời, 10 người sửa cùng một tài liệu |
| Mất dữ liệu tối đa khi sự cố (RPO) | ≤ 5 phút |
| Thời gian khôi phục (RTO) | ≤ 1 giờ |

### 9.2 Cơ chế bảo đảm ổn định

| Rủi ro | Biện pháp bắt buộc |
| --- | --- |
| Mất dữ liệu soạn thảo | Yjs ghi liên tục vào Postgres theo lô 2 giây; bản sao cục bộ IndexedDB; snapshot định kỳ; test mô phỏng rớt mạng giữa chừng |
| Tải tệp lớn lỗi giữa chừng | Multipart + tiếp tục từ phần đã xong; checksum từng phần và toàn tệp; job dọn upload bỏ dở |
| Hai người sửa cùng bản ghi (công việc, sự kiện) | Khoá lạc quan bằng `version`; trả 409 kèm bản mới nhất để giao diện hợp nhất |
| Đặt phòng họp trùng | Ràng buộc EXCLUDE ở DB, không chỉ kiểm tra ở code |
| Gửi tin nhắn trùng khi mạng chập chờn | Idempotency key duy nhất theo kênh |
| Đếm dung lượng sai | Cập nhật `usage_counters` cùng giao dịch với thao tác tệp; job đối soát hằng đêm so với S3 |
| Mất sự kiện thông báo | Mẫu outbox: ghi sự kiện cùng giao dịch, worker phát đi và đánh dấu; thử lại có backoff; dead-letter queue |
| Quá tải / lạm dụng | Rate limit theo người dùng, IP, loại endpoint; giới hạn kích thước body; giới hạn kết nối WebSocket mỗi người |
| Dịch vụ phụ thuộc chết (Redis, S3, ClamAV) | Timeout + retry + circuit breaker; chế độ suy giảm: Redis chết thì bỏ cache nhưng vẫn phục vụ; ClamAV chết thì giữ tệp ở trạng thái “chờ quét”, không cho chia sẻ ra ngoài |
| Triển khai gây gián đoạn | Migration tương thích ngược (mở rộng → chuyển → thu gọn); triển khai xanh/lam hoặc cuốn chiếu; tắt tính năng bằng feature flag |
| Rò rỉ dữ liệu giữa không gian | RLS Postgres + test tự động “tenant isolation” cho mọi endpoint |
| Truy vấn chậm | Giám sát slow query > 200 ms; test EXPLAIN cho truy vấn nóng; index bắt buộc theo mục 8 |
| Phình bộ nhớ ở WebSocket | Giới hạn kích thước tin, kiểm tra heartbeat, đóng kết nối chết sau 60 giây |

### 9.3 Bảo mật

* Tuân thủ OWASP ASVS cấp 2: kiểm tra đầu vào bằng zod ở mọi ranh giới, mã hoá đầu ra, tham số hoá truy vấn.
* Header: CSP nghiêm ngặt, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors. Cookie `Secure`, `HttpOnly`, `SameSite=Lax`.
* Nội dung do người dùng tạo (HTML tài liệu, tên tệp, tin nhắn) phải được làm sạch bằng allowlist (DOMPurify phía client + sanitizer phía server khi xuất/hiển thị).
* Tệp người dùng phục vụ từ tên miền riêng (không cùng origin ứng dụng) hoặc luôn kèm `Content-Disposition` đúng để tránh XSS qua tệp.
* Chống SSRF khi dựng xem trước liên kết: chặn dải IP nội bộ, giới hạn kích thước và thời gian.
* Bí mật quản lý bằng biến môi trường/secret manager; khoá mã hoá TOTP xoay vòng được.
* Mã hoá: TLS mọi nơi; mã hoá at-rest cho Postgres và S3.
* Quét phụ thuộc (`pnpm audit`, Dependabot) và quét bí mật trong CI; chặn merge khi có lỗ hổng mức cao.
* Nhật ký kiểm toán không chứa nội dung nhạy cảm (mật khẩu, token, nội dung tài liệu).

### 9.4 Quan sát và vận hành

| Hạng mục | Yêu cầu |
| --- | --- |
| Log | pino JSON, có requestId, userId, workspaceId; che dữ liệu nhạy cảm |
| Metrics | Prometheus/OpenTelemetry: độ trễ, tỉ lệ lỗi, độ sâu hàng đợi, kết nối WS, dung lượng DB, tỉ lệ cache |
| Trace | OpenTelemetry xuyên web → worker → DB |
| Cảnh báo | Tỉ lệ lỗi 5xx > 2% trong 5 phút; hàng đợi trễ > 1 phút; ổ đĩa > 80%; sao lưu thất bại |
| Health | `/healthz`, `/readyz`; Docker healthcheck; khởi động lại tự động |
| Theo dõi lỗi | Sentry (hoặc tương đương) cho cả web và server, có source map |
| Sao lưu | Postgres: sao lưu liên tục WAL + bản đầy đủ hằng ngày, giữ 30 ngày; S3: bật versioning và nhân bản; **kiểm tra khôi phục mỗi tháng** bằng script tự động |
| Runbook | `/docs/runbooks/`: sự cố DB, Redis, S3, hàng đợi kẹt, khôi phục từ sao lưu, xoay khoá |

### 9.5 Chiến lược kiểm thử (bắt buộc đạt trước khi sang giai đoạn kế)

| Lớp | Công cụ | Phạm vi tối thiểu |
| --- | --- | --- |
| Unit | Vitest | Service, policy phân quyền (bao phủ ≥ 80% lớp nghiệp vụ), tính toán RRULE, tính dung lượng, thời gian tương đối tiếng Việt |
| Tích hợp | Vitest + Testcontainers (Postgres, Redis, MinIO) | Mọi endpoint: thành công, sai đầu vào, sai quyền, khác không gian |
| E2E | Playwright | Đăng nhập, tạo không gian, tạo/sửa/chia sẻ tài liệu, tải tệp, tạo sự kiện lặp, gửi tin nhắn, dashboard khớp dữ liệu |
| Cộng tác | Playwright nhiều context | 10 trình duyệt sửa cùng một tài liệu, ngắt mạng ngẫu nhiên, kết quả cuối giống nhau |
| Tải | k6 | 200 người dùng đồng thời theo kịch bản thực; 50 kết nối WS/kênh |
| Hỏng hoá chủ động | Script | Tắt Redis / S3 / worker giữa chừng và kiểm tra chế độ suy giảm |
| Truy cập | axe + kiểm tra tay | Không có lỗi mức nghiêm trọng; thao tác được hoàn toàn bằng bàn phím |
| Hình ảnh | Playwright screenshot | So sánh với thiết kế ở 3 độ rộng: 1440, 1024, 390; sáng/tối |
| Bảo mật | ZAP/Nuclei + test phân quyền | Quét tự động mỗi bản phát hành |

### 9.6 CI/CD

1. Mỗi pull request: lint → typecheck → unit → tích hợp → build → E2E rút gọn → quét bảo mật.
2. Merge vào nhánh chính: build image Docker, chạy migration thử trên bản sao dữ liệu, E2E đầy đủ, triển khai staging.
3. Phát hành production thủ công duyệt, có kế hoạch rollback (image cũ + migration tương thích ngược).
4. Môi trường: dev (Docker Compose), staging (dữ liệu ẩn danh), production.

### 9.7 Khả năng tương thích và địa phương hoá

* Trình duyệt: Chrome, Edge, Firefox, Safari 2 phiên bản mới nhất; di động iOS Safari và Chrome Android.
* Tiếng Việt: mọi chuỗi nằm trong tệp dịch `vi.json`; kiểm tra chuỗi Unicode tổ hợp/dựng sẵn khi tìm kiếm (chuẩn hoá NFC); sắp xếp theo `Intl.Collator('vi')`.
* Định dạng: ngày dd/MM/yyyy, giờ 24h, dấu phẩy thập phân, dung lượng theo GB/MB.
* Tăng trưởng: lược đồ không giả định một múi giờ hay một ngôn ngữ.

## 10. Chuỗi prompt theo từng giai đoạn

Dán lần lượt vào Antigravity sau Master Prompt. Mỗi prompt đều kết thúc bằng yêu cầu dừng lại chờ duyệt. Chỉ chuyển giai đoạn khi giai đoạn trước đạt điều kiện hoàn thành ở mục 5.

### Giai đoạn 0 – Nền móng

```
Thực hiện GIAI ĐOẠN 0 theo /docs/SPEC.md mục 4 và 5.  
1) Khởi tạo monorepo pnpm; ĐƯA code nền trong /apps/web vào nguyên vẹn, KHÔNG viết lại giao diện; thêm apps/api, apps/realtime, packages/db, packages/shared. Dọn phần của Figma Make theo SPEC mục 3.4 (xoá .figma, thay vite.config.ts, sửa index.html, thay AGENTS.md). TypeScript strict, ESLint, Prettier, Husky + lint-staged.  
2) docker-compose.yml: postgres, redis, minio, clamav, web, realtime; có healthcheck; .env.example đầy đủ và kiểm tra biến môi trường lúc khởi động.  
3) Chạy pnpm dev, chụp ảnh chuẩn trang Tổng quan 1440/1024/390 vào docs/design/baseline. Tách token từ src/index.css ra apps/web/src/styles/tokens.css theo mục 3.2 (giữ nguyên giá trị), giữ font Be Vietnam Pro.  
4) Tách App.tsx thành AppShell (Sidebar, Topbar) và các thẻ dashboard thành component riêng theo bảng ánh xạ ở mục 3.3; thêm React Router (điều hướng bằng liên kết thật), react-i18next vi-VN, sidebar thu gọn, sáng/tối. Ảnh chụp sau khi tách phải giống hệt ảnh chuẩn.  
5) Logging pino + requestId, /healthz, /readyz, GitHub Actions chạy lint/typecheck/test.  
CHƯA làm tính năng nghiệp vụ. Xuất Implementation Plan trước, chờ tôi duyệt.
```

### Giai đoạn 1 – Danh tính và Không gian

```
Thực hiện GIAI ĐOẠN 1: FR-AUTH-01..09, FR-WS-01..08, ma trận quyền mục 6.0.  
- Schema + migration: users, sessions, oauth_accounts, workspaces, workspace_members, invitations.  
- Module policy.can() tập trung; mọi endpoint phải gọi. Bật RLS Postgres theo workspace_id.  
- Giao diện: các màn hình mục 7.1, hộp thoại Tạo không gian, trang chủ không gian và cài đặt (mục 7.2).  
- Seed: 1 tổ chức, 4 không gian (Công ty, Dự án Sản phẩm, Marketing, Nhân sự), 12 người dùng có vai trò khác nhau.  
- Test: bảng test phân quyền cho từng vai trò × từng hành động; test cô lập giữa các không gian; test khoá đăng nhập; test rate limit.  
Dừng lại sau khi báo cáo kết quả test.
```

### Giai đoạn 2 – Tổng quan bằng dữ liệu thật

```
Thực hiện GIAI ĐOẠN 2: FR-DASH-01..08, FR-TASK-01,02,07, FR-NOTI-01..03, FR-SRCH-01,02,06.  
- Nối giao diện Tổng quan của code nền với API thật, thay các hằng số mock trong App.tsx và sửa các điểm ở danh sách “chưa đúng” mục 3.3: mỗi thẻ gọi API riêng, có skeleton, trạng thái rỗng và lỗi riêng.  
- Dựng activity_events + endpoint thống kê 7/30/90 ngày có cache Redis; biểu đồ đường đúng như thiết kế.  
- CRUD công việc, tab Đang thực hiện / Sắp tới / Đã hoàn thành, hoàn tác 5 giây.  
- Chuông thông báo realtime, Ctrl K tìm kiếm không dấu.  
- Playwright: chụp dashboard ở 1440/1024/390 và so với ảnh thiết kế; báo mọi khác biệt.  
Dừng lại chờ duyệt.
```

### Giai đoạn 3 – Kho lưu trữ

```
Thực hiện GIAI ĐOẠN 3: FR-STO-01..13 và màn hình mục 7.7.  
- Bảng items dùng chung, item_versions, upload_sessions, usage_counters.  
- Upload multipart presigned 8MB, tạm dừng/tiếp tục/tự thử lại, hàng đợi UI nổi ở góc dưới phải.  
- Worker: quét ClamAV, thumbnail, đối soát dung lượng hằng đêm, dọn upload bỏ dở.  
- Thanh dung lượng ở sidebar dùng số liệu thật; cảnh báo 80% / 95%; chặn ở 100%.  
- Test: tải 2GB, ngắt mạng giữa chừng rồi tiếp tục; tệp giả đuôi .jpg thực chất là .exe bị chặn; xoá vĩnh viễn thật sự giải phóng dung lượng; tải ZIP nhiều tệp streaming.
```

### Giai đoạn 4 – Soạn thảo

```
Thực hiện GIAI ĐOẠN 4: FR-DOC-01..17 và màn hình mục 7.3.  
- TipTap + Yjs, apps/realtime (Hocuspocus) có xác thực và kiểm tra quyền theo item_shares.  
- Lưu Yjs theo lô 2 giây vào Postgres, snapshot định kỳ, IndexedDB offline.  
- Bình luận gắn đoạn, @nhắc tên gửi thông báo, lịch sử phiên bản có so sánh/khôi phục, hộp thoại chia sẻ đầy đủ quyền.  
- Xuất PDF/DOCX/MD bằng job nền.  
- Test cộng tác: 10 trình duyệt cùng sửa, ngắt/nối mạng ngẫu nhiên, nội dung cuối cùng giống hệt nhau và không mất ký tự nào.
```

### Giai đoạn 5 – Lịch làm việc

```
Thực hiện GIAI ĐOẠN 5: FR-CAL-01..13 và màn hình mục 7.5.  
- Dùng thư viện rrule; lưu UTC, hiển thị theo múi giờ người dùng; xử lý ngoại lệ lặp (chỉ này / từ đây trở đi / tất cả).  
- Ràng buộc EXCLUDE chống trùng phòng họp ở DB.  
- Nhắc lịch bằng BullMQ, đúng giờ ±30 giây; lời mời + phản hồi; lưới rảnh/bận.  
- Nối thẻ Lịch hôm nay trên dashboard vào dữ liệu thật.  
- Test: sự kiện lặp hằng tuần qua ranh giới đổi giờ, kéo-thả đổi giờ, 2 người cùng đặt một phòng cùng lúc chỉ 1 người thành công.
```

### Giai đoạn 6 – Tin nhắn

```
Thực hiện GIAI ĐOẠN 6: FR-MSG-01..14 và màn hình mục 7.6.  
- Gateway WebSocket có xác thực, kiểm tra quyền theo kênh, backoff kết nối lại, đồng bộ phần bị lỡ bằng lastEventId.  
- messages có idempotency_key; phân trang con trỏ; mốc đã đọc; huy hiệu chưa đọc ở sidebar đúng và đồng bộ đa thiết bị.  
- Thread, phản ứng emoji, @nhắc, đính kèm từ Kho, thẻ xem trước liên kết tài liệu (kiểm tra quyền người nhận).  
- Test: gửi 1000 tin/phút vào một kênh, mất kết nối giữa chừng, không trùng và không mất tin.
```

### Giai đoạn 7 – Trình chiếu

```
Thực hiện GIAI ĐOẠN 7: FR-SLD-01..10 và màn hình mục 7.4.  
- Editor canvas (chọn, di chuyển, đổi cỡ, xoay, nhóm, guideline căn lề, hoàn tác/làm lại), kéo-thả sắp xếp trang, mẫu bố cục, chủ đề.  
- Cộng tác bằng Yjs; chế độ trình chiếu và chế độ diễn giả.  
- Xuất PDF và PPTX (pptxgenjs); sinh thumbnail bằng worker.  
- Test: xuất PPTX và mở được bằng PowerPoint/LibreOffice giữ đúng bố cục, 50 trang vẫn mượt (>= 50 fps khi kéo).
```

### Giai đoạn 8 – Đội ngũ và Quản trị

```
Thực hiện GIAI ĐOẠN 8: FR-TEAM-01..08, FR-ADM-01..06, FR-SET-01..06, FR-NOTI-04..06, và Trang Công việc đầy đủ (FR-TASK-03..06, mục 7.9).  
- Audit log append-only (chặn UPDATE/DELETE bằng trigger), chính sách bảo mật theo không gian, quota, báo cáo sử dụng, xuất dữ liệu ZIP.  
- Danh bạ, nhóm, sơ đồ tổ chức, mời CSV có báo cáo lỗi từng dòng.  
- Trang tình trạng hệ thống đọc từ /readyz và metrics.
```

### Giai đoạn 9 – Làm cứng và phát hành

```
Thực hiện GIAI ĐOẠN 9 theo SPEC mục 9 và 11.  
1) Viết kịch bản k6 theo mục 9.1; tối ưu mọi truy vấn chậm > 200ms (đưa EXPLAIN vào báo cáo).  
2) Chạy script hỏng hoá chủ động (tắt Redis/S3/ClamAV/worker) và chứng minh chế độ suy giảm đúng thiết kế.  
3) Sao lưu + khôi phục thử trên môi trường sạch, đo RPO/RTO thật.  
4) Quét bảo mật (ZAP/Nuclei, audit phụ thuộc), sửa mọi lỗi mức cao.  
5) Hoàn thiện /docs/runbooks, README triển khai, tài liệu người dùng cơ bản.  
6) Chạy toàn bộ checklist mục 11 và nộp báo cáo kèm bằng chứng cho từng dòng.
```

### Prompt dùng khi gặp vấn đề

| Tình huống | Prompt gợi ý |
| --- | --- |
| Agent làm sai hoặc thiếu so với đặc tả | Đối chiếu với FR-xxx trong SPEC.md, liệt kê chính xác chỗ lệch, sửa và thêm test chứng minh. Không sửa ngoài phạm vi. |
| Giao diện lệch thiết kế | Chụp ảnh màn hình bằng browser agent ở 1440px, so với /docs/design/dashboard.png, liệt kê khác biệt về khoảng cách, màu, cỡ chữ, rồi sửa bằng token, không hard-code. |
| Lỗi khó tái hiện | Viết test tái hiện lỗi trước, xác nhận test đỏ, sau đó mới sửa và xác nhận test xanh. |
| Trước khi hợp nhất | Tự review như một kỹ sư senior: bảo mật, phân quyền, hiệu năng truy vấn, xử lý lỗi, a11y, chuỗi tiếng Việt. Liệt kê rủi ro còn lại. |
| Agent muốn đổi công nghệ | Dừng lại, viết ADR nêu lý do và tác động, chờ tôi duyệt. |

## 11. Checklist nghiệm thu

### 11.1 Chức năng

* ☐ Mọi FR mức P0 đã hoàn thành và có test tự động; mọi FR P1 đã xong hoặc có ghi chú hoãn được duyệt
* ☐ Dashboard khớp thiết kế ở 1440/1024/390 px, sáng và tối, không còn dữ liệu giả cứng
* ☐ Các phân hệ Soạn thảo, Trình chiếu, Lịch, Tin nhắn, Kho lưu trữ, Đội ngũ có đủ 5 trạng thái (tải, bình thường, rỗng, lỗi, không quyền)
* ☐ Lời chào, ngày tháng, thời gian tương đối, số huy hiệu và dung lượng đều tính từ dữ liệu thật

### 11.2 Ổn định và an toàn

* ☐ 10 người sửa cùng tài liệu trong 30 phút với ngắt mạng ngẫu nhiên: không mất dữ liệu
* ☐ Tải tệp 2 GB, ngắt mạng và tiếp tục thành công; tệp độc hại bị cách ly
* ☐ Test cô lập không gian: người ngoài không đọc được bất kỳ dữ liệu nào qua mọi endpoint và WebSocket
* ☐ Tắt Redis, S3, ClamAV, worker: hệ thống suy giảm đúng thiết kế, tự phục hồi khi dịch vụ trở lại
* ☐ Sao lưu và khôi phục thử thành công, RPO ≤ 5 phút, RTO ≤ 1 giờ
* ☐ k6: 200 người đồng thời đạt các chỉ tiêu ở mục 9.1
* ☐ Không còn lỗi bảo mật mức cao/nghiêm trọng; audit log ghi đủ hành động nhạy cảm

### 11.3 Chất lượng và vận hành

* ☐ `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e` xanh trên CI
* ☐ `docker compose up` chạy từ máy sạch theo README trong dưới 15 phút
* ☐ Giám sát, cảnh báo và runbook đã cấu hình và thử
* ☐ Không lỗi axe mức nghiêm trọng; thao tác chính dùng được hoàn toàn bằng bàn phím
* ☐ `/docs/TRACEABILITY.md` ánh xạ đủ FR → mã nguồn → test

### 11.4 Các giả định cần bạn xác nhận trước khi bắt đầu

| Giả định | Lựa chọn mặc định trong tài liệu | Phương án khác |
| --- | --- | --- |
| Mô hình triển khai | Tự lưu trữ (self-host) bằng Docker Compose, một tổ chức nhiều không gian | Nhiều tổ chức (multi-tenant SaaS) cần thêm bảng `organizations` và thanh toán |
| Quy mô ban đầu | 1.000 người dùng, 200 đồng thời | Lớn hơn cần tách cụm realtime, thêm replica đọc |
| Trình chiếu | Editor tự xây trên canvas, xuất PPTX | Nhúng thư viện có sẵn để ra mắt nhanh hơn nhưng ít kiểm soát |
| Tích hợp ngoài | Google OAuth, SMTP; chưa có Zoom/Meet, Slack | Thêm ở giai đoạn sau qua webhook và OAuth |
| Ngôn ngữ | Tiếng Việt mặc định, sẵn sàng thêm tiếng Anh | Đa ngôn ngữ đầy đủ ngay từ đầu |