import { getMemberStats } from "@/server/actions/members";
import { getArchivesForAdmin } from "@/server/actions/archives";
import { getEventsForAdmin } from "@/server/actions/events";
import { getTodayContentForAdmin } from "@/server/actions/today";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getAdminStats() {
  const [memberStats, archives, events, todayContent] = await Promise.all([
    getMemberStats(),
    getArchivesForAdmin(),
    getEventsForAdmin(),
    getTodayContentForAdmin(),
  ]);

  const archiveCount = archives.filter((a) => a.isPublished).length;
  const eventCount = events.filter((e) => e.isPublished).length;

  return { memberStats, archiveCount, eventCount, hasTodayContent: !!todayContent };
}

export default async function AdminDashboard() {
  const { memberStats, archiveCount, eventCount, hasTodayContent } =
    await getAdminStats();

  const statCards = [
    {
      title: "総会員数",
      value: memberStats.total,
      sub: `有効: ${memberStats.active}名`,
      color: "text-[#6B4F3A]",
      bg: "bg-[#FFF8F0]",
    },
    {
      title: "有効会員",
      value: memberStats.active,
      sub: "isActive: true",
      color: "text-[#7A9E7E]",
      bg: "bg-[#EFF4EF]",
    },
    {
      title: "無効",
      value: memberStats.inactive,
      sub: "isActive: false",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">Living Me 管理画面</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`${stat.bg} border-0 shadow-sm`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/content/today">
          <div
            className={`p-5 rounded-xl border-2 ${
              hasTodayContent
                ? "border-[#7A9E7E] bg-[#EFF4EF]"
                : "border-dashed border-amber-300 bg-amber-50"
            } hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasTodayContent ? "bg-[#7A9E7E]" : "bg-amber-400"
                }`}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 text-sm">今日の表示を更新</p>
            </div>
            <p className="text-xs text-gray-500">
              {hasTodayContent ? "今日のコンテンツ: 設定済み ✓" : "今日のコンテンツ: 未設定"}
            </p>
          </div>
        </Link>

        <Link href="/admin/content/archives/new">
          <div className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#C07052] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 text-sm">アーカイブを追加</p>
            </div>
            <p className="text-xs text-gray-500">公開済み: {archiveCount}件</p>
          </div>
        </Link>

        <Link href="/admin/events">
          <div className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 text-sm">イベント管理</p>
            </div>
            <p className="text-xs text-gray-500">公開中: {eventCount}件</p>
          </div>
        </Link>

        <Link href="/admin/members">
          <div className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 text-sm">会員一覧</p>
            </div>
            <p className="text-xs text-gray-500">総会員数: {memberStats.total}名</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
