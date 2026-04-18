/**
 * イベント Server Actions テスト（Lark Base ストレージ版）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { EventType } from "@/lib/content-types";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock settings
const mockGetSetting = vi.fn();
vi.mock("@/lib/settings", () => ({ getSetting: mockGetSetting }));

// Mock Lark
const mockCreateRecord = vi.fn();
const mockUpdateRecord = vi.fn();
const mockDeleteRecord = vi.fn();
const mockGetRecord = vi.fn();
const mockListAllRecords = vi.fn();
vi.mock("@/lib/lark", () => ({
  createRecord: mockCreateRecord,
  updateRecord: mockUpdateRecord,
  deleteRecord: mockDeleteRecord,
  getRecord: mockGetRecord,
  listAllRecords: mockListAllRecords,
}));

// Mock Prisma (for registration counts only)
const mockRegistrationGroupBy = vi.fn();
const mockRegistrationCount = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    eventRegistration: {
      groupBy: mockRegistrationGroupBy,
      count: mockRegistrationCount,
    },
  },
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createEvent, updateEvent, deleteEvent, getEventsForAdmin, getEventForAdmin, getUpcomingEventsForMember, getThisMonthEventsForMember, getPublishedEvent } =
  await import("@/server/actions/events");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

const baseEventInput = {
  title: "朝会テスト",
  eventType: EventType.MORNING_SESSION,
  startsAt: "2026-04-01T07:00:00",
  isPublished: false,
  registrationEnabled: false,
};

describe("イベント Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
    mockGetSetting.mockImplementation((key: string) => {
      if (key === "LARK_BASE_APP_TOKEN") return Promise.resolve("app-token-xxx");
      if (key === "LARK_EVENT_TABLE_ID") return Promise.resolve("tbl-event");
      return Promise.resolve(null);
    });
    mockRegistrationGroupBy.mockResolvedValue([]);
    mockRegistrationCount.mockResolvedValue(0);
  });

  describe("createEvent", () => {
    test("ADMINはイベントを作成できる", async () => {
      mockCreateRecord.mockResolvedValue("event-1");

      const result = await createEvent(baseEventInput);

      expect(result.success).toBe(true);
      expect(result.id).toBe("event-1");
      expect(mockCreateRecord).toHaveBeenCalledOnce();
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await createEvent(baseEventInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("タイトルが空の場合はバリデーションエラー", async () => {
      const result = await createEvent({ ...baseEventInput, title: "" });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("開始日時が空の場合はバリデーションエラー", async () => {
      const result = await createEvent({ ...baseEventInput, startsAt: "" });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("終了日時・場所付きでイベントを作成できる", async () => {
      mockCreateRecord.mockResolvedValue("event-2");

      const result = await createEvent({
        ...baseEventInput,
        endsAt: "2026-04-01T08:00:00",
        location: "Zoom",
        maxAttendees: 20,
        isPublished: true,
      });

      expect(result.success).toBe(true);
    });

    test("Lark APIエラーはエラーオブジェクトで返す", async () => {
      mockCreateRecord.mockRejectedValue(new Error("Lark connection error"));

      const result = await createEvent(baseEventInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Lark connection error");
    });

    test("Larkテーブルが未設定の場合はエラーを返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await createEvent(baseEventInput);

      expect(result.success).toBe(false);
    });
  });

  describe("updateEvent", () => {
    test("ADMINはイベントを更新できる", async () => {
      mockUpdateRecord.mockResolvedValue({});

      const result = await updateEvent("event-1", baseEventInput);

      expect(result.success).toBe(true);
      expect(mockUpdateRecord).toHaveBeenCalledWith(
        "app-token-xxx",
        "tbl-event",
        "event-1",
        expect.any(Object)
      );
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateEvent("event-1", baseEventInput);

      expect(result.success).toBe(false);
    });
  });

  describe("deleteEvent", () => {
    test("ADMINはイベントを削除できる", async () => {
      mockDeleteRecord.mockResolvedValue({});

      const result = await deleteEvent("event-1");

      expect(result.success).toBe(true);
      expect(mockDeleteRecord).toHaveBeenCalledWith("app-token-xxx", "tbl-event", "event-1");
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await deleteEvent("event-1");

      expect(result.success).toBe(false);
    });
  });

  describe("getEventsForAdmin", () => {
    test("ADMINはイベント一覧を取得できる", async () => {
      const mockRecord = {
        record_id: "event-1",
        fields: {
          title: "朝会",
          eventType: "MORNING_SESSION",
          startsAt: "2026-04-01T07:00:00.000Z",
          isPublished: "false",
          registrationEnabled: "false",
        },
      };
      mockListAllRecords.mockResolvedValue([mockRecord]);

      const result = await getEventsForAdmin();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("event-1");
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getEventsForAdmin()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getEventForAdmin", () => {
    test("ADMINはイベント詳細を取得できる", async () => {
      const mockRecord = {
        record_id: "event-1",
        fields: {
          title: "朝会",
          eventType: "MORNING_SESSION",
          startsAt: "2026-04-01T07:00:00.000Z",
          isPublished: "false",
          registrationEnabled: "false",
        },
      };
      mockGetRecord.mockResolvedValue(mockRecord);

      const result = await getEventForAdmin("event-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("event-1");
      expect(result?._count.registrations).toBe(0);
    });

    test("存在しないイベントは null を返す", async () => {
      mockGetRecord.mockResolvedValue(null);

      const result = await getEventForAdmin("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getUpcomingEventsForMember", () => {
    test("公開済みの近日イベントを取得できる", async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      const mockRecord = {
        record_id: "event-future",
        fields: { title: "近日イベント", eventType: "ONLINE_EVENT", startsAt: futureDate, isPublished: "true", registrationEnabled: "false" },
      };
      mockListAllRecords.mockResolvedValue([mockRecord]);

      const result = await getUpcomingEventsForMember();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("event-future");
    });

    test("過去のイベントは含まれない", async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const mockRecord = {
        record_id: "event-past",
        fields: { title: "過去のイベント", eventType: "ONLINE_EVENT", startsAt: pastDate, isPublished: "true", registrationEnabled: "false" },
      };
      mockListAllRecords.mockResolvedValue([mockRecord]);

      const result = await getUpcomingEventsForMember();

      expect(result).toHaveLength(0);
    });

    test("Larkテーブルが未設定の場合は空配列を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getUpcomingEventsForMember();

      expect(result).toEqual([]);
    });
  });

  describe("getThisMonthEventsForMember", () => {
    test("今月の公開済みイベントを取得できる", async () => {
      const now = new Date();
      const thisMonthDate = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();
      const mockRecord = {
        record_id: "event-month",
        fields: { title: "今月イベント", eventType: "ONLINE_EVENT", startsAt: thisMonthDate, isPublished: "true", registrationEnabled: "false" },
      };
      mockListAllRecords.mockResolvedValue([mockRecord]);

      const result = await getThisMonthEventsForMember();

      expect(result).toHaveLength(1);
    });

    test("Larkテーブルが未設定の場合は空配列を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getThisMonthEventsForMember();

      expect(result).toEqual([]);
    });
  });

  describe("getPublishedEvent", () => {
    test("公開済みの単一イベントを取得できる", async () => {
      const futureDate = new Date(Date.now() + 86400 * 1000).toISOString();
      const mockRecord = {
        record_id: "event-1",
        fields: { title: "公開イベント", eventType: "ONLINE_EVENT", startsAt: futureDate, isPublished: "true", registrationEnabled: "true" },
      };
      mockGetRecord.mockResolvedValue(mockRecord);

      const result = await getPublishedEvent("event-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("event-1");
    });

    test("存在しないイベントは null を返す", async () => {
      mockGetRecord.mockResolvedValue(null);

      const result = await getPublishedEvent("non-existent");

      expect(result).toBeNull();
    });

    test("Larkテーブルが未設定の場合は null を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getPublishedEvent("event-1");

      expect(result).toBeNull();
    });
  });
});
