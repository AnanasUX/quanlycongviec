import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

export function createDbPool(connectionString?: string) {
  const connStr =
    connectionString ||
    process.env.DATABASE_URL ||
    "postgres://workspace:workspace_dev_pwd@localhost:5432/workspace";

  const pool = new Pool({
    connectionString: connStr,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return pool;
}

export function createDbClient(poolOrConnectionString?: pg.Pool | string) {
  let pool: pg.Pool;
  if (!poolOrConnectionString || typeof poolOrConnectionString === "string") {
    pool = createDbPool(poolOrConnectionString);
  } else {
    pool = poolOrConnectionString;
  }

  return drizzle(pool, { schema });
}

export type Database = ReturnType<typeof createDbClient>;
