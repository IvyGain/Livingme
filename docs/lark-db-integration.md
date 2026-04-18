# Living Me × Lark DB 連携 完全手順書

**バージョン**: v1.0
**作成日**: 2026-03-20
**対象**: Living Me 〜本当の自分と出逢う会〜 会員サイト

---

## 目次

1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [Lark Open Platform セットアップ](#2-lark-open-platform-セットアップ)
3. [Lark Base テーブル設計](#3-lark-base-テーブル設計)
4. [Lark Drive 動画管理設計](#4-lark-drive-動画管理設計)
5. [環境変数・認証設定](#5-環境変数認証設定)
6. [Lark API クライアント実装](#6-lark-api-クライアント実装)
7. [既存 Prisma/PostgreSQL との統合戦略](#7-既存-prismapostgresql-との統合戦略)
8. [機能別実装手順](#8-機能別実装手順)
9. [管理者向け Lark Base 操作手順（非エンジニア）](#9-管理者向け-lark-base-操作手順非エンジニア)
10. [テスト・動作確認](#10-テスト動作確認)
11. [デプロイ・運用](#11-デプロイ運用)
12. [トラブルシューティング](#12-トラブルシューティング)

---

## 1. アーキテクチャ概要

### 1.1 Lark DB の役割分担

```
┌─────────────────────────────────────────────────────────┐
│                    Living Me システム                      │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │  PostgreSQL       │    │  Lark (外部DB・CMS)      │   │
│  │  (Prisma ORM)    │    │                          │   │
│  │                  │    │  ┌─────────────────────┐ │   │
│  │  - User (認証)   │    │  │ Lark Base (Bitable) │ │   │
│  │  - Session       │    │  │  - アーカイブ管理   │ │   │
│  │  - Journal       │    │  │  - イベント管理     │ │   │
│  │  - StripeEvent   │    │  │  - コラム管理       │ │   │
│  │  - Setting       │    │  │  - 今日のコンテンツ │ │   │
│  │  (権限・決済)    │    │  └─────────────────────┘ │   │
│  └──────────────────┘    │                          │   │
│                           │  ┌─────────────────────┐ │   │
│  ← 個人情報・権限はPG    │  │   Lark Drive        │ │   │
│    セキュリティ重要な     │  │  - 動画ファイル     │ │   │
│    トランザクションデータ  │  │  - サムネイル画像   │ │   │
│                           │  │  - 議事録ドキュメント│ │   │
│                           │  └─────────────────────┘ │   │
│                           └──────────────────────────┘   │
│                                                          │
│  ← コンテンツは Lark で管理（非エンジニアが運用可能）    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 データフロー

```
【コンテンツ登録フロー（非エンジニア）】
  運営スタッフ
    → Lark Base にアーカイブ・イベント情報を入力
    → 動画を Lark Drive にアップロード
    → Next.js アプリが Lark API 経由でデータ取得
    → 会員サイトに自動反映

【会員認証フロー（既存）】
  会員
    → Discord OAuth ログイン
    → NextAuth.js → PostgreSQL User テーブル
    → Stripe 決済状態確認
    → 権限付与

【朝会 AI 自動抽出フロー（P1）】
  朝会終了
    → Lark Drive に動画・議事録を保存
    → Webhook → Next.js API Routes
    → Claude API で AI 抽出
    → Lark Base「今日のコンテンツ」テーブルに書き込み
    → トップページに自動反映
```

### 1.3 使用する Lark API

| API | 用途 |
|-----|------|
| Lark Base API (Bitable) | テーブルデータの読み書き（アーカイブ・イベント等） |
| Lark Drive API | 動画・画像ファイルの取得・共有リンク発行 |
| Lark Doc API | 議事録ドキュメントの取得 |
| Lark Webhook | ファイルアップロード・更新のリアルタイム通知 |
| Lark OAuth | アプリ認証（tenant_access_token） |

---

## 2. Lark Open Platform セットアップ

### 2.1 Lark 開発者アカウント作成

1. [Lark Open Platform](https://open.larksuite.com/) にアクセス
   ※ 日本語版は Feishu Open Platform: https://open.feishu.cn/
2. 組織の管理者アカウントでログイン
3. 「Developer Console」に移動

### 2.2 アプリケーション作成

```
Developer Console
  → 「Create App」をクリック
  → App Type: 「Custom App（カスタムアプリ）」を選択
  → App Name: 「LivingMe Portal」
  → Description: 「Living Me 会員サイト連携アプリ」
  → 「Create」
```

作成後に取得する情報:
- **App ID** (例: `cli_xxxxxxxxxx`)
- **App Secret** (例: `xxxxxxxxxxxxxxxxxxxx`)

### 2.3 権限（スコープ）設定

「Permissions & Scopes」タブで以下を追加:

**Lark Base (Bitable) 権限:**

| スコープ名 | 用途 |
|-----------|------|
| `bitable:app:readonly` | テーブルデータ読み取り |
| `bitable:app` | テーブルデータ読み書き |

**Lark Drive 権限:**

| スコープ名 | 用途 |
|-----------|------|
| `drive:drive:readonly` | ファイル読み取り |
| `drive:file:readonly` | ファイルメタデータ取得 |
| `drive:file` | ファイルアップロード（将来） |

**Lark Doc 権限:**

| スコープ名 | 用途 |
|-----------|------|
| `docs:document:readonly` | ドキュメント（議事録）読み取り |

### 2.4 Webhook 設定（P1 - AI 自動抽出用）

「Event Subscriptions」タブ:

```
Request URL: https://your-domain.com/api/webhooks/lark
Encryption Key: （任意の文字列を設定）
Verification Token: （自動生成）
```

購読するイベント:

| イベント | 用途 |
|---------|------|
| `drive.file.created_in_folder_v1` | 動画フォルダへのアップロード検知 |
| `bitable.record.created` | Base レコード作成検知 |
| `bitable.record.updated` | Base レコード更新検知 |

### 2.5 アプリを組織にインストール

```
「App Release」→「Organization」→「Apply Release」
  → 管理者承認
  → インストール完了
```

---

## 3. Lark Base テーブル設計

### 3.1 Lark Base（アプリ）の作成

```
Lark アプリ内
  → 「+」新規作成
  → 「多維表格（Base）」を選択
  → 名前: 「LivingMe コンテンツ管理」
  → 作成
```

### 3.2 テーブル一覧

| テーブル名 | 用途 | 優先度 |
|-----------|------|--------|
| `archives` | アーカイブ（動画）管理 | P0 |
| `events` | イベント・スケジュール管理 | P0 |
| `today_content` | 今日のエネルギーシェア・テーマ | P0 |
| `columns` | 主宰者コラム・つぶやき | P0 |
| `playlists` | 再生リスト管理 | P1 |
| `tags` | タグマスタ | P1 |

### 3.3 archives テーブル定義

| フィールド名 | Lark 型 | 必須 | 説明 |
|-------------|---------|------|------|
| `title` | テキスト | ✅ | 動画タイトル |
| `date` | 日付 | ✅ | 開催日 |
| `category` | 単一選択 | ✅ | `朝会` / `夜会` / `学習` / `イベント` / `その他` |
| `description` | 長文テキスト | | 説明・メモ |
| `video_url` | URL | | 動画 URL（Lark Drive / Google Drive / Zoom） |
| `video_file` | 添付ファイル | | 直接アップロード動画 |
| `thumbnail` | 添付ファイル | | サムネイル画像 |
| `minutes` | 長文テキスト | | 議事録 |
| `summary` | 長文テキスト | | 要約（AI 抽出） |
| `energy_share` | テキスト | | 今日のエネルギーシェア（AI 抽出） |
| `journaling_theme` | テキスト | | ジャーナリングテーマ（AI 抽出） |
| `tags` | 複数選択 | | タグ |
| `is_published` | チェックボックス | ✅ | 公開 / 非公開 |
| `published_at` | 日時 | | 公開日時（予約公開） |
| `lark_doc_token` | テキスト | | 議事録 Lark Doc トークン |
| `lark_file_token` | テキスト | | 動画 Lark Drive トークン |

**単一選択「category」の選択肢:**
- `朝会` (MORNING_SESSION)
- `夜会` (EVENING_SESSION)
- `学習` (LEARNING)
- `イベント` (EVENT)
- `その他` (OTHER)

### 3.4 events テーブル定義

| フィールド名 | Lark 型 | 必須 | 説明 |
|-------------|---------|------|------|
| `title` | テキスト | ✅ | イベント名 |
| `type` | 単一選択 | ✅ | `朝会` / `夜会` / `オンライン` / `オフライン` / `ギブ会` / `勉強会` |
| `start_at` | 日時 | ✅ | 開始日時 |
| `end_at` | 日時 | | 終了日時 |
| `description` | 長文テキスト | | 説明 |
| `join_url` | URL | | 参加 URL（Zoom / Google Meet 等） |
| `location` | テキスト | | 開催場所（オフラインの場合） |
| `is_published` | チェックボックス | ✅ | 公開状態 |
| `max_participants` | 数値 | | 定員 |

### 3.5 today_content テーブル定義

| フィールド名 | Lark 型 | 必須 | 説明 |
|-------------|---------|------|------|
| `date` | 日付 | ✅ | 対象日（ユニーク） |
| `energy_share` | 長文テキスト | | 今日のエネルギーシェア |
| `journaling_theme` | テキスト | | 今日のジャーナリングテーマ |
| `summary` | 長文テキスト | | 今日の要約 |
| `source_archive_id` | テキスト | | 元となるアーカイブレコードID |
| `is_auto` | チェックボックス | | AI 自動抽出か手動入力か |
| `is_published` | チェックボックス | ✅ | 公開状態 |

### 3.6 columns テーブル定義

| フィールド名 | Lark 型 | 必須 | 説明 |
|-------------|---------|------|------|
| `title` | テキスト | ✅ | コラムタイトル |
| `content` | 長文テキスト | ✅ | 本文 |
| `author` | テキスト | ✅ | 著者名 |
| `published_at` | 日時 | ✅ | 公開日時 |
| `is_published` | チェックボックス | ✅ | 公開状態 |

### 3.7 Base ID の取得

作成した Lark Base を開き、URL から取得:
```
https://larksuite.com/base/{APP_TOKEN}/...
                              ↑ここが APP_TOKEN
```

各テーブルの TABLE_ID は API で取得するか、Base の設定から確認する。

---

## 4. Lark Drive 動画管理設計

### 4.1 フォルダ構成

```
LivingMe 動画アーカイブ/          ← 共有フォルダ
├── 朝会/
│   ├── 2026-03/
│   │   ├── 2026-03-20_朝会.mp4
│   │   └── 2026-03-20_朝会_議事録.docx
│   └── ...
├── 夜会/
├── 学習コンテンツ/
└── イベント/
```

### 4.2 動画 URL の種類と取得方法

| 登録方法 | 取得方法 | `video_url` に保存する値 |
|---------|---------|------------------------|
| Lark Drive アップロード | API で Download URL 取得 | Lark file_token |
| Google Drive | 共有リンクをそのままコピー | https://drive.google.com/... |
| Zoom | 録画リンクをコピー | https://zoom.us/rec/... |
| 手動アップロード | Cloudflare R2 に保存 | https://r2.livingme.com/... |

---

## 5. 環境変数・認証設定

### 5.1 .env.local に追加

```env
# Lark App 認証情報
LARK_APP_ID=cli_xxxxxxxxxx
LARK_APP_SECRET=xxxxxxxxxxxxxxxxxxxx

# Lark Base (Bitable) 設定
LARK_BASE_APP_TOKEN=xxxxxxxxxxxxxxxxxx    # Base アプリトークン
LARK_TABLE_ARCHIVES=tblxxxxxxxxxx         # archives テーブルID
LARK_TABLE_EVENTS=tblxxxxxxxxxx           # events テーブルID
LARK_TABLE_TODAY_CONTENT=tblxxxxxxxxxx    # today_content テーブルID
LARK_TABLE_COLUMNS=tblxxxxxxxxxx          # columns テーブルID

# Lark Webhook
LARK_WEBHOOK_VERIFICATION_TOKEN=xxxxxxxxxx
LARK_WEBHOOK_ENCRYPT_KEY=xxxxxxxxxx

# Lark Drive
LARK_VIDEO_FOLDER_TOKEN=fldxxxxxxxxxx     # 動画フォルダトークン
```

### 5.2 .env.example を更新（Git 管理用）

```env
LARK_APP_ID=
LARK_APP_SECRET=
LARK_BASE_APP_TOKEN=
LARK_TABLE_ARCHIVES=
LARK_TABLE_EVENTS=
LARK_TABLE_TODAY_CONTENT=
LARK_TABLE_COLUMNS=
LARK_WEBHOOK_VERIFICATION_TOKEN=
LARK_WEBHOOK_ENCRYPT_KEY=
LARK_VIDEO_FOLDER_TOKEN=
```

### 5.3 Prisma Setting テーブルへの追加（DB 暗号化保管）

```sql
-- 管理画面から設定できるよう DB にも保管
INSERT INTO "Setting" (key, label, "isSecret") VALUES
  ('LARK_APP_ID', 'Lark App ID', false),
  ('LARK_APP_SECRET', 'Lark App Secret', true),
  ('LARK_BASE_APP_TOKEN', 'Lark Base アプリトークン', false);
```

---

## 6. Lark API クライアント実装

### 6.1 パッケージインストール

```bash
npm install @larksuiteoapi/node-sdk
```

### 6.2 Lark クライアント初期化

**ファイル:** `src/lib/lark/client.ts`

```typescript
import * as lark from "@larksuiteoapi/node-sdk";

let _client: lark.Client | null = null;

export function getLarkClient(): lark.Client {
  if (!_client) {
    _client = new lark.Client({
      appId: process.env.LARK_APP_ID!,
      appSecret: process.env.LARK_APP_SECRET!,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Lark, // 日本/グローバル版
      // Feishu (中国版) の場合: lark.Domain.Feishu
    });
  }
  return _client;
}
```

### 6.3 Lark Base (Bitable) クライアント

**ファイル:** `src/lib/lark/base.ts`

```typescript
import { getLarkClient } from "./client";

const APP_TOKEN = process.env.LARK_BASE_APP_TOKEN!;

export const TABLE_IDS = {
  archives: process.env.LARK_TABLE_ARCHIVES!,
  events: process.env.LARK_TABLE_EVENTS!,
  todayContent: process.env.LARK_TABLE_TODAY_CONTENT!,
  columns: process.env.LARK_TABLE_COLUMNS!,
} as const;

// レコード一覧取得（フィルタ・ページネーション対応）
export async function listRecords(
  tableId: string,
  options?: {
    filter?: string;          // 例: 'CurrentValue.[is_published] = true'
    sort?: Array<{ field_name: string; order: "ASC" | "DESC" }>;
    pageSize?: number;
    pageToken?: string;
  }
) {
  const client = getLarkClient();
  const res = await client.bitable.appTableRecord.list({
    path: { app_token: APP_TOKEN, table_id: tableId },
    params: {
      filter: options?.filter,
      sort: options?.sort ? JSON.stringify(options.sort) : undefined,
      page_size: options?.pageSize ?? 50,
      page_token: options?.pageToken,
    },
  });
  return res.data;
}

// レコード1件取得
export async function getRecord(tableId: string, recordId: string) {
  const client = getLarkClient();
  const res = await client.bitable.appTableRecord.get({
    path: { app_token: APP_TOKEN, table_id: tableId, record_id: recordId },
  });
  return res.data?.record;
}

// レコード作成
export async function createRecord(
  tableId: string,
  fields: Record<string, unknown>
) {
  const client = getLarkClient();
  const res = await client.bitable.appTableRecord.create({
    path: { app_token: APP_TOKEN, table_id: tableId },
    data: { fields },
  });
  return res.data?.record;
}

// レコード更新
export async function updateRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
) {
  const client = getLarkClient();
  const res = await client.bitable.appTableRecord.update({
    path: { app_token: APP_TOKEN, table_id: tableId, record_id: recordId },
    data: { fields },
  });
  return res.data?.record;
}

// 全件取得（ページネーション自動処理）
export async function listAllRecords(
  tableId: string,
  filter?: string
): Promise<Array<{ record_id: string; fields: Record<string, unknown> }>> {
  const records = [];
  let pageToken: string | undefined;

  do {
    const data = await listRecords(tableId, { filter, pageToken, pageSize: 100 });
    if (data?.items) records.push(...data.items);
    pageToken = data?.page_token;
  } while (pageToken);

  return records as Array<{ record_id: string; fields: Record<string, unknown> }>;
}
```

### 6.4 型定義

**ファイル:** `src/lib/lark/types.ts`

```typescript
export type ArchiveCategory =
  | "朝会"
  | "夜会"
  | "学習"
  | "イベント"
  | "その他";

export interface LarkArchive {
  record_id: string;
  title: string;
  date: string;             // ISO date string
  category: ArchiveCategory;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  minutes?: string;
  summary?: string;
  energy_share?: string;
  journaling_theme?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  lark_file_token?: string;
}

export interface LarkEvent {
  record_id: string;
  title: string;
  type: "朝会" | "夜会" | "オンライン" | "オフライン" | "ギブ会" | "勉強会";
  start_at: string;         // ISO datetime string
  end_at?: string;
  description?: string;
  join_url?: string;
  location?: string;
  is_published: boolean;
  max_participants?: number;
}

export interface LarkTodayContent {
  record_id: string;
  date: string;
  energy_share?: string;
  journaling_theme?: string;
  summary?: string;
  source_archive_id?: string;
  is_auto: boolean;
  is_published: boolean;
}

export interface LarkColumn {
  record_id: string;
  title: string;
  content: string;
  author: string;
  published_at: string;
  is_published: boolean;
}
```

### 6.5 アーカイブ取得サービス

**ファイル:** `src/lib/lark/archives.ts`

```typescript
import { listAllRecords, getRecord, TABLE_IDS } from "./base";
import type { LarkArchive } from "./types";

function parseArchive(record: {
  record_id: string;
  fields: Record<string, unknown>;
}): LarkArchive {
  const f = record.fields;
  return {
    record_id: record.record_id,
    title: f.title as string,
    date: f.date as string,
    category: f.category as LarkArchive["category"],
    description: f.description as string | undefined,
    video_url: f.video_url as string | undefined,
    thumbnail_url: extractAttachmentUrl(f.thumbnail),
    minutes: f.minutes as string | undefined,
    summary: f.summary as string | undefined,
    energy_share: f.energy_share as string | undefined,
    journaling_theme: f.journaling_theme as string | undefined,
    tags: (f.tags as string[]) ?? [],
    is_published: (f.is_published as boolean) ?? false,
    published_at: f.published_at as string | undefined,
    lark_file_token: f.lark_file_token as string | undefined,
  };
}

function extractAttachmentUrl(attachment: unknown): string | undefined {
  if (!attachment || !Array.isArray(attachment)) return undefined;
  const first = attachment[0];
  return first?.tmp_url ?? first?.url;
}

export async function getPublishedArchives(): Promise<LarkArchive[]> {
  const now = new Date().toISOString();
  const records = await listAllRecords(
    TABLE_IDS.archives,
    `AND(CurrentValue.[is_published] = true, CurrentValue.[published_at] <= "${now}")`
  );
  return records.map(parseArchive);
}

export async function getArchiveById(recordId: string): Promise<LarkArchive | null> {
  const record = await getRecord(TABLE_IDS.archives, recordId);
  if (!record) return null;
  return parseArchive(record as { record_id: string; fields: Record<string, unknown> });
}

export async function getRecentArchives(limit = 6): Promise<LarkArchive[]> {
  const all = await getPublishedArchives();
  return all
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
```

### 6.6 イベント取得サービス

**ファイル:** `src/lib/lark/events.ts`

```typescript
import { listAllRecords, TABLE_IDS } from "./base";
import type { LarkEvent } from "./types";

function parseEvent(record: {
  record_id: string;
  fields: Record<string, unknown>;
}): LarkEvent {
  const f = record.fields;
  return {
    record_id: record.record_id,
    title: f.title as string,
    type: f.type as LarkEvent["type"],
    start_at: f.start_at as string,
    end_at: f.end_at as string | undefined,
    description: f.description as string | undefined,
    join_url: f.join_url as string | undefined,
    location: f.location as string | undefined,
    is_published: (f.is_published as boolean) ?? false,
    max_participants: f.max_participants as number | undefined,
  };
}

export async function getUpcomingEvents(): Promise<LarkEvent[]> {
  const now = new Date().toISOString();
  const records = await listAllRecords(
    TABLE_IDS.events,
    `AND(CurrentValue.[is_published] = true, CurrentValue.[start_at] >= "${now}")`
  );
  return records
    .map(parseEvent)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

export async function getTodayEvents(): Promise<LarkEvent[]> {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const records = await listAllRecords(
    TABLE_IDS.events,
    `AND(CurrentValue.[is_published] = true, CurrentValue.[start_at] >= "${start}", CurrentValue.[start_at] <= "${end}")`
  );
  return records.map(parseEvent);
}
```

### 6.7 今日のコンテンツ取得サービス

**ファイル:** `src/lib/lark/today.ts`

```typescript
import { listAllRecords, createRecord, updateRecord, TABLE_IDS } from "./base";
import type { LarkTodayContent } from "./types";

export async function getTodayContent(
  date?: string
): Promise<LarkTodayContent | null> {
  const target = date ?? new Date().toISOString().split("T")[0];
  const records = await listAllRecords(
    TABLE_IDS.todayContent,
    `AND(CurrentValue.[date] = "${target}", CurrentValue.[is_published] = true)`
  );
  if (records.length === 0) return null;

  const f = records[0].fields;
  return {
    record_id: records[0].record_id,
    date: f.date as string,
    energy_share: f.energy_share as string | undefined,
    journaling_theme: f.journaling_theme as string | undefined,
    summary: f.summary as string | undefined,
    source_archive_id: f.source_archive_id as string | undefined,
    is_auto: (f.is_auto as boolean) ?? false,
    is_published: (f.is_published as boolean) ?? false,
  };
}

export async function upsertTodayContent(
  date: string,
  data: Partial<Omit<LarkTodayContent, "record_id" | "date">>
): Promise<void> {
  const existing = await listAllRecords(
    TABLE_IDS.todayContent,
    `CurrentValue.[date] = "${date}"`
  );

  const fields = { date, ...data };

  if (existing.length > 0) {
    await updateRecord(TABLE_IDS.todayContent, existing[0].record_id, fields);
  } else {
    await createRecord(TABLE_IDS.todayContent, fields);
  }
}
```

---

## 7. 既存 Prisma/PostgreSQL との統合戦略

### 7.1 責任分界点

```
PostgreSQL (Prisma) が持つデータ:          Lark Base が持つデータ:
┌───────────────────────────┐              ┌───────────────────────────┐
│ User (認証・権限・決済)   │              │ アーカイブ情報            │
│ Account (OAuth)           │              │ イベント情報              │
│ Session                   │              │ 今日のコンテンツ          │
│ Journal (個人日記)        │              │ コラム・つぶやき          │
│ StripeEvent (冪等性)      │              │ 再生リスト               │
│ Setting (暗号化設定)      │              │ タグマスタ               │
└───────────────────────────┘              └───────────────────────────┘
         ↓ 変更不要                                 ↓ Lark API で読み書き
   NextAuth.js / Stripe 連携                  非エンジニアが Lark で管理
```

### 7.2 既存 Server Actions の移行

**変更前:** `src/server/actions/archives.ts` (Prisma 経由)

```typescript
// Before: Prisma で取得
export async function getArchives() {
  return prisma.archive.findMany({ where: { isPublished: true } });
}
```

**変更後:** `src/server/actions/archives.ts` (Lark API 経由)

```typescript
// After: Lark Base API で取得
import { getPublishedArchives } from "@/lib/lark/archives";

export async function getArchives() {
  return getPublishedArchives();
}
```

### 7.3 Prisma スキーマの変更

archives, events, columns, today_content テーブルを Lark に移行後、対応する Prisma モデルを削除またはコメントアウト:

```prisma
// prisma/schema.prisma
// 以下を削除（Lark Base に移行済み）:
// model Archive { ... }
// model Tag { ... }
// model ArchiveTag { ... }
// model Playlist { ... }
// model PlaylistArchive { ... }
// model TodayContent { ... }
// model Column { ... }
// model Event { ... }

// 以下は残す（認証・権限・決済に必要）:
model User { ... }
model Account { ... }
model Session { ... }
model VerificationToken { ... }
model Journal { ... }
model StripeEvent { ... }
model Setting { ... }
```

マイグレーション実行:

```bash
npx prisma migrate dev --name remove_content_tables
```

---

## 8. 機能別実装手順

### 8.1 アーカイブ一覧ページ

**ファイル:** `src/app/(member)/archives/page.tsx`

```typescript
import { getPublishedArchives } from "@/lib/lark/archives";

export default async function ArchivesPage() {
  const archives = await getPublishedArchives();
  // ... レンダリング
}
```

**キャッシュ設定（Next.js）:**

```typescript
// 5分キャッシュ（Lark API のレート制限対策）
export const revalidate = 300;
```

### 8.2 トップページ（今日のコンテンツ）

**ファイル:** `src/app/(member)/page.tsx`

```typescript
import { getTodayContent } from "@/lib/lark/today";
import { getRecentArchives } from "@/lib/lark/archives";
import { getUpcomingEvents } from "@/lib/lark/events";

export default async function HomePage() {
  const [todayContent, recentArchives, upcomingEvents] = await Promise.all([
    getTodayContent(),
    getRecentArchives(6),
    getUpcomingEvents(),
  ]);
  // ... レンダリング
}
```

### 8.3 Lark Webhook 受信エンドポイント（P1）

**ファイル:** `src/app/api/webhooks/lark/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { upsertTodayContent } from "@/lib/lark/today";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Webhook 検証
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // ファイルアップロードイベント（朝会動画）
  if (body.header?.event_type === "drive.file.created_in_folder_v1") {
    const fileToken = body.event?.file_token;
    // AI 抽出パイプライン起動（非同期）
    triggerAIExtraction(fileToken).catch(console.error);
  }

  // Bitable レコード作成/更新イベント
  if (body.header?.event_type === "bitable.record.created") {
    // キャッシュ無効化等の処理
  }

  return NextResponse.json({ ok: true });
}

async function triggerAIExtraction(fileToken: string) {
  // 1. Lark Drive から動画メタデータ取得
  // 2. 議事録ドキュメント取得
  // 3. Claude API でエネルギーシェア・テーマ抽出
  // 4. Lark Base today_content テーブルに書き込み
}
```

### 8.4 管理画面での Lark 統合

既存の管理画面 (`/admin`) からも Lark Base を参照・更新できるよう Server Actions を変更:

**ファイル:** `src/server/actions/archives.ts`

```typescript
"use server";
import { auth } from "@/lib/auth";
import { createRecord, updateRecord, TABLE_IDS } from "@/lib/lark/base";

export async function createArchiveAction(data: {
  title: string;
  date: string;
  category: string;
  video_url?: string;
  description?: string;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");

  return createRecord(TABLE_IDS.archives, {
    ...data,
    is_published: false,  // デフォルトは非公開
  });
}
```

### 8.5 Lark Drive ファイル URL 取得

**ファイル:** `src/lib/lark/drive.ts`

```typescript
import { getLarkClient } from "./client";

export async function getFileDownloadUrl(fileToken: string): Promise<string> {
  const client = getLarkClient();
  const res = await client.drive.media.batchGetTmpDownloadUrl({
    params: { file_tokens: fileToken, extra: "" },
  });
  return res.data?.tmp_download_urls?.[0]?.tmp_download_url ?? "";
}

export async function getFileMeta(fileToken: string) {
  const client = getLarkClient();
  const res = await client.drive.file.get({
    path: { file_token: fileToken },
  });
  return res.data;
}
```

---

## 9. 管理者向け Lark Base 操作手順（非エンジニア）

### 9.1 アーカイブの登録手順

```
1. Lark を開く
2. 「LivingMe コンテンツ管理」Base を開く
3. 「archives」テーブルを開く
4. 「+」ボタンをクリックして新しい行を追加
5. 各フィールドを入力:
   - タイトル: 「2026-03-20 朝会アーカイブ」
   - 日付: 開催日を選択
   - カテゴリ: 「朝会」を選択
   - 動画URL: 動画の共有リンクを貼り付け
6. 公開準備ができたら「is_published」にチェック
7. 会員サイトに自動反映（最大5分）
```

### 9.2 イベントの登録手順

```
1. 「events」テーブルを開く
2. 新しい行を追加
3. 各フィールドを入力:
   - タイトル: イベント名
   - type: イベント種別を選択
   - start_at: 開始日時を設定
   - join_url: Zoom リンク等を貼り付け
4. 「is_published」にチェックで公開
```

### 9.3 今日のエネルギーシェアを手動入力

```
1. 「today_content」テーブルを開く
2. 対象日の行を探す（または新規追加）
3. フィールドを入力:
   - energy_share: 今日のエネルギーシェア文章
   - journaling_theme: 今日のテーマ
4. 「is_published」にチェック
```

### 9.4 動画を Lark Drive にアップロード

```
1. Lark Drive を開く
2. 「LivingMe 動画アーカイブ」フォルダに移動
3. 該当カテゴリのフォルダに入る
4. 「アップロード」ボタンで動画ファイルをアップロード
5. アップロード完了後「リンクをコピー」
6. archives テーブルの「video_url」に貼り付け
```

---

## 10. テスト・動作確認

### 10.1 Lark API 接続テスト

```bash
# テナントアクセストークンの取得確認
curl -X POST 'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal' \
  -H 'Content-Type: application/json' \
  -d '{
    "app_id": "cli_xxxxxxxxxx",
    "app_secret": "xxxxxxxxxxxxxxxxxxxx"
  }'

# 期待値: { "code": 0, "tenant_access_token": "xxx...", "expire": 7200 }
```

### 10.2 Lark Base レコード取得テスト

```typescript
// src/scripts/test-lark.ts
import { listRecords, TABLE_IDS } from "@/lib/lark/base";

async function test() {
  const data = await listRecords(TABLE_IDS.archives, { pageSize: 5 });
  console.log("Archives:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
```

実行:

```bash
npx tsx src/scripts/test-lark.ts
```

### 10.3 チェックリスト

- [ ] `LARK_APP_ID` / `LARK_APP_SECRET` が設定されている
- [ ] `LARK_BASE_APP_TOKEN` が設定されている
- [ ] 各テーブルの TABLE_ID が設定されている
- [ ] Lark アプリに Bitable 権限が付与されている
- [ ] アプリが組織にインストールされている
- [ ] Base を作成したアカウントでアプリの権限が有効になっている
- [ ] テストレコードが 1 件以上取得できる
- [ ] 公開フラグに応じた絞り込みが動作する
- [ ] 管理者から Server Action でレコード作成できる

### 10.4 レート制限への対応

Lark API のレート制限: **50 req/sec** (tenant レベル)

```typescript
// src/lib/lark/cache.ts
// Next.js の unstable_cache で API 結果をキャッシュ
import { unstable_cache } from "next/cache";
import { getPublishedArchives } from "./archives";

export const getCachedArchives = unstable_cache(
  getPublishedArchives,
  ["lark-archives"],
  { revalidate: 300, tags: ["archives"] } // 5分キャッシュ
);
```

---

## 11. デプロイ・運用

### 11.1 Vercel 環境変数設定

```bash
# Vercel CLI で一括設定
vercel env add LARK_APP_ID
vercel env add LARK_APP_SECRET
vercel env add LARK_BASE_APP_TOKEN
vercel env add LARK_TABLE_ARCHIVES
vercel env add LARK_TABLE_EVENTS
vercel env add LARK_TABLE_TODAY_CONTENT
vercel env add LARK_TABLE_COLUMNS
```

本番 / Preview / Development 全環境に設定すること。

### 11.2 Webhook URL の本番設定

Lark Open Platform の「Event Subscriptions」:

```
Request URL: https://livingme.example.com/api/webhooks/lark
```

### 11.3 運用フロー（本番）

```
【毎日の運用（非エンジニア）】

朝会当日:
  09:00 朝会実施
  09:30 動画を Lark Drive にアップロード
  09:35 archives テーブルに記録を追加
  09:40 （AI 自動抽出: P1）議事録が自動で抽出・反映
  09:45 today_content を確認・is_published にチェック
  10:00 会員サイトに反映完了

朝会のない日:
  今日の分の today_content を手動入力 → is_published にチェック

イベント前日:
  events テーブルに追加 → is_published にチェック
  翌日から会員サイトに表示
```

### 11.4 Lark API トークン有効期限の管理

`tenant_access_token` は 2 時間で期限切れ。SDK が自動更新するため、以下の点を確認:

```typescript
// @larksuiteoapi/node-sdk はトークンを自動キャッシュ・更新する
// getLarkClient() をシングルトンで使うだけで問題なし
```

---

## 12. トラブルシューティング

### 12.1 よくあるエラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `code: 99991663` | Bitable 権限未設定 | Open Platform でスコープ追加→再インストール |
| `code: 10012` | APP_TOKEN が間違い | Base の URL から再取得 |
| `code: 1254043` | テーブルが存在しない | TABLE_ID を再確認 |
| `code: 99991401` | アプリが組織に未インストール | App Release から再インストール |
| 空配列が返る | フィルタ条件の書式ミス | Lark Base フィルタ構文を確認 |
| 添付ファイル URL が空 | tmp_url は一時的（10分） | 表示直前に都度取得するよう実装 |

### 12.2 ローカル開発で Webhook を受け取る

```bash
# ngrok を使った開発時のトンネル設定
npx ngrok http 3000

# 発行された URL を Lark Open Platform の Webhook URL に設定
# https://xxxx.ngrok.io/api/webhooks/lark
```

### 12.3 フィルタ構文リファレンス

```
# 公開済み
CurrentValue.[is_published] = true

# 今日以降のイベント
CurrentValue.[start_at] >= "2026-03-20T00:00:00Z"

# カテゴリ絞り込み
CurrentValue.[category] = "朝会"

# AND 条件
AND(CurrentValue.[is_published] = true, CurrentValue.[category] = "朝会")

# OR 条件
OR(CurrentValue.[category] = "朝会", CurrentValue.[category] = "夜会")
```

---

## 実装優先度まとめ

| フェーズ | タスク | 工数目安 |
|---------|--------|---------|
| **Step 1** | Lark Open Platform セットアップ・アプリ作成 | 1日 |
| **Step 2** | Lark Base テーブル設計・作成（archives, events, today, columns） | 1日 |
| **Step 3** | 環境変数設定・Lark クライアント実装 (`src/lib/lark/`) | 1日 |
| **Step 4** | archives / events / today_content 取得サービス実装 | 2日 |
| **Step 5** | 既存 Server Actions を Lark API に差し替え | 2日 |
| **Step 6** | Prisma スキーマからコンテンツテーブル削除・マイグレーション | 1日 |
| **Step 7** | キャッシュ実装・レート制限対応 | 1日 |
| **Step 8** | Vercel 環境変数設定・本番 Webhook 設定 | 0.5日 |
| **Step 9** | AI 自動抽出パイプライン（Webhook + Claude API） | 3日 (P1) |

---

*Living Me × Lark DB 連携 完全手順書 v1.0 — 2026-03-20*
