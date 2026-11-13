/**
 * Ma trận phân quyền theo SPEC 6.0
 * 5 vai trò: Owner, Admin, Member, Guest, Viewer
 */

export type WorkspaceRole = "owner" | "admin" | "member" | "guest" | "viewer";

export type WorkspaceAction =
  | "workspace:delete"
  | "workspace:transfer_ownership"
  | "workspace:invite_member"
  | "workspace:remove_member"
  | "workspace:update_role"
  | "workspace:update_settings"
  | "workspace:manage_quota"
  | "workspace:manage_integrations"
  | "workspace:archive"
  | "workspace:export_data"
  | "workspace:view_audit_logs"
  | "content:create"
  | "content:edit_own"
  | "content:delete_own"
  | "content:edit_shared"
  | "content:view_shared";

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 50,
  admin: 40,
  member: 30,
  guest: 20,
  viewer: 10,
};

/**
 * Bảng ánh xạ quyền theo vai trò (SPEC 6.0)
 */
export const ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspaceAction[]> = {
  owner: [
    "workspace:delete",
    "workspace:transfer_ownership",
    "workspace:invite_member",
    "workspace:remove_member",
    "workspace:update_role",
    "workspace:update_settings",
    "workspace:manage_quota",
    "workspace:manage_integrations",
    "workspace:archive",
    "workspace:export_data",
    "workspace:view_audit_logs",
    "content:create",
    "content:edit_own",
    "content:delete_own",
    "content:edit_shared",
    "content:view_shared",
  ],
  admin: [
    "workspace:invite_member",
    "workspace:remove_member",
    "workspace:update_role",
    "workspace:update_settings",
    "workspace:manage_quota",
    "workspace:manage_integrations",
    "workspace:archive",
    "workspace:export_data",
    "workspace:view_audit_logs",
    "content:create",
    "content:edit_own",
    "content:delete_own",
    "content:edit_shared",
    "content:view_shared",
  ],
  member: [
    "content:create",
    "content:edit_own",
    "content:delete_own",
    "content:edit_shared",
    "content:view_shared",
  ],
  guest: [
    // Khách có quyền tạo/sửa giới hạn trong các mục được chia sẻ
    "content:edit_own",
    "content:delete_own",
    "content:edit_shared",
    "content:view_shared",
  ],
  viewer: ["content:view_shared"],
};

/**
 * Kiểm tra vai trò có quyền thực hiện hành động không
 */
export function hasPermission(role: WorkspaceRole, action: WorkspaceAction): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes(action);
}

export interface UserContext {
  id: string;
  email?: string;
  role?: WorkspaceRole;
}

export interface ResourceContext {
  id?: string;
  workspaceId?: string;
  createdBy?: string;
}

/**
 * Policy engine trung tâm: policy.can(user, action, resource)
 */
export const policy = {
  can(
    user: UserContext | null | undefined,
    action: WorkspaceAction,
    resource?: ResourceContext
  ): boolean {
    if (!user) return false;
    if (!user.role) return false;

    // Kiểm tra quyền theo vai trò trong workspace
    const roleHasPermission = hasPermission(user.role, action);
    if (!roleHasPermission) return false;

    // Kiểm tra theo tài nguyên (nếu có)
    if (action === "content:edit_own" || action === "content:delete_own") {
      if (resource?.createdBy && resource.createdBy !== user.id) {
        // Chỉ admin hoặc owner mới được sửa/xoá nội dung của người khác nếu không phải edit_shared
        return user.role === "owner" || user.role === "admin";
      }
    }

    return true;
  },
};
