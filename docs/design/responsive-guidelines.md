# Living Me レスポンシブガイドライン

**バージョン**: v1.0
**生成日**: 2026-03-20

---

## 1. 基本方針

**モバイルファースト**。会員の主要アクセスはスマートフォンを想定。

```
モバイル → タブレット → デスクトップ の順に拡張設計
```

---

## 2. ブレークポイント定義

| 名前 | min-width | 対象デバイス |
|------|-----------|------------|
| (default) | 0px | スマートフォン縦 |
| `sm:` | 640px | スマートフォン横・小型タブレット |
| `md:` | 768px | タブレット縦 |
| `lg:` | 1024px | タブレット横・小型PC |
| `xl:` | 1280px | デスクトップ |
| `2xl:` | 1536px | 大型デスクトップ |

---

## 3. レイアウトパターン

### 3.1 ナビゲーション

```
Mobile  (<768px):  Bottom Navigation Bar（5タブ固定）
Tablet  (≥768px):  Left Sidebar（280px fixed）
Desktop (≥1024px): Left Sidebar（280px fixed）
```

**Bottom Navigation タブ構成（モバイル）**:

| タブ | アイコン | パス |
|------|---------|------|
| ホーム | Home | `/(member)/` |
| アーカイブ | Video | `/(member)/archive` |
| イベント | Calendar | `/(member)/events` |
| ジャーナル | BookOpen | `/(member)/journal` |
| わたし | User | — (Sheet: プロフィール・申請フォーム・アンバサダー) |

**実装**:
```tsx
// モバイルのみ表示
<div className="md:hidden">
  <BottomNav />
</div>

// タブレット以上でサイドバー表示
<div className="hidden md:block w-[280px] shrink-0">
  <Sidebar />
</div>
```

### 3.2 メインコンテンツ幅

```
Mobile:  全幅 - padding (px-4)
Tablet:  全幅 - sidebar (280px) - padding
Desktop: max-w-5xl (1024px) centered
```

```tsx
<main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
  <div className="max-w-5xl mx-auto">
    {children}
  </div>
</main>
```

### 3.3 カードグリッド

```
Mobile  (<768px):  1カラム
Tablet  (≥768px):  2カラム
Desktop (≥1024px): 3カラム
```

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <ArchiveCard key={item.id} {...item} />)}
</div>
```

**例外: トップページのアーカイブ**（横スクロール）:
```tsx
// モバイルは横スクロール（ピーク表示で続きを示す）
<div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory
                md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id} className="snap-start shrink-0 w-[280px] md:w-auto">
      <ArchiveCard {...item} />
    </div>
  ))}
</div>
```

---

## 4. コンポーネント別レスポンシブ設計

### 4.1 トップページ（会員ダッシュボード）

```
Mobile:
  [Header: ロゴ + ユーザーアバター]
  [今日のエネルギーシェア カード（大）]
  [今日のジャーナリングテーマ + 書くボタン]
  [直近イベント → 横スクロールカード]
  [新着アーカイブ → 縦カードリスト]
  [主宰者のメッセージ]
  [Bottom Nav]

Tablet/Desktop:
  [Sidebar] | [メインコンテンツ 2カラム]
               [エネルギーシェア（左大）| ジャーナルテーマ（右）]
               [イベント一覧（フル）]
               [アーカイブグリッド]
```

### 4.2 アーカイブ詳細

```
Mobile:
  [動画（16:9 全幅）]
  [タイトル・メタ情報]
  [要約]
  [議事録（折りたたみ）]

Desktop:
  [動画（左2/3）] | [関連情報・タグ（右1/3）]
  [議事録（フル表示）]
```

```tsx
<div className="lg:grid lg:grid-cols-3 lg:gap-8">
  <div className="lg:col-span-2">
    <VideoPlayer ... />
    <ArticleBody ... />
  </div>
  <aside className="mt-6 lg:mt-0">
    <RelatedInfo ... />
  </aside>
</div>
```

### 4.3 カレンダー（イベント・ジャーナリング）

```
Mobile  : 週ビュー（7日分）デフォルト
Tablet+ : 月ビュー デフォルト
```

```tsx
const defaultView = useMediaQuery('(min-width: 768px)') ? 'month' : 'week'
```

### 4.4 管理画面テーブル

```
Mobile  : カード形式スタック表示
Tablet+ : テーブル形式
```

```tsx
// モバイル: カードスタック
<div className="md:hidden space-y-3">
  {members.map(m => <MemberCard key={m.id} member={m} />)}
</div>

// タブレット以上: テーブル
<div className="hidden md:block">
  <MemberTable members={members} />
</div>
```

### 4.5 ダイアログ・モーダル

```
Mobile  : Sheet（ボトムシート）
Tablet+ : Dialog（センターモーダル）
```

```tsx
function ActionModal({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  if (isDesktop) return <Dialog>{children}</Dialog>
  return <Sheet side="bottom">{children}</Sheet>
}
```

---

## 5. セーフエリア対応

PWA・ネイティブライクなレイアウトのため、Safe Area を考慮。

```css
/* Bottom Navigation */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* ページコンテンツ（ボトムナビ分のパディング）*/
.page-content {
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}
```

```tsx
// Tailwind で
<nav className="pb-safe">   {/* tailwind-safe-area plugin */}
<main className="pb-[calc(64px+env(safe-area-inset-bottom))]">
```

---

## 6. 画像・メディアのレスポンシブ

```tsx
// アーカイブサムネイル
<Image
  src={thumbnail}
  alt={title}
  width={640}
  height={360}
  className="w-full aspect-video object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// ヒーローメディア（詳細ページ動画エリア）
<div className="aspect-video w-full bg-[#2A1F18] rounded-2xl overflow-hidden">
  <VideoPlayer ... />
</div>
```

---

## 7. タイポグラフィのレスポンシブ

```tsx
// ページタイトル
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold
               font-[Noto_Serif_JP] text-[#3D2B1F] text-balance">

// セクション見出し
<h2 className="text-xl md:text-2xl font-semibold font-[Noto_Serif_JP]">

// 本文
<p className="text-base leading-relaxed text-[#3D2B1F]">
```

---

## 8. タッチ最適化

| 要件 | 実装 |
|------|------|
| タッチターゲット最小 44px | `min-h-[44px] min-w-[44px]` 必須 |
| スワイプ対応（アーカイブ横スクロール）| `overflow-x-auto snap-x` |
| スワイプ対応（カレンダー）| `touch-action: pan-x` |
| ロングプレス（コンテキストメニュー）| カスタムフック対応 |

---

*Living Me 会員サイト - レスポンシブガイドライン v1.0*
