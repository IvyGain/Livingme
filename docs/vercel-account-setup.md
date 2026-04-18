# Vercel アカウント・プラン登録手順書

**作成日**: 2026-03-21
**対象**: サービス運営会社（費用負担者）と開発者（GitHub 操作者）が別の場合

---

## 最初に知っておくこと

### 登場人物

| 役割 | 説明 | Vercel での立場 |
|------|------|----------------|
| **運営会社**（費用負担者） | Living Me を運営する法人。クレジットカードを持つ | チームオーナー |
| **開発者**（GitHub 操作者） | コードを書いてデプロイする担当者 | チームメンバー |

### なぜ「チーム」が必要か

Vercel には 2 種類のアカウントがあります:

| 種類 | 用途 | 商用利用 | 費用 |
|------|------|:-------:|------|
| **個人アカウント（Hobby）** | 個人の趣味・学習 | ❌ 規約違反 | 無料 |
| **チーム（Pro）** | ビジネス・商用サービス | ✅ | $20/月〜 |

> ⚠️ Living Me は会員から月額料金を受け取るビジネスサービスです。
> **Hobby プランでの商用利用は Vercel の利用規約違反**になります。
> 運営会社のアカウントで **Pro プラン（チーム）** を使う必要があります。

---

## 全体の流れ

```
【運営会社が行う作業】                    【開発者が行う作業】
        │                                        │
STEP 1: Vercel アカウント作成                     │
        │                                        │
STEP 2: チーム作成 + Pro プランに登録              │
        │                                        │
STEP 3: 開発者をチームに招待 ──────────────────→ STEP 4: 招待を承認
        │                                        │
        │                                 STEP 5: GitHub リポジトリを
        │                                         チームにインポート
        │                                        │
STEP 6: 環境変数・Discord 設定 ←─────────────────┘
        │
STEP 7: 動作確認
```

---

## 【運営会社の作業】STEP 1: Vercel アカウントを作成する

> 💡 運営会社の **メールアドレス**で作成してください（個人のメールではなく会社のメール推奨）

1. **[https://vercel.com/signup](https://vercel.com/signup)** を開く
2. **「Continue with Email」** を選ぶ（GitHub アカウントを使わない場合）
   または **「Continue with GitHub」**（会社の GitHub アカウントがある場合）
3. メールアドレスとパスワードを入力 → **「Create Account」**
4. 確認メールが届く → メール内の **「Verify Email」** をクリック

---

## 【運営会社の作業】STEP 2: チームを作成して Pro プランに登録する

### 2-1. チームを作成する

アカウント作成後、ダッシュボードが開きます。

1. 左上のアカウント名の横にある **▼** をクリック
2. **「Create Team」** をクリック
3. チーム名を入力（例: `livingme` または会社名）
4. **「Continue」** をクリック

### 2-2. Pro プランを選択する

チーム作成後、プラン選択画面が出ます:

| プラン | 月額 | 選ぶべきか |
|--------|------|----------|
| Hobby | 無料 | ❌ 商用不可 |
| **Pro** | **$20/月**（約 3,000 円）| ✅ **これを選ぶ** |
| Enterprise | 要相談 | 不要 |

1. **「Pro」** を選択
2. **「Continue」** をクリック

### 2-3. クレジットカードを登録する

運営会社のクレジットカード情報を入力します:

| 入力項目 | 内容 |
|---------|------|
| Card number | カード番号（16 桁）|
| Expiry date | 有効期限（MM/YY）|
| CVC | 裏面の 3 桁 |
| Name on card | カード名義 |
| Billing address | 請求先住所 |

入力後 **「Subscribe」** をクリック。

> ✅ Pro プランへの登録完了。月額 $20（約 3,000 円）が毎月請求されます。

---

## 【運営会社の作業】STEP 3: 開発者をチームに招待する

1. チームのダッシュボード → **「Settings」**
2. 左メニュー **「Members」** をクリック
3. **「Invite Member」** をクリック
4. 開発者のメールアドレスを入力
5. 役割を **「Member」** に設定
6. **「Send Invitation」** をクリック

> 開発者にメールが届きます。開発者は次のステップで承認します。

---

## 【開発者の作業】STEP 4: 招待を承認して GitHub を連携する

1. 届いたメールの **「Join Team」** をクリック
2. Vercel アカウントでログイン（なければ新規作成）
3. チームに参加できたことを確認

### GitHub を Vercel チームに連携する

1. チームダッシュボード → **「Settings」** → **「Integrations」**
2. **「Connect to GitHub」** をクリック
3. GitHub アカウントでログイン
4. `livingme` リポジトリへのアクセスを許可

---

## 【開発者の作業】STEP 5: プロジェクトをチームにインポートする

1. チームダッシュボード → **「Add New...」** → **「Project」**
2. リポジトリ一覧から **`livingme`** を選択 → **「Import」**
3. 設定画面:

   | 項目 | 値 | 操作 |
   |------|-----|------|
   | Framework Preset | Next.js | そのまま |
   | Root Directory | `.` | そのまま |

4. **「Environment Variables」** セクションで以下を追加:

### 追加する環境変数（6 つ）

| Name | Value |
|------|-------|
| `DATABASE_URL` | Neon の接続文字列（`.env` ファイルの値）|
| `NEXTAUTH_SECRET` | `.env` ファイルの `NEXTAUTH_SECRET` の値 |
| `NEXTAUTH_URL` | `https://livingme.vercel.app`（仮。後で更新）|
| `DISCORD_CLIENT_ID` | `.env` ファイルの値 |
| `DISCORD_CLIENT_SECRET` | `.env` ファイルの値 |
| `NEXT_PUBLIC_APP_URL` | `https://livingme.vercel.app`（仮。後で更新）|

5. **「Deploy」** をクリック

---

## STEP 6: 実際のドメインで設定を更新する

デプロイ完了後、実際の URL が確定します（例: `https://livingme-abc123.vercel.app`）。

### 6-1. 環境変数の URL を更新する

チームダッシュボード → プロジェクト → **「Settings」** → **「Environment Variables」**

以下の 2 つを実際の URL に書き換えて保存:

```
NEXTAUTH_URL        → https://livingme-abc123.vercel.app
NEXT_PUBLIC_APP_URL → https://livingme-abc123.vercel.app
```

### 6-2. 再デプロイする

**「Deployments」** → 一番上の行 → **「...」** → **「Redeploy」**

### 6-3. Discord の設定を更新する

**[https://discord.com/developers/applications](https://discord.com/developers/applications)** を開く:

1. **「Living Me」** アプリ → **「OAuth2」** → **「Redirects」**
2. **「Add Redirect」** で以下を追加:
   ```
   https://livingme-abc123.vercel.app/api/auth/callback/discord
   ```
3. **「Save Changes」**

---

## STEP 7: 動作確認

`https://livingme-abc123.vercel.app` を開いて確認:

- [ ] ログイン画面が表示される
- [ ] Discord でログインできる
- [ ] 会員トップページが表示される

---

## 費用まとめ

| サービス | 費用 | 支払い主体 |
|---------|------|----------|
| Vercel Pro | $20/月（約 3,000 円）| 運営会社 |
| Neon（DB）| 無料〜$19/月 | 運営会社 |
| Cloudflare R2（ストレージ）| 無料〜従量 | 運営会社（後で設定）|
| Stripe | 決済手数料のみ（3.6%〜）| 運営会社 |
| **合計（初期）** | **約 3,000〜5,000 円/月** | |

---

## 権限・管理の整理

| 項目 | 管理者 | 備考 |
|------|--------|------|
| Vercel の請求・プラン | 運営会社 | クレジットカード登録 |
| Vercel のデプロイ操作 | 開発者 | チームメンバーとして参加 |
| GitHub リポジトリ | 開発者 | コードの管理 |
| Neon データベース | 運営会社推奨 | 本番データを管理 |
| Discord アプリ | 開発者または運営会社 | `docs/system-transfer-guide.md` 参照 |

> 将来的にシステムを運営会社に引き渡す場合の手順は `docs/system-transfer-guide.md` を参照してください。

---

*Living Me Vercel アカウント・プラン登録手順書 - 2026-03-21*
