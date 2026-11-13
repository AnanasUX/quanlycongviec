import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Users, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { notify } = useUI();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.acceptInvitation(token);
      notify(`Đã tham gia ${res.workspace.name}!`);
      navigate(`/w/${res.workspace.slug}`, { replace: true });
    } catch (err: any) {
      setError(err.message || "Lời mời không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <Users size={28} />
          </span>
          <h1>Lời mời tham gia Không gian</h1>
          <p>Bạn được mời cộng tác và làm việc trên nền tảng Workspace</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="invite-box">
          <div className="invite-meta">
            <span className="meta-label">Mã lời mời:</span>
            <code className="meta-code">{token}</code>
          </div>
          <p className="invite-desc">
            Nhấp vào nút bên dưới để chấp nhận lời mời và truy cập ngay vào dữ liệu dự án của nhóm.
          </p>

          <button
            type="button"
            className="auth-btn-primary"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="spin" /> : "Chấp nhận lời mời & Bắt đầu"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

        <div className="auth-footer">
          <Link to="/" className="auth-link">
            Quay về trang Tổng quan
          </Link>
        </div>
      </div>
    </div>
  );
}
