/**
 * メンバー管理 Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { UserRole, AmbassadorType } from "@prisma/client";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockUserFindMany = vi.fn();
const mockUserUpdate = vi.fn();
const mockUserCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mockUserFindMany,
      update: mockUserUpdate,
      count: mockUserCount,
    },
  },
}));

const {
  getMembers,
  updateMemberActive,
  updateMemberRole,
  updateMemberInfo,
  getMemberStats,
  updateMemberAmbassadorType,
  getReferralReport,
} = await import("@/server/actions/members");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

describe("メンバー管理 Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
  });

  describe("getMembers", () => {
    test("ADMINはメンバー一覧を取得できる", async () => {
      const mockList = [
        { id: "user-1", email: "a@example.com", name: "テスト", isActive: true, role: "MEMBER" },
      ];
      mockUserFindMany.mockResolvedValue(mockList);

      const result = await getMembers();

      expect(result).toEqual(mockList);
      expect(mockUserFindMany).toHaveBeenCalledOnce();
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getMembers()).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateMemberActive", () => {
    test("ADMINはメンバーを無効化できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberActive("user-1", false);

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { isActive: false },
      });
    });

    test("ADMINはメンバーを有効化できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberActive("user-1", true);

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { isActive: true },
      });
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateMemberActive("user-1", false);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockUserUpdate.mockRejectedValue(new Error("DB error"));

      const result = await updateMemberActive("user-1", false);

      expect(result.success).toBe(false);
    });
  });

  describe("updateMemberRole", () => {
    test("ADMINはメンバーのロールをADMINに変更できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberRole("user-1", UserRole.ADMIN);

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { role: UserRole.ADMIN },
      });
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateMemberRole("user-1", UserRole.ADMIN);

      expect(result.success).toBe(false);
    });
  });

  describe("updateMemberInfo", () => {
    test("ADMINはメンバー名を更新できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberInfo("user-1", { name: "新しい名前" });

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { name: "新しい名前" },
      });
    });

    test("名前を null に更新できる（空文字 → null 変換）", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberInfo("user-1", { name: "" });

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { name: null },
      });
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateMemberInfo("user-1", { name: "test" });

      expect(result.success).toBe(false);
    });
  });

  describe("updateMemberAmbassadorType", () => {
    test("ADMINはアンバサダータイプをREFERRALに設定できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberAmbassadorType("user-1", AmbassadorType.REFERRAL);

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { ambassadorType: AmbassadorType.REFERRAL },
      });
    });

    test("ADMINはアンバサダータイプをnullに設定できる", async () => {
      mockUserUpdate.mockResolvedValue({});

      const result = await updateMemberAmbassadorType("user-1", null);

      expect(result.success).toBe(true);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { ambassadorType: null },
      });
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateMemberAmbassadorType("user-1", AmbassadorType.PARTNER);

      expect(result.success).toBe(false);
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockUserUpdate.mockRejectedValue(new Error("DB error"));

      const result = await updateMemberAmbassadorType("user-1", AmbassadorType.REFERRAL);

      expect(result.success).toBe(false);
    });
  });

  describe("getReferralReport", () => {
    test("ADMINは紹介レポートを取得できる", async () => {
      const mockReport = [
        {
          id: "user-1",
          name: "田中",
          email: "tanaka@example.com",
          ambassadorType: AmbassadorType.REFERRAL,
          referrals: [{ id: "user-2", name: "佐藤", email: "sato@example.com", role: "MEMBER", joinedAt: null, createdAt: new Date() }],
          _count: { referrals: 1 },
        },
      ];
      mockUserFindMany.mockResolvedValue(mockReport);

      const result = await getReferralReport();

      expect(result).toEqual(mockReport);
      expect(mockUserFindMany).toHaveBeenCalledOnce();
    });

    test("紹介実績がない場合は空配列を返す", async () => {
      mockUserFindMany.mockResolvedValue([]);

      const result = await getReferralReport();

      expect(result).toEqual([]);
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getReferralReport()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getMemberStats", () => {
    test("ADMINはメンバー統計を取得できる", async () => {
      mockUserCount
        .mockResolvedValueOnce(10)   // total
        .mockResolvedValueOnce(8)    // active
        .mockResolvedValueOnce(2);   // inactive

      const result = await getMemberStats();

      expect(result.total).toBe(10);
      expect(result.active).toBe(8);
      expect(result.inactive).toBe(2);
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getMemberStats()).rejects.toThrow("Unauthorized");
    });
  });
});
