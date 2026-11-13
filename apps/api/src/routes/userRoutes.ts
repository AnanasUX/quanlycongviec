import type { FastifyPluginAsync } from "fastify";
import { updateProfileSchema } from "@workspace/shared";
import { authService } from "../services/authService.js";
import { requireAuth } from "../plugins/auth.js";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // FR-AUTH-07: Lấy thông tin cá nhân
  fastify.get("/", async (req, reply) => {
    return reply.send({ data: req.user });
  });

  // FR-AUTH-07: Cập nhật thông tin cá nhân
  fastify.patch("/", async (req, reply) => {
    const parseResult = updateProfileSchema.safeParse(req.body);
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
      const updated = authService.updateProfile(req.user!.id, parseResult.data);
      return reply.send({ data: updated });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-AUTH-08: Xoá tài khoản
  fastify.delete("/", async (req, reply) => {
    const { passwordConfirm } = (req.body as any) || {};
    if (!passwordConfirm) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Cần nhập mật khẩu hiện tại để xác nhận xoá tài khoản",
          requestId: req.id,
        },
      });
    }

    try {
      await authService.deleteAccount(req.user!.id, passwordConfirm);
      reply.clearCookie("session_token", { path: "/" });
      return reply.send({
        data: { message: "Tài khoản của bạn đã được xoá vĩnh viễn" },
      });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });
};
