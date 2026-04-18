/**
 * 会員登録 Server Actions ユニットテスト
 *
 * registerFree は招待トークン必須化された（#4）。
 * テストはトークン検証のパターンを中心にカバーする。
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();
const mockInviteFindUnique = vi.fn();
const mockInviteUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
    inviteToken: {
      findUnique: mockInviteFindUnique,
      update: mockInviteUpdate,
    },
  },
}));

const { registerFree } = await import("@/server/actions/register");

const VALID_TOKEN = "valid-token";
const VALID_EMAIL = "invited@example.com";
const FAR_FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 1000);

function validInvite(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    token: VALID_TOKEN,
    email: VALID_EMAIL,
    role: "FREE_MEMBER",
    userId: null,
    usedAt: null,
    expiresAt: FAR_FUTURE,
    ...overrides,
  };
}

describe("registerFree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new-user" });
    mockInviteFindUnique.mockResolvedValue(validInvite());
    mockInviteUpdate.mockResolvedValue({});
  });

  test("有効な招待トークン + 一致する email で FREE_MEMBER を作成できる", async () => {
    const result = await registerFree(VALID_TOKEN, "テストユーザー", VALID_EMAIL, "password123");

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockUserCreate).toHaveBeenCalledOnce();
    expect(mockInviteUpdate).toHaveBeenCalledOnce();
    expect(mockInviteUpdate.mock.calls[0][0].data.usedAt).toBeInstanceOf(Date);
  });

  test("招待トークンが空の場合は拒否する", async () => {
    const result = await registerFree("", "テストユーザー", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockInviteFindUnique).not.toHaveBeenCalled();
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("存在しない招待トークンは拒否する", async () => {
    mockInviteFindUnique.mockResolvedValue(null);
    const result = await registerFree("does-not-exist", "テスト", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("使用済みトークンは拒否する", async () => {
    mockInviteFindUnique.mockResolvedValue(validInvite({ usedAt: new Date() }));
    const result = await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("期限切れトークンは拒否する", async () => {
    mockInviteFindUnique.mockResolvedValue(validInvite({ expiresAt: PAST }));
    const result = await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("トークンの email と入力 email が不一致の場合は拒否する", async () => {
    const result = await registerFree(VALID_TOKEN, "テスト", "other@example.com", "password123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("招待されたメールアドレス");
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("メールアドレスが大小文字違いでも一致と判定される", async () => {
    const result = await registerFree(VALID_TOKEN, "テスト", "INVITED@EXAMPLE.COM", "password123");

    expect(result.success).toBe(true);
    expect(mockUserCreate).toHaveBeenCalledOnce();
    expect(mockUserCreate.mock.calls[0][0].data.email).toBe(VALID_EMAIL);
  });

  test("招待の role が作成時に反映される（MEMBER 招待で MEMBER 作成）", async () => {
    mockInviteFindUnique.mockResolvedValue(validInvite({ role: "MEMBER" }));
    await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.role).toBe("MEMBER");
  });

  test("パスワードがハッシュ化される（平文でない）", async () => {
    await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "password123");

    const callArg = mockUserCreate.mock.calls[0][0];
    expect(callArg.data.password).not.toBe("password123");
    expect(callArg.data.password).toContain(":");
  });

  test("同 email の既存ユーザーがいる場合は拒否する", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing", email: VALID_EMAIL });

    const result = await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("パスワード 8 文字未満は拒否する", async () => {
    const result = await registerFree(VALID_TOKEN, "テスト", VALID_EMAIL, "short");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("名前が空の場合は拒否する", async () => {
    const result = await registerFree(VALID_TOKEN, "   ", VALID_EMAIL, "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  test("email が空の場合は拒否する", async () => {
    const result = await registerFree(VALID_TOKEN, "テスト", "", "password123");

    expect(result.success).toBe(false);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});
