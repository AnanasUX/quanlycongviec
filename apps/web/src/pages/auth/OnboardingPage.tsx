import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [workspaceName, setWorkspaceName] = useState("Dự án Khởi đầu");
  const [inviteEmails, setInviteEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { notify } = useUI();

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      try {
        await api.createWorkspace({
          name: workspaceName,
          description: "Không gian làm việc đầu tiên của tôi",
        });
        setStep(3);
      } catch {
        setStep(3); // Bỏ qua nếu lỗi
      } finally {
        setLoading(false);
      }
    } else {
      notify("Thiết lập hoàn tất! Bắt đầu trải nghiệm Workspace.");
      navigate("/");
    }
  };

  const handleSkip = () => {
    notify("Đã bỏ qua thiết lập ban đầu");
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        {/* Step Indicator */}
        <div className="onboarding-steps">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span className="step-circle">{step > 1 ? <Check size={14} /> : "1"}</span>
            <span className="step-text">Hồ sơ</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span className="step-circle">{step > 2 ? <Check size={14} /> : "2"}</span>
            <span className="step-text">Không gian</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span className="step-circle">3</span>
            <span className="step-text">Đồng đội</span>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2>Hoàn thiện hồ sơ cá nhân</h2>
            <p>Xác nhận múi giờ và ngôn ngữ hiển thị phù hợp với bạn</p>
            <div className="form-group">
              <label htmlFor="tz">Múi giờ</label>
              <select
                id="tz"
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Ho_Chi_Minh">Hà Nội / TP.HCM (GMT+7)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                <option value="Asia/Singapore">Singapore (GMT+8)</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Tạo không gian làm việc đầu tiên</h2>
            <p>Nơi lưu trữ tài liệu, kế hoạch và cộng tác cùng nhóm</p>
            <div className="form-group">
              <label htmlFor="wsName">Tên không gian</label>
              <input
                id="wsName"
                type="text"
                className="form-input"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="VD: Dự án Sản phẩm 2025"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>Mời đồng đội cùng tham gia</h2>
            <p>Nhập email các thành viên bạn muốn cộng tác (cách nhau bằng dấu phẩy)</p>
            <div className="form-group">
              <label htmlFor="emails">Email đồng đội</label>
              <textarea
                id="emails"
                className="form-textarea"
                rows={3}
                placeholder="dongdoi1@congty.vn, dongdoi2@congty.vn"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          <button type="button" className="auth-btn-secondary" onClick={handleSkip}>
            Bỏ qua bước này
          </button>
          <button
            type="button"
            className="auth-btn-primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : step === 3 ? (
              "Hoàn tất"
            ) : (
              "Tiếp tục"
            )}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
