# Living Me 画面を動かすための準備手順

**対象者**: はじめてのセットアップ担当者
**作成日**: 2026-03-21 / **更新日**: 2026-03-24
**所要時間**: 約 30 分

---

## この手順書でできること

ブラウザで `http://localhost:3000` を開き、
Living Me のログイン画面・会員トップ画面・管理画面が表示されるところまで進められます。

---

## 現在の状態（確認済み）

| 項目 | 状態 |
|------|------|
| アプリのコード | ✅ 準備完了 |
| `NEXTAUTH_SECRET` | ✅ すでに設定済み |
| データベース接続先 | ❌ **まだ未設定**（← これが今日やること）|
| データベースのテーブル | ❌ **まだ作成されていない** |

---

## やること一覧（全 3 ステップ）

| ステップ | 作業 | 時間目安 |
|---------|------|---------|
| STEP 1 | Neon でデータベースを作る | 10 分 |
| STEP 2 | .env.local に接続先を貼る | 5 分 |
| STEP 3 | テーブルを作ってアプリを起動する | 10 分 |

---

## STEP 1: Neon でデータベースを作る

Neon は「クラウド上の PostgreSQL（データベース）サービス」です。
Excel でいうと、データを保存しておくファイルをクラウドに作るイメージです。

### 1-1. Neon のアカウントを作る

1. ブラウザで **[https://neon.tech](https://neon.tech)** を開く
2. **「Start for free」** または **「Sign Up」** をクリック
3. **「Continue with GitHub」** を選ぶ（GitHub アカウントでそのまま登録できます）
4. 画面の指示に従ってログイン

### 1-2. プロジェクトを作る

ログインするとダッシュボード画面が開きます。

1. **「New Project」** ボタンをクリック
2. 以下のように入力する:

   | 項目 | 入力内容 |
   |------|---------|
   | Project name | `livingme` |
   | Database name | `livingme` |
   | Region | **AWS / Asia Pacific (Singapore)** または **Tokyo** を選ぶ |
   | Postgres version | そのまま（変更不要）|

3. **「Create Project」** をクリック

> ✅ 少し待つと「Your project is ready!」という画面になります

### 1-3. データベースの「接続文字列」をコピーする

「接続文字列」とは、アプリがデータベースを見つけるための住所のようなものです。

1. プロジェクトが作成されたら **「Connection Details」** というセクションが表示される
2. 下の図のような文字列が表示される:

   ```
   postgresql://livingme_owner:xxxxxxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/livingme?sslmode=require
   ```

3. この文字列の右にある **コピーボタン（📋）** をクリックしてコピーする

> ⚠️ **末尾に `?sslmode=require` が付いていることを確認してください**
> もし付いていない場合は手動で追加してください

---

## STEP 2: `.env.local` に接続先を貼る

`.env.local` はアプリの「設定ファイル」です。パスワードなどの秘密情報を管理します。
このファイルはすでに存在しています。1行だけ書き換えます。

### 2-1. ファイルを開く

Mac の **Finder** でプロジェクトフォルダ（`livingme`）を開き、
`.env.local` ファイルをテキストエディタ（テキストエディット・VS Code など）で開く。

> 💡 `.env.local` は「.（ドット）」から始まる隠しファイルです。
> Finder で見えない場合は **Command + Shift + .（ピリオド）** を押すと表示されます。

### 2-2. DATABASE_URL を書き換える

ファイルを開くと以下のような行があります:

```
DATABASE_URL="postgresql://user:password@localhost:5432/livingme"
```

この行を**まるごと**、STEP 1-3 でコピーした接続文字列に書き換えます:

```
DATABASE_URL="postgresql://livingme_owner:xxxxxxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/livingme?sslmode=require"
```

> ⚠️ ダブルクォーテーション `"` を消さないよう注意してください

### 2-3. ファイルを保存する

**Command + S** で保存します。

---

## STEP 3: テーブルを作ってアプリを起動する

ターミナル（黒い画面）を使います。
Mac では **「Launchpad」→「その他」→「ターミナル」** で開けます。

### 3-1. プロジェクトフォルダに移動する

ターミナルに以下を入力して **Enter** を押す:

```bash
cd /path/to/livingme
```

### 3-2. ライブラリをインストールする（初回のみ）

```bash
npm install
```

> 画面にたくさん文字が流れますが正常です。完了まで 1〜2 分待ちます。

### 3-3. データベースにテーブルを作る

```bash
npm run db:push
```

成功すると以下のようなメッセージが表示されます:

```
🚀  Your database is now in sync with your Prisma schema.
```

> ⚠️ `Error: Can't reach database server` と表示された場合は、
> STEP 2 の DATABASE_URL が正しく設定されているか確認してください

### 3-4. アプリを起動する

```bash
npm run dev
```

成功すると以下のようなメッセージが表示されます:

```
▲ Next.js 16.x
- Local: http://localhost:3000
```

### 3-5. ブラウザで確認する

ブラウザで **[http://localhost:3000](http://localhost:3000)** を開く。

**Living Me のログイン画面**が表示されれば成功です 🎉

---

## ログインを試す

Living Me はメールアドレス＋パスワードでログインします。

### テスト用アカウントを作成する

```bash
npm run db:seed
```

シードデータが投入され、以下のテストアカウントが作成されます:

| メールアドレス | パスワード | ロール |
|-------------|---------|------|
| admin@example.com | password123 | 管理者（ADMIN） |
| member@example.com | password123 | 通常会員（MEMBER） |

> ⚠️ シードデータはローカル開発専用です。本番環境では実行しないでください。

---

## よくある問題

### 「Cannot find module」というエラーが出る

```bash
npm install
```

を実行してみてください。

### 「Access denied」というエラーが出る

DATABASE_URL が正しくない可能性があります。
`.env.local` の DATABASE_URL をもう一度コピーし直してください。

### 画面が真っ白になる

ターミナルにエラーメッセージが出ていないか確認してください。
赤い文字が出ている場合は、その内容を開発者に共有してください。

---

## この先でできること（後回しでOK）

今は画面が動いていますが、以下の機能はまだ使えません。
使いたくなったタイミングで設定してください。

| 機能 | 設定が必要なもの | 参考ドキュメント |
|------|---------------|----------------|
| Stripe 決済 | Stripe の API キー | 管理画面 `/admin/settings` |
| 招待メール | Gmail アプリパスワード | docs/SETUP.md |
| 本番デプロイ | Vercel アカウント | docs/deploy-vercel.md |

---

## 開発を終了するとき

ターミナルで **Control + C** を押すとアプリが停止します。
次回は `npm run dev` を実行するだけで再起動できます。

---

*Living Me クイックスタートガイド - 2026-03-24*
