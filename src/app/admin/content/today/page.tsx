import { getTodayContentForAdmin } from "@/server/actions/today";
import { TodayContentForm } from "./TodayContentForm";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default async function TodayContentPage() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const existingContent = await getTodayContentForAdmin(todayStr);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">今日の表示更新</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(today, "yyyy年M月d日(E)", { locale: ja })} のコンテンツ
        </p>
      </div>

      <TodayContentForm
        initialData={existingContent}
        defaultDate={todayStr}
      />
    </div>
  );
}
