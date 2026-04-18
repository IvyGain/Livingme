/**
 * イベント登録 Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock getPublishedEvent from events actions (uses Lark API)
const mockGetPublishedEvent = vi.fn();
vi.mock("@/server/actions/events", () => ({
  getPublishedEvent: mockGetPublishedEvent,
}));

// Mock Prisma (for registration operations)
const mockRegistrationCount = vi.fn();
const mockRegistrationCreate = vi.fn();
const mockRegistrationDelete = vi.fn();
const mockRegistrationFindUnique = vi.fn();
const mockRegistrationFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    eventRegistration: {
      count: mockRegistrationCount,
      create: mockRegistrationCreate,
      delete: mockRegistrationDelete,
      findUnique: mockRegistrationFindUnique,
      findMany: mockRegistrationFindMany,
    },
  },
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const {
  registerForEvent,
  cancelRegistration,
  getMyRegistration,
  getEventRegistrationsForAdmin,
} = await import("@/server/actions/registrations");

const memberSession = { user: { id: "user-1", role: "MEMBER" } };
const adminSession = { user: { id: "admin-1", role: "ADMIN" } };

const baseEvent = {
  id: "event-1",
  registrationEnabled: true,
  maxAttendees: null,
};

describe("イベント登録 Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(memberSession);
  });

  describe("registerForEvent", () => {
    test("認証済みユーザーがイベントに登録できる", async () => {
      mockGetPublishedEvent.mockResolvedValue(baseEvent);
      mockRegistrationCreate.mockResolvedValue({});

      const result = await registerForEvent("event-1", { name: "テスト" });

      expect(result.success).toBe(true);
      expect(mockRegistrationCreate).toHaveBeenCalledWith({
        data: { eventId: "event-1", userId: "user-1", answers: { name: "テスト" } },
      });
    });

    test("未認証ユーザーはエラーを返す", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await registerForEvent("event-1", {});

      expect(result.success).toBe(false);
      expect(mockRegistrationCreate).not.toHaveBeenCalled();
    });

    test("存在しないイベントはエラーを返す", async () => {
      mockGetPublishedEvent.mockResolvedValue(null);

      const result = await registerForEvent("non-existent", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("見つかりません");
    });

    test("申込受付中でないイベントはエラーを返す", async () => {
      mockGetPublishedEvent.mockResolvedValue({ ...baseEvent, registrationEnabled: false });

      const result = await registerForEvent("event-1", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("申込受付");
    });

    test("定員に達している場合はエラーを返す", async () => {
      mockGetPublishedEvent.mockResolvedValue({ ...baseEvent, maxAttendees: 10 });
      mockRegistrationCount.mockResolvedValue(10);

      const result = await registerForEvent("event-1", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("定員");
    });

    test("定員に余裕がある場合は登録できる", async () => {
      mockGetPublishedEvent.mockResolvedValue({ ...baseEvent, maxAttendees: 10 });
      mockRegistrationCount.mockResolvedValue(9);
      mockRegistrationCreate.mockResolvedValue({});

      const result = await registerForEvent("event-1", {});

      expect(result.success).toBe(true);
    });

    test("重複登録はエラーを返す（Unique constraint）", async () => {
      mockGetPublishedEvent.mockResolvedValue(baseEvent);
      mockRegistrationCreate.mockRejectedValue(new Error("Unique constraint failed"));

      const result = await registerForEvent("event-1", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("申し込み済み");
    });
  });

  describe("cancelRegistration", () => {
    test("認証済みユーザーが登録をキャンセルできる", async () => {
      mockRegistrationDelete.mockResolvedValue({});

      const result = await cancelRegistration("event-1");

      expect(result.success).toBe(true);
      expect(mockRegistrationDelete).toHaveBeenCalledWith({
        where: { eventId_userId: { eventId: "event-1", userId: "user-1" } },
      });
    });

    test("未認証ユーザーはエラーを返す", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await cancelRegistration("event-1");

      expect(result.success).toBe(false);
    });

    test("DB エラーはエラーオブジェクトで返す", async () => {
      mockRegistrationDelete.mockRejectedValue(new Error("not found"));

      const result = await cancelRegistration("event-1");

      expect(result.success).toBe(false);
    });
  });

  describe("getMyRegistration", () => {
    test("自分の登録情報を取得できる", async () => {
      const mockReg = { eventId: "event-1", userId: "user-1" };
      mockRegistrationFindUnique.mockResolvedValue(mockReg);

      const result = await getMyRegistration("event-1");

      expect(result).toEqual(mockReg);
    });

    test("未認証ユーザーは null を返す", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getMyRegistration("event-1");

      expect(result).toBeNull();
    });
  });

  describe("getEventRegistrationsForAdmin", () => {
    test("ADMINはイベント登録一覧を取得できる", async () => {
      mockAuth.mockResolvedValue(adminSession);
      const mockList = [{ eventId: "event-1", userId: "user-1", user: { name: "テスト" } }];
      mockRegistrationFindMany.mockResolvedValue(mockList);

      const result = await getEventRegistrationsForAdmin("event-1");

      expect(result).toEqual(mockList);
    });

    test("ADMINでないとエラーを投げる", async () => {
      await expect(getEventRegistrationsForAdmin("event-1")).rejects.toThrow("管理者権限");
    });
  });
});
