import { describe, test, expect } from "vitest";
import { calcDaysSince } from "@/lib/membership-duration";

describe("calcDaysSince", () => {
  test("起算日が今日なら 1 日目", () => {
    const today = new Date(2026, 3, 18);
    expect(calcDaysSince(today, null, today)).toBe(1);
  });

  test("起算日が昨日なら 2 日目", () => {
    const yesterday = new Date(2026, 3, 17);
    const today = new Date(2026, 3, 18);
    expect(calcDaysSince(yesterday, null, today)).toBe(2);
  });

  test("起算日が 30 日前なら 31 日目", () => {
    const start = new Date(2026, 2, 19);
    const today = new Date(2026, 3, 18);
    expect(calcDaysSince(start, null, today)).toBe(31);
  });

  test("起算日が null でも joinedAt にフォールバックする", () => {
    const joined = new Date(2026, 3, 10);
    const today = new Date(2026, 3, 18);
    expect(calcDaysSince(null, joined, today)).toBe(9);
  });

  test("startDate が joinedAt より優先される", () => {
    const start = new Date(2025, 0, 1);
    const joined = new Date(2026, 0, 1);
    const today = new Date(2026, 3, 18);
    // 2025-01-01 から 2026-04-18 の差 = 472 + 1 日
    expect(calcDaysSince(start, joined, today)).toBe(473);
  });

  test("どちらも null なら null", () => {
    expect(calcDaysSince(null, null)).toBeNull();
    expect(calcDaysSince(undefined, undefined)).toBeNull();
  });

  test("起算日が未来の場合は 0 を返す", () => {
    const future = new Date(2026, 4, 1);
    const today = new Date(2026, 3, 18);
    expect(calcDaysSince(future, null, today)).toBe(0);
  });

  test("DST などで時刻が異なっても日付境界で評価する", () => {
    // 同日の 23:59 と翌日 00:01 は 1 日差
    const start = new Date(2026, 3, 18, 23, 59);
    const next = new Date(2026, 3, 19, 0, 1);
    expect(calcDaysSince(start, null, next)).toBe(2);
  });
});
