"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  REWARD_SETTINGS_KEY,
  DEFAULT_REWARD_SETTINGS,
  type RewardSettings,
} from "@/lib/reward-settings-types";

export async function getRewardSettings(): Promise<RewardSettings> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: REWARD_SETTINGS_KEY },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      // Merge over defaults so older records (without maxReferrals)
      // transparently get null (= unlimited).
      return {
        FREE:     { ...DEFAULT_REWARD_SETTINGS.FREE,     ...parsed.FREE },
        REFERRAL: { ...DEFAULT_REWARD_SETTINGS.REFERRAL, ...parsed.REFERRAL },
        PARTNER:  { ...DEFAULT_REWARD_SETTINGS.PARTNER,  ...parsed.PARTNER },
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_REWARD_SETTINGS;
}

export async function saveRewardSettings(
  settings: RewardSettings,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // 人数上限を下げる場合、現在の紹介者数を下回っていないか検証
  const statuses: (keyof RewardSettings)[] = ["FREE", "REFERRAL", "PARTNER"];
  for (const status of statuses) {
    const cap = settings[status].maxReferrals;
    if (cap === null) continue;
    if (!Number.isInteger(cap) || cap < 0) {
      return {
        success: false,
        error: `${status}: 人数上限は 0 以上の整数で指定してください`,
      };
    }

    const ambassadorType = status === "FREE" ? "FREE" : status;
    const usersOverCap = await prisma.user.findMany({
      where: { ambassadorType: ambassadorType as "FREE" | "REFERRAL" | "PARTNER" },
      select: { _count: { select: { referrals: true } } },
    });
    const maxInUse = usersOverCap.reduce(
      (max, u) => Math.max(max, u._count.referrals),
      0,
    );
    if (cap < maxInUse) {
      return {
        success: false,
        error: `${status}: 既に ${maxInUse} 名紹介しているメンバーがいます。上限は ${maxInUse} 以上に設定してください。`,
      };
    }
  }

  await prisma.setting.upsert({
    where: { key: REWARD_SETTINGS_KEY },
    update: { value: JSON.stringify(settings) },
    create: {
      key: REWARD_SETTINGS_KEY,
      value: JSON.stringify(settings),
      isSecret: false,
      label: "報酬単価設定",
    },
  });

  revalidatePath("/admin/referrals");
  return { success: true };
}
