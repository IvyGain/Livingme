import { getMembers } from "@/server/actions/members";
import { getWithdrawalRequests } from "@/server/actions/withdrawal";
import { getAllTags } from "@/server/actions/chat";
import { Badge } from "@/components/ui/badge";
import { UserRole, AmbassadorType } from "@prisma/client";
import { MemberActions } from "./MemberActions";
import { InviteModal } from "./InviteModal";
import { WithdrawalRequests } from "./WithdrawalRequests";
import { MemberTagsManager } from "./MemberTagsManager";

const AMBASSADOR_LABELS: Record<AmbassadorType, string> = {
  FREE: "一般",
  REFERRAL: "紹介アンバサダー",
  PARTNER: "提携アンバサダー",
};

const AMBASSADOR_COLORS: Record<AmbassadorType, string> = {
  FREE: "bg-gray-100 text-gray-600",
  REFERRAL: "bg-blue-100 text-blue-700",
  PARTNER: "bg-purple-100 text-purple-700",
};

export default async function MembersPage() {
  const [members, withdrawalRequests, allTags] = await Promise.all([
    getMembers(),
    getWithdrawalRequests(),
    getAllTags(),
  ]);

  return (
    <div className="space-y-8">
      <MemberTagsManager initialTags={allTags} />

      {withdrawalRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-red-700">退会申請</h2>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {withdrawalRequests.length}
            </span>
          </div>
          <WithdrawalRequests requests={withdrawalRequests} />
        </div>
      )}

      <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">会員管理</h1>
          <p className="text-sm text-gray-500 mt-1">全{members.length}名</p>
        </div>
        <InviteModal />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">名前 / メール</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">ロール</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">アンバサダー</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">紹介者</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">参加日</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  className={`${index !== members.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name ?? "（名前未設定）"}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      {member._count.referrals > 0 && (
                        <p className="text-xs text-blue-500 mt-0.5">紹介 {member._count.referrals}名</p>
                      )}
                      {member.memberTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.memberTags.map(({ tag }) => (
                            <span
                              key={tag.id}
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {member.isActive ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge
                      variant={member.role === UserRole.ADMIN ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.role === UserRole.ADMIN ? "管理者" : "会員"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {member.ambassadorType ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AMBASSADOR_COLORS[member.ambassadorType]}`}>
                        {AMBASSADOR_LABELS[member.ambassadorType]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">一般</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {member.referrer ? (
                      <div>
                        <p className="text-xs font-medium text-gray-700">{member.referrer.name ?? "—"}</p>
                        <p className="text-[10px] text-gray-400">{member.referrer.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell">
                    {member.joinedAt
                      ? member.joinedAt.toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MemberActions
                      userId={member.id}
                      isActive={member.isActive}
                      currentRole={member.role}
                      currentAmbassadorType={member.ambassadorType}
                      allTags={allTags}
                      userTagIds={member.memberTags.map((mt) => mt.tag.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
