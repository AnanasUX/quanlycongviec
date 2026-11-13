import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Grid2X2, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { notify } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Mã liên kết không hợp lệ hoặc bị thiếu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.resetPassword({ token, newPassword });
      setSuccess(true);
      notify("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Liên kết đặt lại mật khẩu đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <Grid2X2 size={24} />
          </span>
          <h1>Đặt lại mật khẩu mới</h1>
          <p>Tạo mật khẩu an toàn với tối thiểu 10 ký tự</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="auth-success-banner">
            <CheckCircle2 size={32} color="#10b981" />
            <h3>Đặt lại mật khẩu thành công!</h3>
            <p>
              Toàn bộ các phiên đăng nhập cũ đã được thu hồi an toàn. Đang chuyển hướng về trang
              Đăng nhập...
            </p>
            <Link to="/login" className="auth-link font-medium">
              Bấm vào đây nếu không tự chuyển hướng
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới (≥ 10 ký tự, đủ hoa/thường/số)</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="newPassword"
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : "Lưu mật khẩu mới"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
