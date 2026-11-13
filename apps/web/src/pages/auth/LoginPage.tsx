import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Grid2X2, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useUI();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password, rememberMe });
      if (res.requires2FA && res.tempToken) {
        notify("Vui lòng nhập mã xác thực 2 lớp (2FA)");
        navigate("/2fa", { state: { tempToken: res.tempToken, from } });
        return;
      }

      notify(`Chào mừng trở lại, ${res.user?.fullName || "bạn"}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    notify("Tính năng đăng nhập Google đang chuyển hướng...");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <Grid2X2 size={24} />
          </span>
          <h1>Đăng nhập Workspace</h1>
          <p>Nền tảng làm việc số hợp nhất cho doanh nghiệp</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Địa chỉ email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ten@congty.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Mật khẩu</label>
              <Link to="/forgot-password" className="auth-link text-sm">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-check">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
            </label>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Đăng nhập"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="auth-btn-google">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.33C2.43 15.98 5.48 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.17.28-1.71V4.96H.95A9.01 9.01 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.33z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0 5.48 0 2.43 2.02.95 4.96l3.01 2.33c.71-2.13 2.7-3.71 5.04-3.71z"
            />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <div className="auth-footer">
          <span>Chưa có tài khoản? </span>
          <Link to="/register" className="auth-link font-medium">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
