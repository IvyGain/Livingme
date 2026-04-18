import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSetting, clearSettingsCache } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/lark?action=test
 * Lark API への接続テスト（access_token が取得できるか確認）
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action !== "test") {
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  try {
    const { getAppAccessToken } = await import("@/lib/lark");
    await getAppAccessToken();
    return NextResponse.json({ ok: true, message: "接続成功" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message });
  }
}

// ---------- テーブル定義 ----------

const LARK_TABLES = [
  {
    name: "チャンネル",
    settingKey: "LARK_CHAT_CHANNEL_TABLE_ID" as const,
    label: "Lark チャンネルテーブルID",
    fields: [
      { field_name: "name",        type: 1 },
      { field_name: "description", type: 1 },
      { field_name: "channelId",   type: 1 },
      { field_name: "createdAt",   type: 1 },
    ],
  },
  {
    name: "メッセージ",
    settingKey: "LARK_CHAT_MESSAGE_TABLE_ID" as const,
    label: "Lark メッセージテーブルID",
    fields: [
      { field_name: "channelId",  type: 1 },
      { field_name: "userId",     type: 1 },
      { field_name: "userName",   type: 1 },
      { field_name: "content",    type: 1 },
      { field_name: "parentId",   type: 1 },
      { field_name: "createdAt",  type: 1 },
    ],
  },
  {
    name: "ジャーナル",
    settingKey: "LARK_JOURNAL_TABLE_ID" as const,
    label: "Lark ジャーナルテーブルID",
    fields: [
      { field_name: "userId",    type: 1 },
      { field_name: "userName",  type: 1 },
      { field_name: "date",      type: 1 },
      { field_name: "body",      type: 1 },
      { field_name: "mood",      type: 1 },
      { field_name: "createdAt", type: 1 },
    ],
  },
  {
    name: "フォーム申請",
    settingKey: "LARK_FORM_TABLE_ID" as const,
    label: "Lark フォームテーブルID",
    fields: [
      { field_name: "formId",      type: 1 },
      { field_name: "formTitle",   type: 1 },
      { field_name: "userId",      type: 1 },
      { field_name: "userName",    type: 1 },
      { field_name: "answers",     type: 1 },
      { field_name: "submittedAt", type: 1 },
    ],
  },
  {
    name: "アーカイブ",
    settingKey: "LARK_ARCHIVE_TABLE_ID" as const,
    label: "Lark アーカイブテーブルID",
    fields: [
      { field_name: "title",          type: 1 },
      { field_name: "description",    type: 1 },
      { field_name: "date",           type: 1 },
      { field_name: "category",       type: 1 },
      { field_name: "videoUrl",       type: 1 },
      { field_name: "thumbnailUrl",   type: 1 },
      { field_name: "minutes",        type: 1 },
      { field_name: "summary",        type: 1 },
      { field_name: "energyShare",    type: 1 },
      { field_name: "journalingTheme",type: 1 },
      { field_name: "isPublished",    type: 1 },
      { field_name: "tags",           type: 1 },
    ],
  },
  {
    name: "今日のコンテンツ",
    settingKey: "LARK_TODAY_CONTENT_TABLE_ID" as const,
    label: "Lark 今日のコンテンツテーブルID",
    fields: [
      { field_name: "date",            type: 1 },
      { field_name: "energyShare",     type: 1 },
      { field_name: "journalingTheme", type: 1 },
      { field_name: "morningNote",     type: 1 },
      { field_name: "isPublished",     type: 1 },
      { field_name: "publishedAt",     type: 1 },
    ],
  },
  {
    name: "イベント",
    settingKey: "LARK_EVENT_TABLE_ID" as const,
    label: "Lark イベントテーブルID",
    fields: [
      { field_name: "title",               type: 1 },
      { field_name: "description",         type: 1 },
      { field_name: "eventType",           type: 1 },
      { field_name: "startsAt",            type: 1 },
      { field_name: "endsAt",              type: 1 },
      { field_name: "location",            type: 1 },
      { field_name: "meetingUrl",          type: 1 },
      { field_name: "isPublished",         type: 1 },
      { field_name: "maxAttendees",        type: 1 },
      { field_name: "registrationEnabled", type: 1 },
      { field_name: "registrationFields",  type: 1 },
    ],
  },
  {
    name: "コラム",
    settingKey: "LARK_COLUMN_TABLE_ID" as const,
    label: "Lark コラムテーブルID",
    fields: [
      { field_name: "title",       type: 1 },
      { field_name: "body",        type: 1 },
      { field_name: "authorId",    type: 1 },
      { field_name: "isPublished", type: 1 },
      { field_name: "publishedAt", type: 1 },
      { field_name: "createdAt",   type: 1 },
    ],
  },
];

/**
 * POST /api/admin/lark
 * body: { action: "setup" | "sync-all" }
 *
 * setup    — 全テーブルを作成して ID を Setting に保存
 * sync-all — setup + Neon の既存データを Lark にプッシュ
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action !== "setup" && body.action !== "sync-all") {
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  try {
    const { createTable, listTables, ensureFields, batchCreateRecords } = await import("@/lib/lark");

    const appToken = await getSetting("LARK_BASE_APP_TOKEN");
    if (!appToken) {
      return NextResponse.json(
        { ok: false, error: "LARK_BASE_APP_TOKEN が設定されていません" },
        { status: 400 },
      );
    }

    // ── Step 1: 全テーブルを ensureTable ─────────────────────
    const existingTables = await listTables(appToken);
    const tableIdMap: Record<string, string> = {};

    for (const def of LARK_TABLES) {
      const saved = await getSetting(def.settingKey);
      // Lark Base に同名テーブルがあるか確認
      const found = existingTables.find((t) => t.name === def.name);
      const tableId = saved ?? (found ? found.table_id : await createTable(appToken, def.name, def.fields));

      // 既存テーブルに不足フィールドを追加（FieldNameNotFound 防止）
      await ensureFields(appToken, tableId, def.fields);

      await prisma.setting.upsert({
        where: { key: def.settingKey },
        update: { value: tableId, isSecret: false, label: def.label },
        create: { key: def.settingKey, value: tableId, isSecret: false, label: def.label },
      });
      tableIdMap[def.settingKey] = tableId;
    }

    clearSettingsCache();

    if (body.action === "setup") {
      return NextResponse.json({ ok: true, message: "全テーブルのセットアップ完了", tableIdMap });
    }

    // ── Step 2: sync-all — Neon データを Lark にプッシュ ──────
    // Archive / TodayContent / Event / Column は Lark Base に移行済みのため除外
    const counts: Record<string, number> = {};

    // チャットチャンネル
    const channels = await prisma.chatChannel.findMany({ where: { isArchived: false } });
    if (channels.length > 0) {
      const chTableId = tableIdMap["LARK_CHAT_CHANNEL_TABLE_ID"];
      await batchCreateRecords(
        appToken,
        chTableId,
        channels.map((ch) => ({
          name:        ch.name,
          description: ch.description ?? "",
          channelId:   ch.id,
          createdAt:   ch.createdAt.toISOString(),
        })),
      );
      counts.channels = channels.length;
    }

    return NextResponse.json({
      ok: true,
      message: "Lark Base 全同期完了",
      counts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
