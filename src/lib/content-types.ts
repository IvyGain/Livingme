/**
 * コンテンツ関連の型定義
 * Archive・Event モデルが Lark に移行したため、
 * 旧 @prisma/client からのエクスポートを置き換えます。
 */

// ── ArchiveCategory ──────────────────────────────────────────

export const ArchiveCategory = {
  MORNING_SESSION: "MORNING_SESSION",
  EVENING_SESSION: "EVENING_SESSION",
  LEARNING:        "LEARNING",
  EVENT:           "EVENT",
  OTHER:           "OTHER",
} as const;

export type ArchiveCategory = (typeof ArchiveCategory)[keyof typeof ArchiveCategory];

// ── EventType ────────────────────────────────────────────────

export const EventType = {
  MORNING_SESSION: "MORNING_SESSION",
  EVENING_SESSION: "EVENING_SESSION",
  ONLINE_EVENT:    "ONLINE_EVENT",
  OFFLINE_EVENT:   "OFFLINE_EVENT",
  GIVE_KAI:        "GIVE_KAI",
  STUDY_GROUP:     "STUDY_GROUP",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// ── Archive ──────────────────────────────────────────────────

export interface Archive {
  id:             string;   // Lark record_id
  title:          string;
  description:    string | null;
  date:           Date;
  category:       ArchiveCategory;
  videoUrl:       string | null;
  thumbnailUrl:   string | null;
  minutes:        string | null;
  summary:        string | null;
  energyShare:    string | null;
  journalingTheme:string | null;
  isPublished:    boolean;
  tags:           string[];  // カンマ区切りを分解した配列
}

// ── TodayContent ─────────────────────────────────────────────

export interface TodayContent {
  id:             string;   // Lark record_id
  date:           Date;
  energyShare:    string | null;
  journalingTheme:string | null;
  morningNote:    string | null;
  isPublished:    boolean;
  // ── エネルギーシェア構造化フィールド（任意） ─────────────
  /** マヤ暦情報（自由記述。例: "K123 白い世界の橋渡し / 赤い月のウェイブスペル / 音5"） */
  mayanInfo:      string | null;
  /** 黒キン */
  mayanBlackKin:  boolean;
  /** 月相: null / "full" / "new" */
  moonPhase:      "full" | "new" | null;
  /** タイトル（今日のテーマの見出しに相当） */
  title:          string | null;
  /** コラム（テーマ解説本文） */
  column:         string | null;
  /** 今日の紋章プチ解説 */
  symbolNote:     string | null;
  /** 💫今日のポイント */
  todayPoint:     string | null;
}

// ── Event ────────────────────────────────────────────────────

export type RegistrationFieldType = "text" | "textarea" | "select" | "checkbox";

export interface RegistrationField {
  id:       string;
  label:    string;
  type:     RegistrationFieldType;
  required: boolean;
  options?: string[];
}

export interface LarkEvent {
  id:                 string;   // Lark record_id
  title:              string;
  description:        string | null;
  eventType:          EventType;
  startsAt:           Date;
  endsAt:             Date | null;
  location:           string | null;
  meetingUrl:         string | null;
  isPublished:        boolean;
  maxAttendees:       number | null;
  registrationEnabled:boolean;
  registrationFields: RegistrationField[];
}
