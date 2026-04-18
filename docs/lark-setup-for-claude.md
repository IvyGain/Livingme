# Lark Base セットアップ手順書
## 〜あなたがやること / Claudeがやること〜

**作成日**: 2026-03-25
**目的**: この手順書の通りに進めると、ClaudeがLark Base上にテーブルを自動作成します

---

## 全体の流れ

```
あなたがやること（3ステップ）      Claudeがやること
──────────────────────────         ──────────────────────────────────────
Step 1: Larkアプリを作成           ← App ID / App Secret を取得するため
Step 2: 空のBaseを作成             ← テーブルの器を用意するため
Step 3: .env.local に貼り付け      ← Claudeが接続できるようにするため
                                   ↓
                             ✅ テーブルを自動作成
                             ✅ 全フィールドを自動設定
                             ✅ 選択肢・タイプも自動設定
```

---

## Step 1: Lark Open Platform でアプリを作成する

### 1-1. Developer Console を開く

ブラウザで以下のURLを開いてください。

```
https://open.larksuite.com/
```

右上の「**Go to Console**」をクリックします。

---

### 1-2. アプリを新規作成する

1. 「**Create app**」をクリック
2. 以下を入力して「**Create**」をクリック

   ```
   App Name    : LivingMe Portal
   Description : Living Me 会員サイト連携
   ```

---

### 1-3. App ID と App Secret をコピーする

左メニューの「**Credentials & Basic Info**」をクリックします。

```
┌──────────────────────────────────────────────────────┐
│  App ID      cli_xxxxxxxxxxxxxxxxxxxx         [Copy] │
│  App Secret  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx [Copy] │
└──────────────────────────────────────────────────────┘
```

**両方「Copy」ボタンでコピーしてメモ帳に保存してください。**

---

### 1-4. 権限（Scopes）を追加する

左メニューの「**Permissions & Scopes**」をクリックします。

検索ボックスに以下を入力して「**Add**」をクリックしてください（2つ追加）。

| 追加するScope | 「Add」ボタンの場所 |
|-------------|------------------|
| `bitable:app` | 検索して追加 |
| `drive:drive` | 検索して追加 |

追加後、ページ右上の「**Publish**」ボタンをクリックします。

---

## Step 2: 空のBaseを1つ作成する

> **ポイント**: テーブルの中身（フィールド・データ）はClaudeが作ります。
> あなたは「空の器（Base）」を作るだけでOKです。

### 2-1. Lark で新しい Base を作成する

1. Lark アプリ（またはブラウザ版 larksuite.com）を開く
2. 左サイドバーの「**Base**」をクリック
3. 「**+ New Base**」または「**Create**」をクリック
4. 名前を入力して「**Create**」

   ```
   Name: LivingMe コンテンツ管理
   ```

---

### 2-2. Base App Token をURLから取得する

作成したBaseをブラウザで開き、URLを確認します。

```
URLの例:
https://www.larksuite.com/base/WxxxBxxxxxxxxxxxxxxxx?table=tblXXX...
                                ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                   この部分が Base App Token
                                   （"W"から始まる文字列）
```

**この値をメモ帳に保存してください。**

---

### 2-3. 作成したアプリをBaseに招待する

> **これをしないとClaudeからBaseにアクセスできません。必須の手順です。**

1. Baseを開いた状態で右上の「**・・・**」（三点メニュー）をクリック
2. 「**Settings**」をクリック
3. 「**Collaborators**」タブをクリック
4. 「**Add Collaborators**」をクリック
5. 検索ボックスに「**LivingMe Portal**」と入力
6. 表示されたアプリを選択し、権限「**Editor**」を設定
7. 「**Add**」をクリック

---

## Step 3: .env.local に貼り付ける

プロジェクトの `.env.local` ファイルに以下を追記してください。

```bash
# Lark 認証情報
LARK_APP_ID=          # ← Step 1-3 でコピーした App ID を貼り付け
LARK_APP_SECRET=      # ← Step 1-3 でコピーした App Secret を貼り付け

# Lark Base
LARK_BASE_APP_TOKEN=  # ← Step 2-2 でコピーした Base App Token を貼り付け
```

### 記入例（値は架空のものです）

```bash
LARK_APP_ID=cli_a1b2c3d4e5f6g7h8
LARK_APP_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz12
LARK_BASE_APP_TOKEN=WxxxBxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3 完了後にClaudeに伝えること

`.env.local` に値を入力し終わったら、以下のようにClaudeに伝えてください。

```
「.env.local に入力しました」
```

---

## Claudeが自動で行うこと（参考）

あなたが「入力しました」と伝えた後、Claudeが以下を自動実行します。

```
1. @larksuiteoapi/node-sdk をインストール
2. Lark API への接続確認
3. 以下の4テーブルを自動作成:

   📋 アーカイブ（13フィールド）
      タイトル / 日付 / カテゴリ / 説明 / 動画URL
      サムネイル / 分数 / 要約 / エネルギーシェア
      ジャーナリングテーマ / タグ / 公開 / 公開日時

   📅 イベント（9フィールド）
      タイトル / イベント種別 / 開始日時 / 終了日時
      説明 / 参加URL / 開催場所 / 定員 / 公開

   🌅 今日のコンテンツ（7フィールド）
      日付 / エネルギーシェア / ジャーナリングテーマ
      朝会メモ / AI自動生成 / 公開 / 公開日時

   ✍️ コラム（5フィールド）
      タイトル / 本文 / 著者名 / 公開日時 / 公開

4. 各テーブルのTable IDを取得して .env.local に自動追記
```

---

## チェックリスト

作業前にこのリストを確認してください。

```
Step 1: Lark Open Platform
  [ ] アプリ「LivingMe Portal」を作成した
  [ ] App ID をメモした
  [ ] App Secret をメモした
  [ ] bitable:app スコープを追加した
  [ ] drive:drive スコープを追加した
  [ ] Publish（公開）した

Step 2: Lark Base
  [ ] 「LivingMe コンテンツ管理」という名前のBaseを作成した
  [ ] Base App Token をメモした（URLから取得）
  [ ] BaseにアプリをEditor権限で招待した

Step 3: .env.local
  [ ] LARK_APP_ID を入力した
  [ ] LARK_APP_SECRET を入力した
  [ ] LARK_BASE_APP_TOKEN を入力した
```

---

*Lark Base セットアップ手順書 v1.0 — 2026-03-25*
