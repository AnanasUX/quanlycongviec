import { describe, it, expect } from "vitest";
import { hasPermission, policy } from "./permissions.js";

describe("Permissions Matrix (SPEC 6.0)", () => {
  describe("Owner Role", () => {
    it("Owner có toàn quyền quản trị và xoá không gian", () => {
      expect(hasPermission("owner", "workspace:delete")).toBe(true);
      expect(hasPermission("owner", "workspace:transfer_ownership")).toBe(true);
      expect(hasPermission("owner", "workspace:invite_member")).toBe(true);
      expect(hasPermission("owner", "workspace:update_settings")).toBe(true);
      expect(hasPermission("owner", "content:create")).toBe(true);
      expect(hasPermission("owner", "content:view_shared")).toBe(true);
    });
  });

  describe("Admin Role", () => {
    it("Admin không thể xoá không gian hay chuyển quyền sở hữu", () => {
      expect(hasPermission("admin", "workspace:delete")).toBe(false);
      expect(hasPermission("admin", "workspace:transfer_ownership")).toBe(false);
    });

    it("Admin có quyền mời thành viên, đổi cài đặt và quản trị", () => {
      expect(hasPermission("admin", "workspace:invite_member")).toBe(true);
      expect(hasPermission("admin", "workspace:remove_member")).toBe(true);
      expect(hasPermission("admin", "workspace:update_role")).toBe(true);
      expect(hasPermission("admin", "workspace:update_settings")).toBe(true);
      expect(hasPermission("admin", "workspace:archive")).toBe(true);
    });
  });

  describe("Member Role", () => {
    it("Member không có quyền quản trị không gian", () => {
      expect(hasPermission("member", "workspace:delete")).toBe(false);
      expect(hasPermission("member", "workspace:transfer_ownership")).toBe(false);
      expect(hasPermission("member", "workspace:invite_member")).toBe(false);
      expect(hasPermission("member", "workspace:update_settings")).toBe(false);
      expect(hasPermission("member", "workspace:archive")).toBe(false);
    });

    it("Member có quyền tạo và chỉnh sửa nội dung", () => {
      expect(hasPermission("member", "content:create")).toBe(true);
      expect(hasPermission("member", "content:edit_own")).toBe(true);
      expect(hasPermission("member", "content:delete_own")).toBe(true);
      expect(hasPermission("member", "content:edit_shared")).toBe(true);
      expect(hasPermission("member", "content:view_shared")).toBe(true);
    });
  });

  describe("Guest Role", () => {
    it("Guest chỉ có quyền thao tác trên nội dung được chia sẻ hoặc tự tạo", () => {
      expect(hasPermission("guest", "workspace:delete")).toBe(false);
      expect(hasPermission("guest", "workspace:invite_member")).toBe(false);
      expect(hasPermission("guest", "content:create")).toBe(false);
      expect(hasPermission("guest", "content:edit_own")).toBe(true);
      expect(hasPermission("guest", "content:edit_shared")).toBe(true);
      expect(hasPermission("guest", "content:view_shared")).toBe(true);
    });
  });

  describe("Viewer Role", () => {
    it("Viewer CHỈ CÓ DUY NHẤT quyền xem nội dung được chia sẻ", () => {
      expect(hasPermission("viewer", "content:view_shared")).toBe(true);
      expect(hasPermission("viewer", "content:create")).toBe(false);
      expect(hasPermission("viewer", "content:edit_own")).toBe(false);
      expect(hasPermission("viewer", "content:edit_shared")).toBe(false);
      expect(hasPermission("viewer", "workspace:invite_member")).toBe(false);
      expect(hasPermission("viewer", "workspace:delete")).toBe(false);
    });
  });

  describe("Policy Engine: policy.can()", () => {
    it("Trả về false nếu user không tồn tại hoặc không có role", () => {
      expect(policy.can(null, "content:view_shared")).toBe(false);
      expect(policy.can(undefined, "content:view_shared")).toBe(false);
      expect(policy.can({ id: "u1" }, "content:view_shared")).toBe(false);
    });

    it("Kiểm tra quyền sở hữu nội dung khi sửa/xoá (content:edit_own)", () => {
      const member = { id: "u1", role: "member" as const };
      const otherUserResource = { id: "res1", createdBy: "u2" };
      const ownResource = { id: "res2", createdBy: "u1" };

      // Member chỉ sửa được tài nguyên của chính mình
      expect(policy.can(member, "content:edit_own", ownResource)).toBe(true);
      expect(policy.can(member, "content:edit_own", otherUserResource)).toBe(false);

      // Admin và Owner có thể can thiệp
      const admin = { id: "admin1", role: "admin" as const };
      const owner = { id: "owner1", role: "owner" as const };
      expect(policy.can(admin, "content:edit_own", otherUserResource)).toBe(true);
      expect(policy.can(owner, "content:edit_own", otherUserResource)).toBe(true);
    });
  });
});
