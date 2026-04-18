# Living Me — API リファレンス

**バージョン**: v2.0
**最終更新**: 2026-03-24

---

## API エンドポイント

### POST /api/webhooks/stripe

Stripe からの Webhook イベントを受信します。

**認証**: `stripe-signature` ヘッダー（HMAC 署名検証）

**処理するイベント:**

| Stripe イベント | 処理内容 |
|----------------|---------|
| `customer.subscription.created` | User.isActive → true |
| `customer.subscription.updated` | ステータス同期 |
| `customer.subscription.deleted` | User.isActive → false |
| `invoice.payment_succeeded` | 支払い成功記録 |
| `invoice.payment_failed` | 支払い失敗処理 |
| `checkout.session.completed` | 新規購読完了 |

**冪等性**: 同一 `event.id` は `StripeEvent` テーブルで重複チェック。

**レスポンス:**
```json
{ "received": true }                          // 正常処理
{ "received": true, "skipped": true }         // 重複イベント
{ "error": "Missing stripe-signature" }       // 400
{ "error": "Invalid signature" }              // 400
```

---

### GET /api/auth/[...nextauth]
### POST /api/auth/[...nextauth]

NextAuth.js v5 の認証ハンドラー。メール+パスワード（Credentials Provider）フローを処理します。

---

### POST /api/invite

管理者が会員を招待するエンドポイント。
招待メール（Gmail SMTP）を送信し、72 時間有効な招待トークンを生成します。

**認証**: ADMIN ロール必須

---

## Server Actions

### journals.ts

#### `upsertJournal(data)`

ジャーナルを作成または更新します。

```typescript
upsertJournal({
  body: string,    // 必須。空白のみは不可
  mood?: string,   // 例: "😊 穏やか"
  date?: string,   // YYYY-MM-DD。省略時は今日
}): Promise<{ success: boolean; error?: string; id?: string }>
```

**認証**: セッション必須。`userId_date` で upsert。

---

### forms.ts

#### `submitForm(slug, data)`

申請フォームを送信します。

```typescript
submitForm(
  slug: string,                   // フォームスラグ
  data: Record<string, string>    // フィールド値
): Promise<{ success: boolean; error?: string }>
```

**アクセス制御:**
- `ambassadorOnly: true` フォーム → 非アンバサダーはエラー
- その他フォーム → 認証済みアクティブユーザー全員可

---

### archives.ts

アーカイブの CRUD 操作（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `createArchive(data)` | 新規アーカイブ作成 |
| `updateArchive(id, data)` | アーカイブ更新 |
| `deleteArchive(id)` | アーカイブ削除 |
| `getArchivesForAdmin()` | 管理者向け一覧取得 |

---

### events.ts

イベントの CRUD 操作（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `createEvent(data)` | イベント作成 |
| `updateEvent(id, data)` | イベント更新 |
| `deleteEvent(id)` | イベント削除 |
| `getEventsForAdmin()` | 管理者向け一覧取得 |

---

### registrations.ts

イベント申込管理。

| アクション | 説明 |
|-----------|------|
| `registerForEvent(eventId)` | イベントに申込 |
| `cancelRegistration(eventId)` | 申込キャンセル |
| `getMyRegistration(eventId)` | 自分の申込状況取得 |
| `getEventRegistrationsForAdmin(eventId)` | 申込者一覧（管理者） |

---

### members.ts

会員管理（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `getMembers()` | 会員一覧取得 |
| `getMemberStats()` | 会員統計（total/active/inactive） |
| `updateMemberActive(userId, isActive)` | 有効/停止切替 |
| `updateMemberRole(userId, role)` | ロール変更 |
| `updateMemberInfo(userId, data)` | 名前等の更新 |

---

### today.ts

今日のコンテンツ管理（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `upsertTodayContent(data)` | 今日のエネルギーシェア・テーマ保存 |
| `getTodayContentForAdmin()` | 管理者向け取得 |

---

### settings.ts

外部サービス設定（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `getSettingsForAdmin()` | 設定一覧取得 |
| `saveSettings(data)` | 設定値保存（秘密情報は暗号化） |

---

### home-layout-actions.ts

ホーム画面レイアウト設定（管理者向け）。

| アクション | 説明 |
|-----------|------|
| `getHomeLayoutSettings()` | レイアウト設定取得 |
| `saveHomeLayoutSettings(data)` | レイアウト・カラースキーム保存 |

---

## 型定義

### Session（next-auth.d.ts）

```typescript
session.user = {
  id: string;           // DB ユーザー ID（CUID）
  name: string;
  image: string | null;
  email?: string;
  isActive: boolean;    // true=有効会員 / false=停止中
  role: "MEMBER" | "ADMIN";
}
```

### FormDef（lib/form-defs.ts）

```typescript
interface FormDef {
  slug: string;
  title: string;
  description: string;
  fields: FormField[];
  ambassadorOnly?: boolean;
}
```

---

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 接続 URL |
| `NEXTAUTH_URL` | ✅ | アプリの公開 URL |
| `NEXTAUTH_SECRET` | ✅ | JWT 署名シークレット（32文字以上推奨） |
| `AUTH_SECRET` | ⚪ | NEXTAUTH_SECRET の代替（NextAuth v5 推奨） |
| `GMAIL_USER` | ⚪ | Gmail SMTP 送信元アドレス |
| `GMAIL_APP_PASSWORD` | ⚪ | Gmail アプリパスワード（16桁） |
| `EMAIL_FROM` | ⚪ | 差出人表示名 |
| `NEXT_PUBLIC_APP_URL` | ⚪ | 公開 URL（招待リンク生成用） |

※ Stripe / UnivaPay の設定は `/admin/settings` から DB に保存可能。
環境変数でも設定でき、DB 設定が優先されます。
