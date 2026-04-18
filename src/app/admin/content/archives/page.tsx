import { getArchivesForAdmin } from "@/server/actions/archives";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArchiveCategory } from "@/lib/content-types";
import { ArchiveDeleteButton } from "./ArchiveDeleteButton";

const categoryLabels: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

export default async function ArchivesAdminPage() {
  const archives = await getArchivesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">アーカイブ管理</h1>
          <p className="text-sm text-gray-500 mt-1">全{archives.length}件</p>
        </div>
        <Link href="/admin/content/archives/new">
          <Button className="bg-[#C07052] hover:bg-[#a85e42] text-white">
            + 新規作成
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">カテゴリー</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">日付</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">ステータス</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {archives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    アーカイブがありません
                  </td>
                </tr>
              ) : (
                archives.map((archive, index) => (
                  <tr
                    key={archive.id}
                    className={`${index !== archives.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {archive.title}
                      </p>
                      {archive.tags.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {archive.tags.join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                        {categoryLabels[archive.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {archive.date.toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          archive.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {archive.isPublished ? "公開中" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/content/archives/${archive.id}/edit`}>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            編集
                          </Button>
                        </Link>
                        <ArchiveDeleteButton archiveId={archive.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
