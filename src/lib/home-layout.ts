// ホーム画面レイアウト設定の型定義と定数

export type SectionId = "today" | "events" | "archives" | "column" | "chat";

export interface SectionConfig {
  id: SectionId;
  label: string;
  visible: boolean;
}

export interface ColorScheme {
  id: string;
  label: string;
  description: string;
  // 将来のカラーコード入力方式への移行を見越し、実カラー値を保持する
  colors: {
    background: string;       // ページ背景
    cardBackground: string;   // カード背景
    primary: string;          // 見出し・強調テキスト
    accent: string;           // アクションカラー（リンク・ボタン）
    secondary: string;        // セカンダリアクセント
    muted: string;            // 補足テキスト
    border: string;           // ボーダー
  };
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "chat",     label: "チャット",          visible: true },
  { id: "today",    label: "今日のコンテンツ",  visible: true },
  { id: "events",   label: "直近のイベント",    visible: true },
  { id: "archives", label: "新着アーカイブ",    visible: true },
  { id: "column",   label: "主宰者コラム",      visible: true },
];

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "autumn",
    label: "秋（デフォルト）",
    description: "温かみのあるテラコッタ系",
    colors: {
      background:    "#FFF8F0",
      cardBackground:"#FEFCF8",
      primary:       "#6B4F3A",
      accent:        "#C07052",
      secondary:     "#7A9E7E",
      muted:         "#9a8070",
      border:        "#e8ddd5",
    },
  },
  {
    id: "spring",
    label: "春",
    description: "やわらかいピンクとグリーン",
    colors: {
      background:    "#FFF5F7",
      cardBackground:"#FFFBFC",
      primary:       "#6B3A4F",
      accent:        "#D4698A",
      secondary:     "#89C4A1",
      muted:         "#9a7080",
      border:        "#f0d8e0",
    },
  },
  {
    id: "summer",
    label: "夏",
    description: "涼やかなブルーグリーン",
    colors: {
      background:    "#F0F8FF",
      cardBackground:"#FAFEFF",
      primary:       "#2C4A6B",
      accent:        "#2E86AB",
      secondary:     "#52B788",
      muted:         "#607080",
      border:        "#C8DFF0",
    },
  },
  {
    id: "winter",
    label: "冬",
    description: "落ち着いたディープトーン",
    colors: {
      background:    "#F4F5F7",
      cardBackground:"#FAFAFA",
      primary:       "#2D3142",
      accent:        "#4F5D75",
      secondary:     "#7B8FA1",
      muted:         "#8090A0",
      border:        "#D8DDE5",
    },
  },
  {
    id: "nature",
    label: "ナチュラル",
    description: "やさしいセージグリーン",
    colors: {
      background:    "#F4F8F4",
      cardBackground:"#FAFCFA",
      primary:       "#3A5A40",
      accent:        "#588157",
      secondary:     "#A3B18A",
      muted:         "#7a9070",
      border:        "#D4E6D4",
    },
  },
  {
    id: "pastel",
    label: "パステル",
    description: "やわらかく淡いパステルトーン",
    colors: {
      background:    "#FDF5FF",
      cardBackground:"#FFFBFF",
      primary:       "#5A3A6A",
      accent:        "#C47EC0",
      secondary:     "#7EC0B4",
      muted:         "#9878A8",
      border:        "#EDD8F4",
    },
  },
  {
    id: "vivid",
    label: "ビビット",
    description: "鮮やかでエネルギッシュな配色",
    colors: {
      background:    "#FFF9F5",
      cardBackground:"#FFFFFF",
      primary:       "#1A1A2E",
      accent:        "#E94560",
      secondary:     "#0A7AFF",
      muted:         "#706070",
      border:        "#F0D0D8",
    },
  },
  {
    id: "tropical",
    label: "トロピカル",
    description: "南国を彷彿とさせる鮮やかな配色",
    colors: {
      background:    "#F0FAFA",
      cardBackground:"#FAFFFE",
      primary:       "#1A4A4A",
      accent:        "#FF6B35",
      secondary:     "#00B894",
      muted:         "#508080",
      border:        "#B4E4E0",
    },
  },
];

export const DEFAULT_COLOR_SCHEME_ID = "autumn";

export function getColorScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.id === id) ?? COLOR_SCHEMES[0];
}

export interface NavItemConfig {
  href: string;
  label: string;
  visible: boolean;
}

export const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  { href: "/home",    label: "ホーム",              visible: true },
  { href: "/energy",  label: "エネルギーシェア",    visible: true },
  { href: "/archive", label: "アーカイブ",          visible: true },
  { href: "/events",  label: "イベント",            visible: true },
  { href: "/journal", label: "ジャーナル",          visible: true },
  { href: "/forms",   label: "わたし",              visible: true },
  { href: "/about",   label: "Living Meとは",       visible: true },
];

// Setting モデルで使うキー
export const LAYOUT_SECTIONS_KEY = "home_layout_sections";
export const LAYOUT_COLOR_SCHEME_KEY = "home_layout_color_scheme";
export const LAYOUT_NAV_ITEMS_KEY = "home_nav_items";
