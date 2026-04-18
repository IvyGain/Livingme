import { getJoinSettings } from "@/server/actions/join-settings";
import { JoinSettingsEditor } from "./JoinSettingsEditor";
import Link from "next/link";

export default async function JoinSettingsPage() {
  const settings = await getJoinSettings();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-[#6B4F3A]">申し込みページ設定</h1>
        <Link
          href="/join"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#C07052] hover:underline"
        >
          実際のページを見る →
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        申し込みページ（/join）のプランブロック・金額・内容一覧・決済リンク・フッター文言を管理できます。
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <JoinSettingsEditor initialSettings={settings} />
      </div>
    </div>
  );
}
