import { z } from "zod";

export const passwordValidation = z
  .string()
  .min(10, "Mật khẩu phải có ít nhất 10 ký tự")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ cái thường")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái in hoa")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số");

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Địa chỉ email không hợp lệ"),
  password: passwordValidation,
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Địa chỉ email không hợp lệ"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ"),
  newPassword: passwordValidation,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .length(6, "Mã xác thực gồm 6 chữ số")
    .regex(/^\d{6}$/, "Mã xác thực chỉ chứa các chữ số"),
});

export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;

export const twoFactorBackupSchema = z.object({
  backupCode: z.string().min(8, "Mã dự phòng không hợp lệ").trim(),
});

export type TwoFactorBackupInput = z.infer<typeof twoFactorBackupSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự").trim().optional(),
  avatarUrl: z.string().url("Đường dẫn ảnh đại diện không hợp lệ").nullable().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
  timezone: string;
  locale: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: string;
  isCurrent: boolean;
}
