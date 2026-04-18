# Mock Detection Report — Living Me

**実行日**: 2026-03-20
**ポリシー**: standard（staging/PR）
**スキャン対象**: `src/**/*.ts`, `src/**/*.tsx`

---

## ゲート判定: ✅ PASS（standard / lenient）

| ポリシー | 判定 |
|---------|------|
| lenient (dev) | ✅ PASS |
| standard (staging/PR) | ✅ PASS |
| strict (prod) | ✅ PASS |

---

## 検出結果サマリー

| Severity | 件数 | 対応 |
|----------|------|------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 0 | — |
| Low | 3 → 0 | **修正済み** |

---

## Critical（ハードコード認証情報）

**検出なし。** APIキー・パスワード・シークレットの露出はありません。

---

## High（モックデータ・localhost参照）

**検出なし。** 本番コードにモック変数・localhost URL・ダミーデータはありません。

---

## Medium（デバッグコード・TODO）

**検出なし。** TODO/FIXME コメントはありません。

`console.log/error/warn` は Stripe Webhook ハンドラーと Discord Sync サービスの
オペレーション用ログとして意図的に使用しており、モックには該当しません。

---

## Low（修正済み）

### L-001: purple カラー使用（EventCard）

- **ファイル**: `src/components/member/EventCard.tsx:32`
- **内容**: `STUDY_GROUP: "bg-purple-100 text-purple-700 border-purple-200"` — 紫はデザインシステム禁止色
- **修正**: `bg-[#f5f0ea] text-[#8B5E3C] border-[#e8ddd5]`（Warm Chestnut系）に置換 ✅

### L-002: `min-h-screen` 使用（MemberLayout）

- **ファイル**: `src/app/(member)/layout.tsx:20`
- **内容**: `min-h-screen` — デザインガイドラインは `h-dvh` / `min-h-dvh` を要求
- **修正**: `min-h-dvh` に変更 ✅

### L-003: Noto Serif JP フォント未読み込み

- **ファイル**: `src/app/globals.css:1`
- **内容**: 見出しフォントとして Noto Serif JP を要件定義で指定しているが、Noto Sans JP のみ読み込んでいた
- **修正**: Google Fonts import に `Noto+Serif+JP` を追加、`--font-heading: var(--font-serif)` に設定 ✅

---

## CC-Auth URL 整合性チェック

CC-Auth を使用していないプロジェクト（Discord OAuth 使用）のためスキップ。

---

## 除外ファイル

- `tests/**` — テストファイルは対象外
- `src/components/ui/**` — shadcn/ui 生成ファイルは対象外
- `node_modules/**` — 対象外

---

*Living Me — Mock Detection Report v1.0 / 2026-03-20*
