import { getJournalMoodOptions } from "@/server/actions/journal-settings";
import { MoodOptionsEditor } from "./MoodOptionsEditor";

export default async function JournalSettingsPage() {
  const moodOptions = await getJournalMoodOptions();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#6B4F3A] mb-1">
        ジャーナル設定
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        ジャーナル入力画面に表示される「今日の気分」の選択肢を管理できます。
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl">
        <MoodOptionsEditor initialOptions={moodOptions} />
      </div>
    </div>
  );
}
