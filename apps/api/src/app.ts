import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import crypto from "node:crypto";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { workspaceRoutes } from "./routes/workspaceRoutes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    genReqId: (req) => {
      return (req.headers["x-request-id"] as string) || crypto.randomUUID();
    },
    logger: false, // Turned off in tests, controlled in index.ts
  });

  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Cookie
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || "workspace_super_secret_cookie_key_32chars",
  });

  // FR-AUTH-09: Giới hạn tốc độ (Rate Limit)
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (req, _context) => ({
      statusCode: 429,
      error: {
        code: "RATE_LIMITED",
        message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.",
        requestId: req.id,
      },
    }),
  });

  // Auth Decorator & Hook
  await app.register(authPlugin);

  // Health checks
  app.get("/healthz", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  app.get("/readyz", async () => ({
    status: "ready",
    timestamp: new Date().toISOString(),
  }));

  // Đăng ký routes
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(userRoutes, { prefix: "/me" });
  await app.register(workspaceRoutes, { prefix: "/workspaces" });

  // Bộ xử lý lỗi tập trung theo chuẩn SPEC 8.3
  app.setErrorHandler((error: unknown, req, reply) => {
    const err = error as any;
    const statusCode = err?.statusCode || 500;
    if (err?.error && typeof err.error === "object") {
      return reply.status(statusCode).send(err);
    }
    return reply.status(statusCode).send({
      error: {
        code: err?.code || "INTERNAL_ERROR",
        message: err?.message || "Đã có lỗi xảy ra trên máy chủ",
        requestId: req.id,
      },
    });
  });

  return app;
}
