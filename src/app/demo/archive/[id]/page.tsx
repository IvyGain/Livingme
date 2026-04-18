import Link from "next/link";

const MOCK_ARCHIVE = {
  id: "1",
  title: "波動を上げる朝のルーティン ― 今日から始める5分間",
  date: new Date("2026-03-20"),
  category: "MORNING_SESSION",
  description: "朝の5分で一日の波動が変わる。実践シェア会からの気づきをまとめました。",
  minutes: "48",
  energyShare: "今日は「受け取る」波動が強い日。感じたことをそのまま信じてみましょう。正しいか間違いかではなく、あなたが感じたことがすべてです。",
  journalingTheme: "今日、自分が「楽しい」と感じた瞬間はいつ？",
  summary: "今朝の波動シェア会では「楽しむために生まれてきた」をテーマに話しました。義務や正しさではなく、純粋な楽しさから動いてみるとどうなるか。朝の5分間を使ったシンプルな実践方法を参加者でシェアしました。",
  minutes_text: `【波動シェア会 2026年3月20日】

テーマ：「楽しむために生まれてきた、を思い出す」

■ 今日のエネルギーシェア
「受け取る」波動が強い日。
感じたことを信じる。それだけで十分。

■ シェアされた気づき
・朝に「今日も楽しみだ」と感じてから動き始めると、一日の質が変わる
・波動は「正しさ」ではなく「感じること」で上がる
・「どう在りたいか」を朝に問うだけで、選択が変わってくる
・もともと完璧な自分がいる、ということを信じてみる5分間

■ 今日のジャーナリングテーマ
「今日、自分が『楽しい』と感じた瞬間はいつ？」

参加者：14名
`,
  tags: ["波動", "朝のルーティン", "楽しむ"],
};

export default function DemoArchiveDetailPage() {
  const archive = MOCK_ARCHIVE;
  const dateStr = archive.date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/demo/archive"
        className="inline-flex items-center gap-1 text-sm text-[#9a8070] hover:text-[#6B4F3A] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        アーカイブ一覧
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            朝の波動シェア
          </span>
          <span className="text-xs text-[#9a8070]">{dateStr}</span>
          <span className="text-xs text-[#9a8070]">· {archive.minutes}分</span>
        </div>
        <h1 className="text-xl font-medium text-[#6B4F3A] leading-snug">
          {archive.title}
        </h1>
      </div>

      {/* Video player placeholder */}
      <div className="aspect-video bg-[#EFF4EF] rounded-2xl flex items-center justify-center border border-[#e8ddd5]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#C07052]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#C07052]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-sm text-[#9a8070]">動画を再生する</p>
          <p className="text-xs text-[#b8a898] mt-1">Lark Drive より</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {archive.tags.map((tag) => (
          <span key={tag} className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-3 py-1 rounded-full">
            # {tag}
          </span>
        ))}
      </div>

      {/* Energy & Journaling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#7A9E7E] uppercase tracking-wide mb-2">
            エネルギーシェア
          </p>
          <p className="text-sm text-[#6B4F3A] leading-relaxed">{archive.energyShare}</p>
        </div>
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#C07052] uppercase tracking-wide mb-2">
            ジャーナリングテーマ
          </p>
          <p className="text-sm text-[#6B4F3A] leading-relaxed font-medium">
            「{archive.journalingTheme}」
          </p>
          <Link
            href="/demo/journal"
            className="inline-block mt-3 text-xs text-[#C07052] hover:underline"
          >
            ジャーナルを書く →
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[#6B4F3A] mb-3">要約</h2>
        <p className="text-sm text-[#6B4F3A] leading-relaxed">{archive.summary}</p>
      </div>

      {/* Minutes */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[#6B4F3A] mb-4">シェア内容</h2>
        <pre className="text-sm text-[#6B4F3A] leading-relaxed whitespace-pre-wrap font-sans">
          {archive.minutes_text}
        </pre>
      </div>
    </div>
  );
}
