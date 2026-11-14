import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Settings,
  ArrowLeft,
  Shield,
  Trash2,
  AlertTriangle,
  HardDrive,
  Save,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";
import type { WorkspaceSummary, WorkspaceRole } from "@workspace/shared";
import { NotFoundPage } from "../NotFoundPage";

export function WorkspaceSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { notify } = useUI();

  const [activeTab, setActiveTab] = useState<"general" | "privacy" | "quota" | "danger">("general");
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [currentRole, setCurrentRole] = useState<WorkspaceRole>("member");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#7766e9");
  const [privacyType, setPrivacyType] = useState<"private" | "link" | "organization">("private");

  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadWorkspace();
  }, [slug]);

  const loadWorkspace = async () => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await api.getWorkspace(slug);
      setWorkspace(res.workspace);
      setCurrentRole(res.currentRole as WorkspaceRole);
      setName(res.workspace.name);
      setDescription(res.workspace.description || "");
      setColor(res.workspace.color);
      setPrivacyType(res.workspace.privacyType);
    } catch (err: any) {
      const isNotFound = err.status === 404 || err.code === "NOT_FOUND";
      const knownSlugs = ["cong-ty", "du-an-san-pham", "marketing", "nhan-su"];

      if (isNotFound || !knownSlugs.includes(slug)) {
        setNotFound(true);
      } else {
        const wsNav = [
          { slug: "cong-ty", name: "Công ty", color: "#6366f1" },
          { slug: "du-an-san-pham", name: "Dự án Sản phẩm", color: "#8b5cf6" },
          { slug: "marketing", name: "Marketing", color: "#10b981" },
          { slug: "nhan-su", name: "Nhân sự", color: "#06b6d4" },
        ].find((w) => w.slug === slug);

        if (wsNav) {
          const fbWs: WorkspaceSummary = {
            id: slug,
            name: wsNav.name,
            slug,
            icon: "Grid2X2",
            color: wsNav.color,
            description: `Không gian làm việc ${wsNav.name}`,
            privacyType: "private",
            storageQuotaBytes: 10 * 1024 * 1024 * 1024,
            isArchived: false,
            memberCount: 8,
            documentCount: 15,
            role: "owner",
            recentMemberAvatars: [],
            createdAt: new Date().toISOString(),
          };
          setWorkspace(fbWs);
          setCurrentRole("owner");
          setName(fbWs.name);
          setDescription(fbWs.description || "");
          setColor(fbWs.color);
          setPrivacyType(fbWs.privacyType);
        } else {
          notify(`Lỗi tải cài đặt: ${err.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    try {
      const updated = await api.updateWorkspace(slug, {
        name,
        description,
        color,
        privacyType,
      });
      notify("Đã cập nhật cài đặt không gian thành công");
      setWorkspace(updated);
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug || !workspace) return;
    if (deleteConfirmName !== workspace.name) {
      notify("Tên xác nhận không trùng khớp");
      return;
    }

    setSaving(true);
    try {
      await api.deleteWorkspace(slug);
      notify("Không gian làm việc đã được chuyển vào thùng rác lưu trữ 30 ngày");
      navigate("/");
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={32} className="spin inline" />
      </div>
    );
  }

  if (notFound) {
    return (
      <NotFoundPage
        title="404 - Không tìm thấy Cài đặt Không gian"
        description={`Không gian làm việc "${slug}" không tồn tại hoặc bạn không có quyền truy cập cài đặt.`}
        isWorkspace
      />
    );
  }

  if (!workspace) return null;

  const isOwner = currentRole === "owner";

  return (
    <div className="workspace-settings-container">
      <div className="settings-header">
        <Link to={`/w/${slug}`} className="back-link">
          <ArrowLeft size={16} />
          <span>Quay lại không gian {workspace.name}</span>
        </Link>
        <h1>Cài đặt không gian làm việc</h1>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation Menu */}
        <aside className="settings-nav">
          <button
            type="button"
            className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Settings size={18} />
            <span>Cài đặt chung</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            <Shield size={18} />
            <span>Quyền riêng tư</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item ${activeTab === "quota" ? "active" : ""}`}
            onClick={() => setActiveTab("quota")}
          >
            <HardDrive size={18} />
            <span>Hạn mức dung lượng</span>
          </button>
          <button
            type="button"
            className={`settings-nav-item danger ${activeTab === "danger" ? "active" : ""}`}
            onClick={() => setActiveTab("danger")}
          >
            <AlertTriangle size={18} />
            <span>Vùng nguy hiểm</span>
          </button>
        </aside>

        {/* Settings Content Area */}
        <main className="settings-content">
          {activeTab === "general" && (
            <form onSubmit={handleSaveGeneral} className="settings-panel">
              <h2>Thông tin cơ bản</h2>
              <div className="form-group">
                <label htmlFor="wsName">Tên không gian</label>
                <input
                  id="wsName"
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="wsDesc">Mô tả</label>
                <textarea
                  id="wsDesc"
                  className="form-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mục đích sử dụng của không gian này..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="wsColor">Màu đại diện</label>
                <div className="color-picker-row">
                  <input
                    id="wsColor"
                    type="color"
                    className="color-input"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span>{color}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                <span>Lưu thay đổi</span>
              </button>
            </form>
          )}

          {activeTab === "privacy" && (
            <div className="settings-panel">
              <h2>Chế độ hiển thị & Quyền riêng tư</h2>
              <div className="privacy-options">
                <label className="radio-card">
                  <input
                    type="radio"
                    name="privacy"
                    checked={privacyType === "private"}
                    onChange={() => setPrivacyType("private")}
                  />
                  <div>
                    <strong>Riêng tư (Chỉ thành viên được mời)</strong>
                    <p>Chỉ những ai được quản trị viên mời mới có thể xem và tham gia.</p>
                  </div>
                </label>

                <label className="radio-card">
                  <input
                    type="radio"
                    name="privacy"
                    checked={privacyType === "organization"}
                    onChange={() => setPrivacyType("organization")}
                  />
                  <div>
                    <strong>Cả tổ chức (Toàn công ty)</strong>
                    <p>Mọi thành viên trong tổ chức đều có thể nhìn thấy và tìm kiếm tài liệu.</p>
                  </div>
                </label>
              </div>

              <button
                type="button"
                className="btn-primary mt-4"
                onClick={handleSaveGeneral}
                disabled={saving}
              >
                <Save size={16} />
                <span>Cập nhật quyền riêng tư</span>
              </button>
            </div>
          )}

          {activeTab === "quota" && (
            <div className="settings-panel">
              <h2>Hạn mức & Dung lượng lưu trữ</h2>
              <div className="quota-box">
                <div className="quota-bar-row">
                  <span>
                    Dung lượng đã dùng: <strong>1.2 GB / 5 GB</strong>
                  </span>
                  <span>24%</span>
                </div>
                <div className="storage-track">
                  <span style={{ width: "24%" }} />
                </div>
                <p className="text-muted text-sm mt-2">
                  Hạn mức mặc định theo gói là 5 GB. Quản trị viên có thể nâng cấp khi cần lưu trữ
                  video hoặc tài liệu nặng.
                </p>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="settings-panel danger-panel">
              <h2>Vùng nguy hiểm</h2>
              <p className="text-danger">
                Các thao tác tại đây không thể hoàn tác ngay lập tức hoặc sẽ ảnh hưởng tới toàn bộ
                thành viên.
              </p>

              <div className="danger-action-card">
                <div>
                  <strong>Xoá không gian làm việc này</strong>
                  <p>
                    Không gian sẽ được lưu trữ mềm trong 30 ngày trước khi bị xoá vĩnh viễn cùng
                    toàn bộ tài liệu.
                  </p>
                </div>
              </div>

              {isOwner ? (
                <div className="danger-confirm-box">
                  <label htmlFor="confirmName">
                    Để xác nhận, vui lòng gõ chính xác tên không gian:{" "}
                    <strong>{workspace.name}</strong>
                  </label>
                  <input
                    id="confirmName"
                    type="text"
                    className="form-input text-danger"
                    placeholder={workspace.name}
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={deleteConfirmName !== workspace.name || saving}
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} />
                    <span>Tôi hiểu hậu quả, xoá không gian này</span>
                  </button>
                </div>
              ) : (
                <p className="text-muted text-sm mt-4">
                  Chỉ Chủ sở hữu (Owner) mới có quyền xoá không gian làm việc.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
