/**
 * 会員登録 Server Actions ユニットテスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock Prisma
const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
  },
}));

const { registerFree } = await import("@/server/actions/register");

describe("registerFree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue(null); // デフォルト: ユーザーなし
    mockUserCreate.mockResolvedValue({});
  });

  test("有効なデータで Free メンバーを作成できる", async () => {
    const result = await registerFree("テストユーザー", "test@example.com", "password123");

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockUserCreate).toHaveBeenCalledOnce();
  });

  test("role が FREE_MEMBER になる", async () => {
    await registerFree("テストユーザー", "test@example.com", "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.role).toBe("FREE_MEMBER");
  });

  test("isActive が true になる", async () => {
    await registerFree("テストユーザー", "test@example.com", "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.isActive).toBe(true);
  });

  test("パスワードがハッシュ化される（平文でない）", async () => {
    await registerFree("テストユーザー", "test@example.com", "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.password).not.toBe("password123");
    expect(callArg.data.password).toContain(":");
  });

  test("メールアドレスが既存ユーザーと重複する場合はエラーを返す", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing-user", email: "existing@example.com" });

    const result = await registerFree("別ユーザー", "existing@example.com", "password123");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("パスワードが8文字未満の場合はエラーを返す", async () => {
    const result = await registerFree("テストユーザー", "test@example.com", "short");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("名前が空の場合はエラーを返す", async () => {
    const result = await registerFree("", "test@example.com", "password123");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("メールアドレスが空の場合はエラーを返す", async () => {
    const result = await registerFree("テストユーザー", "", "password123");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("メールアドレスが小文字に正規化される（大文字入力でも）", async () => {
    await registerFree("テストユーザー", "TEST@EXAMPLE.COM", "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.email).toBe("test@example.com");
  });
});
