import crypto from "node:crypto";
import {
  policy,
  type WorkspaceRole,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
  type InviteMemberInput,
  type WorkspaceSummary,
  type WorkspaceMemberInfo,
  type WorkspaceInvitationInfo,
} from "@workspace/shared";
import { authService } from "./authService.js";

export interface WorkspaceEntity {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  privacyType: "private" | "link" | "organization";
  storageQuotaBytes: number;
  isArchived: boolean;
  deletedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMemberEntity {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  sortOrder: number;
  joinedAt: Date;
}

export interface InvitationEntity {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
}

export class WorkspaceService {
  private workspaces = new Map<string, WorkspaceEntity>();
  private members = new Map<string, WorkspaceMemberEntity>();
  private invitations = new Map<string, InvitationEntity>();

  constructor() {
    this.seedDefaultWorkspaces();
  }

  private seedDefaultWorkspaces() {
    const ownerId = "usr-owner-1"; // Minh Anh

    const wsDefs = [
      {
        id: "ws-cong-ty",
        slug: "cong-ty",
        name: "Công ty Workspace",
        icon: "Building2",
        color: "#7766e9",
        description: "Không gian làm việc chung toàn tổ chức",
        privacyType: "organization" as const,
      },
      {
        id: "ws-du-an-san-pham",
        slug: "du-an-san-pham",
        name: "Dự án Sản phẩm",
        icon: "FolderGit2",
        color: "#3b82f6",
        description: "Không gian phát triển sản phẩm công nghệ",
        privacyType: "private" as const,
      },
      {
        id: "ws-marketing",
        slug: "marketing",
        name: "Marketing & Truyền thông",
        icon: "Megaphone",
        color: "#ec4899",
        description: "Chiến dịch marketing và thương hiệu",
        privacyType: "private" as const,
      },
      {
        id: "ws-nhan-su",
        slug: "nhan-su",
        name: "Nhân sự & Văn hoá",
        icon: "Users",
        color: "#10b981",
        description: "Quản trị nhân sự, tuyển dụng và văn hoá doanh nghiệp",
        privacyType: "private" as const,
      },
    ];

    for (const def of wsDefs) {
      const ws: WorkspaceEntity = {
        id: def.id,
        slug: def.slug,
        name: def.name,
        icon: def.icon,
        color: def.color,
        description: def.description,
        privacyType: def.privacyType,
        storageQuotaBytes: 5368709120, // 5 GB
        isArchived: false,
        deletedAt: null,
        createdBy: ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.workspaces.set(ws.id, ws);

      // Thêm Owner
      this.addMemberInternal(ws.id, ownerId, "owner");
      // Thêm 2 Admin
      this.addMemberInternal(ws.id, "usr-admin-1", "admin");
      this.addMemberInternal(ws.id, "usr-admin-2", "admin");
      // Thêm 5 Members
      this.addMemberInternal(ws.id, "usr-member-1", "member");
      this.addMemberInternal(ws.id, "usr-member-2", "member");
      this.addMemberInternal(ws.id, "usr-member-3", "member");
      this.addMemberInternal(ws.id, "usr-member-4", "member");
      this.addMemberInternal(ws.id, "usr-member-5", "member");
      // Thêm 2 Guests
      this.addMemberInternal(ws.id, "usr-guest-1", "guest");
      this.addMemberInternal(ws.id, "usr-guest-2", "guest");
      // Thêm 2 Viewers
      this.addMemberInternal(ws.id, "usr-viewer-1", "viewer");
      this.addMemberInternal(ws.id, "usr-viewer-2", "viewer");
    }
  }

  private addMemberInternal(workspaceId: string, userId: string, role: WorkspaceRole) {
    const id = `${workspaceId}_${userId}`;
    this.members.set(id, {
      id,
      workspaceId,
      userId,
      role,
      sortOrder: 0,
      joinedAt: new Date(),
    });
  }

  private slugify(text: string): string {
    return (
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "workspace"
    );
  }

  public getMemberRole(workspaceId: string, userId: string): WorkspaceRole | null {
    const m = this.members.get(`${workspaceId}_${userId}`);
    return m ? m.role : null;
  }

  // FR-WS-02 & FR-WS-07: Danh sách không gian của người dùng kèm số liệu thẻ
  public async listWorkspacesForUser(userId: string): Promise<WorkspaceSummary[]> {
    const userMemberships = Array.from(this.members.values()).filter((m) => m.userId === userId);

    const summaries: WorkspaceSummary[] = [];

    for (const membership of userMemberships) {
      const ws = this.workspaces.get(membership.workspaceId);
      if (!ws || ws.deletedAt) continue;

      const allMembers = Array.from(this.members.values()).filter((m) => m.workspaceId === ws.id);

      // Lấy avatar của tối đa 4 thành viên gần nhất
      const memberAvatars = [];
      for (const m of allMembers.slice(0, 4)) {
        const u = await authService.getUserById(m.userId);
        if (u) {
          const prof = authService.toProfile(u);
          memberAvatars.push({
            id: prof.id,
            fullName: prof.fullName,
            avatarUrl: prof.avatarUrl,
            initials: prof.initials,
          });
        }
      }

      summaries.push({
        id: ws.id,
        slug: ws.slug,
        name: ws.name,
        icon: ws.icon,
        color: ws.color,
        description: ws.description,
        privacyType: ws.privacyType,
        storageQuotaBytes: ws.storageQuotaBytes,
        isArchived: ws.isArchived,
        memberCount: allMembers.length,
        documentCount: 8, // Dữ liệu mẫu số tài liệu ban đầu
        role: membership.role,
        recentMemberAvatars: memberAvatars,
        createdAt: ws.createdAt.toISOString(),
      });
    }

    return summaries;
  }

  // FR-WS-03: Lấy thông tin không gian theo slug
  public async getWorkspaceBySlug(
    slug: string,
    userId: string
  ): Promise<{ workspace: WorkspaceSummary; currentRole: WorkspaceRole }> {
    const ws = Array.from(this.workspaces.values()).find((w) => w.slug === slug && !w.deletedAt);
    if (!ws) {
      throw new Error("Không tìm thấy không gian làm việc");
    }

    const role = this.getMemberRole(ws.id, userId);
    // Nếu là workspace tổ chức, người dùng có thể xem với vai trò viewer nếu chưa tham gia
    const effectiveRole = role || (ws.privacyType === "organization" ? "viewer" : null);

    if (!effectiveRole) {
      throw new Error("Bạn không có quyền truy cập vào không gian này (403)");
    }

    const allMembers = Array.from(this.members.values()).filter((m) => m.workspaceId === ws.id);

    const memberAvatars = [];
    for (const m of allMembers.slice(0, 4)) {
      const u = await authService.getUserById(m.userId);
      if (u) {
        const prof = authService.toProfile(u);
        memberAvatars.push({
          id: prof.id,
          fullName: prof.fullName,
          avatarUrl: prof.avatarUrl,
          initials: prof.initials,
        });
      }
    }

    const summary: WorkspaceSummary = {
      id: ws.id,
      slug: ws.slug,
      name: ws.name,
      icon: ws.icon,
      color: ws.color,
      description: ws.description,
      privacyType: ws.privacyType,
      storageQuotaBytes: ws.storageQuotaBytes,
      isArchived: ws.isArchived,
      memberCount: allMembers.length,
      documentCount: 8,
      role: effectiveRole,
      recentMemberAvatars: memberAvatars,
      createdAt: ws.createdAt.toISOString(),
    };

    return { workspace: summary, currentRole: effectiveRole };
  }

  // FR-WS-01: Tạo không gian mới (người tạo là Owner)
  public async createWorkspace(
    input: CreateWorkspaceInput,
    userId: string
  ): Promise<WorkspaceSummary> {
    const baseSlug = input.slug || this.slugify(input.name);
    let finalSlug = baseSlug;
    let counter = 1;

    while (Array.from(this.workspaces.values()).some((w) => w.slug === finalSlug && !w.deletedAt)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const ws: WorkspaceEntity = {
      id: crypto.randomUUID(),
      slug: finalSlug,
      name: input.name,
      icon: input.icon || "Grid2X2",
      color: input.color || "#7766e9",
      description: input.description || null,
      privacyType: input.privacyType || "private",
      storageQuotaBytes: 5368709120, // 5 GB
      isArchived: false,
      deletedAt: null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workspaces.set(ws.id, ws);
    this.addMemberInternal(ws.id, userId, "owner");

    const u = await authService.getUserById(userId);
    const prof = u ? authService.toProfile(u) : null;

    return {
      id: ws.id,
      slug: ws.slug,
      name: ws.name,
      icon: ws.icon,
      color: ws.color,
      description: ws.description,
      privacyType: ws.privacyType,
      storageQuotaBytes: ws.storageQuotaBytes,
      isArchived: false,
      memberCount: 1,
      documentCount: 0,
      role: "owner",
      recentMemberAvatars: prof
        ? [
            {
              id: prof.id,
              fullName: prof.fullName,
              avatarUrl: prof.avatarUrl,
              initials: prof.initials,
            },
          ]
        : [],
      createdAt: ws.createdAt.toISOString(),
    };
  }

  // FR-WS-06: Cài đặt không gian
  public async updateWorkspace(
    slug: string,
    input: UpdateWorkspaceInput,
    actorUserId: string
  ): Promise<WorkspaceSummary> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const role = this.getMemberRole(workspace.id, actorUserId);

    if (!policy.can({ id: actorUserId, role: role || undefined }, "workspace:update_settings")) {
      throw new Error("Bạn không có quyền thay đổi cài đặt của không gian này");
    }

    const ws = this.workspaces.get(workspace.id)!;
    if (input.name !== undefined) ws.name = input.name;
    if (input.icon !== undefined) ws.icon = input.icon;
    if (input.color !== undefined) ws.color = input.color;
    if (input.description !== undefined) ws.description = input.description;
    if (input.privacyType !== undefined) ws.privacyType = input.privacyType;
    if (input.isArchived !== undefined) ws.isArchived = input.isArchived;
    ws.updatedAt = new Date();

    return (await this.getWorkspaceBySlug(ws.slug, actorUserId)).workspace;
  }

  // FR-WS-04: Mời thành viên
  public async inviteMember(
    slug: string,
    input: InviteMemberInput,
    actorUserId: string
  ): Promise<WorkspaceInvitationInfo> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const role = this.getMemberRole(workspace.id, actorUserId);

    if (!policy.can({ id: actorUserId, role: role || undefined }, "workspace:invite_member")) {
      throw new Error("Bạn không có quyền mời thành viên vào không gian này");
    }

    // Kiểm tra xem đã là thành viên chưa
    const existingUser = Array.from(
      (authService as any).users.values() as IterableIterator<any>
    ).find((u: any) => u.email === input.email.toLowerCase().trim());
    if (existingUser && this.getMemberRole(workspace.id, existingUser.id)) {
      throw new Error("Người dùng này đã là thành viên của không gian làm việc");
    }

    const token = crypto.randomUUID();
    const inv: InvitationEntity = {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      token,
      invitedBy: actorUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày (SPEC FR-WS-04)
      status: "pending",
      createdAt: new Date(),
    };

    this.invitations.set(token, inv);
    const actorUser = await authService.getUserById(actorUserId);

    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedByName: actorUser?.fullName || "Thành viên Workspace",
      expiresAt: inv.expiresAt.toISOString(),
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    };
  }

  // FR-WS-05: Quản lý thành viên (danh sách)
  public async listMembers(slug: string, actorUserId: string): Promise<WorkspaceMemberInfo[]> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const allMembers = Array.from(this.members.values()).filter(
      (m) => m.workspaceId === workspace.id
    );

    const result: WorkspaceMemberInfo[] = [];
    for (const m of allMembers) {
      const u = await authService.getUserById(m.userId);
      if (u) {
        const prof = authService.toProfile(u);
        result.push({
          id: m.id,
          userId: u.id,
          email: u.email,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          initials: prof.initials,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        });
      }
    }

    return result.sort((a, b) => {
      const roleWeights: Record<WorkspaceRole, number> = {
        owner: 5,
        admin: 4,
        member: 3,
        guest: 2,
        viewer: 1,
      };
      return roleWeights[b.role] - roleWeights[a.role];
    });
  }

  // FR-WS-05: Đổi vai trò thành viên
  public async updateMemberRole(
    slug: string,
    targetUserId: string,
    newRole: WorkspaceRole,
    actorUserId: string
  ): Promise<void> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const actorRole = this.getMemberRole(workspace.id, actorUserId);

    if (!policy.can({ id: actorUserId, role: actorRole || undefined }, "workspace:update_role")) {
      throw new Error("Bạn không có quyền thay đổi vai trò thành viên");
    }

    const member = this.members.get(`${workspace.id}_${targetUserId}`);
    if (!member) {
      throw new Error("Thành viên không thuộc không gian này");
    }

    if (member.role === "owner") {
      throw new Error("Không thể hạ vai trò của Chủ sở hữu. Hãy sử dụng tính năng chuyển quyền.");
    }

    member.role = newRole;
  }

  // FR-WS-05: Xoá hoặc rời không gian
  public async removeMember(
    slug: string,
    targetUserId: string,
    actorUserId: string
  ): Promise<void> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const actorRole = this.getMemberRole(workspace.id, actorUserId);
    const isSelf = targetUserId === actorUserId;

    if (!isSelf) {
      if (
        !policy.can({ id: actorUserId, role: actorRole || undefined }, "workspace:remove_member")
      ) {
        throw new Error("Bạn không có quyền xoá thành viên khỏi không gian");
      }
    }

    const targetMember = this.members.get(`${workspace.id}_${targetUserId}`);
    if (!targetMember) {
      throw new Error("Thành viên không tồn tại trong không gian");
    }

    // Owner cuối cùng không thể rời nếu chưa chuyển quyền (SPEC FR-WS-05)
    if (targetMember.role === "owner") {
      const allOwners = Array.from(this.members.values()).filter(
        (m) => m.workspaceId === workspace.id && m.role === "owner"
      );
      if (allOwners.length <= 1) {
        throw new Error(
          "Chủ sở hữu cuối cùng không thể rời không gian nếu chưa chuyển quyền sở hữu cho người khác."
        );
      }
    }

    this.members.delete(`${workspace.id}_${targetUserId}`);
  }

  // FR-WS-08: Lưu trữ / Xoá mềm không gian (30 ngày)
  public async deleteWorkspace(slug: string, actorUserId: string): Promise<void> {
    const { workspace } = await this.getWorkspaceBySlug(slug, actorUserId);
    const actorRole = this.getMemberRole(workspace.id, actorUserId);

    // Chỉ Owner mới được xoá không gian (SPEC 6.0)
    if (!policy.can({ id: actorUserId, role: actorRole || undefined }, "workspace:delete")) {
      throw new Error("Chỉ Chủ sở hữu (Owner) mới có quyền xoá không gian làm việc.");
    }

    const ws = this.workspaces.get(workspace.id)!;
    ws.isArchived = true;
    ws.deletedAt = new Date();
  }

  // Chấp nhận lời mời
  public async acceptInvitation(token: string, userId: string): Promise<WorkspaceSummary> {
    const inv = this.invitations.get(token);
    if (!inv || inv.status !== "pending" || inv.expiresAt < new Date()) {
      throw new Error("Lời mời không hợp lệ hoặc đã hết hạn");
    }

    this.addMemberInternal(inv.workspaceId, userId, inv.role);
    inv.status = "accepted";

    const ws = this.workspaces.get(inv.workspaceId)!;
    return (await this.getWorkspaceBySlug(ws.slug, userId)).workspace;
  }
}

export const workspaceService = new WorkspaceService();
