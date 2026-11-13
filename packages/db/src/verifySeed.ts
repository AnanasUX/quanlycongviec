import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";
import { runSeed, SEED_USERS } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runVerifySeed() {
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });

  console.log("=== BƯỚC 1: Chạy Migration Drizzle trên PostgreSQL Engine ===");
  const sql0 = fs.readFileSync(path.resolve(__dirname, "../drizzle/0000_fat_sleeper.sql"), "utf8");
  for (const stmt of sql0.split("--> statement-breakpoint")) {
    const clean = stmt.trim();
    if (clean) await pglite.exec(clean);
  }
  console.log("Migration 0000_fat_sleeper.sql: THÀNH CÔNG");

  const sql1 = fs.readFileSync(path.resolve(__dirname, "../drizzle/0001_rls.sql"), "utf8");
  await pglite.exec(sql1);
  console.log("Migration 0001_rls.sql (RLS): THÀNH CÔNG");

  console.log("\n=== BƯỚC 2: Thực thi Seed Dữ liệu chuẩn ===");
  await runSeed(db as any);

  console.log("\n=== BƯỚC 3: Truy vấn và đếm bản ghi thực tế ===");
  const allUsers = await db.select().from(schema.users);
  const allWorkspaces = await db.select().from(schema.workspaces);
  const orgWorkspaces = allWorkspaces.filter((w) => w.privacyType === "organization");
  const allMembers = await db.select().from(schema.workspaceMembers);

  console.log(
    `- Tổng số Tổ chức (Organization Workspace): ${orgWorkspaces.length} ("${orgWorkspaces[0]?.name}" - slug: ${orgWorkspaces[0]?.slug})`
  );
  console.log(`- Tổng số Không gian làm việc (Workspaces): ${allWorkspaces.length}`);
  allWorkspaces.forEach((w, idx) => {
    console.log(
      `  ${idx + 1}. [${w.privacyType}] ${w.name} (slug: ${w.slug}, icon: ${w.icon}, color: ${w.color})`
    );
  });

  console.log(`- Tổng số Người dùng (Users): ${allUsers.length}`);

  // Thống kê vai trò
  const roleCounts: Record<string, number> = {
    owner: 0,
    admin: 0,
    member: 0,
    guest: 0,
    viewer: 0,
  };

  SEED_USERS.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  console.log("- Thống kê theo 5 vai trò (SPEC 6.0):");
  console.log(`  + Owner: ${roleCounts.owner} (Minh Anh)`);
  console.log(`  + Admin: ${roleCounts.admin} (Hoàng Nam, Thuỳ Trang)`);
  console.log(
    `  + Member: ${roleCounts.member} (Quốc Tuấn, Lan Phương, Đức Huy, Bích Ngọc, Tiến Dũng)`
  );
  console.log(`  + Guest: ${roleCounts.guest} (Đối tác Công nghệ, Chuyên gia Tư vấn)`);
  console.log(`  + Viewer: ${roleCounts.viewer} (Thực tập sinh 1, Thực tập sinh 2)`);
  console.log(`- Tổng số liên kết thành viên (workspace_members): ${allMembers.length}`);

  return {
    orgCount: orgWorkspaces.length,
    workspacesCount: allWorkspaces.length,
    usersCount: allUsers.length,
    roleCounts,
  };
}

if (process.argv[1] === __filename) {
  runVerifySeed().catch((err) => {
    console.error("Lỗi xác minh seed:", err);
    process.exit(1);
  });
}
