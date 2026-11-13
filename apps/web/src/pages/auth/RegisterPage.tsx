import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid2X2, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { notify } = useUI();

  // Đánh giá độ mạnh mật khẩu theo SPEC FR-AUTH-01 (>= 10 ký tự, hoa, thường, số)
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 10) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 1)
      return {
        score: 1,
        label: "Mật khẩu yếu (cần ≥ 10 ký tự, đủ hoa/thường/số)",
        color: "#ef4444",
      };
    if (score <= 3) return { score: 2, label: "Mật khẩu trung bình", color: "#f59e0b" };
    return { score: 3, label: "Mật khẩu rất mạnh", color: "#10b981" };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.register({ fullName, email, password });
      notify(`Đăng ký thành công! Chào mừng ${res.user.fullName}`);
      navigate("/onboarding", { replace: true });
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
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
          <h1>Tạo tài khoản mới</h1>
          <p>Bắt đầu hợp tác và nâng cao năng suất cùng đội ngũ</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="fullName"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email công việc</label>
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

          <div className="form-group">
            <label htmlFor="password">Mật khẩu (tối thiểu 10 ký tự)</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                required
                placeholder="Mật khẩu tối thiểu 10 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {password.length > 0 && (
              <div className="password-strength-meter">
                <div className="strength-bars">
                  <span
                    className="strength-bar"
                    style={{
                      backgroundColor:
                        passwordStrength.score >= 1 ? passwordStrength.color : "#e2e8f0",
                    }}
                  />
                  <span
                    className="strength-bar"
                    style={{
                      backgroundColor:
                        passwordStrength.score >= 2 ? passwordStrength.color : "#e2e8f0",
                    }}
                  />
                  <span
                    className="strength-bar"
                    style={{
                      backgroundColor:
                        passwordStrength.score >= 3 ? passwordStrength.color : "#e2e8f0",
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-row-check">
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                Tôi đồng ý với{" "}
                <a href="#" className="auth-link">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="auth-link">
                  Chính sách bảo mật
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading || !agreed || passwordStrength.score < 2}
          >
            {loading ? <Loader2 size={18} className="spin" /> : "Tạo tài khoản"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="auth-link font-medium">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
