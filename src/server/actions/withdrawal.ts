"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function submitWithdrawalRequest(
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    // 既存のPENDING申請がないか確認
    const existing = await prisma.withdrawalRequest.findFirst({
      where: { userId: session.user!.id!, status: "PENDING" },
    });
    if (existing) {
      return { success: false, error: "既に退会申請が受け付けられています。" };
    }

    await prisma.withdrawalRequest.create({
      data: {
        userId: session.user!.id!,
        reason: reason || null,
      },
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "申請に失敗しました";
    return { success: false, error: message };
  }
}

export async function getWithdrawalRequests() {
  await requireAdmin();

  return prisma.withdrawalRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, joinedAt: true },
      },
    },
  });
}

export async function processWithdrawalRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const req = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });
    if (!req) return { success: false, error: "申請が見つかりません" };

    await prisma.$transaction([
      prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: "PROCESSED", processedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: req.userId },
        data: { isActive: false },
      }),
    ]);

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "処理に失敗しました";
    return { success: false, error: message };
  }
}
