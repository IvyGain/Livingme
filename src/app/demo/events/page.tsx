const MOCK_EVENTS = [
  {
    id: "e0",
    title: "朝の波動シェア会",
    startsAt: new Date("2026-03-20T07:30:00"),
    endsAt: new Date("2026-03-20T08:15:00"),
    eventType: "MORNING_SESSION",
    description: "今日のテーマ：「楽しむために生まれてきた、を思い出す」",
    location: null,
    meetingUrl: "#",
    isToday: true,
  },
  {
    id: "e1",
    title: "朝の波動シェア会",
    startsAt: new Date("2026-03-21T07:30:00"),
    endsAt: new Date("2026-03-21T08:15:00"),
    eventType: "MORNING_SESSION",
    description: "今週のテーマ：「感じたことを信じる」",
    location: null,
    meetingUrl: "#",
    isToday: false,
  },
  {
    id: "e2",
    title: "波動ワークショップ ― 感じる力を取り戻す",
    startsAt: new Date("2026-03-23T13:00:00"),
    endsAt: new Date("2026-03-23T15:00:00"),
    eventType: "STUDY_GROUP",
    description: "波動から見た人間観を探る実践ワーク。初参加の方も安心してご参加ください。",
    location: null,
    meetingUrl: "#",
    isToday: false,
  },
  {
    id: "e3",
    title: "夜の振り返り会",
    startsAt: new Date("2026-03-23T21:00:00"),
    endsAt: new Date("2026-03-23T22:00:00"),
    eventType: "EVENING_SESSION",
    description: "今夜のテーマ：「今週、自分を表現できた瞬間は？」",
    location: null,
    meetingUrl: "#",
    isToday: false,
  },
  {
    id: "e4",
    title: "アート交流会 ― 自由に表現しよう",
    startsAt: new Date("2026-03-26T19:00:00"),
    endsAt: new Date("2026-03-26T21:00:00"),
    eventType: "GIVE_KAI",
    description: "絵・文字・音楽…なんでもOK。正解も不正解もない、自分らしく表現する時間。",
    location: "オンライン（Zoom）",
    meetingUrl: "#",
    isToday: false,
  },
  {
    id: "e5",
    title: "春のオフ会（大阪）",
    startsAt: new Date("2026-03-30T13:00:00"),
    endsAt: new Date("2026-03-30T16:00:00"),
    eventType: "OFFLINE_EVENT",
    description: "メンバーの横のつながりを深める春のオフ会。初参加の方も大歓迎！",
    location: "大阪・中崎町（詳細は参加者にご連絡）",
    meetingUrl: null,
    isToday: false,
  },
  {
    id: "e6",
    title: "「満たされる自分」オンライン交流会",
    startsAt: new Date("2026-04-06T20:00:00"),
    endsAt: new Date("2026-04-06T21:30:00"),
    eventType: "ONLINE_EVENT",
    description: "「満たされる自分」をテーマに、メンバー同士で語り合う夜。",
    location: null,
    meetingUrl: "#",
    isToday: false,
  },
];

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

export default function DemoEventsPage() {
  const todayEvents = MOCK_EVENTS.filter((e) => e.isToday);
  const upcomingEvents = MOCK_EVENTS.filter((e) => !e.isToday);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">イベント</h1>
        <p className="text-sm text-[#9a8070]">
          波動シェア・ワークショップ・交流会のスケジュール
        </p>
      </div>

      {/* Today */}
      {todayEvents.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[#C07052] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C07052] rounded-full motion-safe:animate-pulse" />
            今日のイベント
          </h2>
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <EventRow key={event.id} event={event} highlight />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-medium text-[#6B4F3A] mb-3">
          今後のイベント（{upcomingEvents.length}件）
        </h2>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EventRow({
  event,
  highlight = false,
}: {
  event: (typeof MOCK_EVENTS)[0];
  highlight?: boolean;
}) {
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
      className={`bg-[#FEFCF8] border rounded-xl shadow-sm hover:shadow-md transition-shadow ${
        highlight ? "border-[#C07052]/40" : "border-[#e8ddd5]"
      }`}
    >
      {highlight && (
        <div className="h-0.5 bg-gradient-to-r from-[#C07052] to-[#7A9E7E] rounded-t-xl" />
      )}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-14 text-center rounded-lg py-2 ${
              highlight ? "bg-[#C07052] text-white" : "bg-[#EFF4EF] text-[#6B4F3A]"
            }`}
          >
            <p className="text-xs font-medium">{dateLabel}</p>
            <p className="text-lg font-bold leading-tight tabular-nums">{timeStr}</p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${eventTypeColors[event.eventType]}`}>
                {eventTypeLabels[event.eventType]}
              </span>
              {highlight && (
                <span className="text-xs bg-[#C07052] text-white px-2 py-0.5 rounded-full font-medium">
                  TODAY
                </span>
              )}
            </div>
            <h3 className="font-medium text-[#6B4F3A] text-sm leading-snug">{event.title}</h3>
            {event.description && (
              <p className="text-xs text-[#9a8070] mt-1 line-clamp-2">{event.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#9a8070] flex-wrap">
              {endTimeStr && (
                <span className="tabular-nums">{timeStr} – {endTimeStr}</span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {event.location}
                </span>
              )}
              {event.meetingUrl && (
                <span className="flex items-center gap-1 text-[#7A9E7E]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  参加リンクあり
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
