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

export async function saveRewardSettings(settings: RewardSettings): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

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
}
