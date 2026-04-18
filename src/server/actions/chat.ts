"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ChatChannel, ChatMessage, MemberTag } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ---------- 型定義 ----------

export type MessageWithMeta = ChatMessage & {
  user: { id: string; name: string | null; avatarUrl: string | null };
  _count: { replies: number };
};

export interface GetMessagesResult {
  messages: MessageWithMeta[];
  nextCursor?: string;
}

// ---------- 認証ヘルパー ----------

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

async function requireAdmin() {
  const session = await requireSession();
  if (session.user?.role !== "ADMIN") redirect("/");
  return session;
}

// ---------- Actions ----------

/** ロール階層: 数値が大きいほど権限が高い */
const ROLE_RANK: Record<string, number> = {
  FREE_MEMBER: 1,
  MEMBER: 2,
  ADMIN: 3,
};

function hasAccess(userRole: string, requiredRole: string | null): boolean {
  if (!requiredRole) return true;
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[requiredRole] ?? 99);
}

/**
 * 自分のロールで閲覧可能なチャンネルを取得（アーカイブ除く）
 */
export async function getChannels(): Promise<ChatChannel[]> {
  const session = await requireSession();
  const userRole = session.user?.role ?? "FREE_MEMBER";

  const all = await prisma.chatChannel.findMany({
    where: { isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return all.filter((ch) => hasAccess(userRole, ch.requiredRole));
}

/**
 * チャンネルを作成（ADMIN のみ）
 * requiredRole: null=全員閲覧可, "FREE_MEMBER"=無料以上, "MEMBER"=有料以上, "ADMIN"=管理者のみ
 * writeRole:    null=全員書き込み可, "FREE_MEMBER"=無料以上, "MEMBER"=有料以上, "ADMIN"=管理者のみ
 */
export async function createChannel(
  name: string,
  description?: string,
  requiredRole?: string | null,
  writeRole?: string | null,
): Promise<ChatChannel> {
  await requireAdmin();

  return prisma.chatChannel.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      requiredRole: (requiredRole as import("@prisma/client").UserRole) ?? null,
      writeRole:    (writeRole    as import("@prisma/client").UserRole) ?? null,
    },
  });
}

/**
 * メッセージ一覧を取得（最新 50 件、カーソルページネーション）
 * cursor は最古メッセージの createdAt ISO 文字列
 */
export async function getMessages(
  channelId: string,
  cursor?: string,
): Promise<GetMessagesResult> {
  await requireSession();

  const messages = await prisma.chatMessage.findMany({
    where: {
      channelId,
      parentId: null, // スレッドの親メッセージのみ
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { replies: true } },
    },
  });

  const nextCursor =
    messages.length === 50
      ? messages[messages.length - 1].createdAt.toISOString()
      : undefined;

  return { messages, nextCursor };
}

/**
 * メッセージを送信
 * Lark Base へのバックグラウンド同期（非同期、エラーは無視）
 */
export async function sendMessage(
  channelId: string,
  content: string,
  parentId?: string,
): Promise<ChatMessage> {
  const session = await requireSession();
  const userId = session.user!.id!;

  // チャンネル存在確認 + アクセス権チェック
  const channel = await prisma.chatChannel.findUnique({ where: { id: channelId } });
  if (!channel || channel.isArchived) {
    throw new Error("チャンネルが見つかりません");
  }
  const userRole = session.user?.role ?? "FREE_MEMBER";
  if (!hasAccess(userRole, channel.requiredRole)) {
    throw new Error("このチャンネルを閲覧する権限がありません");
  }
  // 書き込み権限チェック（writeRole が設定されている場合）
  if (!hasAccess(userRole, channel.writeRole)) {
    throw new Error("このチャンネルへの書き込み権限がありません");
  }

  const message = await prisma.chatMessage.create({
    data: {
      channelId,
      userId,
      content: content.trim(),
      parentId: parentId ?? null,
    },
  });

  // Lark Base への非同期同期（awaiting しない）
  void syncMessageToLark(message, session.user?.name ?? null);

  return message;
}

/**
 * スレッドのリプライを取得
 */
export async function getThreadReplies(parentId: string): Promise<MessageWithMeta[]> {
  await requireSession();
  return prisma.chatMessage.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { replies: true } },
    },
  });
}

/**
 * チャンネルを削除（ADMIN のみ）
 */
export async function deleteChannel(channelId: string): Promise<void> {
  await requireAdmin();
  await prisma.chatChannel.delete({ where: { id: channelId } });
}

// ---------- 会員タグ ----------

export type TagWithCount = MemberTag & { _count: { users: number } };

export async function getAllTags(): Promise<TagWithCount[]> {
  await requireAdmin();
  return prisma.memberTag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
}

export async function createTag(name: string, color?: string): Promise<MemberTag> {
  await requireAdmin();
  const tag = await prisma.memberTag.create({
    data: { name: name.trim(), color: color ?? "#9a8070" },
  });
  revalidatePath("/admin/members");
  return tag;
}

export async function deleteTag(tagId: string): Promise<void> {
  await requireAdmin();
  await prisma.memberTag.delete({ where: { id: tagId } });
  revalidatePath("/admin/members");
}

export async function addTagToUser(userId: string, tagId: string): Promise<void> {
  await requireAdmin();
  await prisma.userMemberTag.upsert({
    where: { userId_tagId: { userId, tagId } },
    create: { userId, tagId },
    update: {},
  });
  revalidatePath("/admin/members");
}

export async function removeTagFromUser(userId: string, tagId: string): Promise<void> {
  await requireAdmin();
  await prisma.userMemberTag.deleteMany({ where: { userId, tagId } });
  revalidatePath("/admin/members");
}

export async function getUserTags(userId: string): Promise<MemberTag[]> {
  const rows = await prisma.userMemberTag.findMany({
    where: { userId },
    include: { tag: true },
  });
  return rows.map((r) => r.tag);
}

// ---------- Lark 同期（内部） ----------

async function syncMessageToLark(
  message: ChatMessage,
  userName: string | null,
): Promise<void> {
  try {
    const { getSetting } = await import("@/lib/settings");
    const { createRecord } = await import("@/lib/lark");

    const appToken = await getSetting("LARK_BASE_APP_TOKEN");
    const tableId = await getSetting("LARK_CHAT_MESSAGE_TABLE_ID");

    if (!appToken || !tableId) return;

    await createRecord(appToken, tableId, {
      channelId: message.channelId,
      userId: message.userId,
      userName: userName ?? "",
      content: message.content,
      parentId: message.parentId ?? "",
      createdAt: message.createdAt.toISOString(),
    });
  } catch {
    // Lark 同期エラーは無視（チャット機能に影響させない）
  }
}
