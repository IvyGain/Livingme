# Living Me 結合テスト設計書

**バージョン**: v2.0
**更新日**: 2026-03-24
**フレームワーク**: Vitest

---

## 1. テスト対象

### I-001: Stripe Webhook 処理

**優先度**: P0 Critical

```typescript
describe('Stripe Webhook Handler', () => {
  test('subscription.created → User.isActive = true')
  test('subscription.deleted → User.isActive = false')
  test('invoice.payment_failed → 猶予期間処理')
  test('重複イベント ID は処理をスキップする（冪等性）')
  test('署名検証失敗は 400 を返す')
})
```

### I-002: 認証ミドルウェア（proxy.ts）

**優先度**: P0 Critical

```typescript
describe('Auth Middleware', () => {
  test('未認証ユーザーは /(member)/* → /login へリダイレクト')
  test('isActive=false ユーザーは /login?error=suspended へリダイレクト')
  test('isActive=true ユーザーは /(member)/* にアクセス可能')
  test('非 ADMIN ユーザーは /admin/* → / へリダイレクト')
  test('ADMIN ユーザーは /admin/* にアクセス可能')
  test('/forms/* は全 isActive ユーザーが通過できる')
})
```

実際のテストは `tests/integration/proxy.test.ts` に実装済み。

### I-003: アーカイブ Server Actions

**優先度**: P0 Critical

```typescript
describe('archives.ts', () => {
  test('createArchive: ADMIN が新規アーカイブを作成できる')
  test('createArchive: 非 ADMIN はエラー')
  test('updateArchive: ADMIN が更新できる')
  test('deleteArchive: ADMIN が削除できる')
  test('getArchivesForAdmin: ADMIN が一覧取得できる')
})
```

実際のテストは `tests/integration/archives.test.ts` に実装済み。

### I-004: 会員管理 Server Actions

**優先度**: P0 Critical

```typescript
describe('members.ts', () => {
  test('getMembers: ADMIN が会員一覧を取得できる')
  test('getMemberStats: ADMIN が統計を取得できる（total/active/inactive）')
  test('updateMemberActive: ADMIN が isActive を切り替えられる')
  test('updateMemberRole: ADMIN がロールを変更できる')
  test('updateMemberInfo: ADMIN が名前等を更新できる')
})
```

実際のテストは `tests/integration/members.test.ts` に実装済み。

### I-005: 今日のコンテンツ Server Actions

**優先度**: P0 Critical

```typescript
describe('today.ts', () => {
  test('upsertTodayContent: ADMIN がコンテンツを作成・更新できる')
  test('getTodayContentForAdmin: ADMIN がコンテンツ一覧を取得できる')
  test('非 ADMIN はエラー')
})
```

実際のテストは `tests/integration/today.test.ts` に実装済み。

### I-006: フォーム送信

**優先度**: P1 High

```typescript
describe('forms.ts', () => {
  test('一般フォームは認証済みユーザーが送信できる')
  test('ambassadorOnly フォームは非アンバサダーがエラー')
  test('ambassadorOnly フォームはアンバサダーが送信できる')
  test('必須フィールド未入力はエラー')
  test('未認証ユーザーはエラー')
})
```

実際のテストは `tests/integration/forms.test.ts` に実装済み。

### I-007: 設定管理 Server Actions

**優先度**: P1 High

```typescript
describe('settings.ts', () => {
  test('getSettingsForAdmin: ADMIN が設定一覧を取得できる')
  test('saveSettings: ADMIN が設定を保存できる（Stripe/UnivaPay キー）')
  test('秘密情報（isSecret=true）は暗号化して保存される')
})
```

実際のテストは `tests/integration/settings-admin.test.ts` に実装済み。

### I-008: イベント申込 Server Actions

**優先度**: P1 High

```typescript
describe('registrations.ts', () => {
  test('registerForEvent: 認証済みユーザーがイベントに申込できる')
  test('cancelRegistration: 自分の申込をキャンセルできる')
  test('getMyRegistration: 自分の申込状況を取得できる')
  test('getEventRegistrationsForAdmin: ADMIN が申込者一覧を取得できる')
})
```

実際のテストは `tests/integration/registrations.test.ts` に実装済み。

---

## 2. テスト設定

```typescript
// vitest.config.ts（実際の設定）
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/integration/setup.ts'],
    include: ['tests/integration/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/proxy.ts', 'src/lib/**/*.ts', 'src/server/**/*.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
})
```

---

## 3. モック戦略

```typescript
// tests/integration/setup.ts
vi.mock('@/lib/prisma')    // DB書き込み禁止
vi.mock('@/lib/auth')      // セッション制御
vi.mock('nodemailer')      // メール送信禁止
vi.mock('next/navigation') // redirect() シミュレート
```

---

*Living Me 会員サイト - 結合テスト設計書 v2.0 — 2026-03-24*
