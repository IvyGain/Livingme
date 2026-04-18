"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 月カレンダー。記入日にはマークを、日付タップで該当日の編集ページへ飛ばす。
 * ルナルナ風: マーク（dot）= 記入済み。今日は強調。
 */
export function JournalCalendar({ journalDates }: { journalDates: ReadonlyArray<Date> }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const recordedDaySet = useMemo(
    () => new Set(journalDates.map((d) => startOfDay(d).getTime())),
    [journalDates],
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  return (
    <section className="bg-[#FEFCF8] rounded-2xl p-5 border border-[#e8ddd5]">
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="p-1 text-[#9a8070] hover:text-[#6B4F3A]"
          aria-label="前月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-medium text-[#6B4F3A] tabular-nums">
          {format(month, "yyyy年 M月", { locale: ja })}
        </h3>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="p-1 text-[#9a8070] hover:text-[#6B4F3A]"
          aria-label="翌月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#9a8070] mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const recorded = recordedDaySet.has(day.getTime());
          const isToday = isSameDay(day, today);
          const dateStr = format(day, "yyyy-MM-dd");
          const isFuture = day.getTime() > today.getTime();

          const content = (
            <div
              className={[
                "aspect-square flex flex-col items-center justify-center rounded-lg text-xs tabular-nums transition-colors",
                inMonth ? "text-[#6B4F3A]" : "text-[#d0c5b8]",
                isToday ? "bg-[#FDF3EE] font-semibold" : "",
                !isFuture && inMonth ? "hover:bg-[#F5ECE4] cursor-pointer" : "",
                isFuture ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span>{format(day, "d")}</span>
              {recorded && (
                <span
                  className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#C07052]"
                  aria-label="記入済み"
                />
              )}
            </div>
          );

          if (!inMonth || isFuture) {
            return <div key={day.toISOString()}>{content}</div>;
          }
          return (
            <Link
              key={day.toISOString()}
              href={`/journal/new?date=${dateStr}`}
              aria-label={recorded ? `${dateStr} の記録を見る` : `${dateStr} を書く`}
              className="block"
            >
              {content}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-[#9a8070] flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C07052]" />
        記入済み
      </p>
    </section>
  );
}
