/**
 * パスワード変更・リセット Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockVerificationTokenDeleteMany = vi.fn();
const mockVerificationTokenCreate = vi.fn();
const mockVerificationTokenFindUnique = vi.fn();
const mockVerificationTokenDelete = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
    },
    verificationToken: {
      deleteMany: mockVerificationTokenDeleteMany,
      create: mockVerificationTokenCreate,
      findUnique: mockVerificationTokenFindUnique,
      delete: mockVerificationTokenDelete,
    },
  },
}));

// Mock password functions
const mockVerifyPassword = vi.fn();
const mockHashPassword = vi.fn();
vi.mock("@/lib/password", () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mockHashPassword,
}));

// Mock email
const mockSendEmail = vi.fn();
vi.mock("@/lib/email", () => ({ sendEmail: mockSendEmail }));

const { changePassword, requestPasswordReset, resetPassword } =
  await import("@/server/actions/password-change");

const memberSession = { user: { id: "user-1", role: "MEMBER" } };

describe("パスワード変更・リセット Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(memberSession);
    mockHashPassword.mockResolvedValue("hashed-password");
    mockSendEmail.mockResolvedValue(undefined);
  });

  describe("changePassword", () => {
    test("正しい現在のパスワードで変更できる", async () => {
      mockUserFindUnique.mockResolvedValue({ password: "hashed-current" });
      mockVerifyPassword.mockResolvedValue(true);
      mockUserUpdate.mockResolvedValue({});

      const result = await changePassword("currentPass", "newPassword123");

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledOnce();
    });

    test("未認証ユーザーはエラーを返す", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await changePassword("current", "newPass123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("ログイン");
    });

    test("パスワード未設定アカウントはエラーを返す", async () => {
      mockUserFindUnique.mockResolvedValue({ password: null });

      const result = await changePassword("current", "newPass123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("パスワード認証");
    });

    test("新パスワードが8文字未満はエラーを返す", async () => {
      mockUserFindUnique.mockResolvedValue({ password: "hashed" });

      const result = await changePassword("current", "short");

      expect(result.success).toBe(false);
      expect(result.error).toContain("8文字");
    });

    test("現在のパスワードが間違っている場合はエラーを返す", async () => {
      mockUserFindUnique.mockResolvedValue({ password: "hashed-current" });
      mockVerifyPassword.mockResolvedValue(false);

      const result = await changePassword("wrongPass", "newPassword123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("正しくありません");
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockUserFindUnique.mockRejectedValue(new Error("DB error"));

      const result = await changePassword("current", "newPass123");

      expect(result.success).toBe(false);
    });
  });

  describe("requestPasswordReset", () => {
    test("存在するメールアドレスにリセットメールを送信する", async () => {
      mockUserFindUnique.mockResolvedValue({ id: "user-1" });
      mockVerificationTokenDeleteMany.mockResolvedValue({});
      mockVerificationTokenCreate.mockResolvedValue({});

      const result = await requestPasswordReset("test@example.com");

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledOnce();
    });

    test("存在しないメールアドレスでも成功を返す（列挙防止）", async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const result = await requestPasswordReset("notfound@example.com");

      expect(result.success).toBe(true);
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockUserFindUnique.mockRejectedValue(new Error("DB error"));

      const result = await requestPasswordReset("test@example.com");

      expect(result.success).toBe(false);
    });
  });

  describe("resetPassword", () => {
    const validToken = "valid-token-hex";
    const futureDate = new Date(Date.now() + 3600 * 1000);

    test("有効なトークンでパスワードをリセットできる", async () => {
      mockVerificationTokenFindUnique.mockResolvedValue({
        token: validToken,
        identifier: "reset:test@example.com",
        expires: futureDate,
      });
      mockUserUpdate.mockResolvedValue({});
      mockVerificationTokenDelete.mockResolvedValue({});

      const result = await resetPassword(validToken, "newPassword123");

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledOnce();
    });

    test("パスワードが8文字未満はエラーを返す", async () => {
      const result = await resetPassword(validToken, "short");

      expect(result.success).toBe(false);
      expect(result.error).toContain("8文字");
    });

    test("存在しないトークンはエラーを返す", async () => {
      mockVerificationTokenFindUnique.mockResolvedValue(null);

      const result = await resetPassword("invalid-token", "newPass123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("無効");
    });

    test("期限切れトークンはエラーを返す", async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockVerificationTokenFindUnique.mockResolvedValue({
        token: validToken,
        identifier: "reset:test@example.com",
        expires: pastDate,
      });
      mockVerificationTokenDelete.mockResolvedValue({});

      const result = await resetPassword(validToken, "newPass123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("有効期限");
    });

    test("reset:プレフィックスのないトークンはエラーを返す", async () => {
      mockVerificationTokenFindUnique.mockResolvedValue({
        token: validToken,
        identifier: "other:test@example.com",
        expires: futureDate,
      });

      const result = await resetPassword(validToken, "newPass123");

      expect(result.success).toBe(false);
    });
  });
});
