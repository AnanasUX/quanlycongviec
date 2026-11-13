import {
  CalendarDays,
  Cloud,
  FileText,
  Folder,
  Grid2X2,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { NavItem, Task } from "../types";

export const mainNavigation: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard, path: "/" },
  { label: "Soạn thảo", icon: FileText, path: "/docs" },
  { label: "Đội ngũ", icon: Users, path: "/team" },
  { label: "Trình chiếu", icon: Grid2X2, path: "/slides" },
  { label: "Lịch làm việc", icon: CalendarDays, path: "/calendar" },
  { label: "Tin nhắn", icon: MessageSquare, path: "/messages", badge: "3" },
  { label: "Kho lưu trữ", icon: Cloud, path: "/storage" },
];

export const workspaceNavigation: NavItem[] = [
  { label: "Công ty", icon: Folder, path: "/w/cong-ty" },
  { label: "Dự án Sản phẩm", icon: Folder, path: "/w/du-an-san-pham" },
  { label: "Marketing", icon: Folder, path: "/w/marketing" },
  { label: "Nhân sự", icon: Folder, path: "/w/nhan-su" },
];

export const quickActions = [
  { label: "Soạn thảo", helper: "Tạo tài liệu", icon: FileText, color: "blue" },
  { label: "Đội ngũ", helper: "Quản lý nhân sự", icon: Users, color: "green" },
  { label: "Trình chiếu", helper: "Tạo bài thuyết trình", icon: Grid2X2, color: "orange" },
  { label: "Lịch làm việc", helper: "Lên lịch & họp", icon: CalendarDays, color: "purple" },
  { label: "Tin nhắn", helper: "Trao đổi nhóm", icon: MessageSquare, color: "sky" },
  { label: "Kho lưu trữ", helper: "Lưu tài liệu", icon: Cloud, color: "cyan" },
];

export const schedule = [
  { time: "09:00 - 10:00", title: "Họp triển khai Q1", meta: "Phòng họp A", color: "#6c5ce7" },
  {
    time: "11:00 - 11:30",
    title: "Trao đổi với nhóm Marketing",
    meta: "Trực tuyến",
    color: "#36b37e",
  },
  {
    time: "14:00 - 15:00",
    title: "Review tài liệu sản phẩm",
    meta: "Phòng họp B",
    color: "#f59e0b",
  },
];

export const recentFiles = [
  {
    title: "Kế hoạch sản phẩm Q1 2025",
    meta: "Được sửa bởi Hải Nguyễn · 10 phút trước",
    color: "blue",
  },
  {
    title: "Báo cáo hiệu quả marketing",
    meta: "Được sửa bởi Minh Anh · 1 giờ trước",
    color: "green",
  },
  { title: "Slide họp chiến lược", meta: "Được sửa bởi Tuấn Anh · 3 giờ trước", color: "orange" },
  { title: "Quy trình vận hành nội bộ", meta: "Được sửa bởi Hà Linh · Hôm qua", color: "blue" },
];

export const workspaces = [
  {
    name: "Dự án Sản phẩm",
    meta: "12 thành viên · 18 tài liệu",
    icon: Target,
    color: "purple",
    members: ["MA", "TN", "HL", "NH"],
  },
  {
    name: "Marketing",
    meta: "8 thành viên · 23 tài liệu",
    icon: Sparkles,
    color: "green",
    members: ["TA", "LN", "MA", "HN"],
  },
  {
    name: "Nhân sự",
    meta: "6 thành viên · 14 tài liệu",
    icon: Users,
    color: "cyan",
    members: ["HL", "NH", "AT", "MA"],
  },
];

export const initialTasks: Task[] = [
  { id: 1, title: "Hoàn thiện báo cáo tháng", due: "Hôm nay", priority: "high", completed: false },
  { id: 2, title: "Cập nhật kế hoạch Q1", due: "Ngày mai", completed: false },
  { id: 3, title: "Chuẩn bị slide họp nhóm", due: "27 thg 1", completed: false },
];

export const avatarColors = ["#7567e8", "#f7a65a", "#35b78c", "#4c9bea"];
