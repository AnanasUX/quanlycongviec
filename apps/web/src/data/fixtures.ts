/**
 * Fixture dữ liệu mẫu tạm thời cho Giai đoạn 0.
 * Sẽ được thay thế bằng API & dữ liệu thật từ DB theo từng mã FR trong SPEC.md.
 */

// FR-AUTH-07, FR-DASH-01: Thông tin người dùng hiện tại (Thay thế ở Giai đoạn 1 và 2)
export const currentUserFixture = {
  name: "Minh Anh",
  initials: "MA",
  email: "minhanh@workspace.vn",
  greetingPrefix: "Chào buổi sáng",
};

// FR-DASH-03, FR-CAL-*: Ngày hiển thị lịch làm việc hôm nay (Thay thế ở Giai đoạn 2 và 5)
export const scheduleDateFixture = {
  displayDate: "Thứ Hai, 20 tháng 1, 2025",
};

// FR-TASK-02: Tiêu đề tab công việc kèm số lượng (Thay thế ở Giai đoạn 2)
export const tasksTabsFixture = {
  upcomingTabLabel: "Sắp tới (3)",
};

// FR-DASH-05: Số liệu thống kê và biểu đồ hoạt động nhóm 7/30/90 ngày (Thay thế ở Giai đoạn 2)
export const teamActivityMetricsFixture = {
  defaultRange: "7 ngày qua",
  ranges: ["7 ngày qua", "30 ngày qua"],
  docsCreated: "124",
  docsCreatedGrowth: "+8.5%",
  editsCount: "56",
  editsGrowth: "+12%",
  sharesCount: "28",
  sharesGrowth: "+3.2%",
  chartSvg: {
    pathD: "M10 84 L70 68 L130 73 L190 43 L250 34 L310 39 L370 65 L410 56 L410 100 L10 100 Z",
    polylinePoints: "10,84 70,68 130,73 190,43 250,34 310,39 370,65 410,56",
    circles: [
      ["10", "84"],
      ["70", "68"],
      ["130", "73"],
      ["190", "43"],
      ["250", "34"],
      ["310", "39"],
      ["370", "65"],
      ["410", "56"],
    ],
  },
};

// FR-NOTI-01..03: Thông báo mẫu popup chuông (Thay thế ở Giai đoạn 2)
export const notificationItemsFixture = [
  {
    id: 1,
    title: "Tuấn đã hoàn thành một công việc",
    meta: "Hoàn thiện kế hoạch Q1 · 5 phút trước",
    type: "task",
    color: "purple",
  },
  {
    id: 2,
    title: "Bạn có 3 tin nhắn mới",
    meta: "Trong nhóm Dự án Sản phẩm",
    type: "message",
    color: "blue",
  },
];

// FR-STO-10: Dung lượng lưu trữ đang dùng (Thay thế ở Giai đoạn 3)
export const storageUsageFixture = {
  label: "Dữ liệu đang dùng",
  displayUsage: "128.4 GB / 500 GB",
};

// FR-WS-07: Số thành viên dôi dư trong avatar stack (Thay thế ở Giai đoạn 1 và 2)
export const avatarStackFixture = {
  overflowLabel: "+5",
};
