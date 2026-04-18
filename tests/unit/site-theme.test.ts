import { describe, test, expect } from "vitest";
import {
  sanitizeSiteTheme,
  isValidHex,
  DEFAULT_SITE_THEME,
} from "@/lib/site-theme-types";

describe("isValidHex", () => {
  test("6桁HEXのみ true", () => {
    expect(isValidHex("#ABCDEF")).toBe(true);
    expect(isValidHex("#123456")).toBe(true);
    expect(isValidHex("#abcdef")).toBe(true);
  });
  test("3桁・8桁・空文字は false", () => {
    expect(isValidHex("#FFF")).toBe(false);
    expect(isValidHex("#FFFFFFFF")).toBe(false);
    expect(isValidHex("")).toBe(false);
  });
  test("# を欠いたら false", () => {
    expect(isValidHex("000000")).toBe(false);
  });
  test("不正文字は false（XSSや URL 混入対策）", () => {
    expect(isValidHex("#javascript:")).toBe(false);
    expect(isValidHex("red")).toBe(false);
    expect(isValidHex("#ZZZZZZ")).toBe(false);
  });
});

describe("sanitizeSiteTheme", () => {
  test("null → defaults", () => {
    expect(sanitizeSiteTheme(null)).toEqual(DEFAULT_SITE_THEME);
    expect(sanitizeSiteTheme(undefined)).toEqual(DEFAULT_SITE_THEME);
  });

  test("有効な部分更新はマージされる", () => {
    const result = sanitizeSiteTheme({ accent: "#ABCDEF" });
    expect(result.accent).toBe("#ABCDEF");
    expect(result.primary).toBe(DEFAULT_SITE_THEME.primary);
  });

  test("不正な HEX はデフォルトに置換される（XSS 保護）", () => {
    const result = sanitizeSiteTheme({
      accent: "javascript:alert(1)",
      primary: "red",
    } as unknown as Record<string, string>);
    expect(result.accent).toBe(DEFAULT_SITE_THEME.accent);
    expect(result.primary).toBe(DEFAULT_SITE_THEME.primary);
  });

  test("globalBanner はそのまま保持（空 string も OK）", () => {
    expect(sanitizeSiteTheme({ globalBanner: "お知らせ" }).globalBanner).toBe("お知らせ");
    expect(sanitizeSiteTheme({ globalBanner: "" }).globalBanner).toBe("");
  });

  test("globalBanner が string 以外なら空文字に正規化", () => {
    expect(
      sanitizeSiteTheme({ globalBanner: 123 as unknown as string }).globalBanner,
    ).toBe("");
  });
});
