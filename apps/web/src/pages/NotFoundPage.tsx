import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  isWorkspace?: boolean;
}

export function NotFoundPage({
  title = "404 - Không tìm thấy trang",
  description = "Đường dẫn bạn yêu cầu không tồn tại, đã bị di chuyển hoặc bạn không có quyền truy cập.",
  isWorkspace: _isWorkspace = false,
}: NotFoundPageProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          backgroundColor: "var(--card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "20px",
          padding: "48px 32px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444",
            marginBottom: "24px",
          }}
        >
          <FileQuestion size={36} />
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            margin: "0 0 12px 0",
            color: "var(--text, #0f172a)",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--muted, #64748b)",
            lineHeight: 1.6,
            margin: "0 0 28px 0",
          }}
        >
          {description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              backgroundColor: "var(--primary, #7c3aed)",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <Home size={16} />
            <span>Về Tổng quan</span>
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "transparent",
              border: "1px solid var(--border, #cbd5e1)",
              color: "var(--text, #334155)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  );
}
