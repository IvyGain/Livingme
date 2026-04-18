# Living Me インフラ選定比較

**作成日**: 2026-03-20
**更新日**: 2026-03-21
**対象プロジェクト**: Living Me 〜本当の自分と出逢う会〜 会員サイト

---

## 前提条件の整理

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 15 (App Router, SSR + API Routes) |
| **コンテンツ DB** | **Lark Base（Bitable）** ← 動画アーカイブ・イベント・ジャーナリング・今日のコンテンツを管理 |
| **システム DB** | PostgreSQL / Neon ← **User・StripeEvent・Setting の 3 テーブルのみ**（無料枠で永続的に収まる） |
| ストレージ | Cloudflare R2（手動アップロード画像・サムネイル）+ Lark Drive（動画 URL） |
| 外部 Webhook | Stripe（サブスク）, Discord, **Lark（コンテンツ更新通知）** |
| 規模感 | 初期 40名 → 6ヶ月後 150名 → 将来 3,000〜5,000名 |
| 運用者 | 非エンジニアが **Lark Base 上で** 日常運用 |
| 稼働率要件 | 99.5% 以上 |

---

## Lark Base 連携の設計方針

### なぜ Lark Base をコンテンツ DB に使うか

| 理由 | 詳細 |
|------|------|
| **非エンジニアが使いやすい** | スプレッドシート感覚でアーカイブ・イベント・ジャーナリングを登録できる |
| **既存運用との連続性** | 朝会の議事録・動画 URL はすでに Lark 内で管理されている |
| **ファイルとセットで管理** | Lark Drive の動画ファイルと Lark Base のメタデータが同一ツール内に収まる |
| **追加コストなし** | Lark の既存契約内で利用可能 |

### データの役割分担

```
Lark Base（コンテンツ管理・運用）    PostgreSQL / Neon（システム専用・3テーブル）
────────────────────────────        ────────────────────────────────────────
・動画アーカイブ（メタデータ）         ・User
・イベント / スケジュール               　  discordUserId ↔ stripeCustomerId の紐付け
・今日のエネルギーシェア                　  ambassadorType・referrerId（紹介連鎖）
・今日のジャーナリングテーマ             　  status / role キャッシュ
・再生リスト                          ・StripeEvent
・コラム / 主宰者メッセージ              　  Webhook 二重処理防止（冪等性）
・ジャーナリング（個人記録）            ・Setting
                                       　  暗号化シークレット（管理画面から更新）
```

### PostgreSQL を 3 テーブルに絞れる根拠

| 削除できるテーブル | 移行先 | 理由 |
|-----------------|--------|------|
| Archive / Tag / ArchiveTag | Lark Base | コンテンツ管理 |
| Playlist / PlaylistArchive | Lark Base | コンテンツ管理 |
| TodayContent / Event / Column | Lark Base | コンテンツ管理 |
| Journal | Lark Base | ユーザー要望 |
| Account / Session / VerificationToken | 不要 | `auth.ts` が `strategy:"jwt"` のためDBセッション未使用 |

| 残すテーブル | 理由 |
|------------|------|
| **User** | Discord ID ↔ Stripe 顧客 ID のマッピング。紹介制度（referrerId）は自己結合リレーショナルデータのため Lark Base で代替不可 |
| **StripeEvent** | Stripe は Webhook を複数回送信する仕様。このテーブルがないと同一決済イベントが二重処理される |
| **Setting** | 管理画面から非エンジニアが暗号化シークレットを更新するための仕組み |

### PostgreSQL を完全に排除できないか？

理論上は **Vercel KV（Redis）で StripeEvent を代替**し、User を Stripe のカスタマーメタデータに格納すれば不要にできる。
ただし以下のリスクがあるため **推奨しない**:

- Vercel KV は KV ストアのため JOIN・集計・紹介連鎖の再帰クエリが不可
- Stripe メタデータへの依存はベンダーロックインを深める
- Neon の無料枠（0.5 GB）は 3 テーブル・5,000 名スケールでも < 10 MB しか使わない → **コストゼロで運用できる**

---

### Lark → システム のデータフロー（2 方式）

#### 方式 A: Lark Webhook → リアルタイム同期（推奨）

```
Lark Base でレコード更新
    │  Lark Webhook（即時）
    ↓
Next.js API Route (/api/webhooks/lark)
    │
    ↓
PostgreSQL の Archive / Event テーブルに同期
    │
    ↓
会員サイトに即時反映
```

- **メリット**: 更新後すぐに会員サイトへ反映（遅延なし）
- **デメリット**: Lark Webhook の設定が必要

#### 方式 B: 定期ポーリング（シンプル）

```
Vercel Cron（例: 毎時）
    │
    ↓
Lark Base API を取得
    │
    ↓
PostgreSQL を差分更新
    │
    ↓
会員サイトに反映（最大1時間遅延）
```

- **メリット**: 設定が単純。Webhook 不要
- **デメリット**: 更新の反映に最大1時間のタイムラグ

> **推奨**: 朝会後のコンテンツ更新は「すぐ反映したい」ため、**方式 A（Webhook）を基本とし、方式 B を補完的に使う**構成が最適。

---

## 候補比較

---

### 候補 1: Vercel + Neon + Cloudflare R2 ★推奨

**構成イメージ**

```
運用者（非エンジニア）
  └─ Lark Base でコンテンツ編集
       │  Webhook / Lark API
       ↓
ユーザー
  └─ Cloudflare CDN（R2 + Cache）
       ├─ サムネイル・画像 ─────── Cloudflare R2
       └─ Webアプリ ────────────── Vercel (Next.js)
            ├─ API Route: /api/webhooks/lark  ← Lark Webhook 受信
            ├─ Vercel Cron: Lark 定期同期
            ├─ Lark Base API（コンテンツ読み取り）
            └─ DB ─── Neon (PostgreSQL)
                        ├─ Archive（Lark から同期）
                        ├─ Event（Lark から同期）
                        └─ User / Journal / StripeEvent
```

#### 根拠

- Vercel の **API Routes** が Lark Webhook の受信エンドポイントとして機能する
- **Vercel Cron** で Lark Base の定期ポーリングが設定ゼロで動く（`vercel.json` に1行追加するだけ）
- Lark API は REST + JSON のため、Serverless Function からの呼び出しに問題なし
- Neon は Lark から同期したコンテンツと、PostgreSQL が必要なシステムデータを一元管理

#### Lark 連携に関するメリット

- **Vercel Cron が使える**: 追加インフラ不要で定期同期ジョブを設定できる
- **Webhook レスポンスが速い**: Serverless Function の起動は 50ms 未満。Lark Webhook のタイムアウト（3秒）に余裕で対応
- **Lark API のレート制限対応**: Vercel の Edge Config や Neon の PostgreSQL でキャッシュを持てる

#### Lark 連携に関するデメリット

- **Serverless のタイムアウト**: 大量データの一括同期（例: 過去アーカイブ全件取り込み）は 300 秒制限に引っかかる可能性。初回同期はローカルまたは Vercel の Background Function を使う
- **Lark API レート制限**: Lark Base API は 100 req/分 (テナントあたり)。大量ポーリングには注意が必要

#### その他メリット

- **手離れが最も良い**: デプロイは git push のみ。インフラ管理不要
- **初期コスト最小**: 月 $0〜$25 から始められる
- **動画転送コスト**: R2 は egress 無料

#### デメリット

- **大規模時のコスト**: 会員 1,000 名超で月 $100〜$300 程度になりうる
- **ベンダーロックイン**: Vercel 独自機能を使いすぎると移行コストが増す

#### コスト試算

| フェーズ | 月額目安 |
|---------|---------|
| MVP（〜40名） | $0〜$25 |
| 成長期（〜150名） | $25〜$60 |
| 将来（〜5,000名） | $150〜$400 |

---

### 候補 2: Fly.io + Neon + Cloudflare R2

**構成イメージ**

```
運用者（非エンジニア）
  └─ Lark Base でコンテンツ編集
       │  Webhook / Lark API
       ↓
ユーザー
  └─ Cloudflare CDN（R2 + Cache）
       ├─ サムネイル・画像 ─────── Cloudflare R2
       └─ Webアプリ ────────────── Fly.io (Docker コンテナ)
            ├─ /api/webhooks/lark  ← 常時起動のため確実に受信
            ├─ Cron（コンテナ内タイマー or Fly Machines）
            └─ DB ─── Neon (PostgreSQL)
```

#### 根拠

- 常時起動コンテナのため、Lark Webhook を**確実かつ即時に受信**できる（Serverless のコールドスタートなし）
- 大量アーカイブの初回同期など、長時間バッチ処理が Fly.io 上でそのまま動く
- Neon と R2 の組み合わせはコスト面で候補 1 と同様に最適

#### Lark 連携に関するメリット

- **Webhook 受信の確実性**: 常時起動コンテナのため、Serverless のコールドスタート遅延がない。Lark Webhook のタイムアウトを気にしなくてよい
- **大量同期の制限なし**: 初回の全件アーカイブ取り込みも時間制限なしで実行可能
- **バックグラウンドジョブ**: Node.js の `setInterval` やコンテナ内 cron で Lark 定期同期を柔軟に実装できる

#### Lark 連携に関するデメリット

- Vercel Cron のような「設定ゼロの cron」がなく、自前で実装が必要

#### その他メリット

- **コスパが最良**: 月 $5〜$10 から始められる
- **タイムアウト制限なし**: AI 抽出バッチも安定稼働

#### デメリット

- **手間がやや増える**: Dockerfile 作成・デプロイ設定が必要
- **エコシステムの規模**: Vercel・AWS に比べてドキュメントが少ない

#### コスト試算

| フェーズ | 月額目安 |
|---------|---------|
| MVP（〜40名） | $5〜$15 |
| 成長期（〜150名） | $20〜$40 |
| 将来（〜5,000名） | $80〜$200 |

---

### 候補 3: AWS (ECS Fargate + RDS + S3 + CloudFront)

**構成イメージ**

```
運用者（非エンジニア）
  └─ Lark Base でコンテンツ編集
       │  Webhook / Lark API
       ↓
ユーザー
  └─ CloudFront（CDN）
       ├─ サムネイル・画像 ─────── S3
       └─ ALB ──────────────────── ECS Fargate（Next.js）
            ├─ /api/webhooks/lark
            ├─ Lambda + EventBridge（Lark 定期同期）
            └─ DB ─── RDS PostgreSQL (Aurora Serverless v2)
```

#### 根拠

- 将来 5,000 名規模・AI 機能追加・バーチャルリビング（WebSocket）等を見据えると最もスケール設計が柔軟
- Lark Webhook 受信専用の Lambda を ECS と分離することで、障害の影響範囲を最小化できる

#### Lark 連携に関するメリット

- **Lambda で Lark Webhook 受信を分離**: ECS タスクとは独立して動作するため、本体アプリに影響しない
- **EventBridge Scheduler**: Lark 定期同期を AWS のスケジューラで管理できる
- **SQS でキュー処理**: Lark から大量レコードを取得する際、SQS でバッファリングして安定処理

#### Lark 連携に関するデメリット

- Lambda・EventBridge・SQS の設定が追加で必要になり、構築コストが増す

#### その他メリット

- **スケール上限なし**: 会員 10 万名でも対応可能
- **セキュリティ**: VPC・IAM・WAF の組み合わせで高いセキュリティ

#### デメリット

- **初期構築コストが高い**: 設定に数日〜1 週間かかる
- **固定費が高い**: 会員が少ない初期でも月 $80〜$150 の固定費が発生

#### コスト試算

| フェーズ | 月額目安 |
|---------|---------|
| MVP（〜40名） | $80〜$150 |
| 成長期（〜150名） | $100〜$200 |
| 将来（〜5,000名） | $300〜$800 |

---

## 総合比較表

| 評価軸 | Vercel + Neon + R2 | Fly.io + Neon + R2 | AWS ECS + RDS + S3 |
|--------|:-----------------:|:-----------------:|:-----------------:|
| 手離れの良さ | ★★★★★ | ★★★★☆ | ★★☆☆☆ |
| コストパフォーマンス | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| スケーラビリティ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| 初期構築の容易さ | ★★★★★ | ★★★★☆ | ★★☆☆☆ |
| **Lark Webhook 受信の確実性** | ★★★★☆ | ★★★★★ | ★★★★★ |
| **Lark 大量同期（初回取り込み）** | ★★★☆☆ | ★★★★★ | ★★★★★ |
| 動画配信コスト | ★★★★★ | ★★★★★ | ★★★☆☆ |
| 将来の AI 統合 | ★★★☆☆ | ★★★☆☆ | ★★★★★ |

---

## 推奨

### Living Me 初期〜成長期: **候補 1（Vercel + Neon + R2）**

- 非エンジニアが **Lark Base で運用する**設計において、Vercel Cron による定期同期が設定1行で実現できる
- Lark Webhook のタイムアウト（3 秒以内にレスポンス）は Vercel の Serverless Function で問題なく対応可能
- 初期 40 名〜150 名規模では過剰なインフラは不要
- **月 $0〜$60 で始められ、会員増加に応じて自然にスケール**

> **初回の全件アーカイブ同期**（Lark Base から過去データを一括取り込む作業）は、
> Vercel のタイムアウト制限（300秒）を超える可能性があるため、
> ローカル環境から1回だけ実行するスクリプトを別途用意すること。

### 会員 500 名超・Lark Webhook の安定性が課題になった時: **候補 2（Fly.io）へ移行検討**

- Fly.io の常時起動コンテナは Lark Webhook を遅延なしで確実に受信できる
- Serverless のコールドスタートによる Webhook 受信失敗のリスクが完全にゼロになる

### 会員 1,000 名超・AI 機能追加時: **候補 3（AWS）へ段階移行**

- Lambda + SQS + EventBridge による Lark 同期パイプラインが最も安定・スケーラブル
- AI 抽出パイプライン（Claude API + Lambda）との統合も容易

---

## アーキテクチャ進化パス

```
Phase 1（MVP〜150名）
  Vercel + Neon + Cloudflare R2
  Lark 同期: Vercel Cron（毎時）+ Webhook 受信
       ↓  ※会員 500名 or Webhook 受信の安定性が課題になった時
Phase 2（成長期）
  Fly.io + Neon + Cloudflare R2
  Lark 同期: 常時起動コンテナで確実に Webhook 受信
       ↓  ※会員 1,000名 or バーチャルリビング実装時
Phase 3（将来）
  AWS ECS Fargate + Aurora Serverless v2 + S3 + CloudFront
  Lark 同期: Lambda + SQS + EventBridge Scheduler
```

---

*Living Me インフラ選定比較 - 更新: 2026-03-21*
