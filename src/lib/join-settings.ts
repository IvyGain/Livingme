export interface PlanBlock {
  id: string;
  name: string;           // 会員ステータス名（例: "無料会員"）
  price: string;          // 金額表示（例: "¥0/月"）
  features: string[];     // 内容一覧
  joinUrl: string;        // 申し込みリンク（空の場合は内部フォーム）
  paymentUrl: string;     // 決済リンク（空の場合は /api/checkout）
  isHighlighted: boolean; // 「おすすめ」表示
  visible: boolean;       // 表示/非表示
}

export interface JoinPageSettings {
  plans: PlanBlock[];
  footerText: string;     // ページ下部文言
}

export const DEFAULT_JOIN_SETTINGS: JoinPageSettings = {
  plans: [
    {
      id: "free",
      name: "無料会員",
      price: "¥0/月",
      features: [
        "コミュニティチャットへの参加",
        "イベント情報の閲覧",
        "公開コンテンツの閲覧",
      ],
      joinUrl: "",
      paymentUrl: "",
      isHighlighted: false,
      visible: true,
    },
    {
      id: "paid",
      name: "有料会員",
      price: "¥5,500/月（税込）",
      features: [
        "全アーカイブ動画が見放題",
        "朝会・夜会への参加",
        "毎日のジャーナリングテーマ配信",
        "ワークショップ・イベント参加",
        "コミュニティメンバーとのつながり（全機能）",
      ],
      joinUrl: "",
      paymentUrl: "",
      isHighlighted: true,
      visible: true,
    },
  ],
  footerText: "いつでもキャンセル可能です。登録後のサポートはメールにてご対応します。",
};

export const JOIN_SETTINGS_KEY = "join_page_settings";
