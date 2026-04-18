import { getThisMonthEventsForMember } from "@/server/actions/events";
import { getPublishedArchives } from "@/server/actions/archives";
import { UnifiedCalendar, type CalendarItem } from "@/components/member/UnifiedCalendar";

export const dynamic = "force-dynamic";

/**
 * 統合カレンダー
 * - 管理者が UP したイベント / 朝会録画などをマンスリーカレンダーに表示
 * - 個人のジャーナルカレンダー (/journal) とは別ページ
 * - 日付タップ → 該当日のイベント一覧 / 今日の機能への導線を表示
 */
export default async function CalendarPage() {
  const [events, archives] = await Promise.all([
    getThisMonthEventsForMember().catch(() => []),
    getPublishedArchives(120).catch(() => []),
  ]);

  const items: CalendarItem[] = [
    ...events.map((e) => ({
      kind: "event" as const,
      id: e.id,
      date: e.startsAt,
      title: e.title,
      href: `/events/${e.id}`,
      eventType: e.eventType,
    })),
    ...archives
      .filter((a) => a.category === "MORNING_SESSION" || a.category === "EVENING_SESSION")
      .map((a) => ({
        kind: "archive" as const,
        id: a.id,
        date: a.date,
        title: a.title,
        href: `/archive`,
      })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">カレンダー</h1>
        <p className="text-sm text-[#9a8070]">イベント・朝会録画をまとめて確認できます</p>
      </div>

      <UnifiedCalendar items={items} />
    </div>
  );
}
