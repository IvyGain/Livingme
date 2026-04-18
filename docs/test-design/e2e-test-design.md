# Living Me E2Eテスト設計書

**バージョン**: v1.0
**生成日**: 2026-03-20
**フレームワーク**: Playwright

---

## 1. テスト対象シナリオ

### S-001: Discord OAuth ログインフロー

**優先度**: P0 Critical

```gherkin
Given  未ログインユーザーが / にアクセスする
When   「Discordでログイン」ボタンをクリックする
Then   Discord OAuth 認可画面へリダイレクトされる
When   Discord で認証が完了する
Then   会員ステータスに応じたページへリダイレクトされる
  - member  → /(member)/
  - trial   → /trial
  - inactive → /inactive
```

### S-002: 会員トップページ表示

**優先度**: P0 Critical

```gherkin
Given  member ステータスのユーザーがログインしている
When   /(member)/ にアクセスする
Then   今日のエネルギーシェアが表示される
And    今日のジャーナリングテーマが表示される
And    直近イベント一覧が表示される
And    新着アーカイブが表示される
```

### S-003: アーカイブ検索・閲覧

**優先度**: P0 Critical

```gherkin
Given  member ステータスのユーザーがログインしている
When   /(member)/archive にアクセスする
Then   アーカイブ一覧が表示される
When   検索バーに「朝会」と入力する
Then   タイトル・説明に「朝会」を含むアーカイブのみ表示される
When   カテゴリ「朝会」フィルターを選択する
Then   朝会カテゴリのアーカイブのみ表示される
When   任意のアーカイブカードをクリックする
Then   アーカイブ詳細ページが表示される
And    動画・議事録・要約が表示される
```

### S-004: ジャーナリング記録

**優先度**: P1 High

```gherkin
Given  member ステータスのユーザーがログインしている
When   /(member)/journal/new にアクセスする
Then   今日のジャーナリングテーマが表示される
When   テキストエリアに内容を入力し「保存」をクリックする
Then   保存完了の通知が表示される
And    /(member)/journal に保存済みエントリーが表示される
When   カレンダービューで今日の日付を確認する
Then   今日の日付にマークが付いている
```

### S-005: イベントカレンダー表示

**優先度**: P0 Critical

```gherkin
Given  member ステータスのユーザーがログインしている
When   /(member)/events にアクセスする
Then   Today ビューに当日のイベントが表示される
When   「月表示」タブをクリックする
Then   月間カレンダーにイベントが表示される
```

### S-006: trial ユーザーのアクセス制限

**優先度**: P0 Critical

```gherkin
Given  trial ステータスのユーザーがログインしている
When   /(member)/archive に直接アクセスする
Then   /trial へリダイレクトされる
And    体験動画・コミュニティ紹介コンテンツが表示される
```

### S-007: inactive ユーザーのアクセス制限

**優先度**: P0 Critical

```gherkin
Given  inactive ステータスのユーザーがログインしている
When   /(member)/ に直接アクセスする
Then   /inactive へリダイレクトされる
And    決済再開の案内が表示される
```

### S-008: 申請フォーム送信（P1）

**優先度**: P1 High

```gherkin
Given  member ステータスのユーザーがログインしている
When   /(member)/forms/maya-course にアクセスする
Then   マヤ暦講座申込みフォームが表示される
When   必要事項を入力して送信する
Then   「申請を受け付けました」メッセージが表示される
```

### S-009: 管理画面 - 今日のコンテンツ更新

**優先度**: P0 Critical

```gherkin
Given  staff ロールのユーザーがログインしている
When   /admin/today にアクセスする
Then   今日のコンテンツ編集画面が表示される
When   エネルギーシェアを入力して「保存」をクリックする
Then   保存完了の通知が表示される
When   会員トップページ /(member)/ を確認する
Then   更新されたエネルギーシェアが表示される
```

### S-010: 管理画面 - 会員一覧・同期

**優先度**: P0 Critical

```gherkin
Given  staff ロールのユーザーがログインしている
When   /admin/members にアクセスする
Then   会員一覧テーブルが表示される
When   任意の会員の「同期」ボタンをクリックする
Then   Discord・Stripe 同期が実行される
And    最終同期日時が更新される
```

---

## 2. テスト設定

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['json', { outputFile: '.test-logs/e2e-results.json' }]],

  projects: [
    // セットアップ: 認証状態を保存
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // モバイル（主要テスト）
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: '.playwright/auth/member.json',
      },
      dependencies: ['setup'],
    },
    // デスクトップ
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/auth/member.json',
      },
      dependencies: ['setup'],
    },
    // Safari (iOS)
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14'],
        storageState: '.playwright/auth/member.json',
      },
      dependencies: ['setup'],
    },
  ],
})
```

### 認証セットアップ（auth.setup.ts）

```typescript
// tests/e2e/auth.setup.ts
// Discord OAuth のモック認証（テスト用）
// または テスト専用シードユーザーで直接セッション生成

test('member auth setup', async ({ page }) => {
  // テスト用ユーザーで認証し、storageState を保存
  await page.goto('/api/test/auth?role=member')
  await page.context().storageState({ path: '.playwright/auth/member.json' })
})

test('staff auth setup', async ({ page }) => {
  await page.goto('/api/test/auth?role=staff')
  await page.context().storageState({ path: '.playwright/auth/staff.json' })
})

test('trial auth setup', async ({ page }) => {
  await page.goto('/api/test/auth?role=trial')
  await page.context().storageState({ path: '.playwright/auth/trial.json' })
})
```

---

## 3. テストアカウント

| アカウント | ステータス | 用途 |
|-----------|----------|------|
| `test-member@livingme.test` | member | 会員機能テスト |
| `test-staff@livingme.test` | staff | 管理画面テスト |
| `test-trial@livingme.test` | trial | アクセス制限テスト |
| `test-inactive@livingme.test` | inactive | 失効フローテスト |
| `test-ambassador@livingme.test` | member + ambassador_free | アンバサダーテスト |

---

## 4. カバレッジ目標

| シナリオ種別 | 目標 |
|-----------|------|
| P0 Critical シナリオ | 100% |
| P1 High シナリオ | 100% |
| アクセス制限チェック | 100% |
| モバイル表示確認 | P0全件 |

---

*Living Me 会員サイト - E2Eテスト設計書 v1.0*
