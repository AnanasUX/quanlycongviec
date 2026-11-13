import type { FastifyPluginAsync } from "fastify";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@workspace/shared";
import { workspaceService } from "../services/workspaceService.js";
import { requireAuth } from "../plugins/auth.js";

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // FR-WS-02: Danh sách không gian làm việc của người dùng
  fastify.get("/", async (req, reply) => {
    const list = await workspaceService.listWorkspacesForUser(req.user!.id);
    return reply.send({ data: list });
  });

  // FR-WS-01: Tạo không gian mới
  fastify.post("/", async (req, reply) => {
    const parseResult = createWorkspaceSchema.safeParse(req.body);
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
      const created = await workspaceService.createWorkspace(parseResult.data, req.user!.id);
      return reply.status(201).send({ data: created });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-WS-03: Chi tiết không gian làm việc theo slug
  fastify.get("/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    try {
      const result = await workspaceService.getWorkspaceBySlug(slug, req.user!.id);
      return reply.send({ data: result });
    } catch (err: any) {
      const isForbidden = err.message.includes("403");
      return reply.status(isForbidden ? 403 : 404).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "NOT_FOUND",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-06: Cài đặt không gian làm việc
  fastify.patch("/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const parseResult = updateWorkspaceSchema.safeParse(req.body);
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
      const updated = await workspaceService.updateWorkspace(slug, parseResult.data, req.user!.id);
      return reply.send({ data: updated });
    } catch (err: any) {
      const isForbidden = err.message.includes("không có quyền");
      return reply.status(isForbidden ? 403 : 400).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-08: Lưu trữ / Xoá mềm không gian làm việc (30 ngày)
  fastify.delete("/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    try {
      await workspaceService.deleteWorkspace(slug, req.user!.id);
      return reply.send({
        data: { message: "Không gian làm việc đã được chuyển vào thùng rác lưu trữ 30 ngày" },
      });
    } catch (err: any) {
      const isForbidden = err.message.includes("quyền");
      return reply.status(isForbidden ? 403 : 400).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-05: Danh sách thành viên
  fastify.get("/:slug/members", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    try {
      const members = await workspaceService.listMembers(slug, req.user!.id);
      return reply.send({ data: members });
    } catch (err: any) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: err.message, requestId: req.id },
      });
    }
  });

  // FR-WS-04: Mời thành viên mới
  fastify.post("/:slug/invitations", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const parseResult = inviteMemberSchema.safeParse(req.body);
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
      const inv = await workspaceService.inviteMember(slug, parseResult.data, req.user!.id);
      return reply.status(201).send({ data: inv });
    } catch (err: any) {
      const isForbidden = err.message.includes("không có quyền");
      return reply.status(isForbidden ? 403 : 400).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-05: Đổi vai trò thành viên
  fastify.patch("/:slug/members/:targetUserId", async (req, reply) => {
    const { slug, targetUserId } = req.params as { slug: string; targetUserId: string };
    const parseResult = updateMemberRoleSchema.safeParse(req.body);
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
      await workspaceService.updateMemberRole(
        slug,
        targetUserId,
        parseResult.data.role,
        req.user!.id
      );
      return reply.send({ data: { message: "Đã cập nhật vai trò thành viên thành công" } });
    } catch (err: any) {
      const isForbidden = err.message.includes("không có quyền");
      return reply.status(isForbidden ? 403 : 400).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-05: Xoá hoặc rời không gian
  fastify.delete("/:slug/members/:targetUserId", async (req, reply) => {
    const { slug, targetUserId } = req.params as { slug: string; targetUserId: string };
    try {
      await workspaceService.removeMember(slug, targetUserId, req.user!.id);
      const isSelf = targetUserId === req.user!.id;
      return reply.send({
        data: {
          message: isSelf
            ? "Bạn đã rời không gian làm việc thành công"
            : "Đã xoá thành viên khỏi không gian làm việc",
        },
      });
    } catch (err: any) {
      const isForbidden = err.message.includes("không có quyền");
      return reply.status(isForbidden ? 403 : 400).send({
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: err.message,
          requestId: req.id,
        },
      });
    }
  });

  // FR-WS-04: Chấp nhận lời mời tham gia
  fastify.post("/invitations/:token/accept", async (req, reply) => {
    const { token } = req.params as { token: string };
    try {
      const ws = await workspaceService.acceptInvitation(token, req.user!.id);
      return reply.send({
        data: {
          message: "Bạn đã tham gia không gian làm việc thành công",
          workspace: ws,
        },
      });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: "BAD_REQUEST", message: err.message, requestId: req.id },
      });
    }
  });
};
