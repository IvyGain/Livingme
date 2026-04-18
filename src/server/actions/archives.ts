"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { format } from "date-fns";
import { getSetting } from "@/lib/settings";
import { createRecord, updateRecord, deleteRecord, getRecord, listAllRecords } from "@/lib/lark";
import type { LarkRecord } from "@/lib/lark";
import { ArchiveCategory } from "@/lib/content-types";
import type { Archive } from "@/lib/content-types";

const archiveSchema = z.object({
  title:          z.string().min(1, "タイトルは必須です"),
  description:    z.string().optional(),
  date:           z.string().min(1, "日付は必須です"),
  category:       z.enum(["MORNING_SESSION", "EVENING_SESSION", "LEARNING", "EVENT", "OTHER"]),
  videoUrl:       z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  thumbnailUrl:   z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  minutes:        z.string().optional(),
  summary:        z.string().optional(),
  energyShare:    z.string().optional(),
  journalingTheme:z.string().optional(),
  isPublished:    z.boolean().default(false),
  tags:           z.array(z.string()).default([]),
});

export type ArchiveInput = z.infer<typeof archiveSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

async function getTableConfig() {
  const appToken = await getSetting("LARK_BASE_APP_TOKEN");
  const tableId = await getSetting("LARK_ARCHIVE_TABLE_ID");
  if (!appToken || !tableId) return null;
  return { appToken, tableId };
}

function parseRecord(record: LarkRecord): Archive {
  const f = record.fields;
  const dateStr = String(f.date ?? "");
  const tagsStr = String(f.tags ?? "");
  return {
    id:             record.record_id,
    title:          String(f.title ?? ""),
    description:    String(f.description ?? "") || null,
    date:           dateStr ? new Date(dateStr + "T00:00:00") : new Date(),
    category:       (String(f.category ?? "OTHER") as ArchiveCategory),
    videoUrl:       String(f.videoUrl ?? "") || null,
    thumbnailUrl:   String(f.thumbnailUrl ?? "") || null,
    minutes:        String(f.minutes ?? "") || null,
    summary:        String(f.summary ?? "") || null,
    energyShare:    String(f.energyShare ?? "") || null,
    journalingTheme:String(f.journalingTheme ?? "") || null,
    isPublished:    String(f.isPublished) === "true",
    tags:           tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [],
  };
}

function toFields(validated: ArchiveInput) {
  return {
    title:          validated.title,
    description:    validated.description ?? "",
    date:           format(new Date(validated.date), "yyyy-MM-dd"),
    category:       validated.category,
    videoUrl:       validated.videoUrl ?? "",
    thumbnailUrl:   validated.thumbnailUrl ?? "",
    minutes:        validated.minutes ?? "",
    summary:        validated.summary ?? "",
    energyShare:    validated.energyShare ?? "",
    journalingTheme:validated.journalingTheme ?? "",
    isPublished:    validated.isPublished ? "true" : "false",
    tags:           validated.tags.join(", "),
  };
}

export async function createArchive(
  data: ArchiveInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();
    const validated = archiveSchema.parse(data);

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。外部サービス設定から全同期を実行してください。" };
    }
    const { appToken, tableId } = config;

    const id = await createRecord(appToken, tableId, toFields(validated));

    revalidatePath("/archive");
    revalidatePath("/home");
    revalidatePath("/admin/content/archives");

    return { success: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "作成に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateArchive(
  id: string,
  data: ArchiveInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const validated = archiveSchema.parse(data);

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。" };
    }
    const { appToken, tableId } = config;

    await updateRecord(appToken, tableId, id, toFields(validated));

    revalidatePath(`/archive/${id}`);
    revalidatePath("/archive");
    revalidatePath("/home");
    revalidatePath("/admin/content/archives");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function deleteArchive(
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

    revalidatePath("/archive");
    revalidatePath("/home");
    revalidatePath("/admin/content/archives");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "削除に失敗しました";
    return { success: false, error: message };
  }
}

export async function getArchiveForAdmin(id: string): Promise<Archive | null> {
  await requireAdmin();

  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const record = await getRecord(appToken, tableId, id);
  return record ? parseRecord(record) : null;
}

export async function getArchivesForAdmin(): Promise<Archive[]> {
  await requireAdmin();

  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const records = await listAllRecords(appToken, tableId);
  return records
    .map(parseRecord)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** 公開済みアーカイブ一覧（メンバー向け） */
export async function getPublishedArchives(limit?: number): Promise<Archive[]> {
  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const records = await listAllRecords(appToken, tableId, `CurrentValue.[isPublished]="true"`);
  const sorted = records
    .map(parseRecord)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}

/** 公開済み単一アーカイブ（メンバー向け） */
export async function getPublishedArchive(id: string): Promise<Archive | null> {
  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const record = await getRecord(appToken, tableId, id);
  if (!record) return null;
  const archive = parseRecord(record);
  return archive.isPublished ? archive : null;
}
