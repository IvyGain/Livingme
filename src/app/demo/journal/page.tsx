import Link from "next/link";

const MOCK_JOURNALS = [
  {
    id: "j1",
    date: new Date("2026-03-20"),
    body: "今日のテーマは「楽しい瞬間」だった。\n\n考えてみたら、朝の波動シェアが終わった後、みんなと話しながらコーヒーを飲んでいた時間が一番楽しかった。\n\n特別なことじゃなかった。でも確かに満たされていた。「満たされる自分」ってこういうことかもしれない。",
    isToday: true,
  },
  {
    id: "j2",
    date: new Date("2026-03-18"),
    body: "自己表現のアーカイブを観た。\n\n「表現することが怖い」という言葉が刺さった。わたしもそうだった。うまくできないかもしれないから、見られたくないから、ずっと表現することを後回しにしてきた。\n\nでも波動の視点では、表現することそのものが波動を上げる行為らしい。うまい下手じゃない。ただ出すこと。",
    isToday: false,
  },
  {
    id: "j3",
    date: new Date("2026-03-15"),
    body: "夜の振り返り会で「どう在りたいか」という問いを持って帰ってきた。\n\n正直、まだよくわからない。でも「在り方を問い続けること」自体が答えに近づいていることだと、主宰者が言っていた。\n\n今日はそれだけで十分な気がする。どっちでもOK、今OK。",
    isToday: false,
  },
  {
    id: "j4",
    date: new Date("2026-03-12"),
    body: "今日は何もできなかった日。シェア会にも参加しなかった。\n\nそれでいいんだ、ということをアートライフに来てから少しずつ思えるようになってきた。\n\n「もともと完璧」。完璧な自分は、何もできなかった今日も、完璧だったのかもしれない。",
    isToday: false,
  },
  {
    id: "j5",
    date: new Date("2026-03-08"),
    body: "アートライフに入って1ヶ月が経った。\n\n一番変わったのは、自分を責める声が少し小さくなったこと。「自分大好き」ってまだ言えないけど、「自分、まあまあいいじゃん」くらいは思えるようになった。\n\n輝く人生をアートする。少しずつ、描き始めている気がする。",
    isToday: false,
  },
];

export default function DemoJournalPage() {
  const todayTheme = "今日、自分が「楽しい」と感じた瞬間はいつ？";
  const hasTodayEntry = true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">ジャーナリング</h1>
        <p className="text-sm text-[#9a8070]">感じたことを、そのまま書き留めましょう</p>
      </div>

      {/* Today's prompt */}
      <div className="bg-[#EFF4EF] rounded-2xl p-6 space-y-3">
        <p className="text-xs font-medium text-[#7A9E7E] uppercase tracking-wide">
          今日のテーマ
        </p>
        <p className="text-[#6B4F3A] leading-relaxed">「{todayTheme}」</p>
        {hasTodayEntry ? (
          <span className="inline-block mt-2 border border-[#7A9E7E] text-[#7A9E7E] text-sm px-5 py-2.5 rounded-full cursor-pointer hover:bg-white transition-colors">
            今日の記録を編集する
          </span>
        ) : (
          <span className="inline-block mt-2 bg-[#C07052] hover:bg-[#a85e42] text-white text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer transition-colors">
            今日のジャーナルを書く
          </span>
        )}
      </div>

      {/* Today's entry (open) */}
      <div className="bg-[#FEFCF8] border border-[#C07052]/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <time className="text-xs font-medium text-[#9a8070] tabular-nums">
            2026年3月20日（金）
          </time>
          <span className="text-xs bg-[#C07052] text-white px-2 py-0.5 rounded-full">今日</span>
        </div>
        <textarea
          className="w-full min-h-[160px] bg-transparent text-sm text-[#6B4F3A] leading-relaxed resize-none focus:outline-none placeholder:text-[#b8a898]"
          defaultValue={MOCK_JOURNALS[0].body}
          readOnly
        />
        <div className="flex justify-end">
          <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-4 py-2 rounded-full cursor-pointer hover:bg-[#ddeade] transition-colors">
            保存する
          </span>
        </div>
      </div>

      {/* Past entries */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#6B4F3A]">
          過去の記録（{MOCK_JOURNALS.length}件）
        </h2>
        {MOCK_JOURNALS.map((journal) => {
          const dateLabel = journal.date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
          });
          return (
            <div
              key={journal.id}
              className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <time className="text-xs font-medium text-[#9a8070] tabular-nums">
                  {dateLabel}
                </time>
                {journal.isToday && (
                  <span className="text-xs bg-[#C07052] text-white px-2 py-0.5 rounded-full">
                    今日
                  </span>
                )}
              </div>
              <p className="text-sm text-[#6B4F3A] leading-relaxed line-clamp-3 whitespace-pre-line">
                {journal.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
