/**
 * アーカイブ Server Actions テスト（Lark Base ストレージ版）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { ArchiveCategory } from "@/lib/content-types";

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

// Mock revalidatePath
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createArchive, updateArchive, deleteArchive, getArchivesForAdmin, getArchiveForAdmin, getPublishedArchives, getPublishedArchive } =
  await import("@/server/actions/archives");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

const baseArchiveInput = {
  title: "朝会テスト",
  date: "2026-03-20",
  category: ArchiveCategory.MORNING_SESSION,
  isPublished: false,
  tags: [],
};

describe("アーカイブ Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
    mockGetSetting.mockImplementation((key: string) => {
      if (key === "LARK_BASE_APP_TOKEN") return Promise.resolve("app-token-xxx");
      if (key === "LARK_ARCHIVE_TABLE_ID") return Promise.resolve("tbl-archive");
      return Promise.resolve(null);
    });
  });

  describe("createArchive", () => {
    test("ADMINはアーカイブを作成できる", async () => {
      mockCreateRecord.mockResolvedValue("archive-1");

      const result = await createArchive(baseArchiveInput);

      expect(result.success).toBe(true);
      expect(result.id).toBe("archive-1");
      expect(mockCreateRecord).toHaveBeenCalledOnce();
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await createArchive(baseArchiveInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("タイトルが空の場合はバリデーションエラー", async () => {
      const result = await createArchive({ ...baseArchiveInput, title: "" });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("無効なURLの場合はバリデーションエラー", async () => {
      const result = await createArchive({
        ...baseArchiveInput,
        videoUrl: "not-a-valid-url",
      });

      expect(result.success).toBe(false);
      expect(mockCreateRecord).not.toHaveBeenCalled();
    });

    test("タグ付きアーカイブを作成できる", async () => {
      mockCreateRecord.mockResolvedValue("archive-2");

      const result = await createArchive({
        ...baseArchiveInput,
        tags: ["マインドフルネス", "エネルギー"],
      });

      expect(result.success).toBe(true);
      const callFields = mockCreateRecord.mock.calls[0][2];
      expect(callFields.tags).toContain("マインドフルネス");
    });

    test("Lark APIエラーはエラーオブジェクトで返す", async () => {
      mockCreateRecord.mockRejectedValue(new Error("Lark error"));

      const result = await createArchive(baseArchiveInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Lark error");
    });

    test("Larkテーブルが未設定の場合はエラーを返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await createArchive(baseArchiveInput);

      expect(result.success).toBe(false);
    });
  });

  describe("updateArchive", () => {
    test("ADMINはアーカイブを更新できる", async () => {
      mockUpdateRecord.mockResolvedValue({});

      const result = await updateArchive("archive-1", baseArchiveInput);

      expect(result.success).toBe(true);
      expect(mockUpdateRecord).toHaveBeenCalledWith(
        "app-token-xxx",
        "tbl-archive",
        "archive-1",
        expect.any(Object)
      );
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await updateArchive("archive-1", baseArchiveInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });
  });

  describe("deleteArchive", () => {
    test("ADMINはアーカイブを削除できる", async () => {
      mockDeleteRecord.mockResolvedValue({});

      const result = await deleteArchive("archive-1");

      expect(result.success).toBe(true);
      expect(mockDeleteRecord).toHaveBeenCalledWith("app-token-xxx", "tbl-archive", "archive-1");
    });

    test("ADMINでないとエラーを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await deleteArchive("archive-1");

      expect(result.success).toBe(false);
    });
  });

  describe("getArchivesForAdmin", () => {
    test("ADMINはアーカイブ一覧を取得できる", async () => {
      const mockRecord = {
        record_id: "archive-1",
        fields: { title: "朝会", date: "2026-03-20", category: "MORNING_SESSION", isPublished: "false", tags: "" },
      };
      mockListAllRecords.mockResolvedValue([mockRecord]);

      const result = await getArchivesForAdmin();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("archive-1");
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getArchivesForAdmin()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getArchiveForAdmin", () => {
    test("ADMINはアーカイブ詳細を取得できる", async () => {
      const mockRecord = {
        record_id: "archive-1",
        fields: { title: "朝会", date: "2026-03-20", category: "MORNING_SESSION", isPublished: "false", tags: "" },
      };
      mockGetRecord.mockResolvedValue(mockRecord);

      const result = await getArchiveForAdmin("archive-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("archive-1");
    });

    test("存在しないアーカイブは null を返す", async () => {
      mockGetRecord.mockResolvedValue(null);

      const result = await getArchiveForAdmin("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getPublishedArchives", () => {
    const mockRecords = [
      { record_id: "archive-1", fields: { title: "朝会", date: "2026-03-24", category: "MORNING_SESSION", isPublished: "true", tags: "" } },
      { record_id: "archive-2", fields: { title: "夜会", date: "2026-03-23", category: "EVENING_SESSION", isPublished: "true", tags: "学び" } },
    ];

    test("公開済みアーカイブ一覧を取得できる（認証不要）", async () => {
      mockListAllRecords.mockResolvedValue(mockRecords);

      const result = await getPublishedArchives();

      expect(result).toHaveLength(2);
    });

    test("limit 指定で件数を絞れる", async () => {
      mockListAllRecords.mockResolvedValue(mockRecords);

      const result = await getPublishedArchives(1);

      expect(result).toHaveLength(1);
    });

    test("Larkテーブルが未設定の場合は空配列を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getPublishedArchives();

      expect(result).toEqual([]);
    });
  });

  describe("getPublishedArchive", () => {
    test("公開済みの単一アーカイブを取得できる", async () => {
      const mockRecord = {
        record_id: "archive-1",
        fields: { title: "朝会", date: "2026-03-24", category: "MORNING_SESSION", isPublished: "true", tags: "" },
      };
      mockGetRecord.mockResolvedValue(mockRecord);

      const result = await getPublishedArchive("archive-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("archive-1");
    });

    test("非公開のアーカイブは null を返す", async () => {
      const mockRecord = {
        record_id: "archive-draft",
        fields: { title: "下書き", date: "2026-03-24", category: "MORNING_SESSION", isPublished: "false", tags: "" },
      };
      mockGetRecord.mockResolvedValue(mockRecord);

      const result = await getPublishedArchive("archive-draft");

      expect(result).toBeNull();
    });

    test("存在しないアーカイブは null を返す", async () => {
      mockGetRecord.mockResolvedValue(null);

      const result = await getPublishedArchive("non-existent");

      expect(result).toBeNull();
    });

    test("Larkテーブルが未設定の場合は null を返す", async () => {
      mockGetSetting.mockResolvedValue(null);

      const result = await getPublishedArchive("archive-1");

      expect(result).toBeNull();
    });
  });
});
