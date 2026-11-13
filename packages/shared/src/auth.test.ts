import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, twoFactorVerifySchema } from "./auth.js";

describe("Auth Validation Schemas (FR-AUTH-01..05)", () => {
  describe("registerSchema (FR-AUTH-01)", () => {
    it("Chấp nhận thông tin đăng ký hợp lệ với mật khẩu >= 10 ký tự đủ hoa, thường, số", () => {
      const valid = registerSchema.safeParse({
        email: "user@workspace.vn",
        password: "Password123!",
        fullName: "Nguyễn Văn A",
      });
      expect(valid.success).toBe(true);
    });

    it("Từ chối mật khẩu dưới 10 ký tự", () => {
      const invalid = registerSchema.safeParse({
        email: "user@workspace.vn",
        password: "Pass123",
        fullName: "Nguyễn Văn A",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("ít nhất 10 ký tự");
      }
    });

    it("Từ chối mật khẩu thiếu chữ in hoa hoặc thiếu số", () => {
      const noUpper = registerSchema.safeParse({
        email: "user@workspace.vn",
        password: "password12345",
        fullName: "Nguyễn Văn A",
      });
      expect(noUpper.success).toBe(false);

      const noDigit = registerSchema.safeParse({
        email: "user@workspace.vn",
        password: "PasswordAbcDef",
        fullName: "Nguyễn Văn A",
      });
      expect(noDigit.success).toBe(false);
    });

    it("Tự động chuẩn hoá email về chữ thường", () => {
      const result = registerSchema.parse({
        email: "User.Name@Workspace.VN ",
        password: "Password12345",
        fullName: "Nguyễn Văn A",
      });
      expect(result.email).toBe("user.name@workspace.vn");
    });
  });

  describe("loginSchema (FR-AUTH-02)", () => {
    it("Chấp nhận email và mật khẩu hợp lệ", () => {
      const valid = loginSchema.safeParse({
        email: "user@workspace.vn",
        password: "Password123!",
        rememberMe: true,
      });
      expect(valid.success).toBe(true);
    });

    it("Từ chối khi thiếu mật khẩu hoặc email sai định dạng", () => {
      expect(loginSchema.safeParse({ email: "not-an-email", password: "123" }).success).toBe(false);
      expect(loginSchema.safeParse({ email: "user@workspace.vn", password: "" }).success).toBe(
        false
      );
    });
  });

  describe("twoFactorVerifySchema (FR-AUTH-05)", () => {
    it("Chấp nhận mã TOTP đúng 6 chữ số", () => {
      const valid = twoFactorVerifySchema.safeParse({ token: "123456" });
      expect(valid.success).toBe(true);
    });

    it("Từ chối mã TOTP không đủ 6 số hoặc chứa chữ cái", () => {
      expect(twoFactorVerifySchema.safeParse({ token: "12345" }).success).toBe(false);
      expect(twoFactorVerifySchema.safeParse({ token: "1234567" }).success).toBe(false);
      expect(twoFactorVerifySchema.safeParse({ token: "12a456" }).success).toBe(false);
    });
  });
});
