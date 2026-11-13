import React, { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Grid2X2, ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function TwoFactorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useUI();

  const tempToken = (location.state as any)?.tempToken;
  const from = (location.state as any)?.from || "/";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Tự động chuyển focus giữa 6 ô số (SPEC 7.1)
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Xử lý dán mã 6 chữ số
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = pasted[i] || "";
        }
        setDigits(nextDigits);
        const nextFocus = Math.min(pasted.length, 5);
        inputRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const char = value.replace(/\D/g, "");
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = useBackup ? backupCode.trim() : digits.join("");
    if (!useBackup && code.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã xác thực");
      return;
    }
    if (useBackup && !code) {
      setError("Vui lòng nhập mã dự phòng");
      return;
    }

    setLoading(true);
    try {
      const res = await api.verify2FA(tempToken || "mock-temp", code);
      notify(`Xác thực thành công. Xin chào ${res.user?.fullName || "bạn"}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Mã xác thực không chính xác hoặc đã hết hạn.");
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
          <h1>Xác thực hai lớp (2FA)</h1>
          <p>Bảo vệ tài khoản an toàn với mã xác minh từ ứng dụng Authenticator</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!useBackup ? (
            <div className="form-group">
              <label>Nhập 6 số từ Google Authenticator hoặc ứng dụng 2FA</label>
              <div className="two-factor-grid">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-digit-input"
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="backupCode">Nhập mã dự phòng 8 ký tự</label>
              <input
                id="backupCode"
                type="text"
                className="form-input text-center tracking-widest font-mono uppercase"
                placeholder="VD: 4A8F9C2D"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
              />
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => {
                setUseBackup(!useBackup);
                setError(null);
              }}
            >
              {useBackup
                ? "Dùng mã từ ứng dụng Authenticator"
                : "Không có điện thoại? Dùng mã dự phòng"}
            </button>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Xác thực & Tiếp tục"}
            <ShieldCheck size={18} />
          </button>
        </form>

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
