import type { FastifyPluginAsync } from "fastify";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorVerifySchema,
} from "@workspace/shared";
import { authService } from "../services/authService.js";
import { requireAuth } from "../plugins/auth.js";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // FR-AUTH-01: Đăng ký
  fastify.post("/register", async (req, reply) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0].message,
          details: parseResult.error.issues,
          requestId: req.id,
        },
      });
    }

    try {
      const { user, sessionToken } = await authService.register(parseResult.data);

      reply.setCookie("session_token", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.status(201).send({
        data: { user, token: sessionToken },
      });
    } catch (err: any) {
      return reply.status(409).send({
        error: {
          code: "CONFLICT",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-AUTH-02: Đăng nhập
  fastify.post("/login", async (req, reply) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0].message,
          details: parseResult.error.issues,
          requestId: req.id,
        },
      });
    }

    try {
      const ip = req.ip;
      const userAgent = req.headers["user-agent"];
      const result = await authService.login(parseResult.data, ip, userAgent);

      if (result.requires2FA) {
        return reply.send({
          data: {
            requires2FA: true,
            tempToken: result.tempToken,
          },
        });
      }

      reply.setCookie("session_token", result.sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: (parseResult.data.rememberMe ? 30 : 1) * 24 * 60 * 60,
      });

      return reply.send({
        data: {
          user: result.user,
          token: result.sessionToken,
        },
      });
    } catch (err: any) {
      return reply.status(401).send({
        error: {
          code: "UNAUTHENTICATED",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-AUTH-05: Xác thực 2FA khi đăng nhập
  fastify.post("/2fa/verify", async (req, reply) => {
    const body = req.body as any;
    const tempToken = body?.tempToken;
    const parseResult = twoFactorVerifySchema.safeParse({ token: body?.code });

    if (!tempToken || !parseResult.success) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.success
            ? "Thiếu mã tạm thời xác thực"
            : parseResult.error.issues[0].message,
          requestId: req.id,
        },
      });
    }

    try {
      const ip = req.ip;
      const userAgent = req.headers["user-agent"];
      const result = await authService.verify2FA(tempToken, parseResult.data.token, ip, userAgent);

      reply.setCookie("session_token", result.sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.send({
        data: { user: result.user, token: result.sessionToken },
      });
    } catch (err: any) {
      return reply.status(401).send({
        error: {
          code: "UNAUTHENTICATED",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-AUTH-05: Khởi tạo bật 2FA
  fastify.post("/2fa/setup", { preHandler: [requireAuth] }, async (req, reply) => {
    try {
      const result = authService.generate2FASecret(req.user!.id);
      return reply.send({ data: result });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-AUTH-05: Kích hoạt bật 2FA
  fastify.post("/2fa/enable", { preHandler: [requireAuth] }, async (req, reply) => {
    const { secret, code } = (req.body as any) || {};
    if (!secret || !code) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Thiếu secret hoặc mã xác thực",
          requestId: req.id,
        },
      });
    }

    try {
      const result = await authService.enable2FA(req.user!.id, secret, code);
      return reply.send({ data: result });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-AUTH-04: Quên mật khẩu
  fastify.post("/forgot-password", async (req, reply) => {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0].message,
          requestId: req.id,
        },
      });
    }

    const token = await authService.forgotPassword(parseResult.data.email);
    return reply.send({
      data: {
        message: "Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.",
        devToken: process.env.NODE_ENV !== "production" ? token : undefined,
      },
    });
  });

  // FR-AUTH-04: Đặt lại mật khẩu
  fastify.post("/reset-password", async (req, reply) => {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0].message,
          requestId: req.id,
        },
      });
    }

    try {
      await authService.resetPassword(parseResult.data);
      reply.clearCookie("session_token", { path: "/" });
      return reply.send({
        data: { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." },
      });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-AUTH-06: Đăng xuất
  fastify.post("/logout", async (req, reply) => {
    if (req.rawToken) {
      await authService.logout(req.rawToken);
    }
    reply.clearCookie("session_token", { path: "/" });
    return reply.send({ data: { message: "Đăng xuất thành công" } });
  });

  // FR-AUTH-06: Danh sách phiên làm việc
  fastify.get("/sessions", { preHandler: [requireAuth] }, async (req, reply) => {
    const sessions = authService.listSessions(req.user!.id, req.rawToken || undefined);
    return reply.send({ data: sessions });
  });

  // FR-AUTH-06: Thu hồi phiên làm việc từ xa
  fastify.delete("/sessions/:id", { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      authService.revokeSession(req.user!.id, id);
      return reply.send({ data: { message: "Đã huỷ phiên đăng nhập thành công" } });
    } catch (err: any) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: err.message, requestId: req.id },
      });
    }
  });
};
