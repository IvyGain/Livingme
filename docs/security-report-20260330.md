# セキュリティリスク調査レポート

- **調査日**: 2026-03-30
- **対象**: Living Me（`src/` 配下の全コード）
- **調査範囲**: 認証・認可、入力バリデーション、XSS/CSRF、ファイルアップロード、Webhook、レート制限、シークレット管理

---

## サマリー

| 重大度 | 件数 |
|--------|------|
| Critical | 0 |
| High | 3 |
| Medium | 1 |
| Low | 2 |
| 情報 | 3 |

---

## High（高リスク）

### H-1: メール通知内でユーザー入力が HTML エスケープされていない

**ファイル**: `src/server/actions/inquiries.ts:44–47`

**内容**:
問い合わせフォームで受け取った `name` / `email` / `subject` / `body` が、管理者への通知メール HTML にそのまま埋め込まれている。

```typescript
html: `
  <p><strong>氏名:</strong> ${formData.name}<br/>
  <strong>メール:</strong> ${formData.email}<br/>
  <strong>件名:</strong> ${formData.subject || "（未入力）"}</p>
  <p><strong>内容:</strong><br/>${formData.body.replace(/\n/g, "<br/>")}</p>
`
```

**影響**:
- 攻撃者が `name` に `<script>alert(1)</script>` を送信すると、管理者が受け取るメールのブラウザ表示でスクリプトが実行される可能性がある（メールクライアント依存）
- `body.replace(/\n/g, "<br/>")` は改行変換のみで XSS 対策にならない

**推奨対応**:
ユーザー入力を HTML に埋め込む際にエスケープ処理を行う。

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

返信メール（`replyToInquiry` の `content`）も同様に要対応。

---

### H-2: パスワードリセットエンドポイントにレート制限がない

**ファイル**: `src/server/actions/password-change.ts:49–85`

**内容**:
`requestPasswordReset(email)` にレート制限がなく、1つのメールアドレスに対して無制限にリセットメールを送信できる。

**影響**:
- 攻撃者が特定ユーザーのメールアドレスに大量のリセットメールを送りつけることができる（メールスパム攻撃）
- Gmail SMTP の送信量制限（1日500通）を消費させ、正規メールが届かなくなる
- ユーザーを混乱させる嫌がらせに利用される可能性

**推奨対応**:
既存の `rate-limit.ts` を拡張し、メールアドレス単位で10分間に1回程度に制限する。

```typescript
const limit = checkRateLimit(`reset:${email}`);
if (!limit.allowed) {
  return { success: false, error: "しばらくしてからお試しください" };
}
recordFailure(`reset:${email}`);
```

---

### H-3: UnivaPay Webhook の署名検証がオプション

**ファイル**: `src/app/api/webhooks/univapay/route.ts:46–54`

**内容**:
`UNIVAPAY_APP_SECRET` が管理画面未設定の場合、署名検証がスキップされる。

```typescript
const appSecret = await getSetting("UNIVAPAY_APP_SECRET").catch(() => null);
if (appSecret && signature) {  // secret が null なら検証をスキップ
  if (!verifySignature(body, appSecret, signature)) { ... }
}
```

**影響**:
- シークレット未設定の環境（開発→本番移行直後など）では、誰でも Webhook エンドポイントを呼び出して会員ステータスを操作できる
- `subscription_payment` イベントを偽造して、未払いユーザーを有効化できる

**推奨対応**:
シークレット未設定の場合は `400 Bad Request` または `500 Internal Server Error` を返してリクエストを拒否する。

```typescript
if (!appSecret) {
  console.error("[univapay webhook] UNIVAPAY_APP_SECRET is not configured");
  return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
}
```

---

## Medium（中リスク）

### M-1: JSON.parse 後の型検証が不十分

**ファイル**: `src/server/actions/events.ts`

**内容**:
Lark から取得したイベントの `registrationFields` を `JSON.parse` した後、`as RegistrationField[]` で型アサーションしているが、実際のデータ構造を検証していない。

**影響**:
- 不正な形式のデータが DB/Lark に混入した場合、実行時エラーが発生する可能性
- 型アサーション (`as`) は TypeScript コンパイル時のみの保証で、実行時には保証なし

**推奨対応**:
Zod スキーマで形状を検証する。

```typescript
const registrationFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "textarea", "select", "checkbox"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});
const parsed = z.array(registrationFieldSchema).safeParse(JSON.parse(fieldsStr));
const registrationFields = parsed.success ? parsed.data : [];
```

---

## Low（低リスク）

### L-1: レート制限がインメモリ実装（分散環境非対応）

**ファイル**: `src/lib/rate-limit.ts`

**内容**:
`Map` によるインメモリ実装のため、サーバーを複数台構成（水平スケール）した場合に各インスタンス間でカウントが共有されない。

**影響**:
- 現状（Vercel 単一デプロイ）では問題なし
- 将来的にスケールアウトする場合は Redis 等に移行が必要

**推奨対応**:
ファイル内コメント通り、本番スケールアウト時は Redis に移行する。現時点では低優先度。

---

### L-2: パスワードリセット URL に `NEXTAUTH_URL` を使用

**ファイル**: `src/server/actions/password-change.ts:72`

```typescript
const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
```

**内容**:
`NEXT_PUBLIC_APP_URL` と `NEXTAUTH_URL` の2つの URL 環境変数が混在している。

**影響**:
- 本番環境で `NEXTAUTH_URL` が未設定だと `localhost:3000` のリセットリンクが送信される
- 実害は軽微だが、設定ミスに気づきにくい

**推奨対応**:
`process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` のようにフォールバックを揃える。

---

## 情報（問題なし・良好な実装）

### I-1: 認証・認可は適切に実装されている

- ログイン: タイミング攻撃対策済み（ダミーハッシュで一定時間消費）
- ログイン失敗: 5回で15分ブロック（`rate-limit.ts`）
- ミドルウェア: `/admin` パスは `ADMIN` ロールのみアクセス可能
- 全 Server Action: `requireAdmin()` / `requireAuth()` を適切に使用
- 全 API ルート: 認証チェックを実施

### I-2: オープンリダイレクト対策済み

```typescript
// src/app/login/LoginForm.tsx
const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/home";
```

相対パス（`/` 始まり）のみ許可し、外部 URL へのリダイレクトを防止。

### I-3: SQL インジェクションリスクなし

全 DB クエリに Prisma の型安全 API を使用。Raw SQL は一切使用していない。ファイルアップロードはサイズ・MIME タイプ・管理者認証の3段階チェック済み。

---

## 対応優先度

| 優先度 | Issue | 対応コスト |
|--------|-------|-----------|
| ⚡ 即時 | H-3: Webhook 署名検証をオプションから必須化 | 小（数行） |
| 🔴 高 | H-1: メール HTML エスケープ追加 | 小（ヘルパー関数1つ） |
| 🟠 高 | H-2: パスワードリセット レート制限追加 | 小（既存 rate-limit.ts を再利用） |
| 🟡 中 | M-1: JSON.parse 後の Zod 検証 | 中 |
| 🟢 低 | L-2: 環境変数統一 | 小 |
| ⚪ 将来 | L-1: Redis 移行 | 大（インフラ変更） |

---

*生成: Claude Code / 2026-03-30*
