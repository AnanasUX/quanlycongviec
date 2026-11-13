import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  vi: {
    translation: {
      app_name: "Workspace",
      welcome_morning: "Chào buổi sáng",
      welcome_subtitle: "Cùng làm việc, chia sẻ và hoàn thành mục tiêu với đội ngũ.",
      search_placeholder: "Tìm kiếm tài liệu, tệp, cuộc trò chuyện...",
      nav_overview: "Tổng quan",
      nav_docs: "Soạn thảo",
      nav_team: "Đội ngũ",
      nav_slides: "Trình chiếu",
      nav_calendar: "Lịch làm việc",
      nav_messages: "Tin nhắn",
      nav_storage: "Kho lưu trữ",
      workspace_heading: "Không gian làm việc",
      create_workspace: "Tạo không gian mới",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "vi",
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
