import { describe, it, expect } from "vitest";
import { HealthCheckResponseSchema } from "./index.js";

describe("HealthCheckResponseSchema", () => {
  it("validates correct health check response", () => {
    const valid = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: 12.34,
    };
    expect(HealthCheckResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("fails on invalid status", () => {
    const invalid = {
      status: "bad",
      timestamp: new Date().toISOString(),
      uptime: 12.34,
    };
    expect(HealthCheckResponseSchema.safeParse(invalid).success).toBe(false);
  });
});
