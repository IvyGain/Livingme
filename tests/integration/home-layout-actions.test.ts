/**
 * ホーム画面レイアウト Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockSettingFindMany = vi.fn();
const mockSettingUpsert = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    setting: {
      findMany: mockSettingFindMany,
      upsert: mockSettingUpsert,
    },
  },
}));

const { getHomeLayoutSettings, saveHomeLayoutSettings } =
  await import("@/server/actions/home-layout");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

describe("ホーム画面レイアウト Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
  });

  describe("getHomeLayoutSettings", () => {
    test("DB に設定がない場合はデフォルト値を返す", async () => {
      mockSettingFindMany.mockResolvedValue([]);

      const result = await getHomeLayoutSettings();

      expect(result.sections).toHaveLength(5);
      expect(result.colorSchemeId).toBe("autumn");
    });

    test("DB に保存されたカラースキームを返す", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "home_layout_color_scheme", value: "spring" },
      ]);

      const result = await getHomeLayoutSettings();

      expect(result.colorSchemeId).toBe("spring");
    });

    test("DB に保存されたセクション設定を返す", async () => {
      const customSections = [
        { id: "today", label: "今日のコンテンツ", visible: false },
        { id: "events", label: "直近のイベント", visible: true },
        { id: "archives", label: "新着アーカイブ", visible: true },
        { id: "column", label: "主宰者コラム", visible: true },
      ];
      mockSettingFindMany.mockResolvedValue([
        { key: "home_layout_sections", value: JSON.stringify(customSections) },
      ]);

      const result = await getHomeLayoutSettings();

      expect(result.sections[0].visible).toBe(false);
    });

    test("不正なJSON の場合はデフォルト sections を返す", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "home_layout_sections", value: "invalid-json" },
      ]);

      const result = await getHomeLayoutSettings();

      expect(result.sections).toHaveLength(5);
    });
  });

  describe("saveHomeLayoutSettings", () => {
    test("ADMINはレイアウト設定を保存できる", async () => {
      mockSettingUpsert.mockResolvedValue({});

      const sections = [{ id: "today", label: "今日のコンテンツ", visible: true }];
      await saveHomeLayoutSettings(sections as any, "winter");

      expect(mockSettingUpsert).toHaveBeenCalledTimes(2);
    });

    test("ADMINでないと / にリダイレクト（エラー）される", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(
        saveHomeLayoutSettings([], "autumn")
      ).rejects.toThrow("NEXT_REDIRECT:/");
    });
  });
});
