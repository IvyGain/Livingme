# Living Me UI Guidelines

**バージョン**: v1.0
**生成日**: 2026-03-20
**ソース**: docs/design/design-system.yml

---

## Aesthetic Direction

**Tone**: warm-intimate（温かく・親密に）
**Mood**: nurturing（育み・包み込む）

> リビングのような温かさと安心感。呼吸できる余白。ユーザーがサイトを開くたびに「ただいま」と感じられる居場所。

---

## Differentiation

**一つのことを覚えてもらうなら**:
「Living Me は、帰ってくる場所がある」

- 情報密度よりも**温かみと呼吸感**
- ビジネスライクな清潔感ではなく、**居心地の良さ**
- 機能を見せるのではなく、**感情を先に届ける**

---

## Typography Guidelines

### Principles

日本語と英語のバランスを保ち、和の温かみを感じさせる書体を選択。

- 見出し: **Noto Serif JP**（明朝系の温もり）+ **Playfair Display**（欧文）
- 本文: **Noto Sans JP**（読みやすさ優先）+ **Lato**（欧文）
- 行間: `leading-relaxed`（1.8）— 和文テキストは広めの行間

### Application

| 要素 | フォント | サイズ | ウェイト |
|------|---------|--------|---------|
| ページタイトル | Noto Serif JP | 2.5rem (40px) | 700 |
| セクション見出し | Noto Serif JP | 2rem (32px) | 600 |
| カード見出し | Noto Sans JP | 1.5rem (24px) | 600 |
| 本文 | Noto Sans JP | 1rem (16px) | 400 |
| 補助テキスト | Noto Sans JP | 0.875rem (14px) | 400 |
| ラベル / キャプション | Noto Sans JP | 0.75rem (12px) | 400 |

### Forbidden

```
❌ font-family: 'Inter', ...
❌ font-family: 'Roboto', ...
❌ font-family: 'Arial', ...
```

---

## Color Guidelines

### Principles

- 暖色系（チェスナット・テラコッタ）をアクセントに
- 背景はアイボリー系（冷たい白を使わない）
- テキストはダークブラウン（黒ではなく）

### Primary Palette

```
Primary:    #8B5E3C  Warm Chestnut  → ボタン・リンク・主要UI
Secondary:  #F5EDD8  Cream Linen    → 背景・カード
Accent:     #C4714A  Terracotta     → ハイライト・インタラクション
Muted:      #B8A99A  Warm Taupe     → ボーダー・補助テキスト
Background: #FDF9F3  Ivory Mist     → ページ背景
Text:       #3D2B1F  Dark Brown     → 見出し・本文
```

### Usage Rules

- 背景に **#FFFFFF（純白）は原則使わない** → `#FDF9F3` または `#F5EDD8` を使用
- ボタン背景に `#8B5E3C` + テキスト `#FFFFFF`（コントラスト比 5.2:1 ✅）
- `#3D2B1F` on `#FDF9F3`（コントラスト比 8.9:1 ✅）

### Forbidden

```
❌ 紫グラデーション on 白背景
❌ ビビッドなブルー系ビジネスカラー（#0070F3 等）
❌ 高コントラストなビビッドカラー
```

---

## Motion Guidelines

### Principles

インタラクションは素早く、レイアウトは動かさない。

```
✅ transform: translateY(-2px)  — カードホバー
✅ opacity: 0 → 1              — フェードイン
✅ scale: 0.98 → 1             — ボタン押下
❌ width / height              — サイズ変更アニメーション
❌ margin / padding            — スペースアニメーション
```

### Duration

| 用途 | 時間 |
|------|------|
| ボタンフィードバック | 100ms |
| カードホバー | 150ms |
| ページトランジション | 200ms（最大）|

### Reduced Motion

```tsx
// 必ず prefers-reduced-motion を尊重
import { useReducedMotion } from 'motion/react'

const shouldReduce = useReducedMotion()
const animation = shouldReduce ? {} : { y: -2, transition: { duration: 0.15 } }
```

### Forbidden

```
❌ グロー効果（box-shadow: 0 0 20px ...）
❌ 過剰なドロップシャドウの重ね
❌ レイアウトプロパティのアニメーション
```

---

## Layout Guidelines

### Structure

モバイルファーストで設計。ボトムナビゲーションを主軸とする。

```
Mobile:  Bottom Navigation（5タブ）
Tablet:  Left Sidebar（280px）+ コンテンツ
Desktop: Left Sidebar（280px）+ コンテンツ（max-w-5xl）
```

### Spacing Principles

- セクション間: `gap-8` (32px) 以上
- カード内パディング: `p-6` (24px)
- テキストブロック間: `space-y-4` (16px)
- ページ外側パディング: `px-4` (モバイル) / `px-8` (タブレット+)

### Cards

```tsx
// 標準カードスタイル
<div className="bg-white rounded-2xl border border-[#B8A99A]/30 shadow-sm p-6">
  {/* または */}
</div>
<div className="bg-[#F5EDD8] rounded-2xl p-6">
```

### Forbidden Layouts

```
❌ 3カラム等幅グリッド（予測可能すぎる）
❌ コンテンツの詰め込み（余白不足）
❌ z-index の乱用
```

---

## Component Guidelines

### Button

```tsx
// Primary（メインCTA）
<Button className="bg-[#8B5E3C] text-white hover:bg-[#7A5232] rounded-full min-h-[44px] px-6">
  入会する
</Button>

// Secondary
<Button variant="outline" className="border-[#B8A99A] text-[#8B5E3C] rounded-full min-h-[44px]">
  もっと見る
</Button>

// Ghost
<Button variant="ghost" className="text-[#7A6155] hover:bg-[#F5EDD8] rounded-full">
  キャンセル
</Button>
```

### Card: Daily Content（トップページメインカード）

```tsx
<div className="bg-[#F5EDD8] rounded-2xl p-8 space-y-3">
  <p className="text-[#7A6155] text-sm font-medium tracking-wide">
    今日のエネルギーシェア
  </p>
  <p className="text-[#3D2B1F] text-lg leading-relaxed font-[Noto_Serif_JP]">
    {content}
  </p>
</div>
```

### Navigation: Bottom Bar（モバイル）

```tsx
// 5タブ構成
// ホーム / アーカイブ / イベント / ジャーナル / メニュー
<nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm
                border-t border-[#B8A99A]/30 pb-safe">
  {tabs.map(tab => (
    <Link key={tab.href} className="flex flex-col items-center gap-1 py-2
                                    text-[#B8A99A] data-[active]:text-[#8B5E3C]">
      <tab.icon className="w-5 h-5" />
      <span className="text-xs">{tab.label}</span>
    </Link>
  ))}
</nav>
```

### Archive Card

```tsx
<article className="bg-white rounded-2xl overflow-hidden border border-[#B8A99A]/20
                    shadow-sm hover:shadow-md transition-shadow duration-150">
  <div className="aspect-video bg-[#F5EDD8]">
    <Image ... className="w-full h-full object-cover" />
  </div>
  <div className="p-4 space-y-2">
    <div className="flex items-center gap-2">
      <Badge className="bg-[#F5EDD8] text-[#7A6155] text-xs">{category}</Badge>
      <time className="text-[#B8A99A] text-xs tabular-nums">{date}</time>
    </div>
    <h3 className="text-[#3D2B1F] font-semibold text-balance leading-snug">
      {title}
    </h3>
    <p className="text-[#7A6155] text-sm line-clamp-2">{summary}</p>
  </div>
</article>
```

### Form Input

```tsx
<div className="space-y-2">
  <Label className="text-[#3D2B1F] font-medium text-sm">{label}</Label>
  <Input
    className="border-[#B8A99A] focus:border-[#8B5E3C] focus:ring-[#8B5E3C]/20
               rounded-xl bg-white placeholder:text-[#B8A99A] min-h-[44px]"
  />
</div>
```

---

## Page-Specific Guidelines

### トップページ

- ファーストビュー: エネルギーシェアカードを大きく（ヒーロー的配置）
- 温かいウェルカムメッセージ（時間帯別: おはようございます / こんにちは / お疲れ様）
- 情報カードは詰め込まず、2〜3個を大きく見せる

### アーカイブ一覧

- カードグリッド（モバイル1列 / タブレット2列 / デスクトップ3列）
- サムネイルは 16:9 比率で統一
- タグ・カテゴリフィルターは上部に固定

### ジャーナリング

- エディタは温かみのある背景（`#FDF9F3`）
- 今日のテーマを上部に大きく表示
- 「今日も書いてくれてありがとう」などの共感的メッセージ

### 管理画面

- 管理画面もブランドカラーを維持
- ただしより情報密度を高めても良い（テーブル表示優先）
- アクション系ボタンは同一デザインシステム準拠

---

## Anti-Patterns（NEVER）

| カテゴリ | 禁止 | 代わりに |
|---------|------|---------|
| フォント | Inter, Roboto, Arial | Noto Serif JP / Noto Sans JP |
| 背景色 | 純白 #FFFFFF（メイン背景） | #FDF9F3 Ivory Mist |
| カラー | 紫グラデーション | テラコッタ〜チェスナット |
| カラー | ビジネスブルー | Warm Taupe / Terracotta |
| レイアウト | 情報の詰め込み | 余白を恐れない |
| エフェクト | グロー効果 | 薄い shadow-sm |
| エフェクト | 重ねたドロップシャドウ | 1層のみ |
| アニメーション | layout プロパティ変化 | transform / opacity のみ |

---

*Living Me 会員サイト - UI Guidelines v1.0*
