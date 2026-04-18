import { getReferralReport } from "@/server/actions/members";
import { getSetting } from "@/lib/settings";
import { AmbassadorType } from "@prisma/client";
import { Users } from "lucide-react";
import Link from "next/link";

const AMBASSADOR_LABELS: Record<AmbassadorType, string> = {
  FREE: "一般",
  REFERRAL: "紹介アンバサダー",
  PARTNER: "提携アンバサダー",
};

export default async function ReferralsPage() {
  const [referrers, rewardAmountStr] = await Promise.all([
    getReferralReport(),
    getSetting("REFERRAL_REWARD_AMOUNT"),
  ]);

  const rewardPerReferral = parseInt(rewardAmountStr ?? "0", 10) || 0;
  const totalReferrals = referrers.reduce((sum, r) => sum + r.referrals.length, 0);
  const totalReward = totalReferrals * rewardPerReferral;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">紹介管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            紹介者 {referrers.length}名 ／ 合計紹介 {totalReferrals}名
          </p>
        </div>
        <Link
          href="/admin/referrals/reward-settings"
          className="text-sm text-[#C07052] hover:underline whitespace-nowrap"
        >
          報酬単価設定 →
        </Link>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">報酬単価</p>
          <p className="text-2xl font-semibold text-gray-900">
            ¥{rewardPerReferral.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-1">/ 1件</span>
          </p>
          <Link
            href="/admin/settings"
            className="text-xs text-[#C07052] hover:underline mt-2 inline-block"
          >
            設定画面で変更 →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">合計紹介件数</p>
          <p className="text-2xl font-semibold text-gray-900">{totalReferrals}<span className="text-sm font-normal text-gray-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">報酬合計（累計）</p>
          <p className="text-2xl font-semibold text-gray-900">¥{totalReward.toLocaleString()}</p>
        </div>
      </div>

      {referrers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">紹介実績はまだありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrers.map((referrer) => {
            const reward = referrer.referrals.length * rewardPerReferral;
            return (
              <div key={referrer.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* 紹介者ヘッダー */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {referrer.name ?? "（名前未設定）"}
                    </p>
                    <p className="text-xs text-gray-500">{referrer.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {referrer.ambassadorType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        referrer.ambassadorType === AmbassadorType.PARTNER
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {AMBASSADOR_LABELS[referrer.ambassadorType]}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      紹介 <span className="font-semibold text-gray-900">{referrer._count.referrals}名</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      報酬 <span className="font-semibold text-gray-900">¥{reward.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* 紹介された会員一覧 */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">名前</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">メール</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 hidden md:table-cell">ロール</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 hidden md:table-cell">参加日</th>
                      <th className="text-right px-5 py-2 text-xs font-medium text-gray-500">報酬</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrer.referrals.map((referral, i) => (
                      <tr
                        key={referral.id}
                        className={`${i !== referrer.referrals.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50`}
                      >
                        <td className="px-5 py-2.5 font-medium text-gray-800">
                          {referral.name ?? "—"}
                        </td>
                        <td className="px-5 py-2.5 text-gray-500 text-xs">
                          {referral.email}
                        </td>
                        <td className="px-5 py-2.5 hidden md:table-cell">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {referral.role === "ADMIN" ? "管理者" : "会員"}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-xs text-gray-500 hidden md:table-cell">
                          {referral.joinedAt
                            ? referral.joinedAt.toLocaleDateString("ja-JP")
                            : referral.createdAt.toLocaleDateString("ja-JP")}
                        </td>
                        <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-700">
                          ¥{rewardPerReferral.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
