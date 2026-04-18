/**
 * 今日のコンテンツ Server Actions テスト（Lark Base ストレージ版）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock settings
const mockGetSetting = vi.fn();
vi.mock("@/lib/settings", () => ({ getSetting: mockGetSetting }));

// Mock Lark
const mockListRecords = vi.fn();
const mockCreateRecord = vi.fn();
const mockUpdateRecord = vi.fn();
const mockListAllRecords = vi.fn();
vi.mock("@/lib/lark", () => ({
  listRecords: mockListRecords,
  createRecord: mockCreateRecord,
  updateRecord: mockUpdateRecord,
  listAllRecords: mockListAllRecords,
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { upsertTodayContent, getTodayContentForAdmin, getTodayContentForMember, getTodayThemeForDate } =
  await import("@/server/actions/today");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

const baseTodayInput = {
  date: "2026-03-24",
  energyShare: "今日は穏やかなエネルギーです",
  journalingTheme: "今日大切にしたいことは何ですか？",
  isPublished: false,
};

describe("今日のコンテンツ Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
    mockGetSetting.mockImplementation((key: string) => {
      if (key === "LARK_BASE_APP_TOKEN") return Promise.resolve("app-token-xxx");
      if (key === "LARK_TODAY_CONTENT_TABLE_ID") return Promise.resolve("tbl-today");
      return Promise.resolve(null);
    });
    mockListAllRecords.mockResolvedValue([]);
  });

  describe("upsertTodayContent", () => {
    test("ADMINは今日のコンテンツを保存できる", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockResolvedValue("rec-new");

      const result = await upsertTodayContent(baseTodayInput);

      expect(result.success).toBe(true);
      expect(mockCreateRecord).toHaveBeenCalledOnce();
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await upsertTodayContent(baseTodayInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("日付が空の場合はバリデーションエラー", async () => {
      const result = await upsertTodayContent({ ...baseTodayInput, date: "" });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("公開設定で保存すると publishedAt が設定される", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockResolvedValue("rec-new");

      const result = await upsertTodayContent({ ...baseTodayInput, isPublished: true });

      expect(result.success).toBe(true);
      const callFields = mockCreateRecord.mock.calls[0][2];
      expect(callFields.publishedAt).toBeTruthy();
    });

    test("非公開設定で保存すると publishedAt が空文字になる", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockResolvedValue("rec-new");

      const result = await upsertTodayContent({ ...baseTodayInput, isPublished: false });

      expect(result.success).toBe(true);
      const callFields = mockCreateRecord.mock.calls[0][2];
      expect(callFields.publishedAt).toBe("");
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockRejectedValue(new Error("Lark API error"));

      const result = await upsertTodayContent(baseTodayInput);

      expect(result.success).toBe(false);
    });

    test("既存レコードがある場合は更新する", async () => {
      mockListRecords.mockResolvedValue({
        records: [{ record_id: "rec-existing", fields: { date: "2026-03-24" } }],
      });
      mockUpdateRecord.mockResolvedValue({});

      const result = await upsertTodayContent(baseTodayInput);

      expect(result.success).toBe(true);
      expect(mockUpdateRecord).toHaveBeenCalledOnce();
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("Larkテーブルが未設定の場合はエラーを返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await upsertTodayContent(baseTodayInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("getTodayContentForAdmin", () => {
    test("ADMINは今日のコンテンツを取得できる", async () => {
      const mockRecord = {
        record_id: "today-1",
        fields: {
          energyShare: "穏やか",
          date: "2026-03-24",
          isPublished: "false",
        },
      };
      mockListRecords.mockResolvedValue({ records: [mockRecord] });

      const result = await getTodayContentForAdmin("2026-03-24");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("today-1");
      expect(mockListRecords).toHaveBeenCalledOnce();
    });

    test("日付省略時は今日の日付で検索する", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      await getTodayContentForAdmin();

      expect(mockListRecords).toHaveBeenCalledOnce();
    });

    test("レコードが存在しない場合は null を返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await getTodayContentForAdmin("2026-03-24");

      expect(result).toBeNull();
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getTodayContentForAdmin()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getTodayContentForMember", () => {
    test("今日の公開コンテンツを取得できる", async () => {
      const mockRecord = {
        record_id: "today-1",
        fields: { energyShare: "穏やか", date: "2026-03-24", isPublished: "true" },
      };
      mockListRecords.mockResolvedValue({ records: [mockRecord] });

      const result = await getTodayContentForMember();

      expect(result).not.toBeNull();
      expect(result?.id).toBe("today-1");
    });

    test("今日の公開コンテンツがない場合は最新コンテンツを返す", async () => {
      // 今日はなし
      mockListRecords.mockResolvedValue({ records: [] });
      // listAllRecords は最新を返す
      mockListAllRecords.mockResolvedValueOnce([
        { record_id: "old-1", fields: { energyShare: "元気", date: "2026-03-20", isPublished: "true" } },
      ]);

      const result = await getTodayContentForMember();

      expect(result).not.toBeNull();
    });

    test("Larkテーブルが未設定の場合は null を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getTodayContentForMember();

      expect(result).toBeNull();
    });
  });

  describe("getTodayThemeForDate", () => {
    test("特定日付のジャーナリングテーマを取得できる", async () => {
      const mockRecord = {
        record_id: "today-1",
        fields: { journalingTheme: "今日の気づきは何ですか？", date: "2026-03-24" },
      };
      mockListRecords.mockResolvedValue({ records: [mockRecord] });

      const result = await getTodayThemeForDate("2026-03-24");

      expect(result).toBe("今日の気づきは何ですか？");
    });

    test("レコードが存在しない場合は null を返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await getTodayThemeForDate("2026-03-24");

      expect(result).toBeNull();
    });

    test("Larkテーブルが未設定の場合は null を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getTodayThemeForDate("2026-03-24");

      expect(result).toBeNull();
    });
  });
});
