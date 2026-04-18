# Living Me — AWS コスト概算

**リージョン**: ap-northeast-1 (東京)
**作成日**: 2026-03-20
**対象プロジェクト**: Living Me 〜本当の自分と出逢う会〜 会員サイト

---

## 前提条件・計算根拠

### システム構成

```
ユーザー
  └─ Route 53（DNS）
       └─ CloudFront（CDN: 静的アセット・サムネイル）
            └─ ALB（ロードバランサー）
                 └─ ECS Fargate（Next.js コンテナ）
                      ├─ RDS PostgreSQL（DB）
                      ├─ ElastiCache Redis（セッション・キャッシュ）※1,000名以上
                      └─ S3（動画・画像ストレージ）
```

### 動画配信の前提

このシステムの動画は主に **外部 URL（Lark / Google Drive / Zoom）** 経由で参照される設計のため、
S3 に直接保存・配信するのはサムネイル・手動アップロード動画のみ。
CloudFront のトラフィックは実際より小さくなる。

### 共通前提

| 項目 | 値 |
|------|-----|
| 稼働率 | 24時間 × 730時間/月 |
| 動画平均サイズ | 300〜500MB/本 |
| 動画増加ペース | 約15〜20本/月 |
| 1ユーザーあたりのPV | 約8〜15ページ/日 |
| ピーク係数 | 平均の 3〜4 倍（朝会・夜会の時間帯）|

---

## フェーズ別コスト試算

### Phase 1 — MVP（40名）

> 想定: サービス開始直後。同時接続は数名程度。

#### 構成

| サービス | スペック | 備考 |
|---------|---------|------|
| ECS Fargate | 1 タスク / 0.5 vCPU / 1 GB | 常時起動 |
| RDS PostgreSQL | db.t3.micro / Single AZ | 20 GB SSD |
| S3 | 25 GB | サムネイル + 手動アップ動画 |
| CloudFront | 〜20 GB/月 | 静的アセット・サムネイルのみ |
| ALB | ベース費用のみ | 最小 LCU |
| Route 53 | ホストゾーン 1件 | |
| Secrets Manager | 5 シークレット | |
| CloudWatch | 基本ログ | |
| ECR | 2 GB | Dockerイメージ |

#### 月額内訳

| サービス | 計算式 | 月額（USD）|
|---------|--------|:---------:|
| ECS Fargate（vCPU） | $0.04048 × 0.5 vCPU × 730h | $14.78 |
| ECS Fargate（Memory） | $0.004445 × 1 GB × 730h | $3.24 |
| RDS db.t3.micro | $0.026 × 730h | $18.98 |
| RDS ストレージ | $0.115/GB × 20 GB | $2.30 |
| S3 ストレージ | $0.025/GB × 25 GB | $0.63 |
| S3 オペレーション | PUT/GET リクエスト | $0.20 |
| CloudFront | $0.085/GB × 20 GB | $1.70 |
| ALB（固定） | $0.024 × 730h | $17.52 |
| ALB（LCU） | 最小利用 | $1.50 |
| Route 53 | ホストゾーン + クエリ | $1.00 |
| Secrets Manager | $0.40 × 5 secrets | $2.00 |
| CloudWatch | 基本ログ | $2.00 |
| ECR | $0.10/GB × 2 GB | $0.20 |
| **合計（NAT Gatewayなし）** | | **$66** |
| ＋ NAT Gateway（オプション）| $0.062 × 730h + データ処理 | +$47 |
| **合計（NAT Gateway あり）** | | **$113** |

> **NAT Gateway について**: セキュリティ上は推奨だが、初期フェーズはパブリックサブネット + Security Group で代替可能。
> ECS タスクに直接パブリック IP を割り当てることでコストを削減できる。

---

### Phase 2 — 成長期（150名）

> 想定: 6ヶ月後。朝会・夜会のアーカイブが蓄積。同時接続10〜20名程度。

#### 構成変更点

| 項目 | Phase 1 | Phase 2 |
|------|---------|---------|
| ECS Fargate | 1 タスク × 0.5 vCPU | 2 タスク × 1 vCPU / 2 GB |
| RDS | db.t3.micro Single AZ | db.t3.small Single AZ |
| S3 | 25 GB | 70 GB |
| CloudFront | 20 GB/月 | 80 GB/月 |

#### 月額内訳

| サービス | 計算式 | 月額（USD）|
|---------|--------|:---------:|
| ECS Fargate（vCPU）× 2 | $0.04048 × 1 vCPU × 730h × 2 | $59.10 |
| ECS Fargate（Memory）× 2 | $0.004445 × 2 GB × 730h × 2 | $12.97 |
| RDS db.t3.small | $0.052 × 730h | $37.96 |
| RDS ストレージ | $0.115/GB × 70 GB | $8.05 |
| S3 ストレージ | $0.025/GB × 70 GB | $1.75 |
| S3 オペレーション | PUT/GET リクエスト | $0.50 |
| CloudFront | $0.085/GB × 80 GB | $6.80 |
| ALB | 固定 + LCU | $20.00 |
| NAT Gateway | $0.062 × 730h + データ | $47.00 |
| Route 53 | | $1.00 |
| Secrets Manager | | $2.00 |
| CloudWatch | | $5.00 |
| ECR | | $1.00 |
| **合計** | | **$203** |

---

### Phase 3 — スケール期（1,000名）

> 想定: 1〜2年後。ピーク時50〜100名が同時接続。AI抽出機能（P1）稼働中。

#### 構成変更点

| 項目 | Phase 2 | Phase 3 |
|------|---------|---------|
| ECS Fargate | 2 タスク | Auto Scaling（平均3タスク × 2 vCPU / 4 GB）|
| RDS | t3.small Single AZ | **db.t3.medium Multi-AZ**（稼働率99.5% 保証）|
| Redis | なし | **ElastiCache t3.micro**（セッション・クエリキャッシュ）|
| S3 | 70 GB | 230 GB |
| CloudFront | 80 GB/月 | 500 GB/月 |
| CloudWatch | 基本 | Container Insights 有効化 |

#### 月額内訳

| サービス | 計算式 | 月額（USD）|
|---------|--------|:---------:|
| ECS Fargate（vCPU）平均3タスク | $0.04048 × 2 vCPU × 730h × 3 | $177.31 |
| ECS Fargate（Memory）平均3タスク | $0.004445 × 4 GB × 730h × 3 | $38.97 |
| RDS db.t3.medium Multi-AZ | $0.208 × 730h | $151.84 |
| RDS ストレージ | $0.115/GB × 230 GB | $26.45 |
| ElastiCache cache.t3.micro | $0.017 × 730h | $12.41 |
| S3 ストレージ | $0.025/GB × 230 GB | $5.75 |
| S3 オペレーション | | $1.50 |
| CloudFront | $0.085/GB × 500 GB | $42.50 |
| ALB | 固定 + LCU 増加 | $28.00 |
| NAT Gateway | $0.062 × 730h + データ処理増 | $50.00 |
| Route 53 | | $1.00 |
| Secrets Manager | | $3.00 |
| CloudWatch + Container Insights | $0.35/タスク + ログ | $18.00 |
| ECR | | $2.00 |
| **合計** | | **$559** |

---

### Phase 4 — 将来規模（3,000〜5,000名）

> 想定: 3〜5年後。ピーク時500名以上が同時接続。AI機能フル稼働。バーチャルリビング（WebSocket）運用中。

#### 構成変更点

| 項目 | Phase 3 | Phase 4 |
|------|---------|---------|
| ECS Fargate | 平均3タスク | **Auto Scaling（平均8タスク × 2 vCPU / 4 GB）**|
| RDS | db.t3.medium Multi-AZ | **Aurora Serverless v2**（変動トラフィック対応）|
| Redis | t3.micro × 1 | **t3.medium × 2**（クラスター構成）|
| S3 | 230 GB | 650 GB |
| CloudFront | 500 GB/月 | 1〜2 TB/月 |
| WAF | なし | **AWS WAF**（不正アクセス対策）|
| NAT Gateway | 1 | **2**（Multi-AZ 冗長構成）|
| CI/CD | 手動 | **CodePipeline + CodeBuild** |

#### 月額内訳

| サービス | 計算式 | 月額（USD）|
|---------|--------|:---------:|
| ECS Fargate（vCPU）平均8タスク | $0.04048 × 2 vCPU × 730h × 8 | $472.81 |
| ECS Fargate（Memory）平均8タスク | $0.004445 × 4 GB × 730h × 8 | $103.95 |
| Aurora Serverless v2（Write）| 平均2 ACU × $0.12 × 730h | $175.20 |
| Aurora Serverless v2（Read）| 平均1 ACU × $0.12 × 730h | $87.60 |
| Aurora ストレージ | $0.12/GB × 650 GB | $78.00 |
| Aurora I/O | 推定 | $20.00 |
| ElastiCache t3.medium × 2 | $0.088 × 730h × 2 | $128.48 |
| S3 ストレージ | $0.025/GB × 650 GB | $16.25 |
| S3 オペレーション | | $3.00 |
| CloudFront | $0.085/GB × 1,500 GB | $127.50 |
| ALB | 固定 + LCU 大幅増 | $45.00 |
| NAT Gateway × 2 | $0.062 × 730h × 2 + データ | $100.00 |
| Route 53 | | $2.00 |
| Secrets Manager | | $5.00 |
| CloudWatch + Container Insights | | $40.00 |
| ECR | | $3.00 |
| AWS WAF | $5 + $1/百万リクエスト | $12.00 |
| CodePipeline + CodeBuild | | $8.00 |
| **合計** | | **$1,428** |

---

## フェーズ別サマリー

| フェーズ | 会員数 | AWS 月額 | Vercel+Neon+R2 月額 | 差額 |
|---------|-------|:--------:|:-------------------:|:----:|
| Phase 1 | 40名 | $66〜$113 | $0〜$20 | +$46〜$93 |
| Phase 2 | 150名 | $203 | $40〜$60 | +$143〜$163 |
| Phase 3 | 1,000名 | $559 | $150〜$200 | +$359〜$409 |
| Phase 4 | 5,000名 | $1,428 | $300〜$500 | +$928〜$1,128 |

> ※ Vercel+Neon+R2 の試算は別資料 `infrastructure-options.md` を参照

---

## AWS 固有コスト要因の解説

### ALB が高い理由

ALB は利用量にかかわらず **固定費 $17/月** が発生する。
ユーザー数 40 名でも請求される。小規模フェーズでは最も割高なコンポーネント。

### NAT Gateway が高い理由

ECS タスクがプライベートサブネットにある場合、外部インターネット（Stripe API・Discord API・Google Drive API）に接続するために必要。
**$44〜$47/月の固定費** + データ転送量に応じた従量課金。

> **コスト削減策**: Phase 1〜2 は ECS タスクをパブリックサブネットに配置し、
> Security Group で受信制御することで NAT Gateway を省略できる。
> ただしセキュリティポリシーと要相談。

### Multi-AZ 切り替えのタイミング

RDS を Single AZ → Multi-AZ に切り替えると **コストが約 2 倍** になる。
稼働率 99.5% の要件を満たすには 1,000 名到達前（Phase 3）での切り替えを推奨。

| 構成 | コスト | 稼働率目安 | フェイルオーバー時間 |
|------|-------|-----------|-------------------|
| Single AZ | $38〜$150/月 | 〜99.5% | 手動復旧: 30分〜 |
| Multi-AZ | $76〜$300/月 | 99.95% | 自動: 60〜120秒 |

### Aurora Serverless v2 vs RDS の選択基準

| 条件 | 推奨 |
|------|------|
| 会員 1,000 名未満、トラフィック予測可能 | RDS（コスト安定）|
| 会員 1,000 名超、ピークが不規則（朝会・夜会） | Aurora Serverless v2（自動スケール）|
| AI バッチ処理・夜間バッチが多い | Aurora Serverless v2（深夜は最小 ACU に縮小）|

---

## コスト最適化オプション

### Reserved Instance（RI）割引

RDS と ElastiCache は 1年 RI を購入することで **最大 40% 割引**。

| サービス | オンデマンド | 1年 RI | 節約額/年 |
|---------|------------|--------|---------|
| RDS db.t3.medium Multi-AZ | $152/月 | $91/月 | $732 |
| ElastiCache t3.medium | $64/月 | $42/月 | $264 |

### Fargate Spot

開発環境・バッチ処理タスクに **Fargate Spot** を使うと最大 **70% 割引**。
本番の Web サービスタスクはオンデマンドとの混在運用が推奨。

### Savings Plans

ECS Fargate の **Compute Savings Plans（1年）** で最大 **36% 割引**。
Phase 3 以降（タスク数が安定した時点）での購入を推奨。

---

## 年間コスト・3年試算（AWS 構成）

| 年 | 想定会員数 | 月額 | 年額 | 3年累計 |
|----|----------|------|------|--------|
| Year 1 前半 | 40名 | $66〜$113 | $800〜$1,356 | |
| Year 1 後半 | 150名 | $203 | $1,218 | |
| **Year 1 合計** | | | **$2,000〜$2,600** | |
| Year 2 | 〜1,000名 | $559 | **$6,700** | |
| Year 3 | 〜5,000名 | $1,428 | **$17,136** | |
| **3年合計** | | | | **$25,836〜$26,436** |

---

## 年間コスト・3年試算（Vercel+Neon+R2 との比較）

| 年 | AWS | Vercel+Neon+R2 | AWS が高い分 |
|----|-----|---------------|------------|
| Year 1 | $2,300 | $480〜$720 | +$1,580〜$1,820 |
| Year 2 | $6,700 | $1,800〜$2,400 | +$4,300〜$4,900 |
| Year 3 | $17,136 | $3,600〜$6,000 | +$11,136〜$13,536 |
| **3年合計** | **$26,136** | **$5,880〜$9,120** | **+$17,016〜$20,256** |

---

## AWS を選ぶべき条件

コストが高くても AWS を選ぶ理由が明確にある場合:

| 条件 | 理由 |
|------|------|
| 動画の直接アップロード・変換が必要 | S3 + MediaConvert + Lambda でパイプライン構築 |
| WebSocket（バーチャルリビング）を実装する | ECS 常時起動コンテナが必要（Vercel は Serverless）|
| AI バッチ処理が頻繁（夜間自動抽出） | Lambda + SQS + ECS の非同期パイプライン |
| 将来的にオンプレ・専用クラウドへの移行を想定 | コンテナ設計で移行が容易 |
| セキュリティポリシーで VPC 内隔離が必要 | Vercel はパブリックインターネット上 |

---

## 推奨移行タイミング

```
今〜150名: Vercel + Neon + R2（月 $20〜$60）
              ↓ 500名 到達 or WebSocket 機能追加 or AI バッチ本格化
1,000名前後: AWS（ECS + RDS Multi-AZ + S3 + CloudFront）月 $400〜$600
              ↓ 2,000名 超 or バーチャルリビング実装
3,000名以上: AWS（Aurora Serverless v2 + Redis Cluster + WAF）月 $1,000〜$1,500
```

> **結論**: 現時点では Vercel+Neon+R2 の方が **年間 $15,000〜$20,000 安い**。
> AWS の優位性は **WebSocket・長時間バッチ・VPC 隔離** が必要になってから発揮される。
> Living Me の現フェーズには AWS は過剰投資。

---

## 参考: 本試算に使用した AWS 価格（ap-northeast-1, 2026年3月時点）

| サービス | 単価 |
|---------|------|
| ECS Fargate vCPU | $0.04048/vCPU-時間 |
| ECS Fargate Memory | $0.004445/GB-時間 |
| RDS db.t3.micro (Single AZ) | $0.026/時間 |
| RDS db.t3.small (Single AZ) | $0.052/時間 |
| RDS db.t3.medium (Multi-AZ) | $0.208/時間 |
| Aurora Serverless v2 | $0.12/ACU-時間 |
| Aurora ストレージ | $0.12/GB/月 |
| ElastiCache cache.t3.micro | $0.017/時間 |
| ElastiCache cache.t3.medium | $0.088/時間 |
| S3 Standard ストレージ | $0.025/GB/月 |
| CloudFront データ転送 (APAC) | $0.085/GB（最初の 10TB）|
| ALB 固定費 | $0.024/時間 |
| ALB LCU | $0.008/LCU-時間 |
| NAT Gateway 固定 | $0.062/時間 |
| NAT Gateway データ処理 | $0.062/GB |
| RDS ストレージ (gp2) | $0.115/GB/月 |
| AWS WAF WebACL | $5.00/月 |
| Secrets Manager | $0.40/シークレット/月 |
| CloudWatch Container Insights | $0.35/タスク/月 |

---

*Living Me AWS コスト概算 - 2026-03-20*
