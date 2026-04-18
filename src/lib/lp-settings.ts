// LP（ランディングページ）設定 v2

export interface LPVideo {
  id: string;
  title: string;
  url: string;         // YouTube embed URL
  description: string;
}

export interface LPActivity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;    // アクティビティ画像（任意）
}

export interface LPTestimonial {
  id: string;
  name: string;        // 口コミ投稿者名
  role: string;        // 肩書き・説明（任意）
  body: string;        // 口コミ本文
  avatarUrl: string;   // アバター画像（任意）
  gender?: "female" | "male" | "";  // 女性/男性マーク（空欄でマーク非表示）
}

export interface LPGalleryPhoto {
  id: string;
  imageUrl: string;    // 画像URL
  caption: string;     // 解説コメント
}

export interface LPSectionConfig {
  id: string;
  type: "hero" | "about" | "videos" | "activities" | "testimonials" | "gallery" | "cta";
  visible: boolean;
  heading: string;
  subheading: string;
  body: string;
  bgColor: string;      // CSS color or empty string (empty = デフォルト)
  bgImageUrl: string;   // 背景画像URL (bgImageUrl が優先; bgColor はオーバーレイ色として利用)
  imageUrl: string;     // セクション内コンテンツ画像URL (optional)
}

export interface LPSettings {
  sections: LPSectionConfig[];
  videos: LPVideo[];           // max 30
  activities: LPActivity[];    // 活動内容ブロック
  testimonials: LPTestimonial[]; // 口コミ
  gallery: LPGalleryPhoto[];   // 写真ギャラリー（推奨 6〜12 枚）
  concepts: string[];          // コンセプト文言リスト
  ctaButtonText: string;       // CTAボタンのテキスト（全セクション共通）
  ctaLoginButtonText: string;  // ログインボタンのテキスト（空の場合は非表示）
  larkArchiveIds: string[];    // お試し動画に表示するLarkアーカイブのID一覧
}

export const DEFAULT_LP_SETTINGS: LPSettings = {
  ctaButtonText: "今すぐ始める",
  ctaLoginButtonText: "会員ページにログインする",
  larkArchiveIds: [],
  concepts: [
    "楽しむために生まれてきた",
    "輝く人生をアートする",
    "今、そのままで最高",
    "もともと完璧であることを思い出す",
  ],
  activities: [
    { id: "act_1", title: "アーカイブ動画", description: "過去の朝会・夜会・イベントの動画を好きなときに何度でも。", imageUrl: "" },
    { id: "act_2", title: "朝会・夜会", description: "仲間と一緒に朝と夜のひとときを共有します。", imageUrl: "" },
    { id: "act_3", title: "ジャーナリング", description: "毎日のテーマに沿って、自分の内側と対話する時間を。", imageUrl: "" },
    { id: "act_4", title: "イベント参加", description: "ワークショップやオフ会など、体験型イベントに参加できます。", imageUrl: "" },
    { id: "act_5", title: "コミュニティ", description: "「今のままで最高」を分かち合える横のつながり。", imageUrl: "" },
  ],
  testimonials: [],
  gallery: [],
  videos: [],
  sections: [
    {
      id: "hero",
      type: "hero",
      visible: true,
      heading: "本当の自分と\n出逢う場所",
      subheading: "リビングのような温かさと安心感のある会員コミュニティ。\nただいま、と感じられる居場所があります。",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "about",
      type: "about",
      visible: true,
      heading: "Living Me とは",
      subheading: "",
      body: "波動から見た人間観をベースに、自分を愛し、人生をアートする仲間が集まるコミュニティです。感じたことを信じ、自分を表現し、満たされる自分を取り戻す。そんな時間と空間を一緒に作っています。",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "videos",
      type: "videos",
      visible: true,
      heading: "お試し動画",
      subheading: "Living Me の雰囲気を感じてみてください。",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "activities",
      type: "activities",
      visible: true,
      heading: "活動内容",
      subheading: "",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "gallery",
      type: "gallery",
      visible: false,
      heading: "ギャラリー",
      subheading: "コミュニティの様子をお届けします。",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "testimonials",
      type: "testimonials",
      visible: false,
      heading: "参加者の声",
      subheading: "Living Me に参加されたみなさんの感想です。",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
    {
      id: "cta",
      type: "cta",
      visible: true,
      heading: "あなたの居場所が\nここにあります",
      subheading: "まずはアカウントを作成して、Living Me の世界をお試しください。",
      body: "",
      bgColor: "",
      bgImageUrl: "",
      imageUrl: "",
    },
  ],
};

export const LP_SETTINGS_KEY = "lp_settings";
