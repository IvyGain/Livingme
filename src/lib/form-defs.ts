export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface FormDef {
  slug: string;
  title: string;
  description: string;
  fields: FormField[];
  ambassadorOnly?: boolean;
}

export const FORM_DEFS: FormDef[] = [
  {
    slug: "maya-calendar",
    title: "マヤ暦講座 申請",
    description: "マヤ暦講座へのご参加を申請します。担当者より詳細をご連絡いたします。",
    fields: [
      { name: "motivation", label: "受講を希望する理由", type: "textarea", placeholder: "マヤ暦に興味を持ったきっかけや、学びたい理由を教えてください", required: true },
      { name: "experience", label: "スピリチュアル・占いの経験", type: "select", options: ["まったく初めて", "少し経験あり", "ある程度経験あり", "深く学んでいる"], required: true },
      { name: "preferredDate", label: "希望開始時期", type: "select", options: ["できるだけ早く", "1ヶ月以内", "2〜3ヶ月以内", "半年以内"], required: true },
      { name: "notes", label: "その他・ご質問", type: "textarea", placeholder: "ご質問や特記事項があればお書きください", required: false },
    ],
  },
  {
    slug: "personal-session",
    title: "個人セッション 申請",
    description: "主宰者との個人セッションをご希望の方はこちらからお申し込みください。",

    fields: [
      { name: "concern", label: "セッションで扱いたいテーマ", type: "textarea", placeholder: "現在の悩みや、セッションを通じて得たいことを教えてください", required: true },
      { name: "sessionType", label: "ご希望のセッション種別", type: "select", options: ["オンライン（Zoom）", "オフライン（要相談）"], required: true },
      { name: "preferredTime", label: "ご希望の曜日・時間帯", type: "text", placeholder: "例：平日夜 / 土日午前", required: true },
      { name: "notes", label: "その他・ご質問", type: "textarea", placeholder: "ご質問や特記事項があればお書きください", required: false },
    ],
  },
  {
    slug: "next-stage",
    title: "NextStage 面談 申請",
    description: "あなたの次のステップへ向けた面談をご希望の方はこちらからご申請ください。",

    fields: [
      { name: "currentSituation", label: "現在の状況", type: "textarea", placeholder: "今の生活・仕事・心の状態を簡単に教えてください", required: true },
      { name: "desiredState", label: "目指したい状態・ビジョン", type: "textarea", placeholder: "3〜6ヶ月後にどんな自分でいたいですか？", required: true },
      { name: "preferredTime", label: "ご希望の曜日・時間帯", type: "text", placeholder: "例：平日夜 / 土日", required: true },
      { name: "notes", label: "その他・ご質問", type: "textarea", placeholder: "ご質問や特記事項があればお書きください", required: false },
    ],
  },
  {
    slug: "referral",
    title: "新規紹介 申請",
    description: "新しいメンバーをご紹介いただく際の申請フォームです。",
    ambassadorOnly: true,
    fields: [
      { name: "refereeName", label: "ご紹介する方のお名前", type: "text", placeholder: "例：山田 花子", required: true },
      { name: "refereeContact", label: "ご紹介する方の連絡先（Discord IDなど）", type: "text", placeholder: "例：hanako#1234", required: true },
      { name: "relationship", label: "ご紹介する方との関係", type: "text", placeholder: "例：友人 / SNSでの知り合い", required: true },
      { name: "notes", label: "一言メッセージ", type: "textarea", placeholder: "ご紹介する方の印象や、なぜLiving Meに合うと思うかを教えてください", required: false },
    ],
  },
  {
    slug: "give-kai",
    title: "ギブ会 申請",
    description: "あなたのスキル・経験をコミュニティにギブするイベントを企画しませんか？",
    ambassadorOnly: true,
    fields: [
      { name: "theme", label: "ギブ会のテーマ・内容", type: "textarea", placeholder: "どんな内容を提供したいか教えてください", required: true },
      { name: "targetAudience", label: "対象者", type: "text", placeholder: "例：初心者向け / 子育て中の方向け", required: true },
      { name: "format", label: "開催形式", type: "select", options: ["オンライン（Zoom）", "オフライン（会場未定）", "どちらでも可"], required: true },
      { name: "preferredDate", label: "希望開催時期", type: "text", placeholder: "例：4月中旬〜5月", required: true },
      { name: "notes", label: "その他・ご質問", type: "textarea", placeholder: "準備・当日サポートで必要なことがあればお書きください", required: false },
    ],
  },
];

export function getFormDef(slug: string): FormDef | undefined {
  return FORM_DEFS.find((f) => f.slug === slug);
}
