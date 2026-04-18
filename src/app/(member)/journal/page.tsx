import { auth } from "@/lib/auth";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { getJournals } from "@/server/actions/journals";
import { getTodayThemeForDate } from "@/server/actions/today";

async function getTodayTheme() {
  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");
  return getTodayThemeForDate(todayStr);
}

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [journals, todayTheme] = await Promise.all([
    getJournals(session.user.id),
    getTodayTheme(),
  ]);

  const today = startOfDay(new Date());
  const hasTodayEntry = journals.some(
    (j) => startOfDay(j.date).getTime() === today.getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">ジャーナリング</h1>
        <p className="text-sm text-[#9a8070]">心の声を書き留めましょう</p>
      </div>

      {/* Today's prompt */}
      <div className="bg-[#EFF4EF] rounded-2xl p-6 space-y-3">
        <p className="text-xs font-medium text-[#7A9E7E] uppercase tracking-wide">
          今日のテーマ
        </p>
        {todayTheme ? (
          <p className="text-[#6B4F3A] leading-relaxed">「{todayTheme}」</p>
        ) : (
          <p className="text-[#9a8070] text-sm">今日のテーマは準備中です</p>
        )}
        {!hasTodayEntry ? (
          <Link
            href="/journal/new"
            className="inline-block mt-2 bg-[#C07052] hover:bg-[#a85e42] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            今日のジャーナルを書く
          </Link>
        ) : (
          <Link
            href={`/journal/new?date=${format(today, "yyyy-MM-dd")}`}
            className="inline-block mt-2 border border-[#7A9E7E] text-[#7A9E7E] hover:bg-[#EFF4EF] text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            今日の記録を編集する
          </Link>
        )}
      </div>

      {/* Journal list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#6B4F3A]">
          過去の記録（{journals.length}件）
        </h2>
        {journals.length === 0 ? (
          <div className="text-center py-16 bg-[#FEFCF8] rounded-2xl border border-[#e8ddd5]">
            <p className="text-[#9a8070] text-sm mb-4">まだ記録がありません</p>
            <Link
              href="/journal/new"
              className="text-[#C07052] hover:underline text-sm"
            >
              最初のジャーナルを書く →
            </Link>
          </div>
        ) : (
          journals.map((journal) => {
            const dateLabel = format(journal.date, "yyyy年M月d日(E)", { locale: ja });
            const isToday = startOfDay(journal.date).getTime() === today.getTime();
            return (
              <Link
                key={journal.record_id}
                href={`/journal/new?date=${format(journal.date, "yyyy-MM-dd")}`}
                className="block bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <time className="text-xs font-medium text-[#9a8070] tabular-nums">
                    {dateLabel}
                  </time>
                  {isToday && (
                    <span className="text-xs bg-[#C07052] text-white px-2 py-0.5 rounded-full">
                      今日
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B4F3A] leading-relaxed line-clamp-3 whitespace-pre-line">
                  {journal.body}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
