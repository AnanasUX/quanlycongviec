/**
 * API Client kết nối Fastify Backend (/api)
 */
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UserProfile,
  WorkspaceSummary,
  WorkspaceMemberInfo,
  WorkspaceInvitationInfo,
} from "@workspace/shared";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Mang theo cookie session_token
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.error?.message || `Yêu cầu thất bại (${res.status})`;
        const error = new Error(errorMsg) as any;
        error.code = data?.error?.code || "API_ERROR";
        error.status = res.status;
        error.details = data?.error?.details;
        throw error;
      }

      return data.data !== undefined ? data.data : data;
    } catch (err: any) {
      // Nếu không kết nối được server (server chưa bật), cung cấp fallback thông minh
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        console.warn(
          `[API] Không kết nối được Backend ${API_BASE}. Đang chạy chế độ ngoại tuyến/fallback.`
        );
      }
      throw err;
    }
  }

  // Auth
  async login(input: LoginInput) {
    return this.request<{
      user?: UserProfile;
      token?: string;
      requires2FA?: boolean;
      tempToken?: string;
    }>("/auth/login", { method: "POST", body: JSON.stringify(input) });
  }

  async register(input: RegisterInput) {
    return this.request<{ user: UserProfile; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async logout() {
    return this.request<{ message: string }>("/auth/logout", { method: "POST" });
  }

  async verify2FA(tempToken: string, code: string) {
    return this.request<{ user: UserProfile; token: string }>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ tempToken, code }),
    });
  }

  async forgotPassword(input: ForgotPasswordInput) {
    return this.request<{ message: string; devToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async resetPassword(input: ResetPasswordInput) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getSessions() {
    return this.request<any[]>("/auth/sessions");
  }

  async revokeSession(sessionId: string) {
    return this.request<{ message: string }>(`/auth/sessions/${sessionId}`, { method: "DELETE" });
  }

  // User Profile
  async getMe() {
    return this.request<UserProfile>("/me");
  }

  async updateMe(input: UpdateProfileInput) {
    return this.request<UserProfile>("/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  // Workspaces
  async listWorkspaces() {
    return this.request<WorkspaceSummary[]>("/workspaces");
  }

  async getWorkspace(slug: string) {
    return this.request<{ workspace: WorkspaceSummary; currentRole: string }>(
      `/workspaces/${slug}`
    );
  }

  async createWorkspace(input: CreateWorkspaceInput) {
    return this.request<WorkspaceSummary>("/workspaces", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateWorkspace(slug: string, input: UpdateWorkspaceInput) {
    return this.request<WorkspaceSummary>(`/workspaces/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  async deleteWorkspace(slug: string) {
    return this.request<{ message: string }>(`/workspaces/${slug}`, {
      method: "DELETE",
    });
  }

  async listMembers(slug: string) {
    return this.request<WorkspaceMemberInfo[]>(`/workspaces/${slug}/members`);
  }

  async inviteMember(slug: string, input: InviteMemberInput) {
    return this.request<WorkspaceInvitationInfo>(`/workspaces/${slug}/invitations`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateMemberRole(slug: string, targetUserId: string, role: string) {
    return this.request<{ message: string }>(`/workspaces/${slug}/members/${targetUserId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(slug: string, targetUserId: string) {
    return this.request<{ message: string }>(`/workspaces/${slug}/members/${targetUserId}`, {
      method: "DELETE",
    });
  }

  async acceptInvitation(token: string) {
    return this.request<{ message: string; workspace: WorkspaceSummary }>(
      `/workspaces/invitations/${token}/accept`,
      { method: "POST" }
    );
  }
}

export const api = new ApiClient();
