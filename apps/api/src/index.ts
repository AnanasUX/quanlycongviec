import Fastify from "fastify";
import crypto from "node:crypto";

const server = Fastify({
  genReqId: (req) => {
    return (req.headers["x-request-id"] as string) || crypto.randomUUID();
  },
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
});

// Liveness probe
server.get("/healthz", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Readiness probe
server.get("/readyz", async () => {
  return {
    status: "ready",
    timestamp: new Date().toISOString(),
  };
});

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await server.listen({ port, host });
    server.log.info(`API Server running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
