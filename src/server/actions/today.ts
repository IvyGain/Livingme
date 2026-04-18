"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfDay, format } from "date-fns";
import { getSetting } from "@/lib/settings";
import { createRecord, updateRecord, listRecords, listAllRecords } from "@/lib/lark";
import type { LarkRecord } from "@/lib/lark";
import type { TodayContent } from "@/lib/content-types";

const todayContentSchema = z.object({
  date:           z.string().min(1, "日付は必須です"),
  energyShare:    z.string().optional(),
  journalingTheme:z.string().optional(),
  morningNote:    z.string().optional(),
  isPublished:    z.boolean().default(false),
  // エネルギーシェア構造化フィールド
  mayanInfo:      z.string().optional(),
  mayanBlackKin:  z.boolean().optional(),
  moonPhase:      z.enum(["full", "new"]).nullable().optional(),
  title:          z.string().optional(),
  column:         z.string().optional(),
  symbolNote:     z.string().optional(),
  todayPoint:     z.string().optional(),
});

export type TodayContentInput = z.infer<typeof todayContentSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

async function getTableConfig() {
  const appToken = await getSetting("LARK_BASE_APP_TOKEN");
  const tableId = await getSetting("LARK_TODAY_CONTENT_TABLE_ID");
  if (!appToken || !tableId) return null;
  return { appToken, tableId };
}

function parseRecord(record: LarkRecord): TodayContent {
  const f = record.fields;
  const dateStr = String(f.date ?? "");
  const rawMoon = String(f.moonPhase ?? "").toLowerCase();
  const moonPhase: TodayContent["moonPhase"] =
    rawMoon === "full" ? "full" : rawMoon === "new" ? "new" : null;
  return {
    id:             record.record_id,
    date:           dateStr ? new Date(dateStr + "T00:00:00") : new Date(),
    energyShare:    String(f.energyShare ?? "") || null,
    journalingTheme:String(f.journalingTheme ?? "") || null,
    morningNote:    String(f.morningNote ?? "") || null,
    isPublished:    String(f.isPublished) === "true",
    mayanInfo:      String(f.mayanInfo ?? "") || null,
    mayanBlackKin:  String(f.mayanBlackKin) === "true",
    moonPhase,
    title:          String(f.title ?? "") || null,
    column:         String(f.column ?? "") || null,
    symbolNote:     String(f.symbolNote ?? "") || null,
    todayPoint:     String(f.todayPoint ?? "") || null,
  };
}

async function findByDate(
  appToken: string,
  tableId: string,
  dateStr: string,
): Promise<LarkRecord | null> {
  const { records } = await listRecords(appToken, tableId, {
    filter: `CurrentValue.[date]="${dateStr}"`,
    pageSize: 1,
  });
  return records[0] ?? null;
}

export async function upsertTodayContent(
  data: TodayContentInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const validated = todayContentSchema.parse(data);
    const date = startOfDay(new Date(validated.date));
    const dateStr = format(date, "yyyy-MM-dd");

    const config = await getTableConfig();
    if (!config) {
      return { success: false, error: "Lark テーブルが未設定です。外部サービス設定から全同期を実行してください。" };
    }
    const { appToken, tableId } = config;

    const fields = {
      date:           dateStr,
      energyShare:    validated.energyShare ?? "",
      journalingTheme:validated.journalingTheme ?? "",
      morningNote:    validated.morningNote ?? "",
      isPublished:    validated.isPublished ? "true" : "false",
      publishedAt:    validated.isPublished ? new Date().toISOString() : "",
      mayanInfo:      validated.mayanInfo ?? "",
      mayanBlackKin:  validated.mayanBlackKin ? "true" : "false",
      moonPhase:      validated.moonPhase ?? "",
      title:          validated.title ?? "",
      column:         validated.column ?? "",
      symbolNote:     validated.symbolNote ?? "",
      todayPoint:     validated.todayPoint ?? "",
    };

    const existing = await findByDate(appToken, tableId, dateStr);
    if (existing) {
      await updateRecord(appToken, tableId, existing.record_id, fields);
    } else {
      await createRecord(appToken, tableId, fields);
    }

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/content/today");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました";
    return { success: false, error: message };
  }
}

export async function getTodayContentForAdmin(date?: string): Promise<TodayContent | null> {
  await requireAdmin();

  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const targetDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());
  const dateStr = format(targetDate, "yyyy-MM-dd");

  const record = await findByDate(appToken, tableId, dateStr);
  return record ? parseRecord(record) : null;
}

/** メンバー向け: 今日または最新の公開コンテンツを取得 */
export async function getTodayContentForMember(): Promise<TodayContent | null> {
  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");

  const { records: todayRecords } = await listRecords(appToken, tableId, {
    filter: `AND(CurrentValue.[date]="${todayStr}",CurrentValue.[isPublished]="true")`,
    pageSize: 1,
  });
  if (todayRecords[0]) return parseRecord(todayRecords[0]);

  const all = await listAllRecords(appToken, tableId, `CurrentValue.[isPublished]="true"`);
  if (all.length === 0) return null;

  return all
    .map(parseRecord)
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}

/** 公開済みエネルギーシェア一覧を取得（日付降順） */
export async function getPublishedEnergyShares(): Promise<TodayContent[]> {
  const config = await getTableConfig();
  if (!config) return [];
  const { appToken, tableId } = config;

  const all = await listAllRecords(appToken, tableId, `AND(CurrentValue.[isPublished]="true",CurrentValue.[energyShare]!="")`);
  return all
    .map(parseRecord)
    .filter((r) => r.energyShare)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** 特定日のジャーナリングテーマを取得（ジャーナルページ用）*/
export async function getTodayThemeForDate(dateStr: string): Promise<string | null> {
  const config = await getTableConfig();
  if (!config) return null;
  const { appToken, tableId } = config;

  const record = await findByDate(appToken, tableId, dateStr);
  return record ? (String(record.fields.journalingTheme ?? "") || null) : null;
}
