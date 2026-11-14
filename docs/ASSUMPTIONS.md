# Danh sách Giả định & Vấn đề Chờ Quyết định (Assumptions & Open Decisions)

Tài liệu này ghi nhận các giả định kỹ thuật hoặc điểm thiếu thông tin phát sinh từ quá trình phân tích đặc tả `/docs/SPEC.md` theo quy tắc tại `AGENTS.md`.

---

## 1. Phân hệ Đội ngũ (TEAM - SPEC Mục 6.12 & 7.8)

1. **Badge số lượng trên các Tab (`Thành viên (12)`, `Nhóm (4)`, `Lời mời đang chờ (2)`):**
   - _Hiện trạng SPEC:_ Mục 7.8 chỉ ghi danh sách tên tab dạng văn bản thuần: `Tab: Thành viên | Nhóm | Sơ đồ tổ chức | Lời mời đang chờ`.
   - _Giả định:_ Việc hiển thị huy hiệu (badge) đếm số lượng thành viên, số nhóm và số lời mời chờ xử lý là giả định suy ra từ pattern chung của các tab khác trong hệ thống (như tab `Sắp tới (3)` trong MyTasks và Tab Thông báo). Cần quyết định giữ hay bỏ badge đếm khi bước vào Giai đoạn 8.

2. **Cột dữ liệu `chức danh` (Job title) trong danh bạ thành viên (`FR-TEAM-01` & Mục 7.8):**
   - _Hiện trạng SPEC:_ Mục 7.8 và `FR-TEAM-01` yêu cầu bảng danh bạ hiển thị cột `chức danh`. Tuy nhiên, trong schema CSDL của bảng `users` tại Mục 8.2 (`email`, `password_hash`, `name`, `avatar_key`, `timezone`, `locale`, `totp_secret`, `status`), hoàn toàn không có cột riêng để lưu `job_title` hay `position`.
   - _Vấn đề chờ quyết định:_ Cần quyết định (a) bổ sung cột `job_title varchar(255)` vào bảng `users` trong CSDL, hoặc (b) lưu trong metadata/profile JSON, hoặc (c) gán chức danh theo vai trò/nhóm.

---

## 2. Vị trí các Mục Menu chưa có trong Sidebar (Công việc, Thông báo, Cài đặt cá nhân, Quản trị, Tìm kiếm)

- _Hiện trạng ảnh thiết kế baseline (`docs/design/baseline/dashboard-*.png`):_
  Thanh điều hướng Sidebar chỉ gồm đúng 7 mục menu chính: `Tổng quan`, `Soạn thảo`, `Đội ngũ`, `Trình chiếu`, `Lịch làm việc`, `Tin nhắn`, `Kho lưu trữ` cùng khối `Không gian làm việc` (4 không gian) và nút `Tạo không gian mới`.
- _Màn hình quy định trong SPEC Mục 7 nhưng không có trên Sidebar ảnh:_
  1. Trang Công việc đầy đủ (`/tasks`) — SPEC 7.9 & FR-TASK-03..07.
  2. Trung tâm Thông báo (`/notifications`) — SPEC 7.10 & FR-NOTI-01..06.
  3. Cài đặt cá nhân (`/settings`) — SPEC 7.10 & FR-SET-01..06.
  4. Quản trị hệ thống (`/admin`) — SPEC 7.10 & FR-ADM-01..06.
  5. Tìm kiếm toàn cục (`Modal Ctrl+K`) — SPEC 7.10 & FR-SRCH-01..06.

- _Vấn đề chờ quyết định:_ Cần quyết định vị trí điều hướng người dùng đến các màn hình này mà không làm phá vỡ giao diện chuẩn của trang Tổng quan (bảo toàn 0 pixel lệch so với ảnh baseline).

- _Đề xuất 2 phương án:_
  - **Phương án 1 (Bảo toàn 100% Sidebar baseline — Khuyến nghị):**
    - Giữ nguyên 100% Sidebar theo ảnh gốc (7 mục chính).
    - Phân bổ lối vào theo đúng ngữ cảnh thực tế của SPEC:
      - `Công việc (/tasks)`: Truy cập qua nút "Xem tất cả" trên widget `MyTasks` tại Dashboard hoặc tab `Công việc` bên trong từng Không gian (`/w/:slug/tasks`).
      - `Thông báo (/notifications)`: Truy cập qua biểu tượng Chuông ở Topbar (`NotificationCenter`).
      - `Cài đặt cá nhân (/settings)`: Nằm trong menu Avatar người dùng (`UserMenu` ở góc trên bên phải).
      - `Quản trị (/admin)`: Nằm trong menu Avatar người dùng (chỉ hiển thị với Admin/Owner).
      - `Tìm kiếm`: Nằm ở ô tìm kiếm trung tâm Topbar (`GlobalSearch` Ctrl+K).
    - _Ưu điểm:_ Giữ vững 0 pixel lệch đối với Sidebar và Dashboard baseline ở mọi độ phân giải 1440/1024/390.
  - **Phương án 2 (Bổ sung mục menu trực tiếp vào Sidebar):**
    - Thêm một phân vùng mới hoặc bổ sung vào danh sách chính: ví dụ thêm `Công việc` vào `mainNavigation`, và thêm một khối `Hệ thống` ở chân sidebar gồm `Cài đặt`, `Quản trị`.
    - _Nhược điểm:_ Thay đổi cấu trúc DOM, markup và chiều cao của Sidebar, gây lệch pixel (regression) so với ảnh baseline `dashboard-1440.png`, `dashboard-1024.png`. Cần có quyết định chấp thuận cập nhật baseline trước khi triển khai.
