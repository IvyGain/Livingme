import { getUpcomingEventsForMember, getThisMonthEventsForMember } from "@/server/actions/events";
import { EventCard } from "@/components/member/EventCard";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { EventType } from "@/lib/content-types";

const eventTypeLabels: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "勉強会",
};

export default async function EventsPage() {
  const [upcomingEvents, monthEvents] = await Promise.all([
    getUpcomingEventsForMember(20).catch(() => [] as Awaited<ReturnType<typeof getUpcomingEventsForMember>>),
    getThisMonthEventsForMember().catch(() => [] as Awaited<ReturnType<typeof getThisMonthEventsForMember>>),
  ]);

  const now = new Date();
  const monthLabel = format(now, "yyyy年M月", { locale: ja });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">イベント</h1>
        <p className="text-sm text-[#9a8070]">
          朝会・夜会・イベントのスケジュール
        </p>
      </div>

      {/* Upcoming events */}
      <section>
        <h2 className="text-base font-medium text-[#6B4F3A] mb-4">直近のイベント</h2>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFCF8] rounded-xl border border-[#e8ddd5]">
            <p className="text-[#9a8070] text-sm">予定されているイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                startsAt={event.startsAt}
                endsAt={event.endsAt}
                eventType={event.eventType}
                description={event.description}
                location={event.location}
                meetingUrl={event.meetingUrl}
                registrationEnabled={event.registrationEnabled}
              />
            ))}
          </div>
        )}
      </section>

      {/* Monthly view */}
      <section>
        <h2 className="text-base font-medium text-[#6B4F3A] mb-4">
          {monthLabel}のスケジュール
        </h2>
        {monthEvents.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFCF8] rounded-xl border border-[#e8ddd5]">
            <p className="text-[#9a8070] text-sm">今月の予定はありません</p>
          </div>
        ) : (
          <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EFF4EF]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A9E7E] uppercase tracking-wide">
                    日時
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A9E7E] uppercase tracking-wide">
                    イベント
                  </th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-medium text-[#7A9E7E] uppercase tracking-wide">
                    種別
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthEvents.map((event, index) => {
                  const isLast = index === monthEvents.length - 1;
                  const dateStr = format(event.startsAt, "M/d(E) HH:mm", { locale: ja });
                  return (
                    <tr
                      key={event.id}
                      className={`${!isLast ? "border-b border-[#f0e9e1]" : ""} hover:bg-[#f9f5f1] transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm text-[#9a8070] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#6B4F3A]">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-[#9a8070] mt-0.5 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                        {event.meetingUrl && (
                          <a
                            href={event.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#7A9E7E] hover:underline mt-0.5 inline-block"
                          >
                            参加リンク →
                          </a>
                        )}
                        {event.registrationEnabled && (
                          <a
                            href={`/events/${event.id}`}
                            className="text-xs text-[#C07052] hover:underline mt-0.5 inline-block ml-2 font-medium"
                          >
                            申し込む →
                          </a>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2 py-0.5 rounded-full">
                          {eventTypeLabels[event.eventType]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
