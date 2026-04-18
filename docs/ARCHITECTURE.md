# Living Me — システムアーキテクチャ

**バージョン**: v2.0
**最終更新**: 2026-03-24

---

## 概要

Living Me は Next.js 16 (App Router) で構築された会員制コミュニティポータルです。
メールアドレス＋パスワードで認証し、Stripe / UnivaPay Webhook で会員ステータスを制御します。

```
ブラウザ
  │
  ├── Next.js 16 (App Router)
  │     ├── src/proxy.ts          ← 認証ガード（Next.js 16 の middleware）
  │     ├── src/app/(member)/     ← 会員向けページ
  │     ├── src/app/admin/        ← 管理画面
  │     └── src/app/api/          ← API エンドポイント
  │
  ├── PostgreSQL (Prisma ORM) — Neon
  ├── メール送信 (Gmail SMTP / nodemailer)
  └── 決済 (Stripe Webhook / UnivaPay)
```

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| フレームワーク | Next.js | 16.x |
| 言語 | TypeScript | ^5 |
| 認証 | NextAuth.js | v5 |
| ORM | Prisma | ^7 |
| DB | PostgreSQL (Neon) | — |
| 決済 | Stripe | ^20 |
| メール | nodemailer (Gmail SMTP) | — |
| スタイリング | Tailwind CSS | v4 |
| コンポーネント | shadcn/ui | — |
| フォームバリデーション | Zod | v4 |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (member)/          会員向けルートグループ
│   │   ├── layout.tsx     認証チェック + ヘッダー/ナビ
│   │   ├── page.tsx       トップページ
│   │   ├── archive/       アーカイブ一覧・詳細
│   │   ├── events/        イベント一覧・詳細・申込
│   │   ├── journal/       ジャーナリング
│   │   ├── forms/         申請フォーム
│   │   └── ambassador/    アンバサダーダッシュボード
│   ├── admin/             管理画面（ADMIN ロール必須）
│   │   ├── layout.tsx     管理サイドバー
│   │   ├── page.tsx       ダッシュボード
│   │   ├── members/       会員管理
│   │   ├── content/       コンテンツ管理（今日の更新・アーカイブ）
│   │   ├── events/        イベント管理
│   │   ├── home-layout/   ホーム画面レイアウト設定
│   │   └── settings/      外部サービス設定
│   ├── api/
│   │   ├── auth/[...nextauth]/  NextAuth ハンドラー
│   │   ├── invite/              招待メール送信 API
│   │   └── webhooks/stripe/     Stripe Webhook
│   ├── login/             ログインページ（メール+パスワード）
│   ├── invite/[token]/    招待リンクからのパスワード設定
│   ├── join/              会員登録・Stripe 決済
│   └── demo/              デモページ（認証不要）
├── components/
│   ├── layout/            Header, Sidebar, MobileNav
│   ├── member/            会員向けコンポーネント
│   └── ui/                shadcn/ui コンポーネント
├── lib/
│   ├── auth.ts            NextAuth 設定（Credentials Provider）
│   ├── prisma.ts          Prisma クライアント
│   ├── stripe.ts          Stripe クライアント
│   ├── email.ts           Gmail SMTP メール送信
│   ├── settings.ts        DB 設定値キャッシュ
│   ├── form-defs.ts       申請フォーム定義
│   ├── crypto.ts          AES-256-GCM 暗号化ユーティリティ
│   ├── password.ts        bcrypt パスワードハッシュ
│   ├── rate-limit.ts      ログイン試行制限
│   ├── permissions.ts     権限チェック
│   └── home-layout.ts     ホーム画面レイアウト定義
├── server/
│   ├── actions/           Server Actions
│   │   ├── journals.ts    ジャーナル CRUD
│   │   ├── archives.ts    アーカイブ管理
│   │   ├── events.ts      イベント管理
│   │   ├── registrations.ts イベント申込管理
│   │   ├── forms.ts       フォーム送信
│   │   ├── members.ts     会員管理
│   │   ├── today.ts       今日のコンテンツ管理
│   │   ├── home-layout-actions.ts ホームレイアウト設定
│   │   └── settings.ts    設定管理
│   └── services/
│       └── stripe-sync.ts  Stripe → DB 同期
├── proxy.ts               認証ミドルウェア（Next.js 16）
└── types/
    └── next-auth.d.ts     セッション型拡張
```

---

## 認証フロー

```
1. ユーザーが /login にアクセス
2. メールアドレス + パスワードを入力
3. NextAuth Credentials Provider が検証
   a. レートリミット確認（5 回失敗で 15 分ブロック）
   b. タイミング攻撃対策（ダミーハッシュで常に bcrypt 実行）
   c. DB からユーザー取得・パスワード照合
4. JWT に { dbId, isActive, role } を保存
5. セッション Cookie（authjs.session-token）を発行
6. / にリダイレクト
```

### アクセス制御ロジック（proxy.ts）

```
リクエスト
  │
  ├── 公開パス (/login, /join, /invite, /demo, /api/auth, /api/webhooks, ...) → 通過
  │     └── /login + セッションあり
  │           ├── isActive=false → /login?error=suspended
  │           └── isActive=true  → /
  │
  ├── 未認証 → /login リダイレクト
  │
  ├── isActive=false → /login?error=suspended
  │
  ├── /admin/* → role=ADMIN チェック（MEMBER なら / リダイレクト）
  │
  ├── /forms/* → 全認証済みアクティブユーザー通過
  │
  └── その他 → 通過
```

---

## Stripe Webhook フロー

```
Stripe
  │
  └── POST /api/webhooks/stripe
        │
        ├── 1. stripe-signature 検証（400 if invalid）
        ├── 2. 冪等性チェック（StripeEvent テーブル）
        │         重複なら skipped: true を返して終了
        ├── 3. イベント処理
        │   ├── subscription.created/updated → isActive=true に更新
        │   ├── subscription.deleted         → isActive=false に更新
        │   ├── invoice.payment_succeeded    → 支払い成功確認
        │   ├── invoice.payment_failed       → 猶予期間処理
        │   └── checkout.session.completed   → 新規購読完了処理
        └── 4. 200 OK
```

---

## データモデル

```
User
  ├── id: string (CUID)
  ├── email: string (unique)
  ├── name: string?
  ├── password: string?     (bcrypt ハッシュ)
  ├── isActive: boolean     (true=有効会員 / false=停止中)
  ├── role: UserRole        (MEMBER / ADMIN)
  ├── ambassadorType: AmbassadorType?
  ├── stripeCustomerId: string?
  ├── inviteToken: string?
  ├── inviteTokenExpiry: DateTime?
  ├── journals[]       ─── Journal
  ├── stripeEvents[]   ─── StripeEvent
  └── registrations[]  ─── EventRegistration

Archive
  ├── category: ArchiveCategory
  └── tags[] ─── ArchiveTag → Tag

TodayContent  ── date unique (daily)
Event         ── イベント + 申込管理
Setting       ── key-value + isSecret (暗号化)
```

---

## 設定管理

設定値は DB（`Setting` テーブル）に保存し、秘密情報は AES-256-GCM で暗号化して保存します。
`getSetting(key)` は DB → 環境変数の順でフォールバックします（1 分間キャッシュ）。

```typescript
// 優先順位: DB (復号済み) > process.env[key]
export async function getSetting(key: SettingKey): Promise<string | undefined>
```

管理画面 `/admin/settings` から設定可能なキー:

| グループ | キー |
|---------|------|
| Stripe | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID |
| UnivaPay | UNIVAPAY_APP_TOKEN, UNIVAPAY_APP_SECRET, UNIVAPAY_PRICE |

---

## 申請フォームシステム

フォーム定義は `src/lib/form-defs.ts` に記述。
送信後の通知は管理画面での確認のみ（外部 Webhook 送信なし）。

| スラグ | タイトル | アクセス条件 |
|--------|---------|------------|
| `maya-calendar` | マヤ暦講座申請 | 全アクティブ会員 |
| `personal-session` | 個人セッション申請 | 全アクティブ会員 |
| `next-stage` | NextStage 面談申請 | 全アクティブ会員 |
| `referral` | 新規紹介申請 | アンバサダーのみ |
| `give-kai` | ギブ会申請 | アンバサダーのみ |

---

## メール送信

Gmail SMTP（nodemailer）を使用。

```
環境変数:
  GMAIL_USER         送信元 Gmail アドレス
  GMAIL_APP_PASSWORD Google アカウントのアプリパスワード（16 桁）
```

現在使用しているメール:
- 招待メール（`/admin/members` から送信）

---

*Living Me システムアーキテクチャ v2.0 — 2026-03-24*
