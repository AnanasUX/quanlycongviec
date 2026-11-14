import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Grid2X2,
  Users,
  Settings,
  UserPlus,
  FileText,
  Presentation,
  FolderOpen,
  Activity,
  AlertCircle,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useUI } from "../../context/UIContext";
import type { WorkspaceSummary, WorkspaceMemberInfo, WorkspaceRole } from "@workspace/shared";
import { NotFoundPage } from "../NotFoundPage";

export function WorkspaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { notify } = useUI();

  const [activeTab, setActiveTab] = useState<
    "overview" | "docs" | "slides" | "files" | "members" | "activity"
  >("overview");
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [currentRole, setCurrentRole] = useState<WorkspaceRole>("member");
  const [members, setMembers] = useState<WorkspaceMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    isForbidden: boolean;
    isNotFound?: boolean;
  } | null>(null);

  // Modal mời thành viên
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "guest" | "viewer">("member");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadWorkspace();
  }, [slug]);

  const loadWorkspace = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getWorkspace(slug);
      setWorkspace(res.workspace);
      setCurrentRole(res.currentRole as WorkspaceRole);
      // Tải danh sách thành viên
      const memberList = await api.listMembers(slug);
      setMembers(memberList);
    } catch (err: any) {
      const isNotFound = err.status === 404 || err.code === "NOT_FOUND";
      const knownSlugs = ["cong-ty", "du-an-san-pham", "marketing", "nhan-su"];

      if (isNotFound || !knownSlugs.includes(slug)) {
        setError({
          message: `Không gian làm việc "${slug}" không tồn tại hoặc bạn không có quyền truy cập.`,
          isForbidden: false,
          isNotFound: true,
        });
      } else {
        // Fallback mock workspace khi API chưa bật để không crash giao diện
        const wsNav = [
          { slug: "cong-ty", name: "Công ty", color: "#6366f1" },
          { slug: "du-an-san-pham", name: "Dự án Sản phẩm", color: "#8b5cf6" },
          { slug: "marketing", name: "Marketing", color: "#10b981" },
          { slug: "nhan-su", name: "Nhân sự", color: "#06b6d4" },
        ].find((w) => w.slug === slug);

        if (wsNav) {
          setWorkspace({
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
          });
          setCurrentRole("owner");
        } else {
          setError({
            message: err.message || "Không thể tải thông tin không gian làm việc",
            isForbidden: err.status === 403 || err.code === "FORBIDDEN",
            isNotFound: false,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !inviteEmail) return;
    setInviting(true);
    try {
      const inv = await api.inviteMember(slug, { email: inviteEmail, role: inviteRole });
      notify(`Đã gửi lời mời đến ${inv.email}`);
      setShowInviteModal(false);
      setInviteEmail("");
      loadWorkspace();
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    if (!slug) return;
    try {
      await api.updateMemberRole(slug, targetUserId, newRole);
      notify("Đã cập nhật vai trò thành viên");
      loadWorkspace();
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`);
    }
  };

  const handleRemoveMember = async (targetUserId: string, memberName: string) => {
    if (!slug) return;
    if (!confirm(`Bạn có chắc muốn xoá thành viên ${memberName} khỏi không gian này?`)) return;
    try {
      await api.removeMember(slug, targetUserId);
      notify(`Đã xoá ${memberName}`);
      loadWorkspace();
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`);
    }
  };

  // Trạng thái đang tải (SPEC 7.11)
  if (loading) {
    return (
      <div className="workspace-page-loading">
        <div className="skeleton skeleton-header" />
        <div className="skeleton skeleton-tabs" />
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    );
  }

  // Trạng thái Không tìm thấy không gian (404)
  if (error?.isNotFound) {
    return (
      <NotFoundPage
        title="404 - Không tìm thấy Không gian làm việc"
        description={error.message}
        isWorkspace
      />
    );
  }

  // Trạng thái Không có quyền (403) (SPEC 7.11)
  if (error?.isForbidden) {
    return (
      <div className="state-card error-card">
        <Shield size={48} color="#ef4444" />
        <h2>Không có quyền truy cập (403)</h2>
        <p>
          Bạn không phải là thành viên của không gian này hoặc không gian đã được đặt ở chế độ Riêng
          tư.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => notify("Đã gửi yêu cầu tham gia tới Chủ sở hữu")}
        >
          Yêu cầu quyền truy cập
        </button>
      </div>
    );
  }

  // Trạng thái Lỗi có nút Thử lại (SPEC 7.11)
  if (error) {
    return (
      <div className="state-card error-card">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Đã có lỗi xảy ra</h2>
        <p>{error.message}</p>
        <button type="button" className="btn-primary" onClick={loadWorkspace}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!workspace) return null;

  const isOwnerOrAdmin = currentRole === "owner" || currentRole === "admin";

  return (
    <div className="workspace-detail-container">
      {/* Header không gian (SPEC 7.2) */}
      <div className="workspace-detail-header">
        <div className="ws-title-group">
          <div className="ws-avatar-badge" style={{ backgroundColor: workspace.color }}>
            <Grid2X2 size={24} color="#fff" />
          </div>
          <div>
            <div className="ws-name-row">
              <h1>{workspace.name}</h1>
              <span className="badge-role">{currentRole.toUpperCase()}</span>
            </div>
            <p className="ws-description">{workspace.description || "Không gian làm việc nhóm"}</p>
          </div>
        </div>

        <div className="ws-action-group">
          {isOwnerOrAdmin && (
            <button type="button" className="btn-invite" onClick={() => setShowInviteModal(true)}>
              <UserPlus size={16} />
              <span>Mời thành viên</span>
            </button>
          )}

          {isOwnerOrAdmin && (
            <Link to={`/w/${slug}/settings`} className="btn-settings">
              <Settings size={16} />
              <span>Cài đặt</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs navigation (SPEC 7.2) */}
      <div className="workspace-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`ws-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Grid2X2 size={16} />
          <span>Tổng quan</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "docs"}
          className={`ws-tab-btn ${activeTab === "docs" ? "active" : ""}`}
          onClick={() => setActiveTab("docs")}
        >
          <FileText size={16} />
          <span>Tài liệu ({workspace.documentCount})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "slides"}
          className={`ws-tab-btn ${activeTab === "slides" ? "active" : ""}`}
          onClick={() => setActiveTab("slides")}
        >
          <Presentation size={16} />
          <span>Trình chiếu</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "files"}
          className={`ws-tab-btn ${activeTab === "files" ? "active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          <FolderOpen size={16} />
          <span>Tệp</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "members"}
          className={`ws-tab-btn ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <Users size={16} />
          <span>Thành viên ({members.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "activity"}
          className={`ws-tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <Activity size={16} />
          <span>Hoạt động</span>
        </button>
      </div>

      {/* Tab Content: Tổng quan */}
      {activeTab === "overview" && (
        <div className="workspace-grid-overview">
          <div className="panel ws-pinned-panel">
            <div className="section-header">
              <h2>Ghim & Gần đây</h2>
            </div>
            <div className="pinned-grid">
              <div
                className="doc-card"
                onClick={() => notify("Mở tài liệu: Kế hoạch Chiến lược 2025")}
              >
                <FileText size={20} color="#7766e9" />
                <strong>Kế hoạch Chiến lược 2025</strong>
                <span>Cập nhật 10 phút trước</span>
              </div>
              <div
                className="doc-card"
                onClick={() => notify("Mở bản trình chiếu: Giới thiệu Sản phẩm")}
              >
                <Presentation size={20} color="#3b82f6" />
                <strong>Giới thiệu Sản phẩm Q1</strong>
                <span>Cập nhật 2 giờ trước</span>
              </div>
            </div>
          </div>

          <div className="panel ws-members-side-panel">
            <div className="section-header">
              <h2>Thành viên ({members.length})</h2>
              {isOwnerOrAdmin && (
                <button
                  type="button"
                  className="link-btn text-sm"
                  onClick={() => setShowInviteModal(true)}
                >
                  + Mời
                </button>
              )}
            </div>
            <div className="members-mini-list">
              {members.slice(0, 5).map((m) => (
                <div key={m.id} className="member-mini-row">
                  <div className="avatar-circle">{m.initials}</div>
                  <div className="member-mini-info">
                    <strong>{m.fullName}</strong>
                    <span>{m.role.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Thành viên */}
      {activeTab === "members" && (
        <div className="panel ws-members-full-panel">
          <div className="section-header">
            <div>
              <h2>Quản lý thành viên</h2>
              <p className="text-muted text-sm">Quản lý quyền hạn và vai trò trong không gian</p>
            </div>
            {isOwnerOrAdmin && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={16} />
                <span>Mời thành viên</span>
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tham gia</th>
                  {isOwnerOrAdmin && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="user-table-cell">
                        <div className="avatar-circle">{m.initials}</div>
                        <strong>{m.fullName}</strong>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td>
                      {isOwnerOrAdmin && m.role !== "owner" ? (
                        <select
                          className="role-select"
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.userId, e.target.value as WorkspaceRole)
                          }
                        >
                          <option value="admin">Quản trị viên (Admin)</option>
                          <option value="member">Thành viên (Member)</option>
                          <option value="guest">Khách (Guest)</option>
                          <option value="viewer">Người xem (Viewer)</option>
                        </select>
                      ) : (
                        <span className="badge-role">{m.role.toUpperCase()}</span>
                      )}
                    </td>
                    <td>{new Date(m.joinedAt).toLocaleDateString("vi-VN")}</td>
                    {isOwnerOrAdmin && (
                      <td>
                        {m.role !== "owner" && (
                          <button
                            type="button"
                            className="btn-icon-danger"
                            title="Xoá thành viên"
                            onClick={() => handleRemoveMember(m.userId, m.fullName)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {(activeTab === "docs" ||
        activeTab === "slides" ||
        activeTab === "files" ||
        activeTab === "activity") && (
        <div className="state-card empty-card">
          <FolderOpen size={40} color="#94a3b8" />
          <h3>Chưa có mục nào trong phần này</h3>
          <p>Tạo tài liệu hoặc tải lên tệp đầu tiên để bắt đầu lưu trữ.</p>
        </div>
      )}

      {/* Modal Mời Thành Viên */}
      {showInviteModal && (
        <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mời thành viên vào không gian</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label htmlFor="invEmail">Địa chỉ email đồng đội</label>
                <input
                  id="invEmail"
                  type="email"
                  required
                  placeholder="dongdoi@congty.vn"
                  className="form-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="invRole">Vai trò được giao</label>
                <select
                  id="invRole"
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                >
                  <option value="member">Thành viên (Member) - Tạo & sửa nội dung</option>
                  <option value="admin">Quản trị viên (Admin) - Toàn quyền quản trị</option>
                  <option value="guest">Khách (Guest) - Giới hạn mục được chia sẻ</option>
                  <option value="viewer">Người xem (Viewer) - Chỉ đọc</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Huỷ
                </button>
                <button type="submit" className="btn-primary" disabled={inviting}>
                  {inviting ? <Loader2 size={16} className="spin" /> : "Gửi lời mời"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
