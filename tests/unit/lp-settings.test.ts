/**
 * LP設定 ユニットテスト
 */
import { describe, test, expect } from "vitest";
import { DEFAULT_LP_SETTINGS, LP_SETTINGS_KEY } from "@/lib/lp-settings";

describe("lp-settings", () => {
  describe("LP_SETTINGS_KEY", () => {
    test('LP_SETTINGS_KEY が "lp_settings"', () => {
      expect(LP_SETTINGS_KEY).toBe("lp_settings");
    });
  });

  describe("DEFAULT_LP_SETTINGS", () => {
    test("sections に6つのセクションが存在する", () => {
      expect(DEFAULT_LP_SETTINGS.sections).toHaveLength(6);
    });

    test("sections に hero, about, videos, activities, testimonials, cta が存在する", () => {
      const ids = DEFAULT_LP_SETTINGS.sections.map((s) => s.id);
      expect(ids).toContain("hero");
      expect(ids).toContain("about");
      expect(ids).toContain("videos");
      expect(ids).toContain("activities");
      expect(ids).toContain("testimonials");
      expect(ids).toContain("cta");
    });

    test("各セクションに必須フィールド（id, type, visible, heading, bgColor, bgImageUrl, imageUrl）が存在する", () => {
      for (const section of DEFAULT_LP_SETTINGS.sections) {
        expect(section).toHaveProperty("id");
        expect(section).toHaveProperty("type");
        expect(section).toHaveProperty("visible");
        expect(section).toHaveProperty("heading");
        expect(section).toHaveProperty("bgColor");
        expect(section).toHaveProperty("bgImageUrl");
        expect(section).toHaveProperty("imageUrl");
      }
    });

    test("ctaButtonText が非空文字列", () => {
      expect(typeof DEFAULT_LP_SETTINGS.ctaButtonText).toBe("string");
      expect(DEFAULT_LP_SETTINGS.ctaButtonText.length).toBeGreaterThan(0);
    });

    test("concepts が配列で4要素", () => {
      expect(Array.isArray(DEFAULT_LP_SETTINGS.concepts)).toBe(true);
      expect(DEFAULT_LP_SETTINGS.concepts).toHaveLength(4);
    });

    test("sections の type と id が一致している", () => {
      for (const section of DEFAULT_LP_SETTINGS.sections) {
        expect(section.type).toBe(section.id);
      }
    });
  });
});
