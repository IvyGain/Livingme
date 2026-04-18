import { getEventsForAdmin } from "@/server/actions/events";
import { EventType } from "@/lib/content-types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { EventForm } from "./EventForm";
import { EventDeleteButton } from "./EventDeleteButton";

const eventTypeLabels: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "勉強会",
};

export default async function EventsAdminPage() {
  const events = await getEventsForAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">イベント管理</h1>
        <p className="text-sm text-gray-500 mt-1">全{events.length}件</p>
      </div>

      {/* Create form */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">新規イベント作成</h2>
        <div className="max-w-2xl">
          <EventForm />
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">申込</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">ステータス</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      イベントがありません
                    </td>
                  </tr>
                ) : (
                  events.map((event, index) => (
                    <tr
                      key={event.id}
                      className={`${index !== events.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        {event.meetingUrl && (
                          <a
                            href={event.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            参加リンク
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                          {eventTypeLabels[event.eventType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {format(event.startsAt, "M月d日(E) HH:mm", { locale: ja })}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {event.registrationEnabled ? (
                          <Link
                            href={`/admin/events/${event.id}/registrations`}
                            className="inline-flex items-center gap-1 text-xs text-[#C07052] hover:underline font-medium"
                          >
                            <span className="bg-[#FFF4EF] border border-[#F0D5C0] rounded-full px-2 py-0.5">
                              {event._count.registrations}名
                            </span>
                            詳細
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-[#7A9E7E] hover:underline font-medium mr-3"
                        >
                          編集
                        </Link>
                        <EventDeleteButton eventId={event.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
