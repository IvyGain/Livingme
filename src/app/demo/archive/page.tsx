import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MOCK_ARCHIVES = [
  {
    id: "1",
    title: "波動を上げる朝のルーティン ― 今日から始める5分間",
    date: new Date("2026-03-20"),
    category: "MORNING_SESSION",
    description: "朝の5分で一日の波動が変わる。実践シェア会からの気づきをまとめました。",
    minutes: "48",
    tags: ["波動", "朝のルーティン", "習慣"],
  },
  {
    id: "2",
    title: "自分を表現することが怖かった ― アートワークで気づいたこと",
    date: new Date("2026-03-18"),
    category: "LEARNING",
    description: "「自分を表現する」ってどういうこと？絵を描くことで見えてきた自己開放の話。",
    minutes: "55",
    tags: ["自己表現", "アート", "解放"],
  },
  {
    id: "3",
    title: "夜の振り返り会 ― 今日の自分は最高だったか？",
    date: new Date("2026-03-15"),
    category: "EVENING_SESSION",
    description: "どんな一日も「今、そのままで最高」。夜の振り返り会の記録。",
    minutes: "42",
    tags: ["振り返り", "自己肯定"],
  },
  {
    id: "4",
    title: "波動から見た人間観 ― なぜ私たちは引き合うのか",
    date: new Date("2026-03-13"),
    category: "LEARNING",
    description: "波動の視点で見ると、人と人のつながりはまったく違って見える。メンバーとの対話から生まれた学び。",
    minutes: "60",
    tags: ["波動", "人間観", "引き寄せ"],
  },
  {
    id: "5",
    title: "もともと完璧 ― その言葉が腑に落ちた日",
    date: new Date("2026-03-10"),
    category: "MORNING_SESSION",
    description: "「もともと完璧であることを思い出す」。この言葉と本当に出会えた瞬間の話。",
    minutes: "44",
    tags: ["完璧", "自己肯定", "波動"],
  },
  {
    id: "6",
    title: "アートワーク体験会 ― 色で感情を解放する",
    date: new Date("2026-03-08"),
    category: "EVENT",
    description: "色を使った自己表現ワーク。参加者それぞれの作品と気づきをシェアしました。",
    minutes: null,
    tags: ["アート", "感情", "表現"],
  },
  {
    id: "7",
    title: "夜の振り返り会 ― 「どう在りたいか」を問い直す",
    date: new Date("2026-03-05"),
    category: "EVENING_SESSION",
    description: "「どう在りたいか」という問いに向き合い続けるとはどういうことか。",
    minutes: "50",
    tags: ["在り方", "振り返り", "自分軸"],
  },
  {
    id: "8",
    title: "自分大好きになるワーク ― 鏡の前で言えますか？",
    date: new Date("2026-03-01"),
    category: "LEARNING",
    description: "「自分大好き」と言えない理由を探る。思い込みを手放す実践ワーク。",
    minutes: "52",
    tags: ["自己愛", "ワーク", "思い込み"],
  },
];

const ALL_TAGS = ["波動", "自己表現", "アート", "自己肯定", "振り返り", "引き寄せ", "在り方", "自己愛", "完璧", "習慣"];

const categoryLabels: Record<string, string> = {
  MORNING_SESSION: "朝の波動シェア",
  EVENING_SESSION: "夜の振り返り",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

const categoryColors: Record<string, string> = {
  MORNING_SESSION: "bg-amber-100 text-amber-700",
  EVENING_SESSION: "bg-indigo-100 text-indigo-700",
  LEARNING: "bg-[#EFF4EF] text-[#7A9E7E]",
  EVENT: "bg-rose-100 text-rose-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function DemoArchivePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">アーカイブ</h1>
        <p className="text-sm text-[#9a8070]">
          波動シェア・振り返り会・ワークショップの記録
        </p>
      </div>

      {/* Search bar */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="キーワードで検索..."
            className="border-[#e8ddd5] bg-white focus:border-[#C07052]"
            readOnly
          />
          <button className="px-4 py-2 bg-[#C07052] text-white rounded-lg text-sm hover:bg-[#a85e42] transition-colors">
            検索
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full border bg-[#6B4F3A] text-white border-[#6B4F3A]">
            すべて
          </span>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <span
              key={value}
              className="text-xs px-3 py-1.5 rounded-full border border-[#e8ddd5] text-[#9a8070] hover:border-[#6B4F3A] cursor-pointer transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs cursor-pointer border-[#d0e4d0] text-[#7A9E7E] hover:bg-[#EFF4EF] transition-colors"
          >
            # {tag}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <div>
        <p className="text-xs text-[#9a8070] mb-4">{MOCK_ARCHIVES.length}件のアーカイブ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ARCHIVES.map((archive) => {
            const dateStr = archive.date.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <Link key={archive.id} href={`/demo/archive/${archive.id}`} className="block group">
                <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl overflow-hidden hover:shadow-md hover:border-[#C07052]/30 transition-all duration-200 h-full">
                  <div className="aspect-video relative bg-[#EFF4EF] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-[#C07052]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[archive.category]}`}>
                      {categoryLabels[archive.category]}
                    </span>
                    {archive.minutes && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {archive.minutes}分
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#9a8070] mb-1">{dateStr}</p>
                    <h3 className="font-medium text-[#6B4F3A] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#C07052] transition-colors">
                      {archive.title}
                    </h3>
                    {archive.description && (
                      <p className="text-xs text-[#9a8070] line-clamp-2">{archive.description}</p>
                    )}
                    {archive.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {archive.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
