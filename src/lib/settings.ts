import "server-only";
import { decrypt } from "./crypto";

// 設定キーの定義
export const SETTING_KEYS = {
  // UnivaPay
  UNIVAPAY_APP_TOKEN: "UNIVAPAY_APP_TOKEN",
  UNIVAPAY_APP_SECRET: "UNIVAPAY_APP_SECRET",
  UNIVAPAY_PRICE: "UNIVAPAY_PRICE",
  // Lark
  LARK_APP_ID: "LARK_APP_ID",
  LARK_APP_SECRET: "LARK_APP_SECRET",
  LARK_BASE_APP_TOKEN: "LARK_BASE_APP_TOKEN",
  LARK_API_BASE_URL: "LARK_API_BASE_URL",
  LARK_CHAT_CHANNEL_TABLE_ID: "LARK_CHAT_CHANNEL_TABLE_ID",
  LARK_CHAT_MESSAGE_TABLE_ID: "LARK_CHAT_MESSAGE_TABLE_ID",
  LARK_JOURNAL_TABLE_ID: "LARK_JOURNAL_TABLE_ID",
  LARK_FORM_TABLE_ID: "LARK_FORM_TABLE_ID",
  LARK_ARCHIVE_TABLE_ID: "LARK_ARCHIVE_TABLE_ID",
  LARK_TODAY_CONTENT_TABLE_ID: "LARK_TODAY_CONTENT_TABLE_ID",
  LARK_EVENT_TABLE_ID: "LARK_EVENT_TABLE_ID",
  LARK_COLUMN_TABLE_ID: "LARK_COLUMN_TABLE_ID",
  // メール設定
  INVITE_EMAIL_SUBJECT: "INVITE_EMAIL_SUBJECT",
  INVITE_EMAIL_GREETING: "INVITE_EMAIL_GREETING",
  WELCOME_EMAIL_SUBJECT: "WELCOME_EMAIL_SUBJECT",
  WELCOME_EMAIL_GREETING: "WELCOME_EMAIL_GREETING",
  // 紹介報酬
  REFERRAL_REWARD_AMOUNT: "REFERRAL_REWARD_AMOUNT",
} as const;

export type SettingKey = keyof typeof SETTING_KEYS;

// 設定メタ情報
export const SETTING_META: Record<SettingKey, { label: string; isSecret: boolean; group: string }> = {
  UNIVAPAY_APP_TOKEN:   { label: "UnivaPay アプリトークン",    isSecret: true,  group: "UnivaPay" },
  UNIVAPAY_APP_SECRET:  { label: "UnivaPay アプリシークレット", isSecret: true,  group: "UnivaPay" },
  UNIVAPAY_PRICE:       { label: "UnivaPay 価格 (円)",         isSecret: false, group: "UnivaPay" },
  LARK_APP_ID:                   { label: "Lark アプリID",                                              isSecret: false, group: "Lark" },
  LARK_APP_SECRET:               { label: "Lark アプリシークレット",                                        isSecret: true,  group: "Lark" },
  LARK_BASE_APP_TOKEN:           { label: "Lark Base アプリトークン",                                       isSecret: false, group: "Lark" },
  LARK_API_BASE_URL:             { label: "Lark API ベースURL（デフォルト: https://open.larksuite.com）", isSecret: false, group: "Lark" },
  LARK_CHAT_CHANNEL_TABLE_ID:    { label: "Lark チャンネルテーブルID",                                     isSecret: false, group: "Lark" },
  LARK_CHAT_MESSAGE_TABLE_ID:    { label: "Lark メッセージテーブルID",                                     isSecret: false, group: "Lark" },
  LARK_JOURNAL_TABLE_ID:         { label: "Lark ジャーナルテーブルID",                                     isSecret: false, group: "Lark" },
  LARK_FORM_TABLE_ID:            { label: "Lark フォームテーブルID",                                       isSecret: false, group: "Lark" },
  LARK_ARCHIVE_TABLE_ID:         { label: "Lark アーカイブテーブルID",                                     isSecret: false, group: "Lark" },
  LARK_TODAY_CONTENT_TABLE_ID:   { label: "Lark 今日のコンテンツテーブルID",                               isSecret: false, group: "Lark" },
  LARK_EVENT_TABLE_ID:           { label: "Lark イベントテーブルID",                                       isSecret: false, group: "Lark" },
  LARK_COLUMN_TABLE_ID:          { label: "Lark コラムテーブルID",                                         isSecret: false, group: "Lark" },
  INVITE_EMAIL_SUBJECT: { label: "招待メール件名",              isSecret: false, group: "メール設定" },
  INVITE_EMAIL_GREETING:{ label: "招待メール冒頭文",            isSecret: false, group: "メール設定" },
  WELCOME_EMAIL_SUBJECT:{ label: "ウェルカムメール件名",        isSecret: false, group: "メール設定" },
  WELCOME_EMAIL_GREETING:{ label: "ウェルカムメール冒頭文",     isSecret: false, group: "メール設定" },
  REFERRAL_REWARD_AMOUNT: { label: "紹介報酬 単価（円/1件）",  isSecret: false, group: "紹介報酬" },
};

// キャッシュ（1分間）
let cache: Record<string, string> | null = null;
let cacheAt = 0;
const CACHE_TTL = 60_000;

async function loadAll(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL) return cache;

  try {
    const { prisma } = await import("./prisma");
    const rows = await prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const row of rows) {
      try {
        result[row.key] = row.isSecret ? decrypt(row.value) : row.value;
      } catch {
        // 復号失敗時はスキップ
      }
    }
    cache = result;
    cacheAt = now;
    return result;
  } catch {
    return {};
  }
}

export function clearSettingsCache() {
  cache = null;
}

// キーごとのデフォルト値
const SETTING_DEFAULTS: Partial<Record<SettingKey, string>> = {
  LARK_API_BASE_URL: "https://open.larksuite.com",
  REFERRAL_REWARD_AMOUNT: "0",
};

// DB優先・env変数フォールバックで設定値を取得
export async function getSetting(key: SettingKey): Promise<string | undefined> {
  const all = await loadAll();
  return all[key] ?? process.env[key] ?? SETTING_DEFAULTS[key] ?? undefined;
}
