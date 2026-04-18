"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSetting } from "@/lib/settings";
import { createRecord, updateRecord, deleteRecord, getRecord, listAllRecords } from "@/lib/lark";
import type { LarkRecord } from "@/lib/lark";
import { prisma } from "@/lib/prisma";
import type { LarkEvent, RegistrationField } from "@/lib/content-types";

const eventSchema = z.object({
  title:              z.string().min(1, "タイトルは必須です"),
  description:        z.string().optional(),
  eventType:          z.enum(["MORNING_SESSION", "EVENING_SESSION", "ONLINE_EVENT", "OFFLINE_EVENT", "GIVE_KAI", "STUDY_GROUP"]),
  startsAt:           z.string().min(1, "開始日時は必須です"),
  endsAt:             z.string().optional(),
  location:           z.string().optional(),
  meetingUrl:         z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  isPublished:        z.boolean().default(false),
  maxAttendees:       z.number().int().positive().optional().nullable(),
  registrationEnabled:z.boolean().default(false),
  registrationFields: z.array(z.any()).optional().nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

async function getTableConfig() {
  const appToken = await getSetting("LARK_BASE_APP_TOKEN");
  const tableId = await getSetting("LARK_EVENT_TABLE_ID");
  if (!appToken || !tableId) return null;
  return { appToken, tableId };
}

function parseRecord(record: LarkRecord): LarkEvent {
  const f = record.fields;
  const startsAtStr = String(f.startsAt ?? "");
  const endsAtStr = String(f.endsAt ?? "");
  const maxAttendeesStr = String(f.maxAttendees ?? "");
  const fieldsStr = String(f.registrationFields ?? "[]");

  const registrationFieldSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["text", "textarea", "select", "checkbox"]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  });
  let registrationFields: RegistrationField[] = [];
  try {
    const parsed = z.array(registrationFieldSchema).safeParse(JSON.parse(fieldsStr));
    registrationFields = parsed.success ? parsed.data : [];
  } catch {
    registrationFields = [];
  }

  return {
    id:                 record.record_id,
    title:              String(f.title ?? ""),
    description:        String(f.description ?? "") || null,
    eventType:          (String(f.eventType ?? "ONLINE_EVENT")) as LarkEvent["eventType"],
    startsAt:           startsAtStr ? new Date(startsAtStr) : new Date(),
    endsAt:             endsAtStr ? new Date(endsAtStr) : null,
    location:           String(f.location ?? "") || null,
    meetingUrl:         String(f.meetingUrl ?? "") || null,
    isPublished:        String(f.isPublished) === "true",
    maxAttendees:       maxAttendeesStr ? parseInt(maxAttendeesStr, 10) || null : null,
    registrationEnabled:String(f.registrationEnabled) === "true",
    registrationFields,
  };
}

function toFields(validated: z.infer<typeof eventSchema>) {
  return {
    title:              validated.title,
    description:        validated.description ?? "",
    eventType:          validated.eventType,
    startsAt:           new Date(validated.startsAt).toISOString(),
    endsAt:             validated.endsAt ? new Date(validated.endsAt).toISOString() : "",
    location:           validated.location ?? "",
    meetingUrl:         validated.meetingUrl ?? "",
    isPublished:        validated.isPublished ? "true" : "false",
    maxAttendees:       validated.maxAttendees ? String(validated.maxAttendees) : "",
    registrationEnabled:validated.registrationEnabled ? "true" : "false",
    registrationFields: JSON.stringify(validated.registrationFields ?? []),
  };
}

export async function createEvent(
  data: EventInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();
    const validated = eventSchema.parse(data);

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。外部サービス設定から全同期を実行してください。" };
    }
    const { appToken, tableId } = config;

    const id = await createRecord(appToken, tableId, toFields(validated));

    revalidatePath("/events");
    revalidatePath("/home");
    revalidatePath("/admin/events");

    return { success: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "作成に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateEvent(
  id: string,
  data: EventInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const validated = eventSchema.parse(data);

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。" };
    }
    const { appToken, tableId } = config;

    await updateRecord(appToken, tableId, id, toFields(validated));

    revalidatePath("/events");
    revalidatePath("/home");
    revalidatePath("/admin/events");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function deleteEvent(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。" };
    }
    const { appToken, tableId } = config;

    await deleteRecord(appToken, tableId, id);

    revalidatePath("/events");
    revalidatePath("/home");
    revalidatePath("/admin/events");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "削除に失敗しました";
    return { success: false, error: message };
  }
}

export async function getEventsForAdmin(): Promise<(LarkEvent & { _count: { registrations: number } })[]> {
  await requireAdmin();

  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const records = await listAllRecords(appToken, tableId);
  const events = records
    .map(parseRecord)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const eventIds = events.map(e => e.id);
  const counts = await prisma.eventRegistration.groupBy({
    by: ["eventId"],
    where: { eventId: { in: eventIds } },
    _count: { id: true },
  });
  const countMap = new Map(counts.map(c => [c.eventId, c._count.id]));

  return events.map(e => ({ ...e, _count: { registrations: countMap.get(e.id) ?? 0 } }));
}

export async function getEventForAdmin(id: string): Promise<(LarkEvent & { _count: { registrations: number } }) | null> {
  await requireAdmin();

  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const record = await getRecord(appToken, tableId, id);
  if (!record) return null;

  const event = parseRecord(record);
  const count = await prisma.eventRegistration.count({ where: { eventId: id } });
  return { ...event, _count: { registrations: count } };
}

/** メンバー向け: 公開済み近日イベント */
export async function getUpcomingEventsForMember(limit = 10): Promise<LarkEvent[]> {
  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const records = await listAllRecords(appToken, tableId, `CurrentValue.[isPublished]="true"`);
  const now = new Date();
  return records
    .map(parseRecord)
    .filter(e => e.startsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, limit);
}

/** メンバー向け: 今月のイベント */
export async function getThisMonthEventsForMember(): Promise<LarkEvent[]> {
  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const records = await listAllRecords(appToken, tableId, `CurrentValue.[isPublished]="true"`);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return records
    .map(parseRecord)
    .filter(e => e.startsAt >= startOfMonth && e.startsAt <= endOfMonth)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** メンバー向け: 単一公開イベント */
export async function getPublishedEvent(id: string): Promise<LarkEvent | null> {
  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const record = await getRecord(appToken, tableId, id);
  if (!record) return null;
  const event = parseRecord(record);
  return event.isPublished ? event : null;
}
