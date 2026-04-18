# Living Me システム移管手順書

**作成日**: 2026-03-21
**対象**: システムを販売先（以下「譲受人」）に完全移管する際の手順

---

## はじめに：移管の考え方

### 移管方式は 2 種類ある

| 方式 | 概要 | 推奨ケース |
|------|------|-----------|
| **A. アカウント所有権の譲渡** | 各サービスの登録メールアドレス・銀行口座を譲受人のものに変更する | Stripe など移行コストが非常に高いサービス |
| **B. 新規アカウント作成 + データ移行** | 譲受人が新しいアカウントを作り、データをコピーして移す | GitHub / Vercel / Neon / Cloudflare など移行が容易なサービス |

> ⚠️ **Stripe だけは方式 A（所有権譲渡）を強く推奨**。
> 方式 B にすると既存の会員全員のサブスクリプションが停止し、再契約が必要になるため会員離脱リスクが極めて高い。

---

## 移管前に必ず確認すること

### チェックリスト（作業開始前）

- [ ] 譲受人が全サービスのアカウントを新規作成済み（Stripe を除く）
- [ ] 移管日を会員に事前告知（メンテナンス予告）
- [ ] データベースの最新バックアップを取得済み
- [ ] 移管後の動作確認を行う担当者が両者で決まっている
- [ ] 移管完了後に旧アカウントを削除する日程が合意されている
- [ ] 契約書・秘密保持契約（NDA）が締結されている

### 推奨ダウンタイム枠

```
深夜 1:00〜5:00 JST（朝会・夜会が開催されない時間帯）
```

---

## STEP 1: データベースバックアップ（Neon）

> **最初に実施**。万一に備えて作業前後の 2 回取得する。

### 1-1. バックアップ取得

ローカルターミナルで実行:

```bash
# 環境変数から DATABASE_URL を参照してダンプ
pg_dump "$DATABASE_URL" \
  --no-acl --no-owner \
  -Fc \
  -f livingme-backup-$(date +%Y%m%d-%H%M).dump
```

> `pg_dump` がない場合: `brew install libpq` でインストール

### 1-2. バックアップファイルを安全な場所に保存

- Google Drive / Dropbox など複数箇所にコピーしておく
- ファイル名例: `livingme-backup-20260321-0100.dump`

---

## STEP 2: GitHub — リポジトリ移管

**方式: B（新規作成 + 移行）**

### 方法 A: リポジトリの Transfer（最もシンプル）

1. [github.com](https://github.com) で対象リポジトリを開く
2. **Settings** → 最下部 **Danger Zone** → **Transfer**
3. **Transfer repository** をクリック
4. 譲受人の GitHub アカウント名（または Organization 名）を入力
5. **I understand, transfer this repository** をクリック
6. 譲受人のメールに招待が届く → 譲受人が承認

> 移管後、旧 URL (`github.com/takada-minori/livingme`) は自動でリダイレクトされる。
> Vercel と連携しているため、Vercel 側の GitHub 連携も再設定が必要（STEP 3 参照）。

### 方法 B: 新規リポジトリに push（コードのみ移管）

```bash
# 譲受人のリポジトリを新しい origin として追加
git remote add new-origin https://github.com/[譲受人アカウント]/livingme.git
git push new-origin main --tags
```

---

## STEP 3: Vercel — プロジェクト移管

**方式: B（新規アカウント + 移行）**

### 3-1. 譲受人が Vercel アカウントを作成

1. [vercel.com](https://vercel.com) で Sign Up（GitHub 連携推奨）

### 3-2. 旧プロジェクトの環境変数をエクスポート

Vercel ダッシュボード → **Settings** → **Environment Variables** を開き、
全ての値をテキストファイルにコピーしておく（画面キャプチャでも可）。

```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
DATABASE_URL=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

### 3-3. 譲受人の Vercel に新規プロジェクトを作成

1. 譲受人のアカウントで **New Project** → 移管済みの GitHub リポジトリを選択
2. 環境変数を STEP 3-2 でコピーした値で設定
3. `NEXTAUTH_URL` を **新しい Vercel ドメインに更新**
4. **Deploy** を実行

### 3-4. カスタムドメインの付け替え

> 独自ドメイン（例: `livingme.jp`）を使っている場合

1. 旧 Vercel: **Settings** → **Domains** → ドメインを **Remove**
2. 新 Vercel: **Settings** → **Domains** → 同じドメインを **Add**
3. DNS レジストラ（お名前.com / ムームードメイン等）で CNAME を新 Vercel の IP に向け直す

> ⚠️ DNS 変更は反映に最大 72 時間かかる。作業はダウンタイム枠内で実施すること。

---

## STEP 4: Neon — データベース移管

**方式: B（新規プロジェクト + データ移行）**

### 4-1. 譲受人が Neon アカウントを作成し、プロジェクト作成

1. [neon.tech](https://neon.tech) で Sign Up
2. **New Project** → `livingme` / Tokyo リージョン で作成
3. 新しい接続文字列をコピー

### 4-2. バックアップからリストア

```bash
# 新しい DATABASE_URL に STEP 1 のバックアップを流し込む
pg_restore \
  --no-acl --no-owner \
  -d "postgresql://[新しい接続文字列]?sslmode=require" \
  livingme-backup-20260321-0100.dump
```

### 4-3. Vercel の環境変数を更新

新 Vercel の `DATABASE_URL` を新しい Neon 接続文字列に差し替えて **Redeploy**。

### 4-4. 動作確認後、旧 Neon プロジェクトを削除

---

## STEP 5: Cloudflare R2 — ストレージ移管

**方式: B（新規アカウント + データ移行）**

### 5-1. 譲受人が Cloudflare アカウントを作成し、R2 バケット作成

1. [cloudflare.com](https://cloudflare.com) で Sign Up
2. R2 → **Create bucket** → `livingme-media`
3. パブリックアクセスを有効化
4. API トークンを発行

### 5-2. ファイルを一括コピー（rclone 使用）

```bash
# rclone インストール
brew install rclone

# 旧 R2（コピー元）の設定
rclone config create r2-old s3 \
  provider=Cloudflare \
  access_key_id=[旧 R2_ACCESS_KEY_ID] \
  secret_access_key=[旧 R2_SECRET_ACCESS_KEY] \
  endpoint=https://[旧 R2_ACCOUNT_ID].r2.cloudflarestorage.com

# 新 R2（コピー先）の設定
rclone config create r2-new s3 \
  provider=Cloudflare \
  access_key_id=[新 R2_ACCESS_KEY_ID] \
  secret_access_key=[新 R2_SECRET_ACCESS_KEY] \
  endpoint=https://[新 R2_ACCOUNT_ID].r2.cloudflarestorage.com

# ファイルを全コピー
rclone copy r2-old:livingme-media r2-new:livingme-media --progress
```

### 5-3. Vercel の環境変数を更新

新しい R2 の値（`R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_PUBLIC_URL`）を Vercel に設定して **Redeploy**。

---

## STEP 6: Discord — Bot・OAuth アプリ移管

**方式: A（所有権譲渡）または B（再作成）**

> Discord アプリは「所有者のアカウント」に紐付いている。
> 運営 Discord サーバーが譲受人の管理になる場合は、Bot を含めて新規作成し直す方が綺麗。

### 方法 A: チームメンバーに追加（共同管理）

1. [discord.com/developers/applications](https://discord.com/developers/applications) → Living Me アプリ
2. **General Information** → **App Testers / Team** → 譲受人のDiscord アカウントを追加
3. チーム機能で所有権を移譲（Applications → Team → Transfer Ownership）

### 方法 B: 新規アプリ作成（推奨・クリーン）

1. 譲受人が Discord Developer Portal で **新規アプリ** を作成
2. STEP 3 (Vercel) の `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` を新しい値に更新
3. 新しい Bot を旧 Bot と **同じ権限・ロール設定**でサーバーに招待
4. `DISCORD_BOT_TOKEN` を管理画面で更新
5. 旧 Bot をサーバーから **キック**（退出）

### Discord サーバー自体の所有権移転

Discord サーバーの「所有者」を変更する:

1. Discord サーバー設定 → **メンバー**
2. 譲受人のアカウントにカーソルを当てる → **…** → **所有権を譲渡**
3. パスワード確認で実行

> ⚠️ 所有権は 1 アカウントにのみ帰属。移管後は元に戻せない。

---

## STEP 7: Stripe — 決済アカウント移管（最重要）

**方式: A（アカウント所有権の譲渡）一択**

> Stripe アカウントを新規作成して移行することは**事実上不可能**。
> 理由: 既存の顧客（Customer）・サブスクリプション・請求履歴は元のアカウントに紐付いており、
> 別アカウントに移動する手段が Stripe では提供されていない。
> 無理やり移行しようとすると **全会員の定期課金が停止**し、再契約が必要になる。

### 7-1. ビジネス情報の変更（段階的に実施）

Stripe ダッシュボード → **Settings（設定）** → 以下を順に変更:

| 項目 | 変更内容 |
|------|---------|
| ビジネス情報 | 譲受人の会社名・住所 |
| 銀行口座 | 譲受人の銀行口座（売上振込先） |
| 税務情報 | 譲受人の税務情報（インボイス等）|
| サポートメール | 譲受人のメールアドレス |

### 7-2. ログインメールアドレスの変更

Stripe ダッシュボード → **Settings** → **Account details** → **Email address** を譲受人のメールに変更。

> ⚠️ メール変更後は元のメールでログインできなくなる。
> **変更前に全ての API キーをコピーしておくこと**（変更後は再取得が必要）。

### 7-3. チームメンバーとして先に追加（安全な移行順序）

メールを変更する前に、譲受人を一時的にチームメンバーとして追加して動作確認:

1. **Settings** → **Team** → **Invite member**
2. 譲受人メールを入力 → **Administrator** 権限で招待
3. 譲受人がログインできることを確認
4. その後メールアドレス・銀行口座を変更
5. 旧アカウント（自分）をチームから **Remove**

### 7-4. Webhook の URL を新しい Vercel ドメインに更新

Stripe ダッシュボード → **Developers** → **Webhooks** → エンドポイント URL を新しいドメインに変更。

---

## STEP 8: 管理画面の管理者権限を移管

データベース内の管理者ユーザーを切り替える。

### 8-1. 新管理者（譲受人）が Discord でログイン

1. 新しい Vercel ドメインにアクセス
2. Discord ログインを実行（譲受人の Discord アカウントで）

### 8-2. ADMIN 権限を付与

Neon ダッシュボード → **SQL Editor** で実行:

```sql
-- 譲受人の Discord ユーザー ID で ADMIN に昇格
UPDATE "User"
SET role = 'ADMIN'
WHERE "discordUserId" = '譲受人のDiscordユーザーID';

-- 旧管理者を一般ユーザーに降格
UPDATE "User"
SET role = 'MEMBER'
WHERE "discordUserId" = '旧管理者のDiscordユーザーID';
```

### 8-3. 管理画面から動作確認

1. `/admin` にアクセスし、会員一覧が表示されることを確認
2. **外部サービス設定** ページで全設定が表示されることを確認

---

## STEP 9: 最終動作確認

移管完了後、以下を必ず確認してから引き渡す。

### 確認チェックリスト

- [ ] Discord ログインができる
- [ ] 会員ページ（`/`）が表示される
- [ ] アーカイブ一覧が表示される（動画サムネイルを含む）
- [ ] 管理画面（`/admin`）が表示される
- [ ] 管理画面 → 外部サービス設定 が表示される
- [ ] Stripe テスト決済が通る（テストモードで確認）
- [ ] Stripe Webhook のテストが成功する（Stripe ダッシュボードから「テスト送信」）
- [ ] Discord ロールの自動同期が動作する（テストユーザーで確認）
- [ ] ファイルアップロードが動作する（管理画面からサムネイルをアップロード）
- [ ] エラーログが出ていない（Vercel → Functions → Logs で確認）

---

## 移管完了後の後処理（旧アカウント側）

全ての確認が取れてから実施する。**確認前に削除しないこと。**

| 作業 | タイミング |
|------|-----------|
| 旧 Neon プロジェクトを削除 | 移管後 2 週間以上経過してから |
| 旧 Cloudflare R2 バケットを削除 | 移管後 2 週間以上経過してから |
| 旧 Vercel プロジェクトを削除 | 移管後 2 週間以上経過してから |
| 旧 GitHub リポジトリ（元の fork）を削除 | 移管後 1 ヶ月以上経過してから |
| 旧 Discord Bot をサーバーから削除 | 新 Bot の動作確認後すぐ |
| ローカルの `.env.local` を削除 | 移管完了を確認後すぐ |

---

## 移管全体スケジュール（目安）

```
事前準備（移管 1 週間前）
  ├─ 会員へのメンテナンス告知
  ├─ 譲受人がアカウントを準備（GitHub / Vercel / Neon / Cloudflare）
  └─ Stripe チームメンバーに譲受人を追加・動作確認

移管当日（深夜 1:00〜5:00 JST）
  ├─ 00:50 バックアップ取得（Neon）
  ├─ 01:00 GitHub リポジトリ移管
  ├─ 01:30 Neon データ移行（リストア）
  ├─ 02:00 Cloudflare R2 ファイルコピー
  ├─ 02:30 Vercel 新プロジェクト作成・デプロイ
  ├─ 03:00 Discord OAuth リダイレクト URL 更新・Bot 入れ替え
  ├─ 03:30 Stripe Webhook URL 更新
  ├─ 03:45 管理者権限の切り替え（DB UPDATE）
  ├─ 04:00 動作確認チェックリスト実施
  └─ 04:30 問題なければ移管完了宣言・サービス再開

移管後（1〜2 週間）
  └─ 旧アカウントのリソース削除（問題がないことを確認してから）
```

---

## 移管時に引き渡すもの（引き渡しリスト）

譲受人に渡す情報をまとめたドキュメント（別途作成）に含めるべき項目:

| カテゴリ | 内容 |
|---------|------|
| アクセス情報 | 全サービスのログイン情報 |
| 環境変数 | `.env.local` の全内容（機密情報のため暗号化して渡す）|
| DB バックアップ | 最新の `.dump` ファイル |
| 運用マニュアル | 管理画面の操作方法・日常更新手順 |
| 緊急対応手順 | 障害発生時の確認箇所・連絡先 |
| ドメイン情報 | DNS レジストラのログイン情報・設定内容 |
| 月額費用の一覧 | Vercel / Neon / Cloudflare / Stripe 手数料 |

---

## よくある問題と対処

| 問題 | 原因 | 対処 |
|------|------|------|
| 移管後に Discord ログインが失敗する | Redirect URL が古いドメインのまま | Discord Developer Portal で新ドメインを追加 |
| 画像・動画が表示されない | R2 の公開 URL が変わった | DB 内の URL を新 R2 ドメインに一括更新（SQL） |
| Stripe Webhook が届かない | エンドポイント URL が古いドメイン | Stripe → Webhooks で URL を更新 |
| メール認証が届かない | `NEXTAUTH_URL` が古いドメイン | Vercel 環境変数を更新して Redeploy |
| 管理画面にアクセスできない | 管理者ロールが未付与 | Neon SQL Editor で `role = 'ADMIN'` を設定 |

---

## 注意事項・免責

- **Stripe の銀行口座変更後**は、変更前の売上が旧口座に振り込まれる場合がある。Stripe サポートに確認すること。
- **個人情報保護法**に基づき、会員データを第三者に提供する際は会員への通知または同意が必要な場合がある。法的確認を推奨。
- **ドメインの WHOIS 情報**に個人情報が含まれる場合は、移管前に WHOIS 代理公開サービスへの切り替えを検討すること。

---

*Living Me システム移管手順書 - 2026-03-21*
