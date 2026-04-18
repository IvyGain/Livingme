/**
 * 管理画面設定 Server Actions テスト
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

// Mock settings cache clear
vi.mock("@/lib/settings", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/settings")>();
  return { ...original, clearSettingsCache: vi.fn() };
});

const { getSettingsForAdmin, saveSettings } = await import("@/server/actions/settings");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

describe("管理画面設定 Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
  });

  describe("getSettingsForAdmin", () => {
    test("ADMINは設定一覧を取得できる", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "UNIVAPAY_PRICE", value: "1000", isSecret: false },
      ]);

      const result = await getSettingsForAdmin();

      expect(result).toHaveProperty("UNIVAPAY_APP_TOKEN");
      expect(result).toHaveProperty("UNIVAPAY_APP_SECRET");
      expect(result).toHaveProperty("LARK_BASE_APP_TOKEN");
    });

    test("シークレット項目の値はマスク表示される", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "UNIVAPAY_APP_TOKEN", value: "encrypted_value", isSecret: true },
      ]);

      const result = await getSettingsForAdmin();

      expect(result.UNIVAPAY_APP_TOKEN.value).toBe("••••••••");
    });

    test("非シークレット項目の値はそのまま表示される", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "UNIVAPAY_PRICE", value: "1000", isSecret: false },
      ]);

      const result = await getSettingsForAdmin();

      expect(result.UNIVAPAY_PRICE.value).toBe("1000");
    });

    test("DB にない項目は空文字を返す", async () => {
      mockSettingFindMany.mockResolvedValue([]);
      delete process.env.UNIVAPAY_APP_TOKEN;

      const result = await getSettingsForAdmin();

      expect(result.UNIVAPAY_APP_TOKEN.value).toBe("");
    });

    test("ADMINでないと / にリダイレクト（エラー）される", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getSettingsForAdmin()).rejects.toThrow("NEXT_REDIRECT:/");
    });

    test("各設定に isSecret, label, group が含まれる", async () => {
      mockSettingFindMany.mockResolvedValue([]);

      const result = await getSettingsForAdmin();

      expect(result.UNIVAPAY_APP_TOKEN.isSecret).toBe(true);
      expect(result.UNIVAPAY_APP_TOKEN.label).toBeTruthy();
      expect(result.UNIVAPAY_APP_TOKEN.group).toBe("UnivaPay");
    });
  });

  describe("saveSettings", () => {
    test("ADMINは設定を保存できる", async () => {
      mockSettingUpsert.mockResolvedValue({});

      const formData = new FormData();
      formData.append("UNIVAPAY_PRICE", "1000");

      // saveSettings は最後に redirect するので、エラーになるが upsert は呼ばれる
      await expect(saveSettings(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockSettingUpsert).toHaveBeenCalledOnce();
    });

    test("空文字・マスク値はスキップされる", async () => {
      mockSettingUpsert.mockResolvedValue({});

      const formData = new FormData();
      formData.append("UNIVAPAY_PRICE", "");
      formData.append("UNIVAPAY_APP_TOKEN", "••••••••");

      await expect(saveSettings(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockSettingUpsert).not.toHaveBeenCalled();
    });

    test("未知のキーはスキップされる", async () => {
      mockSettingUpsert.mockResolvedValue({});

      const formData = new FormData();
      formData.append("UNKNOWN_KEY", "some_value");

      await expect(saveSettings(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockSettingUpsert).not.toHaveBeenCalled();
    });

    test("ADMINでないと / にリダイレクト（エラー）される", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const formData = new FormData();
      await expect(saveSettings(formData)).rejects.toThrow("NEXT_REDIRECT:/");
      expect(mockSettingUpsert).not.toHaveBeenCalled();
    });
  });
});
