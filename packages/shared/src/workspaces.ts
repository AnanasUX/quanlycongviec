import { z } from "zod";
import type { WorkspaceRole } from "./permissions.js";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Tên không gian phải có ít nhất 2 ký tự")
    .max(100, "Tên không quá 100 ký tự")
    .trim(),
  slug: z
    .string()
    .min(2, "Đường dẫn (slug) phải có ít nhất 2 ký tự")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang")
    .optional(),
  icon: z.string().optional().default("Grid2X2"),
  color: z.string().optional().default("#7766e9"),
  description: z.string().max(500, "Mô tả không quá 500 ký tự").optional(),
  template: z.enum(["blank", "project", "marketing", "hr"]).optional().default("blank"),
  privacyType: z.enum(["private", "link", "organization"]).optional().default("private"),
});

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;
export type CreateWorkspaceOutput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Tên không gian phải có ít nhất 2 ký tự").max(100).trim().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().max(500).optional(),
  privacyType: z.enum(["private", "link", "organization"]).optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Địa chỉ email không hợp lệ"),
  role: z.enum(["admin", "member", "guest", "viewer"] as const).default("member"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "guest", "viewer"] as const),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  privacyType: "private" | "link" | "organization";
  storageQuotaBytes: number;
  isArchived: boolean;
  memberCount: number;
  documentCount: number;
  role: WorkspaceRole;
  recentMemberAvatars: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    initials: string;
  }>;
  createdAt: string;
}

export interface WorkspaceMemberInfo {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceInvitationInfo {
  id: string;
  email: string;
  role: WorkspaceRole;
  invitedByName: string;
  expiresAt: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
}
