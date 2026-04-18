# ArchiveCard コンポーネント仕様

**用途**: アーカイブ一覧・トップページ新着表示のカード

---

## Props

```typescript
interface ArchiveCardProps {
  id: string
  title: string
  date: string           // ISO date string
  category: ArchiveCategory
  summary?: string
  thumbnailUrl?: string
  tags?: string[]
  href: string
}
```

## Visual Design

```
┌──────────────────────────────────┐
│  [サムネイル 16:9]                 │
│  bg-[#F5EDD8] if no thumbnail    │
├──────────────────────────────────┤
│  [朝会]  2026.03.20              │  ← Badge + time
│                                  │
│  今日の朝会 — 自分を信じる           │  ← H3 text-balance
│  ための3つの問い                  │
│                                  │
│  エネルギーシェアとジャーナリング    │  ← summary line-clamp-2
│  テーマが深く...                  │
└──────────────────────────────────┘
bg: white   border: 1px #B8A99A/20   radius: 2xl
hover: shadow-md (transition 150ms)
```

## Category → Badge Color

| Category | ラベル | Badge Style |
|----------|--------|------------|
| MORNING_MEETING | 朝会 | `bg-[#FAF6EE] text-[#8B5E3C]` |
| EVENING_MEETING | 夜会 | `bg-[#F5EDD8] text-[#7A6155]` |
| LEARNING | 学習 | `bg-[#EFF5EC] text-[#4A6B3E]` |
| EVENT | イベント | `bg-[#FFF3EC] text-[#8B4A1F]` |
| OTHER | その他 | `bg-[#F5EDD8] text-[#7A6155]` |

## Implementation

```tsx
export function ArchiveCard({
  title, date, category, summary, thumbnailUrl, href
}: ArchiveCardProps) {
  return (
    <Link href={href}>
      <article className="bg-white rounded-2xl overflow-hidden
                          border border-[#B8A99A]/20 shadow-sm
                          hover:shadow-md transition-shadow duration-150
                          cursor-pointer">
        {/* サムネイル */}
        <div className="aspect-video bg-[#F5EDD8] overflow-hidden">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={title}
                   width={640} height={360}
                   className="w-full h-full object-cover
                              transition-transform duration-200 hover:scale-[1.02]"
                   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-8 h-8 text-[#B8A99A]" />
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs rounded-full px-2 py-0.5",
                                  CATEGORY_STYLES[category])}>
              {CATEGORY_LABELS[category]}
            </Badge>
            <time className="text-[#B8A99A] text-xs tabular-nums">
              {format(new Date(date), 'yyyy.MM.dd')}
            </time>
          </div>

          <h3 className="text-[#3D2B1F] font-semibold text-sm leading-snug
                         text-balance line-clamp-2">
            {title}
          </h3>

          {summary && (
            <p className="text-[#7A6155] text-xs leading-relaxed line-clamp-2">
              {summary}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
```

## Accessibility

- `<article>` でセマンティックな記事要素
- `<time>` で日付をセマンティックに
- `<Link>` がカード全体をタップ可能に（44px以上確保）
- `alt` テキストは記事タイトルを使用

---

*Living Me コンポーネント仕様 - ArchiveCard*
