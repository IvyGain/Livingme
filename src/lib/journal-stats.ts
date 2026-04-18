import { startOfDay } from "date-fns";

/**
 * ジャーナル記録から「連続日数」と「トータル記録数」を計算する。
 *
 * 連続日数:
 *   - 今日または昨日に記録があれば、その日から過去に向かって連続する記録を数える
 *   - 今日も昨日も記録が無ければ 0
 *   - （昨日まで書いていた人が今日まだ書いていない場合のため、今日と昨日の両方を許可）
 */
export function calcJournalStats(
  journalDates: ReadonlyArray<Date>,
  now: Date = new Date(),
): { total: number; streak: number } {
  const total = journalDates.length;
  if (total === 0) return { total: 0, streak: 0 };

  const today = startOfDay(now).getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const dayTimes = new Set(
    journalDates.map((d) => startOfDay(d).getTime()),
  );

  let streak = 0;
  let cursor: number;

  if (dayTimes.has(today)) {
    cursor = today;
  } else if (dayTimes.has(today - DAY_MS)) {
    cursor = today - DAY_MS;
  } else {
    return { total, streak: 0 };
  }

  while (dayTimes.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }

  return { total, streak };
}
