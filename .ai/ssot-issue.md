# [EPIC] Living Me 会員サイト — 全実装計画 SSOT Issue

**作成日**: 2026-03-20
**ステータス**: Phase 4 実装待ち
**プロジェクト**: Living Me 〜本当の自分と出逢う会〜 会員サイト

---

## 概要

Living Me コミュニティの会員向けポータルサイト。
Discord OAuth 認証 + Stripe 決済連動 + コンテンツ管理を一元化する。

**コアコンセプト**: 愛のあるこころの居場所 / リビングのような温かさ

---

## 参照ドキュメント

| ドキュメント | パス |
|------------|------|
| 機能要件 | `docs/requirements/requirements.md` |
| 非機能要件 | `docs/requirements/non-functional.md` |
| デザイン要件 | `docs/requirements/design-requirements.md` |
| 機能仕様書 | `docs/design/spec.md` |
| デザインシステム | `docs/design/design-system.yml` |
| UI ガイドライン | `docs/design/ui-guidelines.md` |
| コンポーネントライブラリ | `docs/design/component-library.md` |
| レスポンシブガイドライン | `docs/design/responsive-guidelines.md` |
| E2E テスト設計 | `docs/test-design/e2e-test-design.md` |
| 結合テスト設計 | `docs/test-design/integration-test-design.md` |

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| 認証 | NextAuth.js v5 + **Discord OAuth** |
| ORM | Prisma |
| DB | PostgreSQL |
| 決済 | Stripe |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| アニメーション | motion/react |
| アイコン | lucide-react |

---

## Wave 構成（実装順）

### Wave 1: 基盤インフラ（P0）

#### W1-1: DB スキーマ・マイグレーション
- [ ] Prisma スキーマ作成（User, Archive, DailyContent, Event, Journal, Referral, Partner, Post）
- [ ] 初期マイグレーション実行
- [ ] シードデータ（テスト会員・アーカイブ）

#### W1-2: Discord OAuth 認証
- [ ] NextAuth.js v5 設定（Discord Provider）
- [ ] セッション型拡張（memberStatus, discordRoles, stripeCustomerId）
- [ ] ログインページ `/login`
- [ ] サインアウト処理

#### W1-3: ミドルウェア権限制御
- [ ] `src/middleware.ts` 実装
- [ ] `/(member)/*` → trial/inactive リダイレクト
- [ ] `/admin/*` → staff チェック
- [ ] 未認証 → `/login` リダイレクト

#### W1-4: Stripe Webhook 基盤
- [ ] `/api/webhooks/stripe` エンドポイント
- [ ] 署名検証
- [ ] 冪等性テーブル（WebhookEvent）
- [ ] `subscription.created/deleted` → memberStatus 更新
- [ ] `invoice.payment_failed` → 猶予期間処理

#### W1-5: Discord Bot ロール同期
- [ ] Discord Bot API クライアント
- [ ] ロール付与・剥奪処理
- [ ] Stripe Webhook トリガー連動

---

### Wave 2: 会員向けコアページ（P0）

#### W2-1: レイアウト基盤
- [ ] `MemberLayout` — サイドバー/ボトムナビ切替
- [ ] `BottomNav` — 5タブ（モバイル）
- [ ] `Sidebar` — 280px（タブレット+）
- [ ] ダークモード対応（CSS Variables）
- [ ] フォント設定（Noto Serif JP / Noto Sans JP）

#### W2-2: 会員トップページ `/(member)/`
- [ ] `DailyContentCard` — エネルギーシェア
- [ ] `DailyContentCard` — ジャーナリングテーマ
- [ ] 直近イベント横スクロールカード
- [ ] 新着アーカイブカードリスト
- [ ] 主宰者メッセージ表示

#### W2-3: アーカイブ機能 `/(member)/archive`
- [ ] `ArchiveCard` コンポーネント
- [ ] アーカイブ一覧（グリッド）
- [ ] キーワード検索
- [ ] カテゴリ・タグ・日付フィルター
- [ ] アーカイブ詳細ページ `/(member)/archive/[id]`
- [ ] 動画プレイヤー（URL埋め込み / ファイル再生）
- [ ] 議事録折りたたみ
- [ ] 再生リストページ `/(member)/archive/playlist/[id]`

#### W2-4: イベント `/(member)/events`
- [ ] Today ビュー（当日イベントカード）
- [ ] Monthly カレンダービュー
- [ ] イベント詳細ページ `/(member)/events/[id]`

#### W2-5: 各種ステータスページ
- [ ] `/trial` — 体験者向け（体験動画・入会案内）
- [ ] `/inactive` — 失効者向け（決済再開案内）
- [ ] `/login` — Discord OAuthログイン

---

### Wave 3: コンテンツ機能（P1）

#### W3-1: ジャーナリング `/(member)/journal`
- [ ] ジャーナル一覧（カレンダービュー）
- [ ] 新規作成ページ `/(member)/journal/new`
- [ ] 今日のジャーナリングテーマ表示
- [ ] 詳細・編集・削除

#### W3-2: 学習コンテンツ `/(member)/learning`
- [ ] 学習コンテンツ一覧
- [ ] 詳細ページ `/(member)/learning/[id]`

#### W3-3: 申請フォーム `/(member)/forms/[slug]`
- [ ] フォームレンダラー（スラグ別）
- [ ] マヤ暦講座・個人セッション・NextStage 面談
- [ ] アンバサダー向け: 新規紹介申請・ギブ会申請
- [ ] 申請送信 API

#### W3-4: アンバサダーダッシュボード `/(member)/ambassador`
- [ ] 紹介リンク生成・コピー
- [ ] 紹介人数・上限表示
- [ ] 今月報酬見込み・累計報酬
- [ ] 被紹介者一覧

---

### Wave 4: 管理画面（P0/P1）

#### W4-1: 管理画面基盤
- [ ] `AdminLayout` — 管理サイドバー
- [ ] 管理ダッシュボード `/admin`
- [ ] staff 権限チェック共通化

#### W4-2: 今日の更新管理 `/admin/today`
- [ ] エネルギーシェア・ジャーナリングテーマ編集
- [ ] 紐づくアーカイブ選択
- [ ] AI 抽出ボタン（P1）
- [ ] 公開日時設定

#### W4-3: アーカイブ管理 `/admin/archive`
- [ ] アーカイブ一覧テーブル
- [ ] 新規登録フォーム（URL / ファイルアップロード）
- [ ] サムネイル・タグ・再生リスト設定
- [ ] 公開・非公開切替

#### W4-4: 会員管理 `/admin/members`
- [ ] 会員一覧テーブル（検索・フィルター）
- [ ] 会員詳細 `/admin/members/[id]`
- [ ] 個別 Discord/Stripe 同期
- [ ] 一括同期

#### W4-5: イベント管理 `/admin/events`
- [ ] イベント一覧・作成・編集
- [ ] 申込状況管理

#### W4-6: フォーム管理 `/admin/forms`
- [ ] 申請一覧・ステータス管理（承認/非承認）
- [ ] 対応履歴

#### W4-7: 決済・権限管理 `/admin/payments`
- [ ] Stripe 決済状態確認
- [ ] 未払い・trial・inactive 一覧
- [ ] 手動ロール同期

---

### Wave 5: AI 抽出・外部連携（P1）

#### W5-1: AI 抽出パイプライン
- [ ] `/api/admin/archive/[id]/extract` エンドポイント
- [ ] Claude API 統合（claude-haiku-4-5）
- [ ] エネルギーシェア・ジャーナリングテーマ・要約抽出
- [ ] 結果プレビュー → DailyContent 保存

#### W5-2: Lark / Google Drive 連携
- [ ] 外部 URL からのアーカイブ登録
- [ ] サムネイル自動取得（可能な場合）

---

### Wave 6: 付加機能（P2）

#### W6-1: アンバサダー管理 `/admin/ambassador`
- [ ] アンバサダー種別管理
- [ ] 提携アンバサダー申請承認フロー
- [ ] 6ヶ月継続自動判定

#### W6-2: 提携店掲載 `/(member)/partners`
- [ ] 提携店一覧表示
- [ ] 提携店登録（ambassador_partner 向け）

#### W6-3: お助け隊管理
- [ ] お助け隊メンバー一覧
- [ ] 自主オフ会・ギブ会申請フロー

#### W6-4: 月次報酬バッチ
- [ ] Cron ジョブ設定（毎月1日）
- [ ] RewardRecord テーブルへの記録

---

### Wave 7: 品質・デプロイ（P0）

#### W7-1: テスト実装
- [ ] Vitest 結合テスト（Stripe Webhook・認証・API）
- [ ] Playwright E2E テスト（主要フロー）
- [ ] カバレッジ 80%+

#### W7-2: PWA 対応
- [ ] `manifest.json` 設定
- [ ] サービスワーカー
- [ ] ホーム画面アイコン

#### W7-3: デプロイ
- [ ] 環境変数設定（Discord / Stripe / DB）
- [ ] Vercel または AWS デプロイ
- [ ] Stripe Webhook エンドポイント登録

---

## 実装優先度サマリー

| Wave | 内容 | 優先度 | 依存 |
|------|------|--------|------|
| W1 | 基盤インフラ | **P0 必須** | なし |
| W2 | 会員向けコアページ | **P0 必須** | W1 |
| W4-1〜4-4 | 管理画面（コア）| **P0 必須** | W1, W2 |
| W3-1〜3-3 | コンテンツ機能 | P1 | W2 |
| W3-4 | アンバサダーダッシュボード | P1 | W1 |
| W5 | AI 抽出・外部連携 | P1 | W4 |
| W4-5〜4-7 | 管理画面（拡張）| P1 | W4-1 |
| W6 | 付加機能 | P2 | W1〜W4 |
| W7 | 品質・デプロイ | P0 | 全Wave |

---

## デザイン原則チェックリスト（実装時確認）

- [ ] フォント: Noto Serif JP（見出し）/ Noto Sans JP（本文）— Inter/Roboto/Arial 禁止
- [ ] 背景: `#FDF9F3` Ivory Mist（純白禁止）
- [ ] アクセント: `#8B5E3C` Warm Chestnut
- [ ] ボタン: `rounded-full`、最小高さ 44px
- [ ] カード: `rounded-2xl`、`shadow-sm` のみ
- [ ] アニメーション: 200ms 以下、transform/opacity のみ
- [ ] モバイル: ボトムナビ5タブ
- [ ] `prefers-reduced-motion` 対応
- [ ] WCAG AA: コントラスト比 4.5:1 以上
- [ ] `text-balance` を見出しに使用
- [ ] `tabular-nums` を数値・日付に使用
- [ ] `h-dvh` を使用（`h-screen` 禁止）

---

## 環境変数チェックリスト

```env
# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# DB
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Claude API (AI抽出・P1)
ANTHROPIC_API_KEY=
```

---

*Living Me 会員サイト — SSOT Issue v1.0 / 2026-03-20*
