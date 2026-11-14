import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { TwoFactorPage } from "./pages/auth/TwoFactorPage";
import { AcceptInvitePage } from "./pages/auth/AcceptInvitePage";
import { OnboardingPage } from "./pages/auth/OnboardingPage";
import { WorkspaceDetailPage } from "./pages/workspace/WorkspaceDetailPage";
import { WorkspaceSettingsPage } from "./pages/workspace/WorkspaceSettingsPage";
import { FeaturePlaceholderPage } from "./pages/FeaturePlaceholderPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
    // 1. Dashboard (Tổng quan)
    {
      path: "/",
      element: (
        <AppShell>
          <DashboardPage />
        </AppShell>
      ),
    },

    // 2. Nhóm Xác thực (Auth)
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

    // 3. Phân hệ Soạn thảo (Docs)
    {
      path: "/docs",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Soạn thảo"
            moduleName="Soạn thảo"
            featureName="Quản lý và danh sách tài liệu"
            frCodes={["FR-DOC-01", "FR-DOC-10", "FR-DOC-12"]}
            description="Không gian quản lý toàn bộ tài liệu cá nhân và chia sẻ trong tổ chức."
            expectedFeatures={[
              "Lưới và danh sách tài liệu trực quan với 5 tab phân loại",
              "Bộ lọc theo không gian làm việc và trạng thái tài liệu",
              "Xem trước ảnh thumbnail trang đầu và thao tác nhanh",
              "Khởi tạo tài liệu mới từ trang trống hoặc thư viện mẫu",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/docs/:id",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trình soạn thảo Tài liệu"
            moduleName="Soạn thảo"
            featureName="Soạn thảo cộng tác thời gian thực (TipTap & Yjs)"
            frCodes={[
              "FR-DOC-02",
              "FR-DOC-03",
              "FR-DOC-04",
              "FR-DOC-05",
              "FR-DOC-06",
              "FR-DOC-07",
              "FR-DOC-08",
              "FR-DOC-09",
              "FR-DOC-13",
              "FR-DOC-14",
              "FR-DOC-15",
              "FR-DOC-16",
              "FR-DOC-17",
            ]}
            description="Trình biên soạn nội dung đa phương tiện, hỗ trợ cộng tác thời gian thực và lịch sử phiên bản."
            expectedFeatures={[
              "Thanh công cụ định dạng khối và nội dòng phong phú",
              "Mục lục tự động trượt bên trái theo cấu trúc tiêu đề",
              "Bình luận, thảo luận theo dòng và giải quyết phản hồi",
              "Lịch sử phiên bản trượt phải và tính năng khôi phục bản cũ",
              "Hộp thoại chia sẻ phân quyền chi tiết và liên kết bảo mật",
            ]}
            backPath="/docs"
            backLabel="Về Danh sách tài liệu"
          />
        </AppShell>
      ),
    },
    {
      path: "/w/:slug/docs/:id",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trình soạn thảo Tài liệu Không gian"
            moduleName="Soạn thảo"
            featureName="Soạn thảo tài liệu thuộc Không gian làm việc"
            frCodes={["FR-DOC-02", "FR-DOC-03", "FR-DOC-09"]}
            description="Tài liệu được quản lý trong phạm vi không gian làm việc chuyên biệt."
          />
        </AppShell>
      ),
    },

    // 4. Phân hệ Trình chiếu (Slides)
    {
      path: "/slides",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trình chiếu"
            moduleName="Trình chiếu"
            featureName="Danh sách bản trình chiếu & Thư viện mẫu"
            frCodes={["FR-SLD-01", "FR-SLD-02"]}
            description="Quản lý các bài thuyết trình chuyên nghiệp và bộ sưu tập mẫu thiết kế chuẩn."
            expectedFeatures={[
              "Lưới thumbnail tỷ lệ chuẩn 16:9 với chế độ xem thẻ",
              "Bộ lọc theo nhãn, ngày cập nhật và quyền sở hữu",
              "Thư viện mẫu thuyết trình doanh nghiệp phong phú",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/slides/:id",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trình soạn thảo Trình chiếu"
            moduleName="Trình chiếu"
            featureName="Biên tập Slide Canvas 16:9"
            frCodes={["FR-SLD-03", "FR-SLD-04", "FR-SLD-05", "FR-SLD-07", "FR-SLD-09", "FR-SLD-10"]}
            description="Không gian thiết kế slide tương tác cao với canvas tự do và định dạng linh hoạt."
            expectedFeatures={[
              "Dải trang thu nhỏ kéo-thả sắp xếp thứ tự bên trái",
              "Canvas trung tâm zoom tự do hỗ trợ các thành phần văn bản, hình vẽ, ảnh",
              "Bảng điều khiển thuộc tính màu sắc, font chữ và hiệu ứng bên phải",
              "Ngăn ghi chú dành riêng cho diễn giả ở chân trang",
            ]}
            backPath="/slides"
            backLabel="Về Danh sách trình chiếu"
          />
        </AppShell>
      ),
    },
    {
      path: "/w/:slug/slides/:id",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trình soạn thảo Slide Không gian"
            moduleName="Trình chiếu"
            featureName="Biên tập slide trong Không gian làm việc"
            frCodes={["FR-SLD-03", "FR-SLD-05"]}
            description="Bài thuyết trình được lưu trữ và cộng tác trong không gian cụ thể."
          />
        </AppShell>
      ),
    },
    {
      // Chế độ trình chiếu toàn màn hình & diễn giả (Render không cần Shell)
      path: "/slides/:id/present",
      element: (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#0b0f19",
            color: "#f8fafc",
            padding: "40px",
          }}
        >
          <FeaturePlaceholderPage
            title="Chế độ Trình chiếu & Diễn giả"
            moduleName="Trình chiếu"
            featureName="Trình chiếu Toàn màn hình & Màn hình Diễn giả (Presenter View)"
            frCodes={["FR-SLD-06", "FR-SLD-08"]}
            description="Giao diện trình chiếu toàn màn hình mượt mà cùng chế độ hỗ trợ diễn giả chuyên nghiệp."
            expectedFeatures={[
              "Trình chiếu toàn màn hình không viền với thanh điều khiển tự ẩn",
              "Chế độ diễn giả hiển thị đồng hồ đếm giờ, slide tiếp theo và ghi chú bí mật",
              "Hỗ trợ phím tắt điều hướng nhanh và con trỏ laser ảo",
            ]}
            backPath="/slides"
            backLabel="Thoát trình chiếu"
          />
        </div>
      ),
    },

    // 5. Phân hệ Lịch làm việc (Calendar)
    {
      path: "/calendar",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Lịch làm việc"
            moduleName="Lịch làm việc"
            featureName="Quản lý Lịch biểu & Lên lịch họp thông minh"
            frCodes={[
              "FR-CAL-01",
              "FR-CAL-02",
              "FR-CAL-03",
              "FR-CAL-04",
              "FR-CAL-05",
              "FR-CAL-06",
              "FR-CAL-07",
              "FR-CAL-08",
              "FR-CAL-09",
              "FR-CAL-10",
              "FR-CAL-11",
              "FR-CAL-12",
              "FR-CAL-13",
            ]}
            description="Trung tâm điều phối thời gian làm việc, lịch họp nhóm và tài nguyên phòng họp."
            expectedFeatures={[
              "Lưới lịch đa chế độ: Ngày, Tuần, Tháng và Lịch biểu chi tiết",
              "Lịch nhỏ mini-calendar bên trái phục vụ chuyển ngày nhanh",
              "Hộp thoại tạo sự kiện có chức năng tìm giờ rảnh/bận chung",
              "Tích hợp phòng họp và gửi thư mời tham gia tự động",
            ]}
          />
        </AppShell>
      ),
    },

    // 6. Phân hệ Tin nhắn (Messages)
    {
      path: "/messages",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Tin nhắn"
            moduleName="Tin nhắn"
            featureName="Giao tiếp Tức thời & Kênh Trao đổi Nhóm"
            frCodes={[
              "FR-MSG-01",
              "FR-MSG-02",
              "FR-MSG-03",
              "FR-MSG-04",
              "FR-MSG-05",
              "FR-MSG-06",
              "FR-MSG-07",
              "FR-MSG-08",
              "FR-MSG-09",
              "FR-MSG-10",
              "FR-MSG-11",
              "FR-MSG-12",
              "FR-MSG-13",
              "FR-MSG-14",
            ]}
            description="Hệ thống tin nhắn tức thời thời gian thực kết nối đội ngũ làm việc hiệu quả."
            expectedFeatures={[
              "Bố cục 3 cột: Danh sách kênh/hội thoại, Luồng tin nhắn chính, Chi tiết kênh",
              "Hỗ trợ tin nhắn nhóm (kênh công khai/riêng tư) và tin nhắn trực tiếp 1-1",
              "Soạn thảo tin nhắn giàu nội dung, biểu cảm cảm xúc (reaction), đính kèm tệp",
              "Luồng trả lời chuyên sâu (Thread) giúp phân nhánh thảo luận rõ ràng",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/messages/:channelId",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Kênh Tin nhắn"
            moduleName="Tin nhắn"
            featureName="Luồng Thảo luận Kênh"
            frCodes={["FR-MSG-02", "FR-MSG-03", "FR-MSG-05"]}
            description="Kênh hội thoại làm việc theo nhóm hoặc dự án."
            backPath="/messages"
            backLabel="Về Danh sách tin nhắn"
          />
        </AppShell>
      ),
    },

    // 7. Phân hệ Kho lưu trữ (Storage)
    {
      path: "/storage",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Kho lưu trữ"
            moduleName="Kho lưu trữ"
            featureName="Quản lý Tệp tin, Thư mục & Hạn ngạch Lưu trữ"
            frCodes={[
              "FR-STO-01",
              "FR-STO-02",
              "FR-STO-03",
              "FR-STO-04",
              "FR-STO-05",
              "FR-STO-06",
              "FR-STO-07",
              "FR-STO-08",
              "FR-STO-09",
              "FR-STO-10",
              "FR-STO-11",
              "FR-STO-12",
              "FR-STO-13",
            ]}
            description="Lưu trữ an toàn, tổ chức phân cấp tệp tin và kiểm soát dung lượng không gian."
            expectedFeatures={[
              "Chuyển đổi linh hoạt giữa chế độ hiển thị danh sách chi tiết và lưới thẻ",
              "Cây điều hướng đường dẫn (Breadcrumb) thuận tiện",
              "Khung nổi theo dõi tiến độ tải lên (Upload Progress Panel) ở góc màn hình",
              "Ngăn xem chi tiết tệp, lịch sử tải về và tab trực quan hoá hạn ngạch",
            ]}
          />
        </AppShell>
      ),
    },

    // 8. Phân hệ Đội ngũ (Team)
    {
      path: "/team",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Đội ngũ"
            moduleName="Đội ngũ"
            featureName="Danh bạ Thành viên, Nhóm & Quản trị Quyền hạn"
            frCodes={[
              "FR-TEAM-01",
              "FR-TEAM-02",
              "FR-TEAM-03",
              "FR-TEAM-04",
              "FR-TEAM-05",
              "FR-TEAM-06",
              "FR-TEAM-07",
              "FR-TEAM-08",
            ]}
            description="Quản lý nhân sự, cơ cấu tổ chức và phân quyền thành viên trong toàn bộ không gian."
            expectedFeatures={[
              "Bảng danh bạ thành viên đầy đủ kèm bộ lọc phòng ban và trạng thái",
              "Ngăn hồ sơ chi tiết bên phải tích hợp phím tắt nhắn tin và mời họp",
              "Quản lý nhóm làm việc và sơ đồ tổ chức phân cấp trực quan",
              "Quản lý lời mời đang chờ xử lý và tính năng mời hàng loạt qua CSV",
            ]}
          />
        </AppShell>
      ),
    },

    // 9. Trang Công việc (Tasks)
    {
      path: "/tasks",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Công việc"
            moduleName="Công việc"
            featureName="Bảng Kanban Quản lý Công việc Toàn diện"
            frCodes={[
              "FR-TASK-01",
              "FR-TASK-02",
              "FR-TASK-03",
              "FR-TASK-04",
              "FR-TASK-05",
              "FR-TASK-06",
              "FR-TASK-07",
            ]}
            description="Bảng quản lý công việc trực quan giúp tối ưu hoá năng suất và tiến độ của từng cá nhân, dự án."
            expectedFeatures={[
              "Bảng Kanban 3 cột trực quan (Cần làm, Đang làm, Hoàn thành) hỗ trợ kéo-thả",
              "Bộ lọc thông minh theo người phụ trách, độ ưu tiên, hạn chót và nhãn",
              "Ngăn trượt chi tiết công việc: mô tả, công việc con, tệp đính kèm và bình luận",
              "Đồng bộ liên kết với tài liệu soạn thảo và sự kiện lịch làm việc",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/w/:slug/tasks",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Công việc Không gian"
            moduleName="Công việc"
            featureName="Bảng Công việc thuộc Không gian làm việc"
            frCodes={["FR-TASK-03", "FR-TASK-04", "FR-TASK-06"]}
            description="Theo dõi và quản lý công việc được gán trong không gian chuyên biệt."
          />
        </AppShell>
      ),
    },

    // 10. Trung tâm Thông báo (Notifications)
    {
      path: "/notifications",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Trung tâm Thông báo"
            moduleName="Thông báo"
            featureName="Quản lý Thông báo Hoạt động & Cảnh báo Hệ thống"
            frCodes={[
              "FR-NOTI-01",
              "FR-NOTI-02",
              "FR-NOTI-03",
              "FR-NOTI-04",
              "FR-NOTI-05",
              "FR-NOTI-06",
            ]}
            description="Theo dõi tức thời các hoạt động quan trọng, lời nhắc công việc và cập nhật cộng tác."
            expectedFeatures={[
              "Phân loại 3 tab chuyên biệt: Tất cả, Chưa đọc và Nhắc tên tôi",
              "Thao tác nhanh: Đánh dấu đã đọc tất cả và tuỳ chọn lọc theo phân hệ",
              "Điều hướng trực tiếp đến tài liệu, sự kiện hoặc công việc liên quan",
            ]}
          />
        </AppShell>
      ),
    },

    // 11. Cài đặt Cá nhân (Settings)
    {
      path: "/settings",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Cài đặt cá nhân"
            moduleName="Cài đặt"
            featureName="Tuỳ chỉnh Tài khoản, Giao diện & Bảo mật Người dùng"
            frCodes={[
              "FR-AUTH-07",
              "FR-AUTH-08",
              "FR-SET-01",
              "FR-SET-02",
              "FR-SET-03",
              "FR-SET-04",
              "FR-SET-05",
              "FR-SET-06",
            ]}
            description="Quản lý thông tin định danh cá nhân, giao diện trải nghiệm và cấu hình bảo mật tài khoản."
            expectedFeatures={[
              "Menu cấu hình 8 phân mục: Hồ sơ, Giao diện, Ngôn ngữ, Thông báo, Bảo mật, Phiên, Phím tắt, Khoá API",
              "Cấu hình xác thực hai lớp (TOTP) và quản lý danh sách phiên đăng nhập",
              "Tuỳ chọn ngôn ngữ hiển thị tiếng Việt và bảng phím tắt tiện ích",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/settings/:tab",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Cài đặt cá nhân"
            moduleName="Cài đặt"
            featureName="Cấu hình Phân mục Cài đặt Cá nhân"
            frCodes={["FR-SET-01", "FR-SET-02", "FR-SET-03", "FR-SET-04"]}
            description="Thiết lập chi tiết cho từng hạng mục tuỳ chọn cá nhân."
            backPath="/settings"
            backLabel="Về Cài đặt cá nhân"
          />
        </AppShell>
      ),
    },

    // 12. Quản trị Hệ thống (Admin)
    {
      path: "/admin",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Quản trị Hệ thống"
            moduleName="Quản trị"
            featureName="Bảng điều khiển Quản trị Toàn cục & Kiểm toán Hệ thống"
            frCodes={["FR-ADM-01", "FR-ADM-02", "FR-ADM-03", "FR-ADM-04", "FR-ADM-05", "FR-ADM-06"]}
            description="Dành riêng cho Quản trị viên theo dõi nhật ký kiểm toán, quản lý tài nguyên và báo cáo."
            expectedFeatures={[
              "Tổng quan tình trạng vận hành hệ thống và trạng thái dịch vụ",
              "Nhật ký kiểm toán (Audit Log) bất biến ghi nhận mọi thao tác nhạy cảm",
              "Báo cáo dung lượng lưu trữ, thống kê người dùng và kiểm soát hạn ngạch",
            ]}
          />
        </AppShell>
      ),
    },
    {
      path: "/admin/:tab",
      element: (
        <AppShell>
          <FeaturePlaceholderPage
            title="Quản trị Hệ thống"
            moduleName="Quản trị"
            featureName="Phân mục Quản trị Hệ thống"
            frCodes={["FR-ADM-01", "FR-ADM-02", "FR-ADM-03"]}
            description="Trang chức năng quản trị theo từng hạng mục nghiệp vụ."
            backPath="/admin"
            backLabel="Về Quản trị hệ thống"
          />
        </AppShell>
      ),
    },

    // 13. Phân hệ Không gian làm việc (Workspaces)
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

    // 14. Trang 404 cho mọi đường dẫn không tồn tại
    {
      path: "*",
      element: (
        <AppShell>
          <NotFoundPage />
        </AppShell>
      ),
    },
  ],
  { basename: basename || undefined }
);
