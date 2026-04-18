import Link from "next/link";
import { TodayCard } from "@/components/member/TodayCard";

const MOCK_ARCHIVES = [
  {
    id: "1",
    title: "波動を上げる朝のルーティン ― 今日から始める5分間",
    date: new Date("2026-03-20"),
    category: "MORNING_SESSION" as const,
    description: "朝の5分で一日の波動が変わる。実践シェア会からの気づきをまとめました。",
    minutes: "48",
    tags: [{ tag: { name: "波動" } }, { tag: { name: "朝のルーティン" } }],
    thumbnailUrl: null,
  },
  {
    id: "2",
    title: "自分を表現することが怖かった ― アートワークで気づいたこと",
    date: new Date("2026-03-18"),
    category: "LEARNING" as const,
    description: "「自分を表現する」ってどういうこと？絵を描くことで見えてきた自己開放の話。",
    minutes: "55",
    tags: [{ tag: { name: "自己表現" } }, { tag: { name: "アート" } }],
    thumbnailUrl: null,
  },
  {
    id: "3",
    title: "夜の振り返り会 ― 今日の自分は最高だったか？",
    date: new Date("2026-03-15"),
    category: "EVENING_SESSION" as const,
    description: "どんな一日も「今、そのままで最高」。夜の振り返り会の記録。",
    minutes: "42",
    tags: [{ tag: { name: "振り返り" } }, { tag: { name: "自己肯定" } }],
    thumbnailUrl: null,
  },
];

const MOCK_EVENTS = [
  {
    id: "e1",
    title: "朝の波動シェア会",
    startsAt: new Date("2026-03-21T07:30:00"),
    endsAt: new Date("2026-03-21T08:15:00"),
    eventType: "MORNING_SESSION" as const,
    description: "今日のテーマ：「楽しむために生まれてきた、を思い出す」",
    location: null,
    meetingUrl: "#",
  },
  {
    id: "e2",
    title: "波動ワークショップ ― 感じる力を取り戻す",
    startsAt: new Date("2026-03-23T13:00:00"),
    endsAt: new Date("2026-03-23T15:00:00"),
    eventType: "STUDY_GROUP" as const,
    description: "波動から見た自分の人間観を探るワークショップ。",
    location: null,
    meetingUrl: "#",
  },
  {
    id: "e3",
    title: "アート交流会 ― 自由に表現しよう",
    startsAt: new Date("2026-03-26T19:00:00"),
    endsAt: new Date("2026-03-26T21:00:00"),
    eventType: "GIVE_KAI" as const,
    description: "絵・文字・音楽…なんでもOK。自分らしく表現する時間。",
    location: "オンライン（Zoom）",
    meetingUrl: "#",
  },
];

const categoryLabels: Record<string, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
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

const eventTypeLabels: Record<string, string> = {
  MORNING_SESSION: "朝の波動シェア",
  EVENING_SESSION: "夜の振り返り会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "ワークショップ",
};

const eventTypeColors: Record<string, string> = {
  MORNING_SESSION: "bg-amber-100 text-amber-700 border-amber-200",
  EVENING_SESSION: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ONLINE_EVENT: "bg-blue-100 text-blue-700 border-blue-200",
  OFFLINE_EVENT: "bg-orange-100 text-orange-700 border-orange-200",
  GIVE_KAI: "bg-[#EFF4EF] text-[#7A9E7E] border-[#d0e4d0]",
  STUDY_GROUP: "bg-[#f5f0ea] text-[#8B5E3C] border-[#e8ddd5]",
};

export default function DemoHomePage() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-light text-[#6B4F3A] mb-1">
          こんにちは、さくらさん
        </h2>
        <p className="text-sm text-[#9a8070]">
          今日も、今のあなたのままで最高です。
        </p>
      </div>

      {/* Today's content */}
      <TodayCard
        date={new Date("2026-03-20")}
        energyShare="今日は「受け取る」波動が強い日。誰かの言葉、空の色、風の感触…感じたことをそのまま信じてみましょう。正しいか間違いかではなく、あなたが感じたことがすべてです。"
        journalingTheme="今日、自分が「楽しい」と感じた瞬間はいつ？"
        morningNote="今朝の波動シェアでは「楽しむために生まれてきた」をテーマに話しました。義務や正しさではなく、純粋な楽しさから動いてみるとどうなるか。みんなで小さな実験を始めています。"
      />

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[#6B4F3A]">直近のイベント</h3>
          <Link href="/demo/events" className="text-sm text-[#C07052] hover:text-[#a85e42]">
            すべて見る →
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_EVENTS.map((event) => {
            const dateLabel = event.startsAt.toLocaleDateString("ja-JP", {
              month: "numeric",
              day: "numeric",
              weekday: "short",
            });
            const timeStr = event.startsAt.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTimeStr = event.endsAt
              ? event.endsAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
              : null;
            return (
              <div
                key={event.id}
                className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 text-center rounded-lg py-2 bg-[#EFF4EF] text-[#6B4F3A]">
                      <p className="text-xs font-medium">{dateLabel}</p>
                      <p className="text-lg font-bold leading-tight tabular-nums">{timeStr}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${eventTypeColors[event.eventType]}`}>
                          {eventTypeLabels[event.eventType]}
                        </span>
                      </div>
                      <h3 className="font-medium text-[#6B4F3A] text-sm leading-snug">{event.title}</h3>
                      {event.description && (
                        <p className="text-xs text-[#9a8070] mt-1 line-clamp-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#9a8070]">
                        {endTimeStr && <span className="tabular-nums">{timeStr} – {endTimeStr}</span>}
                        {event.location && <span>{event.location}</span>}
                        {event.meetingUrl && (
                          <span className="text-[#7A9E7E]">参加リンクあり</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Archives */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[#6B4F3A]">新着アーカイブ</h3>
          <Link href="/demo/archive" className="text-sm text-[#C07052] hover:text-[#a85e42]">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ARCHIVES.map((archive) => {
            const dateStr = archive.date.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <Link key={archive.id} href={`/demo/archive/${archive.id}`} className="block group">
                <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl overflow-hidden hover:shadow-md hover:border-[#C07052]/30 transition-all duration-200">
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
                        {archive.tags.slice(0, 3).map(({ tag }) => (
                          <span key={tag.name} className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                            {tag.name}
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
      </section>

      {/* Latest Column */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[#6B4F3A]">主宰者コラム</h3>
        </div>
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6 shadow-sm">
          <p className="text-xs text-[#9a8070] mb-2">
            主宰者 · 2026年3月20日
          </p>
          <h4 className="font-medium text-[#6B4F3A] mb-3">
            「どっちでもOK」が最強の波動だと気づいた話
          </h4>
          <p className="text-sm text-[#6B4F3A] leading-relaxed line-clamp-4">
            先日、あるメンバーさんから「どちらを選んでいいかわからなくて、ずっと悩んでいる」というお話をうかがいました。
            そのとき私が伝えたのは、「どっちでもOK」という言葉でした。
            波動の世界では、正しい選択よりも「今、自分が感じていること」の方がずっと大切。
            輝く人生をアートするって、答えを出すことじゃなく、感じながら描いていくことだと思っています。
          </p>
        </div>
      </section>
    </div>
  );
}
