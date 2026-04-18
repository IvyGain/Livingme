import Link from "next/link";
import { Button } from "@/components/ui/button";

type ArchiveCategory = "MORNING_SESSION" | "EVENING_SESSION" | "LEARNING" | "EVENT" | "OTHER";

const MOCK_ARCHIVES = [
  {
    id: "1",
    title: "波動を上げる朝のルーティン ― 今日から始める5分間",
    date: new Date("2026-03-20"),
    category: "MORNING_SESSION" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "波動" } }, { tag: { name: "朝のルーティン" } }],
  },
  {
    id: "2",
    title: "自分を表現することが怖かった ― アートワークで気づいたこと",
    date: new Date("2026-03-18"),
    category: "LEARNING" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "自己表現" } }, { tag: { name: "アート" } }],
  },
  {
    id: "3",
    title: "夜の振り返り会 ― 今日の自分は最高だったか？",
    date: new Date("2026-03-15"),
    category: "EVENING_SESSION" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "振り返り" } }, { tag: { name: "自己肯定" } }],
  },
  {
    id: "4",
    title: "波動から見た人間観 ― なぜ私たちは引き合うのか",
    date: new Date("2026-03-13"),
    category: "LEARNING" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "波動" } }, { tag: { name: "人間観" } }],
  },
  {
    id: "5",
    title: "もともと完璧 ― その言葉が腑に落ちた日",
    date: new Date("2026-03-10"),
    category: "MORNING_SESSION" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "完璧" } }, { tag: { name: "自己肯定" } }],
  },
  {
    id: "6",
    title: "アートワーク体験会 ― 色で感情を解放する",
    date: new Date("2026-03-08"),
    category: "EVENT" as ArchiveCategory,
    isPublished: false,
    tags: [{ tag: { name: "アート" } }, { tag: { name: "感情" } }],
  },
  {
    id: "7",
    title: "夜の振り返り会 ― 「どう在りたいか」を問い直す",
    date: new Date("2026-03-05"),
    category: "EVENING_SESSION" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "在り方" } }, { tag: { name: "振り返り" } }],
  },
  {
    id: "8",
    title: "自分大好きになるワーク ― 鏡の前で言えますか？",
    date: new Date("2026-03-01"),
    category: "LEARNING" as ArchiveCategory,
    isPublished: true,
    tags: [{ tag: { name: "自己愛" } }, { tag: { name: "ワーク" } }],
  },
];

const categoryLabels: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

export default function DemoAdminArchivesPage() {
  const published = MOCK_ARCHIVES.filter((a) => a.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">アーカイブ管理</h1>
          <p className="text-sm text-gray-500 mt-1">全{MOCK_ARCHIVES.length}件（公開中: {published}件）</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-[#C07052] hover:bg-[#a85e42] text-white text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </span>
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
              {MOCK_ARCHIVES.map((archive, index) => (
                <tr
                  key={archive.id}
                  className={`${index !== MOCK_ARCHIVES.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{archive.title}</p>
                    {archive.tags.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {archive.tags.map((t) => t.tag.name).join(", ")}
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
                      <Link href={`/demo/archive/${archive.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          プレビュー
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        編集
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
