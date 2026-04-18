# Living Me — ドキュメントインデックス

**プロジェクト**: Living Me 〜本当の自分と出逢う会〜 会員サイト
**最終更新**: 2026-03-20

---

## 開発者向け

| ドキュメント | 説明 |
|------------|------|
| [SETUP.md](./SETUP.md) | 開発環境セットアップ手順 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | システムアーキテクチャ・ディレクトリ構成 |
| [API.md](./API.md) | API・Server Actions リファレンス |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | デプロイ手順・本番チェックリスト |
| [deploy-vercel.md](./deploy-vercel.md) | Vercel デプロイ手順（詳細） |
| [production-setup-checklist.md](./production-setup-checklist.md) | 本番運用設定チェックリスト |
| [quickstart.md](./quickstart.md) | ローカル開発クイックスタート |

---

## 要件・設計

| ドキュメント | 説明 |
|------------|------|
| [requirements/requirements.md](./requirements/requirements.md) | 機能要件定義 |
| [requirements/non-functional.md](./requirements/non-functional.md) | 非機能要件 |
| [requirements/design-requirements.md](./requirements/design-requirements.md) | デザイン要件定義 |
| [design/spec.md](./design/spec.md) | 機能仕様書 |
| [design/design-system.yml](./design/design-system.yml) | デザインシステム定義 |
| [design/ui-guidelines.md](./design/ui-guidelines.md) | UI 実装ガイドライン |
| [design/component-library.md](./design/component-library.md) | コンポーネントライブラリ設定 |
| [design/responsive-guidelines.md](./design/responsive-guidelines.md) | レスポンシブデザインガイドライン |

---

## テスト

| ドキュメント | 説明 |
|------------|------|
| [test-design/e2e-test-design.md](./test-design/e2e-test-design.md) | E2E テスト設計書 |
| [test-design/integration-test-design.md](./test-design/integration-test-design.md) | 結合テスト設計書 |

---

## 品質

| ドキュメント | 説明 |
|------------|------|
| [quality/mock-detection-report.md](./quality/mock-detection-report.md) | モック検出レポート（Phase 5.5） |
| [quality/ui-review-report.md](./quality/ui-review-report.md) | UI 品質レビューレポート（Phase 5.5） |
| [UX-REVIEW/ux-review-report.md](./UX-REVIEW/ux-review-report.md) | UX レビューレポート（Phase 3） |

---

## フェーズ管理

| フェーズ | 状態 | 成果物 |
|---------|------|--------|
| Phase 1: 要件定義 | ✅ | requirements/, design-requirements.md |
| Phase 2: 設計 | ✅ | design/, test-design/ |
| Phase 3: 計画 + UX レビュー | ✅ | SSOT Issue, UX-REVIEW/ |
| Phase 4: 実装 | ✅ | src/ |
| Phase 5: テスト | ✅ | tests/, vitest.config.ts |
| Phase 5.5: 品質ゲート | ✅ | quality/ |
| Phase 6: ドキュメント | ✅ | docs/ (本ドキュメント群) |
| Phase 7: デプロイ | 🔜 | — |
| Phase 8: Platform 連携 | 🔜 | — |
