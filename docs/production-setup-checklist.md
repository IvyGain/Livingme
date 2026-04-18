# 本番運用 設定チェックリスト

**作成日**: 2026-03-21 / **更新日**: 2026-03-24
**対象**: Living Me を Vercel でインターネット公開するための残り設定

---

## 優先順位まとめ

```
今すぐ → Vercel 環境変数設定・デプロイ → 管理画面に入れる
次に   → Stripe 設定 → 決済が動く
次に   → UnivaPay 設定 → 追加決済が動く
最後   → 独自ドメイン → ブランディング
```

---

## 🔴 必須（今すぐ必要）

### 1. Vercel 環境変数の設定

Vercel → Settings → Environment Variables に以下を追加 → Redeploy:

| Name | 内容 |
|------|------|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` で生成 |
| `DATABASE_URL` | Neon 接続文字列 |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `GMAIL_USER` | 送信元 Gmail アドレス |
| `GMAIL_APP_PASSWORD` | Gmail アプリパスワード（16桁） |

追加後:
1. Vercel → Deployments → 一番上 → `...` → **「Redeploy」**
2. `https://your-domain.vercel.app/login` にアクセスできれば完了

---

### 2. 管理者アカウントの作成

Neon ダッシュボード → SQL Editor で管理者ユーザーを作成:

```sql
-- 1. まず招待メールで通常ユーザーを作成（/admin/members から）
-- 2. その後 ADMIN ロールに昇格
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

---

### 3. Vercel の支払い方法登録

14日間トライアル中です。期限前にクレジットカードを登録してください。

1. Vercel → Settings → Billing
2. **「Add Payment Method」** をクリック
3. クレジットカード情報を入力

> 登録しないとトライアル終了後にサービスが停止します（月額 $20）

---

## 🟡 Stripe 設定（決済を動かすのに必要）

### Stripe アカウント準備

1. [https://stripe.com/jp](https://stripe.com/jp) でアカウント作成
2. ダッシュボード → **「商品」** → **「商品を追加」**
   - 商品名: `Living Me 月額会員`
   - 価格: 月額（例: ¥5,500）
   - 請求期間: 毎月
3. 作成後に表示される **`price_xxx`** をコピー

### Stripe Webhook を登録

1. Stripe ダッシュボード → **「Webhook」** → **「エンドポイントを追加」**
2. URL を入力:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
3. 以下のイベントを選択:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. **「エンドポイントを追加」** → 表示される **`whsec_xxx`** をコピー

### 管理画面で設定

`https://your-domain.vercel.app/admin/settings` を開いて入力:

| 項目 | 値 |
|------|----|
| Stripe シークレットキー | `sk_live_xxx`（本番）または `sk_test_xxx`（テスト中）|
| Stripe Webhook シークレット | `whsec_xxx` |
| Stripe 価格ID | `price_xxx` |

> ✅ まずは `sk_test_xxx`（テストモード）で動作確認してから、本番キーに切り替えることを推奨します。

---

## 🟢 推奨（あると望ましい）

### 独自ドメイン（例: `livingme.jp`）

1. ドメイン取得（[お名前.com](https://www.onamae.com) / [Cloudflare](https://www.cloudflare.com) 等）
2. Vercel → プロジェクト → **「Settings」** → **「Domains」** → ドメインを追加
3. DNS 設定（Vercel の指示に従う）
4. Vercel → Environment Variables で以下を更新:

| Name | 変更後の値 |
|------|-----------|
| `NEXTAUTH_URL` | `https://livingme.jp` |
| `NEXT_PUBLIC_APP_URL` | `https://livingme.jp` |

5. Vercel → Deployments → Redeploy

---

## 完了チェックリスト

### 必須

- [ ] Vercel 環境変数（NEXTAUTH_SECRET / DATABASE_URL / NEXTAUTH_URL / GMAIL_USER / GMAIL_APP_PASSWORD）を設定
- [ ] Redeploy してログイン画面 `/login` にアクセスできる
- [ ] 管理者アカウントを作成・ADMIN ロールを設定
- [ ] 管理画面 `/admin` にアクセスできる
- [ ] Vercel の支払い方法を登録済み

### メール

- [ ] 管理画面の「招待メールを送る」から招待メールが届く

### 決済

- [ ] Stripe アカウント作成済み
- [ ] Stripe に商品・月額価格を作成済み
- [ ] Stripe Webhook エンドポイントを登録済み
- [ ] 管理画面に Stripe キーを保存済み
- [ ] テスト決済が成功する（`sk_test_xxx` で確認）

### 独自ドメイン（任意）

- [ ] ドメイン取得済み
- [ ] Vercel に追加・DNS 設定済み
- [ ] 環境変数 URL を更新・Redeploy 済み

---

*Living Me 本番運用設定チェックリスト - 2026-03-24*
