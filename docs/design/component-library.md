# Living Me コンポーネントライブラリ設定

**バージョン**: v1.0
**生成日**: 2026-03-20

---

## 1. shadcn/ui 導入設定

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### CSS Variables（globals.css）

```css
@layer base {
  :root {
    /* Living Me カスタムカラー */
    --background: 40 50% 97%;           /* #FDF9F3 Ivory Mist */
    --foreground: 20 40% 18%;           /* #3D2B1F Dark Brown */
    --card: 0 0% 100%;                  /* #FFFFFF */
    --card-foreground: 20 40% 18%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 40% 18%;
    --primary: 25 43% 38%;              /* #8B5E3C Warm Chestnut */
    --primary-foreground: 0 0% 100%;
    --secondary: 38 57% 90%;            /* #F5EDD8 Cream Linen */
    --secondary-foreground: 25 43% 38%;
    --muted: 25 15% 65%;               /* #B8A99A Warm Taupe */
    --muted-foreground: 20 20% 47%;    /* #7A6155 */
    --accent: 20 48% 53%;              /* #C4714A Terracotta */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 43% 45%;          /* #A84242 */
    --destructive-foreground: 0 0% 100%;
    --border: 25 15% 65%;              /* #B8A99A */
    --input: 25 15% 65%;
    --ring: 25 43% 38%;                /* #8B5E3C */
    --radius: 0.75rem;                 /* 12px デフォルト */

    /* ステータスカラー */
    --success: 110 20% 47%;            /* #6B8F5E */
    --warning: 30 43% 53%;             /* #C4914A */
    --info: 200 32% 42%;               /* #4A7A8F */
  }

  .dark {
    --background: 20 28% 13%;          /* #2A1F18 */
    --foreground: 38 57% 90%;          /* #F5EDD8 */
    --card: 20 40% 18%;               /* #3D2B1F */
    --card-foreground: 38 57% 90%;
    --primary: 20 48% 58%;            /* #D4845A Terracotta Dark */
    --primary-foreground: 0 0% 100%;
    --secondary: 20 28% 20%;
    --secondary-foreground: 38 57% 90%;
    --muted: 20 22% 33%;              /* #5A4035 */
    --muted-foreground: 25 15% 65%;
    --accent: 20 48% 58%;
    --accent-foreground: 0 0% 100%;
    --border: 20 22% 33%;
    --input: 20 22% 33%;
  }
}
```

---

## 2. 導入コンポーネント一覧

### P0（必須・MVP）

```bash
# shadcn/ui コンポーネント
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add calendar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add toggle
npx shadcn@latest add switch
```

### P1（ジャーナリング・フォーム）

```bash
npx shadcn@latest add form
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add scroll-area
```

---

## 3. カスタムコンポーネント一覧

### 会員向けコンポーネント

| コンポーネント | パス | 説明 |
|-------------|------|------|
| `DailyContentCard` | `components/member/DailyContentCard.tsx` | 今日のエネルギーシェア・テーマ表示 |
| `ArchiveCard` | `components/member/ArchiveCard.tsx` | アーカイブサムネイルカード |
| `EventCard` | `components/member/EventCard.tsx` | イベント情報カード |
| `JournalEditor` | `components/member/JournalEditor.tsx` | ジャーナリングエディタ |
| `JournalCalendar` | `components/member/JournalCalendar.tsx` | ジャーナリングカレンダービュー |
| `VideoPlayer` | `components/member/VideoPlayer.tsx` | 動画再生（URL/ファイル対応）|
| `TagFilter` | `components/member/TagFilter.tsx` | タグ・カテゴリフィルター |
| `MemberStatusBadge` | `components/member/MemberStatusBadge.tsx` | 会員ステータスバッジ |

### レイアウトコンポーネント

| コンポーネント | パス | 説明 |
|-------------|------|------|
| `BottomNav` | `components/layout/BottomNav.tsx` | モバイルボトムナビ |
| `Sidebar` | `components/layout/Sidebar.tsx` | タブレット・デスクトップサイドバー |
| `MemberLayout` | `components/layout/MemberLayout.tsx` | 会員ページ共通レイアウト |
| `AdminLayout` | `components/layout/AdminLayout.tsx` | 管理画面共通レイアウト |
| `PageHeader` | `components/layout/PageHeader.tsx` | ページヘッダー |

### 管理画面コンポーネント

| コンポーネント | パス | 説明 |
|-------------|------|------|
| `MemberTable` | `components/admin/MemberTable.tsx` | 会員一覧テーブル |
| `ArchiveForm` | `components/admin/ArchiveForm.tsx` | アーカイブ登録・編集フォーム |
| `TodayEditor` | `components/admin/TodayEditor.tsx` | 今日のコンテンツ編集 |
| `EventForm` | `components/admin/EventForm.tsx` | イベント作成・編集フォーム |
| `SyncStatus` | `components/admin/SyncStatus.tsx` | Discord/Stripe 同期状態 |
| `StatsCard` | `components/admin/StatsCard.tsx` | 統計カード |

---

## 4. 依存パッケージ

### 追加が必要なパッケージ

```json
{
  "dependencies": {
    "motion": "^12.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@radix-ui/react-*": "最新",
    "next-auth": "^5.x",
    "stripe": "^17.x",
    "@prisma/client": "^6.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "date-fns": "^4.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "@types/node": "^22.x"
  }
}
```

---

## 5. cn() ユーティリティ

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 6. フォント設定

```typescript
// src/app/layout.tsx
import { Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-noto-serif-jp',
  preload: false,  // 日本語フォントはpreload不要
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-sans-jp',
  preload: false,
})

// tailwind.config.ts
// fontFamily: { serif: ['var(--font-noto-serif-jp)', 'Georgia', 'serif'], sans: ['var(--font-noto-sans-jp)', ...] }
```

---

*Living Me 会員サイト - コンポーネントライブラリ設定 v1.0*
