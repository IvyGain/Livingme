# DailyContentCard コンポーネント仕様

**用途**: トップページのメインカード — 今日のエネルギーシェア・ジャーナリングテーマ表示

---

## Props

```typescript
interface DailyContentCardProps {
  type: 'energy-share' | 'journal-theme'
  content: string | null
  date: string       // "2026-03-20"
  onJournalClick?: () => void  // type=journal-theme 時のみ
}
```

## Visual Design

```
type: energy-share
┌────────────────────────────────────────┐
│  ☀️  今日のエネルギーシェア               │  ← text-sm text-[#7A6155]
│                                        │
│  今日は自分の感覚を信じてみる日。         │  ← text-lg Noto Serif JP
│  あなたの内側にある答えが              │     text-[#3D2B1F] leading-relaxed
│  きっと道を示してくれる。               │
│                                        │
│                          2026.03.20    │  ← text-xs text-[#B8A99A] tabular-nums
└────────────────────────────────────────┘
bg: #F5EDD8   radius: 2xl   padding: 8 (32px)

type: journal-theme
┌────────────────────────────────────────┐
│  ✍️  今日のジャーナリングテーマ            │
│                                        │
│  「今の自分が大切にしているものは？」     │
│                                        │
│                 [今日のテーマで書く →]  │  ← ghost button
└────────────────────────────────────────┘
bg: white   border: 1px #B8A99A/30   radius: 2xl
```

## Implementation

```tsx
export function DailyContentCard({
  type, content, date, onJournalClick
}: DailyContentCardProps) {
  const isEnergyShare = type === 'energy-share'

  return (
    <div className={cn(
      "rounded-2xl p-8 space-y-4",
      isEnergyShare
        ? "bg-[#F5EDD8]"
        : "bg-white border border-[#B8A99A]/30 shadow-sm"
    )}>
      <p className="text-sm font-medium text-[#7A6155] tracking-wide">
        {isEnergyShare ? '今日のエネルギーシェア' : '今日のジャーナリングテーマ'}
      </p>

      {content ? (
        <p className="text-lg text-[#3D2B1F] leading-relaxed font-serif">
          {content}
        </p>
      ) : (
        <p className="text-[#B8A99A] text-base">準備中です</p>
      )}

      <div className="flex items-center justify-between">
        <time className="text-xs text-[#B8A99A] tabular-nums">
          {date.replace(/-/g, '.')}
        </time>
        {!isEnergyShare && onJournalClick && (
          <Button variant="ghost" size="sm" onClick={onJournalClick}
                  className="text-[#8B5E3C] hover:bg-[#F5EDD8] rounded-full text-sm">
            今日のテーマで書く →
          </Button>
        )}
      </div>
    </div>
  )
}
```

## Accessibility

- `<time>` 要素で日付をセマンティックに
- コンテンツが空の場合は適切な代替テキスト
- ボタンには `aria-label` 付与

---

*Living Me コンポーネント仕様 - DailyContentCard*
