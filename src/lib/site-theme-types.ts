export const SITE_THEME_KEY = "site_theme";

export interface SiteTheme {
  /** アクセントカラー（CTA / リンクなど）*/
  accent: string;
  /** セカンダリカラー（補助アクション） */
  secondary: string;
  /** テキスト主色（本文） */
  primary: string;
  /** 背景色 */
  background: string;
  /** カード背景 */
  cardBg: string;
  /** ミュート（補足テキスト） */
  muted: string;
  /** ボーダー */
  border: string;
  /** グローバル案内メッセージ（空なら非表示） */
  globalBanner: string;
}

export const DEFAULT_SITE_THEME: SiteTheme = {
  accent: "#C07052",
  secondary: "#7A9E7E",
  primary: "#6B4F3A",
  background: "#FFF8F0",
  cardBg: "#FEFCF8",
  muted: "#9a8070",
  border: "#e8ddd5",
  globalBanner: "",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isValidHex(v: string): boolean {
  return HEX.test(v);
}

/**
 * 受け取った部分更新を defaults にマージしつつ、不正な HEX は
 * デフォルトで置き換える（XSS 防止の一環: 値はそのまま CSS 変数に流す）。
 */
export function sanitizeSiteTheme(input: Partial<SiteTheme> | null | undefined): SiteTheme {
  const merged: SiteTheme = { ...DEFAULT_SITE_THEME, ...(input ?? {}) };
  const colorKeys: (keyof SiteTheme)[] = [
    "accent",
    "secondary",
    "primary",
    "background",
    "cardBg",
    "muted",
    "border",
  ];
  for (const key of colorKeys) {
    const v = merged[key];
    if (typeof v !== "string" || !isValidHex(v)) {
      merged[key] = DEFAULT_SITE_THEME[key];
    }
  }
  if (typeof merged.globalBanner !== "string") {
    merged.globalBanner = "";
  }
  return merged;
}
