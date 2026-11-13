import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { generate } from "otplib";
import { buildApp } from "./app.js";

describe("Fastify API Integration Tests (Phase 1: AUTH & WS)", () => {
  let app: FastifyInstance;
  let ownerCookie: string;
  let memberCookie: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Đăng nhập tài khoản Owner (Minh Anh)
    const ownerLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "minhanh@workspace.vn",
        password: "Password123!",
      },
    });
    expect(ownerLogin.statusCode).toBe(200);
    const cookies = ownerLogin.cookies;
    const sessionCookie = cookies.find((c) => c.name === "session_token");
    ownerCookie = `session_token=${sessionCookie?.value}`;

    // Đăng nhập tài khoản Member (Quốc Tuấn)
    const memberLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "tuan.quoc@workspace.vn",
        password: "Password123!",
      },
    });
    expect(memberLogin.statusCode).toBe(200);
    const memberSession = memberLogin.cookies.find((c) => c.name === "session_token");
    memberCookie = `session_token=${memberSession?.value}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Health Checks", () => {
    it("GET /healthz trả về status ok", async () => {
      const res = await app.inject({ method: "GET", url: "/healthz" });
      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe("ok");
    });

    it("GET /readyz trả về status ready", async () => {
      const res = await app.inject({ method: "GET", url: "/readyz" });
      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe("ready");
    });
  });

  describe("Xác thực & Tài khoản (FR-AUTH-01..09)", () => {
    it("FR-AUTH-01: Đăng ký tài khoản thành công với mật khẩu hợp lệ", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "newuser@workspace.vn",
          password: "Password12345!",
          fullName: "Người Dùng Mới",
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data.user.email).toBe("newuser@workspace.vn");
      expect(body.data.user.fullName).toBe("Người Dùng Mới");
      expect(res.cookies.some((c) => c.name === "session_token")).toBe(true);
    });

    it("FR-AUTH-01: Từ chối đăng ký khi mật khẩu < 10 ký tự", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "invalid@workspace.vn",
          password: "Short1",
          fullName: "Test Short",
        },
      });

      expect(res.statusCode).toBe(422);
      expect(res.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("FR-AUTH-02: Đăng nhập sai và cơ chế khoá tạm 15 phút sau 5 lần sai", async () => {
      const targetEmail = "locktest@workspace.vn";
      // Tạo user để test khoá
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: targetEmail,
          password: "Password12345!",
          fullName: "User Lock Test",
        },
      });

      // Nhập sai 4 lần đầu -> 401
      for (let i = 1; i <= 4; i++) {
        const res = await app.inject({
          method: "POST",
          url: "/auth/login",
          payload: { email: targetEmail, password: "WrongPassword!" },
        });
        expect(res.statusCode).toBe(401);
        expect(res.json().error.message).toContain("không chính xác");
      }

      // Lần thứ 5 sai -> bị khoá 15 phút!
      const fifthRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: targetEmail, password: "WrongPassword!" },
      });
      expect(fifthRes.statusCode).toBe(401);
      expect(fifthRes.json().error.message).toContain("khoá tạm thời trong 15 phút");

      // Lần thứ 6 (kể cả gõ đúng mật khẩu) -> vẫn bị từ chối do đang bị khoá!
      const lockedRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: targetEmail, password: "Password12345!" },
      });
      expect(lockedRes.statusCode).toBe(401);
      expect(lockedRes.json().error.message).toContain("tạm thời bị khoá");

      // Giả lập trôi qua 15 phút (mở lại tài khoản)
      const { authService } = await import("./services/authService.js");
      const user = Array.from((authService as any).users.values() as IterableIterator<any>).find(
        (u: any) => u.email === targetEmail
      );
      if (user) {
        user.lockedUntil = new Date(Date.now() - 1000); // Đã qua 15 phút
      }

      // Đăng nhập lại với mật khẩu đúng -> Thành công 200!
      const recoveredRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: targetEmail, password: "Password12345!" },
      });
      expect(recoveredRes.statusCode).toBe(200);
      expect(recoveredRes.json().data.user.email).toBe(targetEmail);
    });

    it("Mục 7: Test cookie Set-Cookie đầy đủ httpOnly, SameSite=Lax (và Secure ở production)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "minhanh@workspace.vn",
          password: "Password123!",
        },
      });

      const setCookieHeader = res.headers["set-cookie"] as string;
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader.toLowerCase()).toContain("httponly");
      expect(setCookieHeader.toLowerCase()).toContain("samesite=lax");
      expect(setCookieHeader.toLowerCase()).toContain("path=/");

      // Thử nghiệm ở môi trường production
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const prodApp = await buildApp();
        const prodRes = await prodApp.inject({
          method: "POST",
          url: "/auth/login",
          payload: {
            email: "nam.hoang@workspace.vn",
            password: "Password123!",
          },
        });
        const prodCookie = prodRes.headers["set-cookie"] as string;
        expect(prodCookie.toLowerCase()).toContain("secure");
        await prodApp.close();
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it("Mục 8: Test rate limit - gửi vượt ngưỡng và xác nhận trả về 429", async () => {
      // Dùng instance app riêng biệt để không ảnh hưởng đến hạn mức của các bài test khác
      const rateLimitApp = await buildApp();
      try {
        let hitRateLimit = false;
        let lastRes: any = null;
        for (let i = 0; i < 110; i++) {
          const res = await rateLimitApp.inject({
            method: "GET",
            url: "/healthz",
          });
          if (res.statusCode === 429) {
            hitRateLimit = true;
            lastRes = res;
            break;
          }
        }
        expect(hitRateLimit).toBe(true);
        expect(lastRes.statusCode).toBe(429);
        expect(lastRes.json().error.code).toBe("RATE_LIMITED");
      } finally {
        await rateLimitApp.close();
      }
    });

    it("FR-AUTH-06: Xem danh sách thiết bị/phiên làm việc (GET /auth/sessions)", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/auth/sessions",
        headers: { cookie: ownerCookie },
      });

      expect(res.statusCode).toBe(200);
      const sessions = res.json().data;
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.some((s: any) => s.isCurrent === true)).toBe(true);
    });

    it("FR-AUTH-07: Lấy và cập nhật thông tin cá nhân (GET/PATCH /me)", async () => {
      const getRes = await app.inject({
        method: "GET",
        url: "/me",
        headers: { cookie: ownerCookie },
      });
      expect(getRes.statusCode).toBe(200);
      expect(getRes.json().data.email).toBe("minhanh@workspace.vn");

      const patchRes = await app.inject({
        method: "PATCH",
        url: "/me",
        headers: { cookie: ownerCookie },
        payload: { fullName: "Minh Anh (Cập nhật)" },
      });
      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.json().data.fullName).toBe("Minh Anh (Cập nhật)");
    });

    it("FR-AUTH-05: Thiết lập và kích hoạt 2FA TOTP", async () => {
      const setupRes = await app.inject({
        method: "POST",
        url: "/auth/2fa/setup",
        headers: { cookie: ownerCookie },
      });
      expect(setupRes.statusCode).toBe(200);
      const { secret } = setupRes.json().data;
      expect(secret).toBeDefined();

      // Sinh mã TOTP hợp lệ
      const validCode = await generate({ secret });
      const enableRes = await app.inject({
        method: "POST",
        url: "/auth/2fa/enable",
        headers: { cookie: ownerCookie },
        payload: { secret, code: validCode },
      });

      expect(enableRes.statusCode).toBe(200);
      expect(enableRes.json().data.backupCodes.length).toBe(10);
    });

    it("FR-AUTH-04: Quên và đặt lại mật khẩu thu hồi mọi phiên cũ", async () => {
      const forgotRes = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: "minhanh@workspace.vn" },
      });
      expect(forgotRes.statusCode).toBe(200);
      const token = forgotRes.json().data.devToken;

      const resetRes = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: {
          token,
          newPassword: "NewPassword123!",
        },
      });
      expect(resetRes.statusCode).toBe(200);

      // Thử dùng lại cookie cũ -> phải bị từ chối 401 vì phiên đã bị thu hồi!
      const checkRevoked = await app.inject({
        method: "GET",
        url: "/me",
        headers: { cookie: ownerCookie },
      });
      expect(checkRevoked.statusCode).toBe(401);
    });
  });

  describe("Không gian làm việc & Phân quyền (FR-WS-01..08, Ma trận quyền 6.0)", () => {
    let reLoginOwnerCookie: string;

    beforeAll(async () => {
      // Đăng nhập lại với mật khẩu mới
      const loginRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "minhanh@workspace.vn",
          password: "NewPassword123!",
        },
      });
      const loginData = loginRes.json().data;
      if (loginData?.requires2FA) {
        // User có 2FA bật, lấy mã và xác thực 2FA
        const userEntity = (await import("./services/authService.js")).authService.getUserById(
          "usr-owner-1"
        );
        const user = await userEntity;
        const code = await generate({ secret: user!.twoFactorSecret! });
        const verifyRes = await app.inject({
          method: "POST",
          url: "/auth/2fa/verify",
          payload: { tempToken: loginData.tempToken, code },
        });
        const cookie = verifyRes.cookies.find((c) => c.name === "session_token");
        reLoginOwnerCookie = `session_token=${cookie?.value}`;
      } else {
        const cookie = loginRes.cookies.find((c) => c.name === "session_token");
        reLoginOwnerCookie = `session_token=${cookie?.value}`;
      }
    });

    it("FR-WS-02: Lấy danh sách không gian của người dùng", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/workspaces",
        headers: { cookie: reLoginOwnerCookie },
      });

      expect(res.statusCode).toBe(200);
      const list = res.json().data;
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(4);
      expect(list.some((w: any) => w.slug === "cong-ty")).toBe(true);
    });

    it("FR-WS-01: Tạo không gian mới thành công, người tạo có vai trò Owner", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/workspaces",
        headers: { cookie: reLoginOwnerCookie },
        payload: {
          name: "Phòng Thử Nghiệm AI",
          description: "Nghiên cứu mô hình trí tuệ nhân tạo",
          color: "#6366f1",
        },
      });

      expect(res.statusCode).toBe(201);
      const created = res.json().data;
      expect(created.slug).toContain("phong-thu-nghiem-ai");
      expect(created.role).toBe("owner");
    });

    it("FR-WS-04 & Ma trận quyền: Owner có thể mời thành viên, Member bị chặn (403)", async () => {
      // Member (Quốc Tuấn) thử mời thành viên -> Bị 403 FORBIDDEN
      const memberTryInvite = await app.inject({
        method: "POST",
        url: "/workspaces/du-an-san-pham/invitations",
        headers: { cookie: memberCookie },
        payload: {
          email: "newcolleague@workspace.vn",
          role: "member",
        },
      });
      expect(memberTryInvite.statusCode).toBe(403);
      expect(memberTryInvite.json().error.code).toBe("FORBIDDEN");

      // Owner mời thành viên -> Thành công 201
      const ownerInvite = await app.inject({
        method: "POST",
        url: "/workspaces/du-an-san-pham/invitations",
        headers: { cookie: reLoginOwnerCookie },
        payload: {
          email: "newcolleague@workspace.vn",
          role: "member",
        },
      });
      expect(ownerInvite.statusCode).toBe(201);
      expect(ownerInvite.json().data.email).toBe("newcolleague@workspace.vn");
    });

    it("FR-WS-05: Chặn Chủ sở hữu cuối cùng rời không gian", async () => {
      // Tạo một workspace chỉ có 1 mình Owner
      const createRes = await app.inject({
        method: "POST",
        url: "/workspaces",
        headers: { cookie: reLoginOwnerCookie },
        payload: { name: "Không Gian Riêng Của Tôi" },
      });
      const wsSlug = createRes.json().data.slug;

      // Lấy thông tin user hiện tại
      const meRes = await app.inject({
        method: "GET",
        url: "/me",
        headers: { cookie: reLoginOwnerCookie },
      });
      const myId = meRes.json().data.id;

      // Cố gắng rời không gian -> Bị từ chối vì là Owner cuối cùng
      const leaveRes = await app.inject({
        method: "DELETE",
        url: `/workspaces/${wsSlug}/members/${myId}`,
        headers: { cookie: reLoginOwnerCookie },
      });

      expect(leaveRes.statusCode).toBe(400);
      expect(leaveRes.json().error.message).toContain("Chủ sở hữu cuối cùng");
    });

    it("FR-WS-08: Lưu trữ / Xoá mềm không gian 30 ngày", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/workspaces",
        headers: { cookie: reLoginOwnerCookie },
        payload: { name: "Không Gian Cần Xoá" },
      });
      const slug = createRes.json().data.slug;

      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/workspaces/${slug}`,
        headers: { cookie: reLoginOwnerCookie },
      });

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.json().data.message).toContain("30 ngày");
    });
  });
});
