# Living Me — デプロイチェックリスト

Web サービスとして公開するための本番デプロイ手順と必須チェック項目。

## 1. 事前準備

### 1.1 環境変数

`.env.example` をベースに、以下を **本番ホスティング側のシークレット管理** に登録します。`.env.local` は **絶対にコミットしない** こと（`.gitignore` 済み）。

| 変数 | 必須 | 用途 | 生成方法 |
|---|---|---|---|
| `AUTH_SECRET` | ✅ | NextAuth JWT 署名/暗号化 | `openssl rand -base64 32` |
| `AUTH_SALT` | 推奨 | Setting テーブル AES 鍵導出 | `openssl rand -base64 32` |
| `DATABASE_URL` | ✅ | PostgreSQL 接続文字列 | Neon / Supabase / RDS など |
| `NEXTAUTH_URL` | ✅ | 本番ドメイン (https) | `https://livingme.example.com` |
| `UPSTASH_REDIS_REST_URL` | **強く推奨** (1000+ ユーザー) | レートリミッタ永続化 | Upstash で Database 作成 → REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | **強く推奨** (1000+ ユーザー) | 同上 | 同上 |
| `LARK_*` | 任意 | Lark Base 連携 | 管理画面 > 設定 から後で投入可 |
| `UNIVAPAY_*` | 任意 | 課金 (現在は 501 を返す stub) | 後続フェーズ |

### 1.3 Upstash Redis（1000+ ユーザー向け必須）

水平スケールする Vercel/Lambda ではログイン失敗カウンタを **永続化が必要**。

最速セットアップ:

1. Vercel ダッシュボード → Project → **Storage** タブ → **Create Database** → **Upstash for Redis**
2. リージョンは Vercel と同じ（例: us-east-1）を選択 → Free プランで開始
3. **Connect to Project** で `livingme-app` にリンクすると、`UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` が自動で env に追加される
4. 再デプロイで反映

未設定でも動きますが、**ブルートフォース攻撃に対し弱くなります**（インスタンスごと独立カウンタ）。
`src/lib/rate-limit.ts` は env が無ければ in-memory にフォールバックします。

### 1.2 データベース

- **本番ではマネージド Postgres を推奨**: Neon（推奨、Vercel と無料連携）、Supabase、AWS RDS for PostgreSQL 15+
- **接続文字列に `?sslmode=require` を必須付与**（Neon/Supabase は自動）
- **Prisma マイグレーションを適用**:
  ```bash
  DATABASE_URL=... npx prisma migrate deploy
  ```
- **本番ではシードを実行しない** (`prisma/seed.ts` はテストアカウントを作成します)
- 初回管理者アカウントは `npm run create-admin` または `scripts/create-admin.ts` で作成

## 2. 本番ビルドの確認（ローカル）

デプロイ前にローカルで本番モードを再現:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm test                         # vitest
NODE_ENV=production npm run build
NODE_ENV=production npm start    # http://localhost:3000

# 動作確認
curl -sf http://localhost:3000/api/health | jq .
curl -sI http://localhost:3000/ | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy|content-security"
curl -so /dev/null -w "%{http_code}\n" http://localhost:3000/demo/forms-admin   # => 404
```

## 3. セキュリティ設定（実装済み）

### 3.1 HTTP セキュリティヘッダ（`next.config.ts`）

- `Strict-Transport-Security` (本番のみ)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`（YouTube埋め込み許可、それ以外 self）

### 3.2 認証・セッション（`src/lib/auth.ts`）

- NextAuth v5 + JWT（`maxAge: 7d`、`updateAge: 1d`）
- 本番では `__Secure-` プレフィックス付き Cookie / `Secure; HttpOnly; SameSite=Lax`
- `verifyPassword` は `timingSafeEqual` でタイミング攻撃対策
- ログイン失敗のレートリミット（後述の既知の制約あり）

### 3.3 データ層

- パスワード: scrypt + ランダム 16byte salt
- 設定値（API トークン等）: AES-256-GCM 暗号化（`AUTH_SECRET` 由来鍵）
- Lark Base App Token は `isSecret: true` で DB 保管時に暗号化
- アクセス制御: `src/proxy.ts` ですべての非公開パスを認証ゲート、`/admin/**` は ADMIN ロール必須、`isActive=false` ユーザーは強制ログアウト

### 3.4 入力バリデーション

- 動的フォーム送信は `form.fields` から動的生成した Zod schema (`strict()`) で検証
- text/textarea は最大 5000 文字、select は定義済み選択肢のみ、date は ISO 形式
- Server Actions はすべて `requireAdmin()` または `auth()` で再検証

## 4. デプロイ手順例

### 4.1 Vercel

1. プロジェクトを GitHub に push
2. Vercel で New Project → Import
3. **Environment Variables** に `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL` を登録
4. **Build Command** はデフォルト (`next build`)
5. デプロイ後 `https://<your-domain>/api/health` で 200 を確認
6. Domains で本番ドメインを設定し、CNAME / A レコードを追加

### 4.2 AWS（ECS / App Runner）

`docs/aws-cost-estimate.md` と `docs/deploy-vercel.md` を参照。

## 5. 既知の制約 / 後続 Issue

リリース後に対応する項目（READMEの Roadmap に転記推奨）:

| 項目 | 制約 | 暫定対処 |
|---|---|---|
| ログインレートリミット | in-memory のため複数インスタンスで非同期 / 再起動で失効 | 当面 1 インスタンスで運用、Upstash Redis 化を別 Issue |
| UnivaPay チェックアウト | `/api/checkout` は 501 を返す | 課金導線を有効化する際に実装 |
| 監査ログ | `AuditLog` テーブル無し | 別 Issue |
| 招待トークン GC | 期限切れトークン自動削除無し | cron で `prisma.inviteToken.deleteMany({ where: { expiresAt: { lt: new Date() }}})` |
| 設定キャッシュ TTL | 60秒（管理画面で更新後 最大 60秒 反映遅延） | 必要なら短縮 |

## 6. リリース後 Smoke Test

```bash
BASE=https://your-domain
curl -sf $BASE/api/health | jq .                                       # status: ok
curl -sI $BASE/ | grep -iE "strict-transport|content-security"         # ヘッダ存在
curl -sI $BASE/demo/forms-admin | head -1                              # 404
curl -sI $BASE/admin/content/forms | head -1                           # 307 → /login
```

ブラウザで手動確認:

1. `/login` で管理者ログイン
2. `/admin/content/forms` でフォーム CRUD
3. `/forms/<slug>` で会員フォーム表示・送信
4. 送信内容が Lark Base（設定済みなら）に反映

## 7. インシデント対応

- **AUTH_SECRET 漏洩疑い**: 直ちに新 Secret に差し替え → 全ユーザー強制ログアウト → 既存セッションは復号不能になり無効化
- **データ漏洩疑い**: Postgres 側の Audit Log（Neon/RDS の機能）を確認、必要なら `User` の `password` を強制リセット（次回ログイン時にパスワード再設定フローへ誘導）
- **DB 障害**: `/api/health` が 503 を返す。アプリは 503 を出し続けるので、ヘルスチェック付き LB であれば自動的にトラフィック停止
