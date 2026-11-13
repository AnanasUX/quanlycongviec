import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid2X2, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword({ email });
      setSuccess(true);
      setCountdown(60); // 60 giây đếm ngược theo SPEC 7.1
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } catch (err: any) {
      setError(err.message || "Không thể gửi email đặt lại mật khẩu");
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
          <h1>Quên mật khẩu?</h1>
          <p>Nhập email tài khoản của bạn để nhận liên kết khôi phục</p>
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
            <h3>Đã gửi liên kết khôi phục</h3>
            <p>
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu
              đã được gửi đến hộp thư của bạn.
            </p>
            {devToken && (
              <div className="auth-dev-box">
                <span>[Môi trường dev] Token thử nghiệm:</span>
                <Link to={`/reset-password?token=${devToken}`} className="auth-link">
                  Bấm vào đây để đặt lại mật khẩu ngay
                </Link>
              </div>
            )}
            <div className="countdown-text">
              {countdown > 0 ? (
                <span>Có thể gửi lại sau {countdown} giây</span>
              ) : (
                <button type="button" onClick={handleSubmit} className="auth-link-btn">
                  Gửi lại email khôi phục
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email tài khoản</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ten@congty.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : "Gửi liên kết khôi phục"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link inline-flex items-center gap-1">
            <ArrowLeft size={16} />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
