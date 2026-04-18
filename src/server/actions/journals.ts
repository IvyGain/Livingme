"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfDay, format } from "date-fns";
import { getSetting } from "@/lib/settings";
import { createRecord, updateRecord, deleteRecord, listRecords, LarkRecord } from "@/lib/lark";

const journalSchema = z.object({
  body: z.string().trim().min(1, "内容を入力してください"),
  mood: z.string().optional(),
  date: z.string().optional(),
});

async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function getTableConfig() {
  const appToken = await getSetting("LARK_BASE_APP_TOKEN");
  const tableId = await getSetting("LARK_JOURNAL_TABLE_ID");
  if (!appToken || !tableId) throw new Error("Lark ジャーナルテーブルが未設定です。管理画面でセットアップしてください。");
  return { appToken, tableId };
}

/** 特定ユーザー・特定日付のジャーナルレコードを検索 */
async function findRecord(appToken: string, tableId: string, userId: string, dateStr: string): Promise<LarkRecord | null> {
  const { records } = await listRecords(appToken, tableId, {
    filter: `AND(CurrentValue.[userId]="${userId}",CurrentValue.[date]="${dateStr}")`,
    pageSize: 1,
  });
  return records[0] ?? null;
}

export async function upsertJournal(
  data: z.infer<typeof journalSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const validated = journalSchema.parse(data);
    const date = startOfDay(data.date ? new Date(data.date) : new Date());
    const dateStr = format(date, "yyyy-MM-dd");

    const { appToken, tableId } = await getTableConfig();

    const fields = {
      userId: session.user.id,
      userName: session.user.name ?? "",
      date: dateStr,
      body: validated.body,
      mood: validated.mood ?? "",
      createdAt: new Date().toISOString(),
    };

    const existing = await findRecord(appToken, tableId, session.user.id, dateStr);
    if (existing) {
      await updateRecord(appToken, tableId, existing.record_id, fields);
    } else {
      await createRecord(appToken, tableId, fields);
    }

    revalidatePath("/journal");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました";
    return { success: false, error: message };
  }
}

export async function deleteJournal(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const { appToken, tableId } = await getTableConfig();

    // 自分のレコードか確認（filterで絞り込み）
    const { records } = await listRecords(appToken, tableId, {
      filter: `CurrentValue.[userId]="${session.user.id}"`,
      pageSize: 100,
    });
    const owned = records.find(r => r.record_id === recordId);
    if (!owned) {
      return { success: false, error: "見つかりません" };
    }

    await deleteRecord(appToken, tableId, recordId);
    revalidatePath("/journal");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "削除に失敗しました";
    return { success: false, error: message };
  }
}

/** 一覧取得（ジャーナルページ用）*/
export async function getJournals(userId: string): Promise<{
  record_id: string;
  body: string;
  mood: string;
  date: Date;
}[]> {
  try {
    const appToken = await getSetting("LARK_BASE_APP_TOKEN");
    const tableId = await getSetting("LARK_JOURNAL_TABLE_ID");
    if (!appToken || !tableId) return [];

    const { records } = await listRecords(appToken, tableId, {
      filter: `CurrentValue.[userId]="${userId}"`,
      pageSize: 50,
    });

    return records
      .map(r => ({
        record_id: r.record_id,
        body: String(r.fields.body ?? ""),
        mood: String(r.fields.mood ?? ""),
        date: new Date(String(r.fields.date) + "T00:00:00"),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch {
    return [];
  }
}

/** 特定日付のジャーナル取得（編集ページ用）*/
export async function getJournalByDate(userId: string, dateStr: string): Promise<{
  record_id: string;
  body: string;
  mood: string;
} | null> {
  try {
    const appToken = await getSetting("LARK_BASE_APP_TOKEN");
    const tableId = await getSetting("LARK_JOURNAL_TABLE_ID");
    if (!appToken || !tableId) return null;

    const record = await findRecord(appToken, tableId, userId, dateStr);
    if (!record) return null;
    return {
      record_id: record.record_id,
      body: String(record.fields.body ?? ""),
      mood: String(record.fields.mood ?? ""),
    };
  } catch {
    return null;
  }
}
