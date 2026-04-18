/**
 * 設定ライブラリ ユニットテスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// prisma を動的インポートしているので、モック方法が特殊
const mockSettingFindMany = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    setting: { findMany: mockSettingFindMany },
  },
}));

// settings.ts は server-only を import するが setup.ts でモック済み
const { getSetting, clearSettingsCache, SETTING_KEYS, SETTING_META } =
  await import("@/lib/settings");

describe("settings (lib)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSettingsCache();
    // 環境変数をクリア
    delete process.env.UNIVAPAY_APP_TOKEN;
    delete process.env.LARK_BASE_APP_TOKEN;
  });

  describe("SETTING_KEYS / SETTING_META", () => {
    test("UnivaPay の設定キーが定義されている", () => {
      expect(SETTING_KEYS.UNIVAPAY_APP_TOKEN).toBe("UNIVAPAY_APP_TOKEN");
      expect(SETTING_KEYS.UNIVAPAY_APP_SECRET).toBe("UNIVAPAY_APP_SECRET");
      expect(SETTING_KEYS.UNIVAPAY_PRICE).toBe("UNIVAPAY_PRICE");
    });

    test("Lark の設定キーが定義されている", () => {
      expect(SETTING_KEYS.LARK_APP_ID).toBe("LARK_APP_ID");
      expect(SETTING_KEYS.LARK_APP_SECRET).toBe("LARK_APP_SECRET");
      expect(SETTING_KEYS.LARK_BASE_APP_TOKEN).toBe("LARK_BASE_APP_TOKEN");
    });

    test("UNIVAPAY_APP_TOKEN は isSecret: true", () => {
      expect(SETTING_META.UNIVAPAY_APP_TOKEN.isSecret).toBe(true);
    });

    test("UNIVAPAY_PRICE は isSecret: false", () => {
      expect(SETTING_META.UNIVAPAY_PRICE.isSecret).toBe(false);
    });

    test("各メタに label と group が存在する", () => {
      Object.values(SETTING_META).forEach((meta) => {
        expect(meta.label.length).toBeGreaterThan(0);
        expect(meta.group.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getSetting", () => {
    test("DB に値がある場合は DB の値を返す（非シークレット）", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "UNIVAPAY_PRICE", value: "1000", isSecret: false },
      ]);

      const result = await getSetting("UNIVAPAY_PRICE");
      expect(result).toBe("1000");
    });

    test("DB になく環境変数にある場合は env の値を返す", async () => {
      mockSettingFindMany.mockResolvedValue([]);
      process.env.UNIVAPAY_APP_TOKEN = "token_from_env";

      const result = await getSetting("UNIVAPAY_APP_TOKEN");
      expect(result).toBe("token_from_env");
    });

    test("DB にも環境変数にもない場合は undefined を返す", async () => {
      mockSettingFindMany.mockResolvedValue([]);

      const result = await getSetting("UNIVAPAY_APP_TOKEN");
      expect(result).toBeUndefined();
    });

    test("DB エラー時は undefined を返す（クラッシュしない）", async () => {
      mockSettingFindMany.mockRejectedValue(new Error("DB error"));

      const result = await getSetting("UNIVAPAY_PRICE");
      expect(result).toBeUndefined();
    });

    test("キャッシュが効いて2回目は DB を叩かない", async () => {
      mockSettingFindMany.mockResolvedValue([
        { key: "UNIVAPAY_PRICE", value: "1000", isSecret: false },
      ]);

      await getSetting("UNIVAPAY_PRICE");
      await getSetting("UNIVAPAY_PRICE");

      expect(mockSettingFindMany).toHaveBeenCalledOnce();
    });
  });

  describe("clearSettingsCache", () => {
    test("キャッシュをクリアすると次回 DB を再取得する", async () => {
      mockSettingFindMany.mockResolvedValue([]);

      await getSetting("UNIVAPAY_PRICE");
      clearSettingsCache();
      await getSetting("UNIVAPAY_PRICE");

      expect(mockSettingFindMany).toHaveBeenCalledTimes(2);
    });
  });
});
