"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UserRole, AmbassadorType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function getMembers() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      role: true,
      ambassadorType: true,
      joinedAt: true,
      startDate: true,
      lastLoginAt: true,
      stripeCustomerId: true,
      createdAt: true,
      referrerId: true,
      referrer: { select: { id: true, name: true, email: true } },
      _count: { select: { referrals: true } },
      memberTags: { select: { tag: { select: { id: true, name: true, color: true } } } },
    },
  });
}

export async function updateMemberActive(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/admin/members");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateMemberRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/members");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateMemberInfo(
  userId: string,
  data: { name?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name || null },
    });

    revalidatePath("/admin/members");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateMemberStartDate(
  userId: string,
  startDate: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    let parsed: Date | null = null;
    if (startDate) {
      // Accept YYYY-MM-DD (input[type=date]) interpreted at local midnight.
      parsed = new Date(`${startDate}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return { success: false, error: "日付の形式が不正です" };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { startDate: parsed },
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

export async function updateMemberAmbassadorType(
  userId: string,
  ambassadorType: AmbassadorType | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { ambassadorType },
    });
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return { success: false, error: message };
  }
}

/** 紹介関係一覧（紹介報酬管理用） */
export async function getReferralReport() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { referrals: { some: {} } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      ambassadorType: true,
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          joinedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { referrals: true } },
    },
  });
}

export async function getMemberStats() {
  await requireAdmin();

  const [total, active, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return { total, active, inactive };
}
