import crypto from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { generateSecret, generateURI, verify as verifyTOTP } from "otplib";
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UserProfile,
  SessionInfo,
} from "@workspace/shared";

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string | null;
  timezone: string;
  locale: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  backupCodes: string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export class AuthService {
  // In-memory data store for self-contained runtime & testing (synchronizes with DB when connected)
  private users = new Map<string, UserEntity>();
  private sessions = new Map<string, SessionEntity>();
  private resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

  constructor() {
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    // 1 Owner
    await this.registerInternal({
      id: "usr-owner-1",
      email: "minhanh@workspace.vn",
      fullName: "Minh Anh",
      password: "Password123!",
    });
    // 2 Admins
    await this.registerInternal({
      id: "usr-admin-1",
      email: "nam.hoang@workspace.vn",
      fullName: "Hoàng Nam",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-admin-2",
      email: "trang.thuy@workspace.vn",
      fullName: "Thuỳ Trang",
      password: "Password123!",
    });
    // 5 Members
    await this.registerInternal({
      id: "usr-member-1",
      email: "tuan.quoc@workspace.vn",
      fullName: "Quốc Tuấn",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-member-2",
      email: "phuong.lan@workspace.vn",
      fullName: "Lan Phương",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-member-3",
      email: "huy.duc@workspace.vn",
      fullName: "Đức Huy",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-member-4",
      email: "ngoc.bich@workspace.vn",
      fullName: "Bích Ngọc",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-member-5",
      email: "dung.tien@workspace.vn",
      fullName: "Tiến Dũng",
      password: "Password123!",
    });
    // 2 Guests
    await this.registerInternal({
      id: "usr-guest-1",
      email: "partner.tech@external.vn",
      fullName: "Đối tác Công nghệ",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-guest-2",
      email: "consultant@expert.vn",
      fullName: "Chuyên gia Tư vấn",
      password: "Password123!",
    });
    // 2 Viewers
    await this.registerInternal({
      id: "usr-viewer-1",
      email: "intern1@workspace.vn",
      fullName: "Thực tập sinh 1",
      password: "Password123!",
    });
    await this.registerInternal({
      id: "usr-viewer-2",
      email: "intern2@workspace.vn",
      fullName: "Thực tập sinh 2",
      password: "Password123!",
    });
  }

  private async registerInternal(params: {
    id?: string;
    email: string;
    fullName: string;
    password?: string;
  }) {
    const passwordHash = params.password ? await hash(params.password) : "";
    const user: UserEntity = {
      id: params.id || crypto.randomUUID(),
      email: params.email.toLowerCase().trim(),
      passwordHash,
      fullName: params.fullName,
      avatarUrl: null,
      timezone: "Asia/Ho_Chi_Minh",
      locale: "vi-VN",
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  public hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  public toProfile(user: UserEntity): UserProfile {
    const initials = user.fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(-2)
      .join("")
      .toUpperCase();

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      initials: initials || "WA",
      timezone: user.timezone,
      locale: user.locale,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // FR-AUTH-01: Đăng ký email + mật khẩu
  public async register(
    input: RegisterInput
  ): Promise<{ user: UserProfile; sessionToken: string }> {
    const existing = Array.from(this.users.values()).find(
      (u) => u.email === input.email.toLowerCase().trim()
    );
    if (existing) {
      throw new Error("Email đã được đăng ký trong hệ thống");
    }

    const passwordHash = await hash(input.password);
    const user: UserEntity = {
      id: crypto.randomUUID(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      fullName: input.fullName.trim(),
      avatarUrl: null,
      timezone: "Asia/Ho_Chi_Minh",
      locale: "vi-VN",
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    const sessionToken = await this.createSession(user.id);
    return { user: this.toProfile(user), sessionToken };
  }

  // FR-AUTH-02: Đăng nhập email + mật khẩu kèm khoá 15 phút sau 5 lần sai
  public async login(
    input: LoginInput,
    ip?: string,
    userAgent?: string
  ): Promise<
    | { requires2FA: false; user: UserProfile; sessionToken: string }
    | { requires2FA: true; tempToken: string }
  > {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === input.email.toLowerCase().trim()
    );

    // Không tiết lộ email có tồn tại hay không (SPEC FR-AUTH-02)
    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // Kiểm tra khoá tài khoản
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(
        `Tài khoản tạm thời bị khoá do đăng nhập sai quá 5 lần. Vui lòng thử lại sau ${waitMinutes} phút.`
      );
    }

    // Kiểm tra mật khẩu
    const isValid = await verify(user.passwordHash, input.password);
    if (!isValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
        user.failedLoginAttempts = 0;
        throw new Error(
          "Đăng nhập sai 5 lần liên tiếp. Tài khoản đã bị khoá tạm thời trong 15 phút để bảo vệ an toàn."
        );
      }
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // Đăng nhập thành công -> reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    // FR-AUTH-05: 2FA TOTP
    if (user.twoFactorEnabled) {
      const tempToken = crypto.randomUUID();
      this.resetTokens.set(tempToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
      });
      return { requires2FA: true, tempToken };
    }

    const sessionToken = await this.createSession(user.id, input.rememberMe, ip, userAgent);
    return { requires2FA: false, user: this.toProfile(user), sessionToken };
  }

  // FR-AUTH-05: Xác thực mã 2FA
  public async verify2FA(
    tempToken: string,
    code: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ user: UserProfile; sessionToken: string }> {
    const record = this.resetTokens.get(tempToken);
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Phiên xác thực 2FA đã hết hạn hoặc không hợp lệ");
    }

    const user = this.users.get(record.userId);
    if (!user || !user.twoFactorSecret) {
      throw new Error("Thông tin người dùng không hợp lệ");
    }

    const verifyResult = await verifyTOTP({
      token: code,
      secret: user.twoFactorSecret,
    });
    const isValid = verifyResult.valid;

    if (!isValid) {
      // Kiểm tra xem có phải mã dự phòng (backup code) không
      const backupIndex = user.backupCodes.indexOf(code);
      if (backupIndex === -1) {
        throw new Error("Mã xác thực 2FA không chính xác");
      }
      // Dùng mã dự phòng xong thì thu hồi mã đó
      user.backupCodes.splice(backupIndex, 1);
    }

    this.resetTokens.delete(tempToken);
    const sessionToken = await this.createSession(user.id, false, ip, userAgent);
    return { user: this.toProfile(user), sessionToken };
  }

  // Cấu hình bật 2FA
  public generate2FASecret(userId: string): { secret: string; otpauthUrl: string } {
    const user = this.users.get(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: "Workspace",
      label: user.email,
      secret,
    });
    return { secret, otpauthUrl };
  }

  public async enable2FA(
    userId: string,
    secret: string,
    code: string
  ): Promise<{ backupCodes: string[] }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const verifyResult = await verifyTOTP({ token: code, secret });
    if (!verifyResult.valid) {
      throw new Error("Mã xác thực 6 chữ số không đúng. Vui lòng thử lại.");
    }

    // Sinh 10 mã dự phòng
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    user.backupCodes = backupCodes;

    return { backupCodes };
  }

  // FR-AUTH-04: Quên mật khẩu
  public async forgotPassword(email: string): Promise<string> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email.toLowerCase().trim()
    );
    const token = crypto.randomUUID();
    if (user) {
      this.resetTokens.set(token, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ (SPEC FR-AUTH-04)
      });
    }
    // Luôn trả về thông báo chung, không lộ email có tồn tại hay không
    return token;
  }

  // FR-AUTH-04: Đặt lại mật khẩu & thu hồi toàn bộ phiên cũ
  public async resetPassword(input: ResetPasswordInput): Promise<void> {
    const record = this.resetTokens.get(input.token);
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ");
    }

    const user = this.users.get(record.userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    user.passwordHash = await hash(input.newPassword);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    this.resetTokens.delete(input.token);

    // Thu hồi MỌI phiên cũ (SPEC FR-AUTH-04)
    this.revokeAllUserSessions(user.id);
  }

  // FR-AUTH-06: Quản lý phiên
  public async createSession(
    userId: string,
    rememberMe = false,
    ip?: string,
    userAgent?: string
  ): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresDays = rememberMe ? 30 : 1; // 30 ngày nếu nhớ tôi, 1 ngày nếu không
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const session: SessionEntity = {
      id: crypto.randomUUID(),
      userId,
      tokenHash,
      ipAddress: ip || "127.0.0.1",
      userAgent: userAgent || "Browser",
      lastActiveAt: new Date(),
      expiresAt,
      createdAt: new Date(),
    };

    this.sessions.set(tokenHash, session);
    return rawToken;
  }

  public async getSessionUser(rawToken: string): Promise<UserProfile | null> {
    const tokenHash = this.hashToken(rawToken);
    const session = this.sessions.get(tokenHash);
    if (!session || session.expiresAt < new Date()) {
      if (session) this.sessions.delete(tokenHash);
      return null;
    }

    session.lastActiveAt = new Date();
    const user = this.users.get(session.userId);
    return user ? this.toProfile(user) : null;
  }

  public async getUserById(userId: string): Promise<UserEntity | null> {
    return this.users.get(userId) || null;
  }

  public async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    this.sessions.delete(tokenHash);
  }

  public revokeAllUserSessions(userId: string): void {
    for (const [hash, sess] of this.sessions.entries()) {
      if (sess.userId === userId) {
        this.sessions.delete(hash);
      }
    }
  }

  public listSessions(userId: string, currentRawToken?: string): SessionInfo[] {
    const currentHash = currentRawToken ? this.hashToken(currentRawToken) : "";
    const result: SessionInfo[] = [];

    for (const sess of this.sessions.values()) {
      if (sess.userId === userId && sess.expiresAt > new Date()) {
        result.push({
          id: sess.id,
          ipAddress: sess.ipAddress,
          userAgent: sess.userAgent,
          lastActiveAt: sess.lastActiveAt.toISOString(),
          isCurrent: sess.tokenHash === currentHash,
        });
      }
    }

    return result.sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  }

  public revokeSession(userId: string, sessionId: string): void {
    for (const [hash, sess] of this.sessions.entries()) {
      if (sess.id === sessionId && sess.userId === userId) {
        this.sessions.delete(hash);
        return;
      }
    }
    throw new Error("Không tìm thấy phiên làm việc để thu hồi");
  }

  // FR-AUTH-07: Cập nhật hồ sơ
  public updateProfile(userId: string, input: UpdateProfileInput): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
    if (input.timezone !== undefined) user.timezone = input.timezone;
    if (input.locale !== undefined) user.locale = input.locale;
    user.updatedAt = new Date();

    return this.toProfile(user);
  }

  // FR-AUTH-08: Xoá tài khoản
  public async deleteAccount(userId: string, passwordConfirm: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const isValid = await verify(user.passwordHash, passwordConfirm);
    if (!isValid) {
      throw new Error("Mật khẩu xác nhận không đúng");
    }

    this.revokeAllUserSessions(userId);
    this.users.delete(userId);
  }
}

export const authService = new AuthService();
