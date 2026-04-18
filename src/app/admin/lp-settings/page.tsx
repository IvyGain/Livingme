import { getLPSettings } from "@/server/actions/lp-settings";
import { getPublishedArchives } from "@/server/actions/archives";
import { LPEditor } from "./LPEditor";
import Link from "next/link";

export default async function AdminLPSettingsPage() {
  const [settings, archives] = await Promise.all([
    getLPSettings(),
    getPublishedArchives(),
  ]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-[#6B4F3A]">LP（トップページ）設定</h1>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#C07052] hover:underline"
        >
          実際の画面を見る →
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        左でテキスト・色・画像を編集すると、右のプレビューにリアルタイム反映されます。「変更を保存する」で公開されます。
      </p>
      <LPEditor initialSettings={settings} availableArchives={archives} />
    </div>
  );
}
