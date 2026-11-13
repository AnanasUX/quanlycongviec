# Workspace – quy tắc cho agent

Đọc /docs/SPEC.md trước mọi việc. Mục 2, 3.3, 3.4 luôn đọc; các mục khác đọc theo giai đoạn được giao.

## Nguồn sự thật

SPEC.md (hành vi, dữ liệu) > code nền /apps/web (giao diện) > /docs/design/dashboard.png > suy đoán.
Thiếu thông tin: ghi giả định vào /docs/ASSUMPTIONS.md rồi tiếp tục.

## Công nghệ (cố định)

Frontend: React 19 + Vite + Tailwind v4 + lucide-react (code nền có sẵn; KHÔNG chuyển sang Next.js, KHÔNG viết lại giao diện).
Backend: Node 22 + Fastify; PostgreSQL + Drizzle; Redis; BullMQ; Yjs + TipTap; MinIO/S3.
Muốn đổi công nghệ: viết ADR vào /docs/ADR và chờ tôi duyệt.

## Quy tắc

1. Chỉ làm giai đoạn được giao. Trước khi code phải xuất Implementation Plan và chờ tôi duyệt.
2. Khi tách component không đổi markup, tên class, giá trị CSS trừ khi SPEC yêu cầu.
3. Màn hình mới dùng lại token và mẫu class của code nền (SPEC mục 3.2).
4. Mọi chức năng: validate đầu vào, kiểm tra quyền phía server, đủ trạng thái tải/rỗng/lỗi, chuỗi tiếng Việt, có test.
5. Không dữ liệu giả cứng trong UI cuối; dữ liệu mẫu chỉ ở script seed.
6. Mỗi giai đoạn xong: lint, typecheck, test, e2e xanh; cập nhật /docs/TRACEABILITY.md và /docs/CHANGELOG.md.
7. Mỗi lần bàn giao báo: FR đã xong, kết quả test, việc chưa làm, rủi ro.
