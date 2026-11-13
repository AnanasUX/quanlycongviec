import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

describe("PostgreSQL Row Level Security (RLS) Direct SQL Test (SPEC 6.0 & 7.1)", () => {
  let db: PGlite;

  const userAId = "11111111-1111-1111-1111-111111111111";
  const userBId = "22222222-2222-2222-2222-222222222222";
  const wsAId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const wsBId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  beforeAll(async () => {
    db = new PGlite();

    // 1. Chạy migration tạo bảng
    const migrationPath1 = path.resolve(__dirname, "../drizzle/0000_fat_sleeper.sql");
    const sql1 = fs.readFileSync(migrationPath1, "utf8");
    for (const stmt of sql1.split("--> statement-breakpoint")) {
      const clean = stmt.trim();
      if (clean) await db.exec(clean);
    }

    // 2. Chạy migration bật RLS
    const migrationPath2 = path.resolve(__dirname, "../drizzle/0001_rls.sql");
    const sql2 = fs.readFileSync(migrationPath2, "utf8");
    await db.exec(sql2);

    // 3. Chèn 2 người dùng mẫu
    await db.query(`
      INSERT INTO users (id, email, full_name, password_hash)
      VALUES 
        ('${userAId}', 'usera@workspace.vn', 'User A', 'hashA'),
        ('${userBId}', 'userb@workspace.vn', 'User B', 'hashB');
    `);

    // 4. Chèn 2 không gian làm việc riêng tư (Private)
    await db.query(`
      INSERT INTO workspaces (id, slug, name, privacy_type, created_by)
      VALUES
        ('${wsAId}', 'ws-a', 'Không Gian Của A', 'private', '${userAId}'),
        ('${wsBId}', 'ws-b', 'Không Gian Của B', 'private', '${userBId}');
    `);

    // 5. Chèn thành viên tương ứng
    await db.query(`
      INSERT INTO workspace_members (id, workspace_id, user_id, role)
      VALUES
        (gen_random_uuid(), '${wsAId}', '${userAId}', 'owner'),
        (gen_random_uuid(), '${wsBId}', '${userBId}', 'owner');
    `);

    // 6. Tạo role phi superuser app_user (SPEC 7.1: Superuser luôn bypass RLS theo PostgreSQL core, application cần chạy qua non-superuser role)
    await db.exec(`
      CREATE ROLE app_user NOSUPERUSER;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
      SET ROLE app_user;
    `);
  });

  it("RLS: Người dùng A chỉ đọc được Không Gian A, KHÔNG đọc được Không Gian B trong SQL", async () => {
    // Giả lập ngữ cảnh phiên đăng nhập của User A qua biến cấu hình PostgreSQL
    await db.exec(`SET app.current_user_id = '${userAId}';`);

    const result = await db.query<{ id: string; name: string }>("SELECT id, name FROM workspaces;");
    const workspaceIds = result.rows.map((r) => r.id);

    expect(workspaceIds).toContain(wsAId);
    expect(workspaceIds).not.toContain(wsBId);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe("Không Gian Của A");
  });

  it("RLS: Người dùng B chỉ đọc được Không Gian B, KHÔNG đọc được Không Gian A trong SQL", async () => {
    // Giả lập ngữ cảnh phiên đăng nhập của User B
    await db.exec(`SET app.current_user_id = '${userBId}';`);

    const result = await db.query<{ id: string; name: string }>("SELECT id, name FROM workspaces;");
    const workspaceIds = result.rows.map((r) => r.id);

    expect(workspaceIds).toContain(wsBId);
    expect(workspaceIds).not.toContain(wsAId);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe("Không Gian Của B");
  });

  it("RLS: Người dùng A không xem được danh sách thành viên của Không Gian B", async () => {
    await db.exec(`SET app.current_user_id = '${userAId}';`);

    const result = await db.query<{ workspace_id: string; user_id: string }>(
      "SELECT workspace_id, user_id FROM workspace_members;"
    );
    const workspaceIds = result.rows.map((r) => r.workspace_id);

    expect(workspaceIds).toContain(wsAId);
    expect(workspaceIds).not.toContain(wsBId);
  });
});
