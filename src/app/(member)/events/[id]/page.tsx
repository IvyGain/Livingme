import { getPublishedEvent } from "@/server/actions/events";
import { getMyRegistration } from "@/server/actions/registrations";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { EventType } from "@/lib/content-types";
import Link from "next/link";
import { RegistrationForm } from "./RegistrationForm";
import type { RegistrationField } from "@/lib/content-types";

const eventTypeLabels: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT: "オンラインイベント",
  OFFLINE_EVENT: "オフラインイベント",
  GIVE_KAI: "ギブ会",
  STUDY_GROUP: "勉強会",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const event = await getPublishedEvent(id);

  if (!event) notFound();

  const [myRegistration, registrationCount] = await Promise.all([
    userId ? getMyRegistration(id) : Promise.resolve(null),
    prisma.eventRegistration.count({ where: { eventId: id } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/events"
          className="text-sm text-[#9a8070] hover:text-[#6B4F3A]"
        >
          ← イベント一覧
        </Link>
      </div>

      {/* Event header */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] border border-[#d0e4d0] px-2 py-0.5 rounded-full">
              {eventTypeLabels[event.eventType]}
            </span>
            <h1 className="text-xl font-medium text-[#6B4F3A] mt-2">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[#6B4F3A]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#9a8070] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {format(event.startsAt, "yyyy年M月d日(E) HH:mm", { locale: ja })}
              {event.endsAt && ` 〜 ${format(event.endsAt, "HH:mm")}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#9a8070] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          )}

          {event.meetingUrl && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#9a8070] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A9E7E] hover:underline"
              >
                参加リンクを開く
              </a>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-[#9a8070] leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        )}
      </div>

      {/* Registration section */}
      {event.registrationEnabled ? (
        <RegistrationForm
          eventId={event.id}
          fields={event.registrationFields as RegistrationField[]}
          maxAttendees={event.maxAttendees}
          registrationCount={registrationCount}
          alreadyRegistered={!!myRegistration}
        />
      ) : null}
    </div>
  );
}
