import { describe, test, expect } from "vitest";
import { calcJournalStats } from "@/lib/journal-stats";

function day(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}

describe("calcJournalStats", () => {
  const NOW = day(2026, 4, 18); // 2026-04-18

  test("記録ゼロなら total=0, streak=0", () => {
    expect(calcJournalStats([], NOW)).toEqual({ total: 0, streak: 0 });
  });

  test("今日の記録だけなら streak=1, total=1", () => {
    expect(calcJournalStats([day(2026, 4, 18)], NOW)).toEqual({ total: 1, streak: 1 });
  });

  test("今日・昨日・一昨日と続けば streak=3", () => {
    const dates = [day(2026, 4, 18), day(2026, 4, 17), day(2026, 4, 16)];
    expect(calcJournalStats(dates, NOW)).toEqual({ total: 3, streak: 3 });
  });

  test("今日・昨日と続くが一昨日は空なら streak=2", () => {
    const dates = [day(2026, 4, 18), day(2026, 4, 17), day(2026, 4, 14)];
    expect(calcJournalStats(dates, NOW)).toEqual({ total: 3, streak: 2 });
  });

  test("今日は未記入でも昨日にあれば streak=（昨日からの連続）", () => {
    const dates = [day(2026, 4, 17), day(2026, 4, 16), day(2026, 4, 15)];
    expect(calcJournalStats(dates, NOW)).toEqual({ total: 3, streak: 3 });
  });

  test("今日も昨日も未記入なら streak=0", () => {
    const dates = [day(2026, 4, 10), day(2026, 4, 9)];
    expect(calcJournalStats(dates, NOW)).toEqual({ total: 2, streak: 0 });
  });

  test("同日複数記録でも 1 日としてカウント", () => {
    const d = day(2026, 4, 18);
    const d2 = new Date(d);
    d2.setHours(10);
    expect(calcJournalStats([d, d2], NOW)).toEqual({ total: 2, streak: 1 });
  });

  test("時刻の違いがあっても日付で判定する", () => {
    const dates = [
      new Date(2026, 3, 18, 23, 59),
      new Date(2026, 3, 17, 0, 1),
      new Date(2026, 3, 16, 12, 0),
    ];
    expect(calcJournalStats(dates, NOW)).toEqual({ total: 3, streak: 3 });
  });
});
