/**
 * ホーム画面レイアウト設定 ユニットテスト
 */
import { describe, test, expect } from "vitest";
import {
  getColorScheme,
  DEFAULT_SECTIONS,
  COLOR_SCHEMES,
  DEFAULT_COLOR_SCHEME_ID,
  LAYOUT_SECTIONS_KEY,
  LAYOUT_COLOR_SCHEME_KEY,
} from "@/lib/home-layout";

describe("home-layout", () => {
  describe("DEFAULT_SECTIONS", () => {
    test("5つのセクションが定義されている", () => {
      expect(DEFAULT_SECTIONS.length).toBe(5);
    });

    test("today, events, archives, column, chat が含まれる", () => {
      const ids = DEFAULT_SECTIONS.map((s) => s.id);
      expect(ids).toContain("today");
      expect(ids).toContain("events");
      expect(ids).toContain("archives");
      expect(ids).toContain("column");
      expect(ids).toContain("chat");
    });

    test("全セクションがデフォルトで visible: true", () => {
      DEFAULT_SECTIONS.forEach((section) => {
        expect(section.visible).toBe(true);
      });
    });

    test("各セクションに label が設定されている", () => {
      DEFAULT_SECTIONS.forEach((section) => {
        expect(section.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("COLOR_SCHEMES", () => {
    test("8つのカラースキームが定義されている", () => {
      expect(COLOR_SCHEMES.length).toBe(8);
    });

    test("autumn, spring, summer, winter, nature, pastel, vivid, tropical が含まれる", () => {
      const ids = COLOR_SCHEMES.map((s) => s.id);
      expect(ids).toContain("autumn");
      expect(ids).toContain("spring");
      expect(ids).toContain("summer");
      expect(ids).toContain("winter");
      expect(ids).toContain("nature");
      expect(ids).toContain("pastel");
      expect(ids).toContain("vivid");
      expect(ids).toContain("tropical");
    });

    test("各スキームに必要なカラーキーが全て存在する", () => {
      const requiredKeys = [
        "background",
        "cardBackground",
        "primary",
        "accent",
        "secondary",
        "muted",
        "border",
      ];
      COLOR_SCHEMES.forEach((scheme) => {
        requiredKeys.forEach((key) => {
          expect(scheme.colors).toHaveProperty(key);
          expect(scheme.colors[key as keyof typeof scheme.colors].startsWith("#")).toBe(true);
        });
      });
    });
  });

  describe("getColorScheme", () => {
    test("autumn スキームを取得できる", () => {
      const scheme = getColorScheme("autumn");
      expect(scheme.id).toBe("autumn");
    });

    test("spring スキームを取得できる", () => {
      const scheme = getColorScheme("spring");
      expect(scheme.id).toBe("spring");
    });

    test("summer スキームを取得できる", () => {
      const scheme = getColorScheme("summer");
      expect(scheme.id).toBe("summer");
    });

    test("winter スキームを取得できる", () => {
      const scheme = getColorScheme("winter");
      expect(scheme.id).toBe("winter");
    });

    test("nature スキームを取得できる", () => {
      const scheme = getColorScheme("nature");
      expect(scheme.id).toBe("nature");
    });

    test("存在しない ID はデフォルト（autumn）を返す", () => {
      const scheme = getColorScheme("non-existent");
      expect(scheme.id).toBe("autumn");
    });

    test("空文字はデフォルトを返す", () => {
      const scheme = getColorScheme("");
      expect(scheme).toBeDefined();
    });
  });

  describe("定数", () => {
    test("DEFAULT_COLOR_SCHEME_ID は autumn", () => {
      expect(DEFAULT_COLOR_SCHEME_ID).toBe("autumn");
    });

    test("LAYOUT_SECTIONS_KEY が定義されている", () => {
      expect(LAYOUT_SECTIONS_KEY).toBe("home_layout_sections");
    });

    test("LAYOUT_COLOR_SCHEME_KEY が定義されている", () => {
      expect(LAYOUT_COLOR_SCHEME_KEY).toBe("home_layout_color_scheme");
    });
  });
});
