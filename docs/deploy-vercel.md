# Vercel デプロイ手順書

**作成日**: 2026-03-21 / **更新日**: 2026-03-24
**所要時間**: 約 20 分
**目標**: `https://xxxx.vercel.app` でインターネットから Living Me にアクセスできる状態にする

---

## やること一覧

| ステップ | 作業 | 時間 |
|---------|------|------|
| STEP 1 | コードを GitHub に送る | 3 分 |
| STEP 2 | Vercel にデプロイする | 5 分 |
| STEP 3 | 環境変数を設定する | 5 分 |
| STEP 4 | ドメインを確定して更新する | 3 分 |
| STEP 5 | 動作確認する | 3 分 |

---

## STEP 1: コードを GitHub に送る

ターミナルで以下を順番に実行してください:

```bash
cd /path/to/livingme
git add -A
git commit -m "deploy: initial production setup"
git push
```

> ✅ 「main ブランチに push されました」のようなメッセージが出れば完了

---

## STEP 2: Vercel にデプロイする

### 2-1. Vercel にログイン

1. ブラウザで **[https://vercel.com](https://vercel.com)** を開く
2. **「Log In」** → **「Continue with GitHub」** でログイン

### 2-2. プロジェクトを追加する

1. ダッシュボードの **「Add New...」** → **「Project」** をクリック
2. リポジトリ一覧に **`livingme`** が表示される
3. **「Import」** をクリック

### 2-3. ビルド設定を確認する

以下の画面が出ます。**変更不要**です。そのまま進めてください:

| 項目 | 表示される値 | 操作 |
|------|------------|------|
| Framework Preset | Next.js | そのまま |
| Root Directory | `.` | そのまま |
| Build Command | `next build` | そのまま |

> ⚠️ **「Deploy」はまだ押さない**。先に環境変数を設定します（STEP 3）

---

## STEP 3: 環境変数を設定する

「Import」後の画面で **「Environment Variables」** というセクションが下の方にあります。
以下の項目を **1つずつ** 追加してください。

**「Name」に変数名、「Value」に値を貼り付けて、「Add」をクリック** を繰り返します。

---

### 追加する環境変数

#### 1. DATABASE_URL

Neon ダッシュボードから取得した接続文字列を設定してください。

```
Name:  DATABASE_URL
Value: postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

#### 2. NEXTAUTH_SECRET

以下のコマンドで生成したランダム文字列を設定してください:

```bash
openssl rand -base64 32
```

```
Name:  NEXTAUTH_SECRET
Value: （openssl で生成した文字列）
```

#### 3. NEXTAUTH_URL

デプロイ後のドメインを設定します。最初は仮の値を入れ、STEP 4 で更新します。

```
Name:  NEXTAUTH_URL
Value: https://livingme.vercel.app
```

> ⚠️ デプロイ後に実際のドメインに変更してください（STEP 4 参照）

#### 4. GMAIL_USER

招待メール送信に使用する Gmail アドレスを設定してください。

```
Name:  GMAIL_USER
Value: your-gmail@gmail.com
```

#### 5. GMAIL_APP_PASSWORD

Google アカウントのアプリパスワード（16桁）を設定してください。

> アプリパスワードの取得方法:
> Google アカウント → セキュリティ → 2段階認証を有効化 → アプリパスワードを生成

```
Name:  GMAIL_APP_PASSWORD
Value: （16桁のアプリパスワード）
```

#### 6. NEXT_PUBLIC_APP_URL

```
Name:  NEXT_PUBLIC_APP_URL
Value: https://livingme.vercel.app
```

> ⚠️ デプロイ後に実際のドメインに変更してください

---

### 環境変数を全部追加し終えたら

画面下の **「Deploy」** ボタンをクリックします。

ビルドが始まります（1〜3 分かかります）。
画面にログが流れて、最後に 🎉 の画面になれば成功です。

---

## STEP 4: ドメインを確定して設定を更新する

### 4-1. Vercel のドメインを確認する

デプロイ完了画面に **「Visit」** ボタンがあります。
クリックすると、以下のような URL のサイトが開きます:

```
https://livingme-xxxxxxxx.vercel.app
```

この URL をコピーしておいてください。

### 4-2. Vercel の環境変数を更新する

1. Vercel のプロジェクトページ → **「Settings」** → **「Environment Variables」**
2. `NEXTAUTH_URL` を探して **編集**:
   ```
   変更前: https://livingme.vercel.app
   変更後: https://livingme-xxxxxxxx.vercel.app  ← 実際のドメイン
   ```
3. `NEXT_PUBLIC_APP_URL` も同様に更新

### 4-3. 再デプロイする

1. **「Deployments」** タブ → 一番上のデプロイ → **「...」** → **「Redeploy」**
2. 完了まで待つ

---

## STEP 5: 動作確認

ブラウザで `https://livingme-xxxxxxxx.vercel.app` を開いて確認:

- [ ] ログイン画面が表示される
- [ ] メールアドレスとパスワードでログインできる
- [ ] ログイン後に会員トップページが表示される

---

## うまくいかない場合

### ビルドエラーが出た

Vercel のデプロイログ（赤い文字）をコピーして開発者に共有してください。

### ログインできない

- `NEXTAUTH_SECRET` が設定されているか確認
- ユーザーアカウントがデータベースに存在するか確認

### 画面が表示されない（500 エラー）

`NEXTAUTH_URL` が実際の Vercel ドメインと一致しているか確認してください。

### 招待メールが届かない

- `GMAIL_USER` と `GMAIL_APP_PASSWORD` が正しく設定されているか確認
- Gmail の 2段階認証が有効か確認
- アプリパスワード（通常のパスワードではない）を使用しているか確認

---

## デプロイ完了後の URL まとめ（あとで記録しておく）

| 項目 | URL |
|------|-----|
| サービス URL | `https://livingme-xxxxxxxx.vercel.app` |
| 管理画面 | `https://livingme-xxxxxxxx.vercel.app/admin` |
| GitHub | リポジトリの URL |
| Neon DB | `https://console.neon.tech` |

---

*Living Me Vercel デプロイ手順書 - 2026-03-24*
