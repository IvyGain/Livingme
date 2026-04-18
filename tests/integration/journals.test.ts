/**
 * I-004: ジャーナリング Server Action テスト（Lark Base ストレージ版）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock settings
const mockGetSetting = vi.fn();
vi.mock("@/lib/settings", () => ({ getSetting: mockGetSetting }));

// Mock lark
const mockListRecords = vi.fn();
const mockCreateRecord = vi.fn();
const mockUpdateRecord = vi.fn();
const mockDeleteRecord = vi.fn();
vi.mock("@/lib/lark", () => ({
  listRecords: mockListRecords,
  createRecord: mockCreateRecord,
  updateRecord: mockUpdateRecord,
  deleteRecord: mockDeleteRecord,
}));

// Mock revalidatePath (next/cache)
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Import after mocks
const { upsertJournal, deleteJournal, getJournals, getJournalByDate } = await import("@/server/actions/journals");

const mockSession = {
  user: { id: "user-123", role: "MEMBER", name: "テストユーザー" },
};

describe("I-004: ジャーナリング Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
    mockGetSetting.mockImplementation((key: string) => {
      if (key === "LARK_BASE_APP_TOKEN") return Promise.resolve("app-token-xxx");
      if (key === "LARK_JOURNAL_TABLE_ID") return Promise.resolve("tbl-xxx");
      return Promise.resolve(null);
    });
  });

  describe("upsertJournal", () => {
    test("新規ジャーナルを保存できる", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockResolvedValue({ record_id: "rec-1" });

      const result = await upsertJournal({
        body: "今日の気づき",
        mood: "😊 穏やか",
        date: "2026-03-20",
      });

      expect(result.success).toBe(true);
      expect(mockCreateRecord).toHaveBeenCalledOnce();
      expect(mockUpdateRecord).not.toHaveBeenCalled();
    });

    test("既存レコードがある場合は更新する", async () => {
      mockListRecords.mockResolvedValue({
        records: [{ record_id: "rec-1", fields: { userId: "user-123", date: "2026-03-20" } }],
      });
      mockUpdateRecord.mockResolvedValue({});

      const result = await upsertJournal({
        body: "更新した内容",
        date: "2026-03-20",
      });

      expect(result.success).toBe(true);
      expect(mockUpdateRecord).toHaveBeenCalledOnce();
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("body が空の場合はエラーを返す", async () => {
      const result = await upsertJournal({ body: "  ", date: "2026-03-20" });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("date を省略すると今日の日付で保存される", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockResolvedValue({ record_id: "rec-2" });

      const result = await upsertJournal({ body: "今日の日記" });

      expect(result.success).toBe(true);
      expect(mockCreateRecord).toHaveBeenCalledWith(
        "app-token-xxx",
        "tbl-xxx",
        expect.objectContaining({
          userId: "user-123",
          body: "今日の日記",
        })
      );
    });

    test("未認証ユーザーはエラーを返す", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await upsertJournal({ body: "テスト" });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("Lark API エラーが発生してもエラーオブジェクトを返す（クラッシュしない）", async () => {
      mockListRecords.mockResolvedValue({ records: [] });
      mockCreateRecord.mockRejectedValue(new Error("Lark API connection failed"));

      const result = await upsertJournal({ body: "テスト" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Lark API connection failed");
    });

    test("Lark テーブルが未設定の場合はエラーを返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await upsertJournal({ body: "テスト" });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("deleteJournal", () => {
    test("自分のジャーナルを削除できる", async () => {
      mockListRecords.mockResolvedValue({
        records: [{ record_id: "rec-1", fields: { userId: "user-123" } }],
      });
      mockDeleteRecord.mockResolvedValue({});

      const result = await deleteJournal("rec-1");

      expect(result.success).toBe(true);
      expect(mockDeleteRecord).toHaveBeenCalledWith("app-token-xxx", "tbl-xxx", "rec-1");
    });

    test("他人のジャーナルは削除できない", async () => {
      // 実際のLark APIはuserId="user-123"でフィルターするため
      // 他のユーザーのレコードは返ってこない（空リスト）
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await deleteJournal("rec-2");

      expect(result.success).toBe(false);
      expect(mockDeleteRecord).not.toHaveBeenCalled();
    });

    test("存在しないレコードはエラーを返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await deleteJournal("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("getJournals", () => {
    test("ユーザーIDでジャーナル一覧を取得できる", async () => {
      const mockRecords = [
        { record_id: "rec-1", fields: { body: "今日の気づき", mood: "😊", date: "2026-03-24", userId: "user-123" } },
        { record_id: "rec-2", fields: { body: "昨日の振り返り", mood: "🌙", date: "2026-03-23", userId: "user-123" } },
      ];
      mockListRecords.mockResolvedValue({ records: mockRecords });

      const result = await getJournals("user-123");

      expect(result).toHaveLength(2);
      expect(result[0].body).toBe("今日の気づき");
    });

    test("Larkテーブルが未設定の場合は空配列を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getJournals("user-123");

      expect(result).toEqual([]);
    });

    test("ジャーナルがない場合は空配列を返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await getJournals("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("getJournalByDate", () => {
    test("特定日付のジャーナルを取得できる", async () => {
      mockListRecords.mockResolvedValue({
        records: [{ record_id: "rec-1", fields: { body: "今日の日記", mood: "😊", userId: "user-123", date: "2026-03-24" } }],
      });

      const result = await getJournalByDate("user-123", "2026-03-24");

      expect(result).not.toBeNull();
      expect(result?.body).toBe("今日の日記");
    });

    test("該当する日付のジャーナルがない場合は null を返す", async () => {
      mockListRecords.mockResolvedValue({ records: [] });

      const result = await getJournalByDate("user-123", "2026-03-24");

      expect(result).toBeNull();
    });

    test("Larkテーブルが未設定の場合は null を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getJournalByDate("user-123", "2026-03-24");

      expect(result).toBeNull();
    });
  });
});
