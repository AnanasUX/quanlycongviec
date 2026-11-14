import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Construction, Layers, Sparkles } from "lucide-react";

interface FeaturePlaceholderPageProps {
  title: string;
  moduleName: string;
  featureName: string;
  frCodes: string[];
  description: string;
  expectedFeatures?: string[];
  requiresAuth?: boolean;
  backPath?: string;
  backLabel?: string;
}

export function FeaturePlaceholderPage({
  title,
  moduleName,
  featureName,
  frCodes,
  description,
  expectedFeatures = [],
  requiresAuth = true,
  backPath = "/",
  backLabel = "Về Tổng quan",
}: FeaturePlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="content" style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px" }}>
      {/* Top navigation / Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "var(--muted, #64748b)",
            fontSize: "14px",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang trước</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {requiresAuth && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: "9999px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                color: "#2563eb",
              }}
            >
              Yêu cầu xác thực
            </span>
          )}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "9999px",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              color: "var(--primary, #7c3aed)",
            }}
          >
            <Clock size={13} />
            Đang phát triển
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: "var(--card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "rgba(124, 58, 237, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary, #7c3aed)",
              flexShrink: 0,
            }}
          >
            <Construction size={28} />
          </div>

          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--primary, #7c3aed)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              {moduleName}
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                margin: "0 0 8px 0",
                color: "var(--text, #0f172a)",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "var(--muted, #64748b)",
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Feature Overview Section */}
        <div
          style={{
            backgroundColor: "var(--bg, #f8fafc)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            border: "1px solid var(--border, #e2e8f0)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles size={16} color="var(--primary, #7c3aed)" />
            <strong style={{ fontSize: "14px", color: "var(--text, #0f172a)" }}>
              Tính năng: {featureName}
            </strong>
          </div>

          {expectedFeatures.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--muted, #64748b)",
                  marginBottom: "8px",
                }}
              >
                Các chức năng dự kiến:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "14px",
                  color: "var(--text, #334155)",
                  lineHeight: 1.8,
                }}
              >
                {expectedFeatures.map((feat) => (
                  <li key={feat}>{feat}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FR Codes badges */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Layers size={14} color="var(--muted, #64748b)" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted, #64748b)" }}>
              MÃ CHỨC NĂNG HỆ THỐNG
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {frCodes.map((code) => (
              <span
                key={code}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "monospace",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg, #f1f5f9)",
                  border: "1px solid var(--border, #e2e8f0)",
                  color: "var(--text, #334155)",
                }}
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderTop: "1px solid var(--border, #e2e8f0)",
            paddingTop: "20px",
          }}
        >
          <Link
            to={backPath}
            className="btn-primary"
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
            {backLabel}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
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
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
