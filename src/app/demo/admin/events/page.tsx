type EventType = "MORNING_SESSION" | "EVENING_SESSION" | "ONLINE_EVENT" | "OFFLINE_EVENT" | "GIVE_KAI" | "STUDY_GROUP";

const MOCK_EVENTS = [
  {
    id: "e0",
    title: "朝の波動シェア会",
    startsAt: new Date("2026-03-20T07:30:00"),
    eventType: "MORNING_SESSION" as EventType,
    meetingUrl: "https://meet.example.com/morning",
    isPublished: true,
  },
  {
    id: "e1",
    title: "朝の波動シェア会",
    startsAt: new Date("2026-03-21T07:30:00"),
    eventType: "MORNING_SESSION" as EventType,
    meetingUrl: "https://meet.example.com/morning",
    isPublished: true,
  },
  {
    id: "e2",
    title: "波動ワークショップ ― 感じる力を取り戻す",
    startsAt: new Date("2026-03-23T13:00:00"),
    eventType: "STUDY_GROUP" as EventType,
    meetingUrl: "https://meet.example.com/workshop",
    isPublished: true,
  },
  {
    id: "e3",
    title: "夜の振り返り会",
    startsAt: new Date("2026-03-23T21:00:00"),
    eventType: "EVENING_SESSION" as EventType,
    meetingUrl: "https://meet.example.com/evening",
    isPublished: true,
  },
  {
    id: "e4",
    title: "アート交流会 ― 自由に表現しよう",
    startsAt: new Date("2026-03-26T19:00:00"),
    eventType: "GIVE_KAI" as EventType,
    meetingUrl: "https://zoom.example.com/art",
    isPublished: true,
  },
  {
    id: "e5",
    title: "春のオフ会（大阪）",
    startsAt: new Date("2026-03-30T13:00:00"),
    eventType: "OFFLINE_EVENT" as EventType,
    meetingUrl: null,
    isPublished: false,
  },
];

const eventTypeLabels: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "ワークショップ",
};

export default function DemoAdminEventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">イベント管理</h1>
        <p className="text-sm text-gray-500 mt-1">全{MOCK_EVENTS.length}件</p>
      </div>

      {/* Create form */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">新規イベント作成</h2>
        <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">タイトル</label>
              <input
                type="text"
                placeholder="例：朝の波動シェア会"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052] placeholder:text-gray-300"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">種別</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052] text-gray-400 bg-white">
                <option value="">選択してください</option>
                {Object.entries(eventTypeLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">開始日時</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052]"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">終了日時</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052]"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">参加リンク（任意）</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052] placeholder:text-gray-300"
                readOnly
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">説明（任意）</label>
              <textarea
                placeholder="イベントの詳細を入力..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#C07052] min-h-[72px] placeholder:text-gray-300"
                readOnly
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <span className="px-4 py-2 bg-[#C07052] text-white text-sm rounded-lg cursor-pointer hover:bg-[#a85e42] transition-colors">
              作成する
            </span>
          </div>
        </div>
      </div>

      {/* Event list */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">イベント一覧</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">種別</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">開始日時</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">ステータス</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EVENTS.map((event, index) => (
                  <tr
                    key={event.id}
                    className={`${index !== MOCK_EVENTS.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      {event.meetingUrl && (
                        <span className="text-xs text-blue-400">参加リンクあり</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                        {eventTypeLabels[event.eventType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {event.startsAt.toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        weekday: "short",
                      })}{" "}
                      {event.startsAt.toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          event.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {event.isPublished ? "公開中" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs border border-gray-200 rounded px-2.5 py-1 text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                        削除
                      </span>
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
