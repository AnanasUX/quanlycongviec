import { z } from "zod";

export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  uptime: z.number(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
