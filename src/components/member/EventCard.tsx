import { Card, CardContent } from "@/components/ui/card";
import type { EventType } from "@/lib/content-types";
import { format, isToday, isTomorrow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

interface EventCardProps {
  id: string;
  title: string;
  startsAt: Date;
  endsAt?: Date | null;
  eventType: EventType;
  description?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  registrationEnabled?: boolean;
}

const eventTypeLabels: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "勉強会",
};

const eventTypeColors: Record<EventType, string> = {
  MORNING_SESSION: "bg-[#FFF4E8] text-[#C07052] border-[#F0D5C0]",
  EVENING_SESSION: "bg-[#EEF0F8] text-[#5B6B9A] border-[#D0D5E8]",
  ONLINE_EVENT: "bg-[#EAF4F8] text-[#3B7A9A] border-[#C0D8E8]",
  OFFLINE_EVENT: "bg-[#F5F0EA] text-[#8B5E3C] border-[#e8ddd5]",
  GIVE_KAI: "bg-[#EFF4EF] text-[#7A9E7E] border-[#d0e4d0]",
  STUDY_GROUP: "bg-[#f5f0ea] text-[#8B5E3C] border-[#e8ddd5]",
};

export function EventCard({
  id,
  title,
  startsAt,
  endsAt,
  eventType,
  description,
  location,
  meetingUrl,
  registrationEnabled,
}: EventCardProps) {
  const isEventToday = isToday(startsAt);
  const isEventTomorrow = isTomorrow(startsAt);

  const dateLabel = isEventToday
    ? "今日"
    : isEventTomorrow
    ? "明日"
    : format(startsAt, "M月d日(E)", { locale: ja });

  const timeStr = format(startsAt, "HH:mm");
  const endTimeStr = endsAt ? format(endsAt, "HH:mm") : null;

  return (
    <Card
      className={`border bg-[#FEFCF8] shadow-sm hover:shadow-md transition-shadow ${
        isEventToday ? "border-[#C07052]/40" : "border-[#e8ddd5]"
      }`}
    >
      {isEventToday && (
        <div className="h-0.5 bg-gradient-to-r from-[#C07052] to-[#7A9E7E] rounded-t-xl" />
      )}
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div
            className={`flex-shrink-0 w-14 text-center rounded-lg py-2 ${
              isEventToday ? "bg-[#C07052] text-white" : "bg-[#EFF4EF] text-[#6B4F3A]"
            }`}
          >
            <p className="text-xs font-medium">{dateLabel}</p>
            <p className="text-lg font-bold leading-tight">{timeStr}</p>
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${eventTypeColors[eventType]}`}
              >
                {eventTypeLabels[eventType]}
              </span>
              {isEventToday && (
                <span className="text-xs bg-[#C07052] text-white px-2 py-0.5 rounded-full font-medium motion-safe:animate-pulse">
                  TODAY
                </span>
              )}
            </div>
            <h3 className="font-medium text-[#6B4F3A] text-sm leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#9a8070] mt-1 line-clamp-1">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#9a8070]">
              {endTimeStr && (
                <span>
                  {timeStr} - {endTimeStr}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {location}
                </span>
              )}
              {meetingUrl && (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#7A9E7E] hover:underline"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  参加リンク
                </a>
              )}
              {registrationEnabled && (
                <Link
                  href={`/events/${id}`}
                  className="flex items-center gap-1 text-[#C07052] hover:underline font-medium"
                >
                  申し込む →
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
