import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import type { UserProfile } from "@workspace/shared";
import { authService } from "../services/authService.js";

declare module "fastify" {
  interface FastifyRequest {
    user: UserProfile | null;
    rawToken: string | null;
  }
}

const authPluginCallback: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("user", null);
  fastify.decorateRequest("rawToken", null);

  fastify.addHook("preHandler", async (req: FastifyRequest) => {
    let token: string | undefined;

    // Lấy token từ Cookie
    const cookies = req.cookies;
    if (cookies && cookies.session_token) {
      token = cookies.session_token;
    }

    // Lấy token từ Authorization: Bearer
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (token) {
      const user = await authService.getSessionUser(token);
      if (user) {
        req.user = user;
        req.rawToken = token;
      }
    }
  });
};

export const authPlugin = fp(authPluginCallback);

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    return reply.status(401).send({
      error: {
        code: "UNAUTHENTICATED",
        message: "Bạn cần đăng nhập để thực hiện hành động này",
        requestId: req.id,
      },
    });
  }
}
