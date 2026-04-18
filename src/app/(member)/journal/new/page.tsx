import { auth } from "@/lib/auth";
import { startOfDay, format } from "date-fns";
import { JournalEditor } from "@/components/member/JournalEditor";
import { getJournalByDate } from "@/server/actions/journals";
import { getTodayThemeForDate } from "@/server/actions/today";
import { getJournalMoodOptions } from "@/server/actions/journal-settings";

export default async function JournalNewPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { date: dateParam } = await searchParams;
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const dateStr = format(startOfDay(targetDate), "yyyy-MM-dd");

  const [todayTheme, existing, moodOptions] = await Promise.all([
    getTodayThemeForDate(dateStr),
    getJournalByDate(session.user.id, dateStr),
    getJournalMoodOptions(),
  ]);

  return (
    <JournalEditor
      date={dateStr}
      initialBody={existing?.body ?? ""}
      initialMood={existing?.mood ?? ""}
      theme={todayTheme}
      moodOptions={moodOptions}
    />
  );
}
