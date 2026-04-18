import { getSiteTheme } from "@/server/actions/site-theme";
import { SiteThemeEditor } from "./SiteThemeEditor";

export const dynamic = "force-dynamic";

export default async function SiteThemePage() {
  const theme = await getSiteTheme();
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B4F3A]">サイトテーマ</h1>
        <p className="text-sm text-gray-500 mt-1">
          サイト全体の色調とグローバルメッセージを編集します。変更は即時反映されます。
        </p>
      </div>
      <SiteThemeEditor initial={theme} />
    </div>
  );
}
