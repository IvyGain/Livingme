"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getPublishedEvent } from "@/server/actions/events";

async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ログインが必要です");
  return session;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("管理者権限が必要です");
  }
  return session;
}

export async function registerForEvent(
  eventId: string,
  answers: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const userId = session.user.id;

    // Lark からイベント情報を取得
    const event = await getPublishedEvent(eventId);
    if (!event) return { success: false, error: "イベントが見つかりません" };
    if (!event.registrationEnabled) return { success: false, error: "このイベントは申込受付中ではありません" };

    if (event.maxAttendees) {
      const count = await prisma.eventRegistration.count({ where: { eventId } });
      if (count >= event.maxAttendees) {
        return { success: false, error: "定員に達しています" };
      }
    }

    await prisma.eventRegistration.create({
      data: { eventId, userId, answers },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/admin/events");

    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, error: "すでに申し込み済みです" };
    }
    const message = error instanceof Error ? error.message : "申し込みに失敗しました";
    return { success: false, error: message };
  }
}

export async function cancelRegistration(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const userId = session.user.id;

    await prisma.eventRegistration.delete({
      where: { eventId_userId: { eventId, userId } },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/admin/events");

    return { success: true };
  } catch {
    return { success: false, error: "キャンセルに失敗しました" };
  }
}

export async function getMyRegistration(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
}

export async function getEventRegistrationsForAdmin(eventId: string) {
  await requireAdmin();

  return prisma.eventRegistration.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
