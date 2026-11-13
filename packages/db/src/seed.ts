import { hash } from "@node-rs/argon2";
import { createDbClient } from "./client.js";
import { users, workspaces, workspaceMembers } from "./schema.js";

export interface SeedUserDef {
  email: string;
  fullName: string;
  role: "owner" | "admin" | "member" | "guest" | "viewer";
  avatarUrl?: string;
}

export const SEED_USERS: SeedUserDef[] = [
  // 1 Owner
  { email: "minhanh@workspace.vn", fullName: "Minh Anh", role: "owner" },
  // 2 Admins
  { email: "nam.hoang@workspace.vn", fullName: "Hoàng Nam", role: "admin" },
  { email: "trang.thuy@workspace.vn", fullName: "Thuỳ Trang", role: "admin" },
  // 5 Members
  { email: "tuan.quoc@workspace.vn", fullName: "Quốc Tuấn", role: "member" },
  { email: "phuong.lan@workspace.vn", fullName: "Lan Phương", role: "member" },
  { email: "huy.duc@workspace.vn", fullName: "Đức Huy", role: "member" },
  { email: "ngoc.bich@workspace.vn", fullName: "Bích Ngọc", role: "member" },
  { email: "dung.tien@workspace.vn", fullName: "Tiến Dũng", role: "member" },
  // 2 Guests
  { email: "partner.tech@external.vn", fullName: "Đối tác Công nghệ", role: "guest" },
  { email: "consultant@expert.vn", fullName: "Chuyên gia Tư vấn", role: "guest" },
  // 2 Viewers
  { email: "intern1@workspace.vn", fullName: "Thực tập sinh 1", role: "viewer" },
  { email: "intern2@workspace.vn", fullName: "Thực tập sinh 2", role: "viewer" },
];

export const SEED_WORKSPACES = [
  {
    slug: "cong-ty",
    name: "Công ty Workspace",
    icon: "Building2",
    color: "#7766e9",
    description: "Không gian làm việc chung toàn tổ chức",
    privacyType: "organization" as const,
  },
  {
    slug: "du-an-san-pham",
    name: "Dự án Sản phẩm",
    icon: "FolderGit2",
    color: "#3b82f6",
    description: "Không gian phát triển sản phẩm công nghệ",
    privacyType: "private" as const,
  },
  {
    slug: "marketing",
    name: "Marketing & Truyền thông",
    icon: "Megaphone",
    color: "#ec4899",
    description: "Chiến dịch marketing và thương hiệu",
    privacyType: "private" as const,
  },
  {
    slug: "nhan-su",
    name: "Nhân sự & Văn hoá",
    icon: "Users",
    color: "#10b981",
    description: "Quản trị nhân sự, tuyển dụng và văn hoá doanh nghiệp",
    privacyType: "private" as const,
  },
];

export async function runSeed(dbInstance?: ReturnType<typeof createDbClient>) {
  const db = dbInstance || createDbClient();
  const defaultPasswordHash = await hash("Password123!");

  console.log("Seeding 12 users...");
  const createdUsers: Array<{ id: string; email: string; fullName: string; role: string }> = [];

  for (const u of SEED_USERS) {
    const [inserted] = await db
      .insert(users)
      .values({
        email: u.email,
        passwordHash: defaultPasswordHash,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl || null,
        timezone: "Asia/Ho_Chi_Minh",
        locale: "vi-VN",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { fullName: u.fullName, passwordHash: defaultPasswordHash },
      })
      .returning();

    createdUsers.push({
      id: inserted.id,
      email: inserted.email,
      fullName: inserted.fullName,
      role: u.role,
    });
  }

  const ownerUser = createdUsers.find((u) => u.role === "owner") || createdUsers[0];

  console.log("Seeding 4 workspaces...");
  for (const ws of SEED_WORKSPACES) {
    const [insertedWs] = await db
      .insert(workspaces)
      .values({
        slug: ws.slug,
        name: ws.name,
        icon: ws.icon,
        color: ws.color,
        description: ws.description,
        privacyType: ws.privacyType,
        createdBy: ownerUser.id,
      })
      .onConflictDoUpdate({
        target: workspaces.slug,
        set: { name: ws.name, color: ws.color, description: ws.description },
      })
      .returning();

    // Thêm các thành viên vào workspace
    for (const u of createdUsers) {
      await db
        .insert(workspaceMembers)
        .values({
          workspaceId: insertedWs.id,
          userId: u.id,
          role: u.role,
        })
        .onConflictDoNothing();
    }
  }

  console.log("Seed completed successfully!");
  return { usersCount: createdUsers.length, workspacesCount: SEED_WORKSPACES.length };
}
