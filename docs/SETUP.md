# Living Me — 開発環境セットアップ

**バージョン**: v2.0
**最終更新**: 2026-03-24

---

## 前提条件

| ツール | バージョン |
|-------|----------|
| Node.js | 20+ |
| npm | 10+ |

---

## 1. リポジトリのクローン・依存関係インストール

```bash
git clone <repo-url>
cd livingme
npm install
```

---

## 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下を設定します:

```env
# データベース（Neon PostgreSQL）
DATABASE_URL="postgresql://user:password@host/livingme?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ランダムな32文字以上の文字列"
# または AUTH_SECRET= でも可

# メール送信（Gmail SMTP）
GMAIL_USER="your-gmail@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # Google アプリパスワード（16桁）

# アプリ公開URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **NEXTAUTH_SECRET の生成方法**: ターミナルで `openssl rand -base64 32` を実行

> **Gmail アプリパスワードの取得**:
> Google アカウント → セキュリティ → 2段階認証を有効化 → アプリパスワードで生成

> **注意**: Stripe / UnivaPay の API キーは開発サーバー起動後、`/admin/settings` から設定できます。

---

## 3. データベースのセットアップ

```bash
# スキーマ適用（開発時）
npm run db:push

# または マイグレーション管理（本番推奨）
npm run db:migrate

# Prisma クライアント生成
npm run db:generate

# Prisma Studio（GUIクライアント、任意）
npm run db:studio
```

---

## 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

---

## 5. 初回管理者ユーザーの作成

初回は Neon のダッシュボードまたは Prisma Studio で管理者ユーザーを作成します。

```sql
-- パスワードは bcrypt ハッシュが必要なため、まず通常ユーザーを招待経由で作成後、
-- 以下で ADMIN ロールに昇格させる
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

または Prisma Studio（`npm run db:studio`）から GUI で操作できます。

---

## 6. Stripe Webhook（ローカル開発）

```bash
# Stripe CLI をインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhook を localhost に転送
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

表示される `whsec_...` を `/admin/settings` の **Stripe Webhook シークレット** に設定。

---

## 7. テスト実行

```bash
# ユニットテスト + 統合テスト（Vitest）
npm test

# カバレッジレポート
npm run test:coverage

# E2Eテスト（Playwright）—— 開発サーバー起動が必要
npm run test:e2e
```

---

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm test` | テスト（Vitest） |
| `npm run test:coverage` | テストカバレッジ |
| `npm run test:e2e` | E2Eテスト（Playwright） |
| `npm run db:push` | スキーマ → DB 適用 |
| `npm run db:migrate` | マイグレーション作成・実行 |
| `npm run db:generate` | Prisma クライアント生成 |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:studio` | Prisma Studio 起動 |

---

## トラブルシューティング

### ログインできない

- `NEXTAUTH_SECRET` が設定されているか確認
- パスワードが bcrypt でハッシュされているか確認（`npm run db:seed` で作成されたユーザーは OK）

### メールが届かない

- `GMAIL_USER` と `GMAIL_APP_PASSWORD` が設定されているか確認
- Google アカウントの 2 段階認証が有効になっているか確認
- アプリパスワード（16 桁）を使用しているか確認（通常のパスワードは不可）

### Stripe Webhook が届かない

- `stripe listen` が起動しているか確認
- `whsec_...` が `/admin/settings` に設定されているか確認（`stripe listen` の出力と一致）

### DB 接続エラー

- `DATABASE_URL` の末尾に `?sslmode=require` があるか確認（Neon の場合）
