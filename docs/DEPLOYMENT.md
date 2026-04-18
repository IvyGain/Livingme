# Living Me — デプロイガイド

**バージョン**: v2.0
**最終更新**: 2026-03-24

---

## 対応デプロイ先

| プラットフォーム | 推奨 | 備考 |
|----------------|------|------|
| Vercel | ✅ | Next.js ネイティブ、最小設定 |
| AWS (ECS + CloudFront) | ✅ | エンタープライズ、CodePipeline 対応 |
| Render / Railway | ⚪ | 中規模、PostgreSQL 付き |

---

## Vercel デプロイ

### 1. 環境変数の設定

Vercel ダッシュボード → プロジェクト → Settings → Environment Variables に以下を設定:

| 変数名 | 環境 |
|--------|------|
| `DATABASE_URL` | Production, Preview |
| `NEXTAUTH_URL` | Production（本番 URL） |
| `NEXTAUTH_SECRET` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | Production |
| `GMAIL_USER` | Production（招待メール送信に必要） |
| `GMAIL_APP_PASSWORD` | Production（招待メール送信に必要） |

> Stripe / UnivaPay の設定は `/admin/settings` から設定可能。
> 環境変数として設定することも可能。

### 2. デプロイ

```bash
# Vercel CLI
npx vercel --prod
```

または GitHub 連携で `main` ブランチへの push 時に自動デプロイ。

### 3. データベース

外部 PostgreSQL（Neon 推奨）を使用。
`DATABASE_URL` に接続文字列を設定（末尾に `?sslmode=require`）。

### 4. Stripe Webhook エンドポイント登録

Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `customer.subscription.*`, `invoice.payment_*`, `checkout.session.completed`

生成された `whsec_...` を `/admin/settings` に設定。

---

## 本番チェックリスト

### 環境変数

- [ ] `DATABASE_URL` — 本番 PostgreSQL（Neon 推奨）
- [ ] `NEXTAUTH_URL` — `https://your-domain.com`
- [ ] `NEXTAUTH_SECRET` — 強力なランダム文字列（32文字以上）
- [ ] `NEXT_PUBLIC_APP_URL` — `https://your-domain.com`
- [ ] `GMAIL_USER` — 送信元 Gmail アドレス
- [ ] `GMAIL_APP_PASSWORD` — Google アプリパスワード

### 管理画面設定（/admin/settings）

- [ ] `STRIPE_SECRET_KEY`（本番キー `sk_live_...`）
- [ ] `STRIPE_WEBHOOK_SECRET`（本番 `whsec_...`）
- [ ] `STRIPE_PRICE_ID`（月額プライス ID）

### データベース

- [ ] マイグレーション適用: `npm run db:migrate`
- [ ] 初期管理者ユーザーの作成（SQL または Prisma Studio で `role = 'ADMIN'` に設定）

### セキュリティ

- [ ] `NEXTAUTH_SECRET` が開発環境と異なる値を使用
- [ ] Stripe 本番キー（`sk_live_`）を使用

---

## マイグレーション手順

```bash
# 1. マイグレーションファイル作成
npm run db:migrate -- --name <migration-name>

# 2. 本番環境での適用
DATABASE_URL="production-url" npx prisma migrate deploy
```

---

## ロールバック

```bash
# 直前のマイグレーションに戻す（Prisma は自動ロールバック非対応）
# → データベースのバックアップから復元

# または マイグレーションを手動で revert
DATABASE_URL="production-url" npx prisma migrate resolve --rolled-back <migration-name>
```

---

## モニタリング

| 項目 | 推奨ツール |
|------|----------|
| エラー追跡 | Sentry |
| ログ | Vercel Log Drain / AWS CloudWatch |
| アップタイム | Better Uptime / UptimeRobot |
| DB パフォーマンス | Prisma Pulse / pganalyze |
