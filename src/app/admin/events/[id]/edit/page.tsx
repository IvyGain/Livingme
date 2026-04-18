import { getEventForAdmin } from "@/server/actions/events";
import { EventForm, type EventFormInitialValues } from "../../EventForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { RegistrationField } from "@/lib/content-types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * `datetime-local` input expects "YYYY-MM-DDTHH:mm" in local time.
 * We format in the user agent's local zone using toISOString offset removal.
 */
function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export default async function EventEditPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventForAdmin(id);

  if (!event) notFound();

  const initial: EventFormInitialValues = {
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    startsAt: toDatetimeLocal(event.startsAt),
    endsAt: toDatetimeLocal(event.endsAt),
    location: event.location,
    meetingUrl: event.meetingUrl,
    isPublished: event.isPublished,
    registrationEnabled: event.registrationEnabled,
    registrationFields: event.registrationFields as RegistrationField[],
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← イベント一覧
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          イベントを編集
        </h1>
        <p className="text-sm text-gray-500 mt-1">{event.title}</p>
      </div>

      <div className="max-w-2xl">
        <EventForm initial={initial} />
      </div>
    </div>
  );
}
