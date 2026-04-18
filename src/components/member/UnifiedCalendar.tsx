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
import { ChevronLeft, ChevronRight, Video, Calendar as CalIcon } from "lucide-react";

export type CalendarItem =
  | {
      kind: "event";
      id: string;
      date: Date;
      title: string;
      href: string;
      eventType: string;
    }
  | {
      kind: "archive";
      id: string;
      date: Date;
      title: string;
      href: string;
    };

function dayKey(d: Date) {
  return startOfDay(d).getTime();
}

/**
 * 統合カレンダー:
 * - イベント / 朝会録画を月グリッドに配置
 * - 日付タップ → 該当日の項目リスト + 機能導線パネル表示
 */
export function UnifiedCalendar({ items }: { items: ReadonlyArray<CalendarItem> }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));

  const byDay = useMemo(() => {
    const m = new Map<number, CalendarItem[]>();
    for (const it of items) {
      const k = dayKey(it.date);
      const arr = m.get(k) ?? [];
      arr.push(it);
      m.set(k, arr);
    }
    return m;
  }, [items]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedItems = byDay.get(dayKey(selected)) ?? [];
  const isSelectedToday = isSameDay(selected, today);
  const selectedDateStr = format(selected, "yyyy-MM-dd");

  return (
    <div className="space-y-5">
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
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selected);
            const dayItems = byDay.get(dayKey(day)) ?? [];
            const hasEvent = dayItems.some((i) => i.kind === "event");
            const hasArchive = dayItems.some((i) => i.kind === "archive");

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={[
                  "aspect-square flex flex-col items-center justify-center rounded-lg text-xs tabular-nums transition-colors",
                  inMonth ? "text-[#6B4F3A]" : "text-[#d0c5b8]",
                  isToday ? "font-semibold" : "",
                  isSelected ? "bg-[#C07052] text-white" : "hover:bg-[#F5ECE4]",
                ].join(" ")}
              >
                <span>{format(day, "d")}</span>
                <span className="flex items-center gap-0.5 mt-0.5 h-1.5">
                  {hasEvent && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#C07052]"}`} aria-label="イベント" />}
                  {hasArchive && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#7A9E7E]"}`} aria-label="録画" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[10px] text-[#9a8070]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#C07052]" />イベント</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7A9E7E]" />朝会録画</span>
        </div>
      </section>

      {/* Selected day details */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[#6B4F3A]">
          {format(selected, "M月d日(E)", { locale: ja })}
          {isSelectedToday && <span className="ml-2 text-xs text-[#C07052]">（今日）</span>}
        </h3>

        {selectedItems.length > 0 ? (
          <ul className="space-y-2">
            {selectedItems.map((it) => (
              <li key={`${it.kind}-${it.id}`}>
                <Link
                  href={it.href}
                  className="flex items-center gap-3 bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-4 hover:border-[#C07052]/40 hover:shadow-sm transition-all"
                >
                  {it.kind === "event" ? (
                    <CalIcon className="w-4 h-4 flex-shrink-0 text-[#C07052]" />
                  ) : (
                    <Video className="w-4 h-4 flex-shrink-0 text-[#7A9E7E]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#9a8070] mb-0.5">
                      {it.kind === "event" ? "イベント" : "録画"}
                      {it.kind === "event" && ` ・ ${format(it.date, "HH:mm")}`}
                    </p>
                    <p className="text-sm font-medium text-[#6B4F3A] truncate">
                      {it.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[#9a8070] px-1">この日は予定がありません</p>
        )}

        {/* Feature shortcuts — surfaced from any selected day */}
        <nav className="grid grid-cols-2 gap-2 pt-2">
          <Link
            href="/energy"
            className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl px-4 py-3 text-sm text-[#6B4F3A] hover:border-[#C07052]/40 transition-colors"
          >
            🌿 今日のテーマを見る
          </Link>
          <Link
            href={`/journal/new?date=${selectedDateStr}`}
            className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl px-4 py-3 text-sm text-[#6B4F3A] hover:border-[#C07052]/40 transition-colors"
          >
            ✍ 今日の書き書きタイム
          </Link>
        </nav>
      </section>
    </div>
  );
}
