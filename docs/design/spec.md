# Living Me 機能仕様書

**バージョン**: v2.0
**生成日**: 2026-03-20 / **更新日**: 2026-03-24
**ソース**: docs/requirements/requirements.md
**プロジェクト名**: Living Me 〜本当の自分と出逢う会〜 会員サイト

---

## 1. システムアーキテクチャ概要

```
┌─────────────────────────────────────────────────┐
│                  Next.js 16 (App Router)         │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ (member) │  │  /admin  │  │ /api (Routes)  │ │
│  │  pages   │  │  pages   │  │                │ │
│  └──────────┘  └──────────┘  └────────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │       proxy.ts (Auth Guard)              │   │
│  │  isActive / role (MEMBER / ADMIN)        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │                         │
    ┌────▼───┐                ┌────▼───┐
    │Prisma  │                │ Stripe │
    │  ORM   │                │Webhook │
    │  PG    │                │        │
    └────────┘                └────────┘
```

### 技術スタック確定

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| ORM | Prisma |
| DB | PostgreSQL (Neon) |
| 認証 | NextAuth.js v5 + Credentials (メール+パスワード) |
| 決済 | Stripe / UnivaPay |
| メール | nodemailer (Gmail SMTP) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| アニメーション | motion/react |

---

## 2. ルーティング設計

### 2.1 公開ルート（認証不要）

| パス | 説明 |
|------|------|
| `/login` | メール+パスワードログイン画面 |
| `/join` | 会員登録・Stripe 決済 |
| `/invite/[token]` | 招待リンクからのパスワード設定 |
| `/demo` | デモページ（サンプルデータ） |
| `/api/auth/[...nextauth]` | NextAuth.js エンドポイント |
| `/api/invite` | 招待メール送信 API |
| `/api/webhooks/stripe` | Stripe Webhook 受信 |

### 2.2 会員ルート (`/` → `/(member)/`)

| パス | 説明 | 権限 |
|------|------|------|
| `/(member)/` | 会員トップページ | member |
| `/(member)/archive` | アーカイブ一覧 | member |
| `/(member)/archive/[id]` | アーカイブ詳細 | member |
| `/(member)/archive/playlist/[id]` | 再生リスト | member |
| `/(member)/events` | イベント一覧 | member |
| `/(member)/events/[id]` | イベント詳細 | member |
| `/(member)/journal` | ジャーナリング一覧 | member |
| `/(member)/journal/new` | 新規ジャーナリング | member |
| `/(member)/journal/[id]` | ジャーナリング詳細 | member |
| `/(member)/learning` | 学習コンテンツ | member |
| `/(member)/learning/[id]` | 学習コンテンツ詳細 | member |
| `/(member)/forms/[slug]` | 申請フォーム | member |
| `/(member)/ambassador` | アンバサダーダッシュボード | ambassador |
| `/(member)/partners` | 提携店一覧 | member |

### 2.3 管理ルート (`/admin/`)

| パス | 説明 | 権限 |
|------|------|------|
| `/admin` | 管理ダッシュボード | staff |
| `/admin/members` | 会員一覧 | staff |
| `/admin/members/[id]` | 会員詳細 | staff |
| `/admin/archive` | アーカイブ管理 | staff |
| `/admin/archive/new` | アーカイブ登録 | staff |
| `/admin/archive/[id]/edit` | アーカイブ編集 | staff |
| `/admin/today` | 今日の更新管理 | staff |
| `/admin/events` | イベント管理 | staff |
| `/admin/events/new` | イベント作成 | staff |
| `/admin/forms` | フォーム管理 | staff |
| `/admin/forms/[id]` | フォーム申請一覧 | staff |
| `/admin/ambassador` | アンバサダー管理 | staff |
| `/admin/payments` | 決済・権限管理 | staff |
| `/admin/content` | コンテンツ管理 | staff |

---

## 3. 認証仕様

### 3.1 メール+パスワード認証フロー

```
ユーザー → /login
    ↓
メールアドレス + パスワード入力
    ↓
NextAuth Credentials Provider
    ↓
レートリミット確認（5回失敗→15分ブロック）
    ↓
DB からユーザー取得・bcrypt 照合
    ↓
JWT に { dbId, isActive, role } を保存
    ↓
セッション Cookie 発行 → / へリダイレクト
```

### 3.2 ミドルウェア権限制御（proxy.ts）

```typescript
// src/proxy.ts

// 公開パス → 通過
// /login + isActive=true → / へリダイレクト
// /login + isActive=false → /login?error=suspended

// 未認証 → /login?callbackUrl=...
// isActive=false → /login?error=suspended

// /admin/* → role=ADMIN 必須 → 非ADMIN は / へ
// /forms/* → 全 isActive ユーザー通過
// その他   → 通過
```

### 3.3 セッション構造

```typescript
interface Session {
  user: {
    id: string          // DB ユーザー ID (CUID)
    name: string
    email?: string
    image: string | null
    isActive: boolean   // true=有効会員 / false=停止中
    role: 'MEMBER' | 'ADMIN'
  }
}
```

---

## 4. データモデル設計

### 4.1 User（会員）

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  password          String?           // bcrypt ハッシュ
  avatarUrl         String?
  isActive          Boolean   @default(true)   // true=有効 / false=停止
  role              UserRole  @default(MEMBER)
  ambassadorType    AmbassadorType?
  stripeCustomerId  String?   @unique
  inviteToken       String?   @unique
  inviteTokenExpiry DateTime?
  joinedAt          DateTime?
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  journals          Journal[]
  stripeEvents      StripeEvent[]
  registrations     EventRegistration[]
}

enum UserRole {
  MEMBER
  ADMIN
}

enum AmbassadorType {
  FREE
  REFERRAL
  PARTNER
}
```

### 4.2 Archive（アーカイブ）

```prisma
model Archive {
  id                    String    @id @default(cuid())
  title                 String
  date                  DateTime
  category              ArchiveCategory
  description           String?
  videoUrl              String?
  videoFileKey          String?   // S3 key
  thumbnailUrl          String?
  minutes               String?   // 議事録
  summary               String?   // 要約
  extractedEnergyShare  String?   // AI抽出エネルギーシェア
  extractedJournalTheme String?   // AI抽出ジャーナリングテーマ
  isPublished           Boolean   @default(false)
  publishedAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  tags                  ArchiveTag[]
  playlists             PlaylistArchive[]
  dailyContent          DailyContent[]
}

enum ArchiveCategory {
  MORNING_MEETING   // 朝会
  EVENING_MEETING   // 夜会
  LEARNING          // 学習
  EVENT             // イベント
  OTHER
}
```

### 4.3 DailyContent（今日の表示）

```prisma
model DailyContent {
  id              String    @id @default(cuid())
  date            DateTime  @unique @db.Date
  energyShare     String?
  journalTheme    String?
  summary         String?
  isAutoExtracted Boolean   @default(false)
  sourceArchive   Archive?  @relation(fields: [archiveId], references: [id])
  archiveId       String?
  publishAt       DateTime?
  isPublished     Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 4.4 Event（イベント）

```prisma
model Event {
  id            String      @id @default(cuid())
  title         String
  type          EventType
  description   String?
  startAt       DateTime
  endAt         DateTime?
  joinUrl       String?
  location      String?
  isPublished   Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum EventType {
  MORNING_MEETING
  EVENING_MEETING
  ONLINE_EVENT
  OFFLINE_EVENT
  GIVE_KAI
  STUDY_SESSION
}
```

### 4.5 Journal（ジャーナリング）

```prisma
model Journal {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String
  theme     String?
  writtenAt DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.6 Referral（紹介制度）

```prisma
model Referral {
  id              String    @id @default(cuid())
  referrerId      String
  referrer        User      @relation("referrer", fields: [referrerId], references: [id])
  referredId      String    @unique
  referred        User      @relation("referred", fields: [referredId], references: [id])
  joinedAt        DateTime?
  isActive        Boolean   @default(true)
  rewardsPaid     Int       @default(0)  // 支払い済み報酬月数
  createdAt       DateTime  @default(now())
}
```

### 4.7 その他モデル

```prisma
model Tag { id String @id; name String @unique; archives ArchiveTag[] }
model ArchiveTag { archiveId String; tagId String; @@id([archiveId, tagId]) }
model Playlist { id String @id; title String; archives PlaylistArchive[] }
model PlaylistArchive { playlistId String; archiveId String; order Int; @@id([playlistId, archiveId]) }
model FormSubmission { id String @id; formSlug String; userId String; data Json; status SubmissionStatus @default(PENDING) }
enum SubmissionStatus { PENDING APPROVED REJECTED }
model Partner { id String @id; userId String @unique; name String; description String; photos String[]; url String?; isPublished Boolean @default(false) }
model Post { id String @id; title String; content String; type PostType; isPublished Boolean; publishedAt DateTime? }
enum PostType { COLUMN ANNOUNCEMENT }
```

---

## 5. API エンドポイント設計

### 5.1 会員向け API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/daily-content` | 今日のコンテンツ取得 |
| GET | `/api/archive` | アーカイブ一覧（検索・フィルタ）|
| GET | `/api/archive/[id]` | アーカイブ詳細 |
| GET | `/api/events` | イベント一覧 |
| GET | `/api/events/[id]` | イベント詳細 |
| GET | `/api/journal` | 自分のジャーナリング一覧 |
| POST | `/api/journal` | ジャーナリング作成 |
| PUT | `/api/journal/[id]` | ジャーナリング更新 |
| DELETE | `/api/journal/[id]` | ジャーナリング削除 |
| POST | `/api/forms/[slug]` | フォーム申請送信 |
| GET | `/api/ambassador/dashboard` | アンバサダーダッシュボード |

### 5.2 管理者 API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/admin/members` | 会員一覧 |
| GET | `/api/admin/members/[id]` | 会員詳細 |
| PATCH | `/api/admin/members/[id]` | 会員情報更新 |
| PATCH | `/api/admin/members/[id]/active` | 有効/停止切替 |
| POST | `/api/admin/archive` | アーカイブ作成 |
| PUT | `/api/admin/archive/[id]` | アーカイブ更新 |
| DELETE | `/api/admin/archive/[id]` | アーカイブ削除 |
| POST | `/api/admin/archive/[id]/extract` | AI抽出実行 |
| PUT | `/api/admin/today` | 今日のコンテンツ更新 |
| POST | `/api/admin/events` | イベント作成 |
| PUT | `/api/admin/events/[id]` | イベント更新 |
| GET | `/api/admin/forms/[id]/submissions` | フォーム申請一覧 |
| PATCH | `/api/admin/forms/submissions/[id]` | 申請ステータス更新 |

### 5.3 Webhook

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/webhooks/stripe` | Stripe Webhook 受信 |

---

## 6. Stripe 連携仕様

### 6.1 Webhook イベント処理

| Stripe イベント | 処理内容 |
|----------------|---------|
| `customer.subscription.created` | User.isActive → true |
| `customer.subscription.updated` | ステータス同期 |
| `customer.subscription.deleted` | User.isActive → false |
| `invoice.payment_succeeded` | 継続確認、isActive 維持 |
| `invoice.payment_failed` | 猶予期間処理、期限後 isActive → false |

### 6.2 冪等性設計

```typescript
// Stripe Webhook の冪等性保証
// 1. Webhook イベント ID を DB に保存
// 2. 重複受信時はスキップ
// 3. 失敗時は 3回 リトライ（指数バックオフ）
```

---

## 7. メール送信仕様

### 7.1 Gmail SMTP 設定

| 環境変数 | 説明 |
|---------|------|
| `GMAIL_USER` | 送信元 Gmail アドレス |
| `GMAIL_APP_PASSWORD` | Google アプリパスワード（16桁） |

### 7.2 送信するメール

| メール種別 | タイミング | 送信先 |
|-----------|----------|--------|
| 招待メール | 管理者が `/admin/members` から送信 | 招待する会員 |

---

## 8. AI 抽出パイプライン仕様（P1）

### 8.1 抽出フロー

```
議事録テキスト入力
    ↓
Claude API (claude-haiku-4-5) 呼び出し
    ↓
プロンプト:
  - 今日のエネルギーシェア（3〜5文）
  - 今日のジャーナリングテーマ（1文）
  - 今日の要約（5〜8文）
    ↓
JSON レスポンス
    ↓
DailyContent モデルへ保存
    ↓
管理画面でプレビュー・確認
    ↓
公開
```

### 8.2 API エンドポイント

```
POST /api/admin/archive/[id]/extract
Body: { "targetDate": "2026-03-20" }
Response: { energyShare, journalTheme, summary }
```

---

## 9. 画面仕様

### 9.1 会員トップページ

**レイアウト（モバイル）**:
```
┌─────────────────────────┐
│  Header (ロゴ + ユーザー)  │
├─────────────────────────┤
│  今日のエネルギーシェア    │
│  カード（大）              │
├─────────────────────────┤
│  今日のジャーナリングテーマ │
│  + 書くボタン              │
├─────────────────────────┤
│  直近イベント              │
│  (横スクロールカード)       │
├─────────────────────────┤
│  新着アーカイブ            │
│  (縦カードリスト)          │
├─────────────────────────┤
│  主宰者のメッセージ         │
├─────────────────────────┤
│  Bottom Navigation       │
└─────────────────────────┘
```

### 9.2 アーカイブ一覧

- 検索バー（キーワード）
- フィルター: カテゴリ / タグ / 日付
- カードグリッド: サムネイル + タイトル + 日付 + カテゴリ
- 無限スクロール or ページネーション

### 9.3 アーカイブ詳細

- 動画プレイヤー（埋め込み or 直接再生）
- タイトル・日付・カテゴリ・タグ
- 要約
- 議事録（折りたたみ可）
- エネルギーシェア / ジャーナリングテーマ

### 9.4 イベント

- Today ビュー: 当日イベントカード
- Monthly ビュー: カレンダー形式

### 9.5 ジャーナリング

- カレンダービュー（書いた日はマーク）
- エントリーリスト
- エディタ（今日のテーマ表示 + テキストエリア）

### 9.6 管理画面 - 今日の更新

```
┌─────────────────────────────┐
│  今日の表示（2026-03-20）    │
├─────────────────────────────┤
│  自動抽出: ON/OFF トグル     │
├─────────────────────────────┤
│  エネルギーシェア            │
│  [テキストエリア]            │
├─────────────────────────────┤
│  ジャーナリングテーマ         │
│  [テキストエリア]            │
├─────────────────────────────┤
│  紐づく朝会動画: [セレクト]  │
│  [AI抽出実行ボタン]          │
├─────────────────────────────┤
│  公開日時: [日時ピッカー]    │
│  [保存] [公開]               │
└─────────────────────────────┘
```

---

## 10. アンバサダーダッシュボード仕様

### 10.1 表示情報

| 項目 | 説明 |
|------|------|
| 自分の紹介リンク | URL コピー機能付き |
| 紹介人数 | 現在 / 上限 |
| 今月の報酬見込み | 円 |
| 累計報酬 | 円 |
| 被紹介者一覧 | 名前・入会日・継続中フラグ |

### 10.2 報酬計算ロジック（月次バッチ）

```typescript
// 毎月1日 0:00 JST 実行
// 1. アクティブなアンバサダー取得
// 2. 被紹介者の継続状況確認
// 3. 上限内の人数で報酬計算
//    入会金: joinedAt が当月 → 3,000円
//    継続: isActive → 500円
// 4. RewardRecord テーブルへ記録
```

---

## 11. 試験ステータス別ページ仕様

### 11.1 trial ページ (`/trial`)

- コミュニティ紹介コンテンツ
- 体験動画（公開設定された動画）
- 入会案内・CTAボタン

### 11.2 inactive ページ (`/inactive`)

- 決済再開のご案内
- Stripe Customer Portal へのリンク
- 体験動画（閲覧可）

---

*Living Me 会員サイト - 機能仕様書 v1.0*
