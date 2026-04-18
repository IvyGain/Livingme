/**
 * 起算日 (startDate) から今日までの継続日数を計算する。
 * 起算日当日を 1 日目としてカウント（会員に親しみのある表記）。
 *
 * 起算日が未来の場合は 0 を返す（未起算）。
 * startDate が null/undefined の場合は joinedAt にフォールバック。
 * どちらも無い場合は null。
 */
export function calcDaysSince(
  startDate: Date | null | undefined,
  joinedAt: Date | null | undefined,
  now: Date = new Date(),
): number | null {
  const base = startDate ?? joinedAt;
  if (!base) return null;

  const startUTC = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return diffDays + 1;
}
