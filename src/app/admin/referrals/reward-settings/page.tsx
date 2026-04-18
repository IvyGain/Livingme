import { getRewardSettings } from "@/server/actions/reward-settings";
import { RewardSettingsEditor } from "./RewardSettingsEditor";
import Link from "next/link";

export default async function RewardSettingsPage() {
  const settings = await getRewardSettings();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-[#6B4F3A]">報酬単価設定</h1>
        <Link
          href="/admin/referrals"
          className="text-sm text-[#C07052] hover:underline"
        >
          ← 紹介管理に戻る
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        会員ステータスごと・報酬種別ごとに報酬単価を設定します。
        変更は「変更を保存する」ボタンで反映されます。
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
        <RewardSettingsEditor initialSettings={settings} />
      </div>
    </div>
  );
}
