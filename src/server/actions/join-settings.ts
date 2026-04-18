"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_JOIN_SETTINGS,
  JOIN_SETTINGS_KEY,
  type JoinPageSettings,
} from "@/lib/join-settings";

export async function getJoinSettings(): Promise<JoinPageSettings> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: JOIN_SETTINGS_KEY },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      return {
        plans: parsed.plans ?? DEFAULT_JOIN_SETTINGS.plans,
        footerText: parsed.footerText ?? DEFAULT_JOIN_SETTINGS.footerText,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_JOIN_SETTINGS;
}

export async function saveJoinSettings(settings: JoinPageSettings): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  await prisma.setting.upsert({
    where: { key: JOIN_SETTINGS_KEY },
    update: { value: JSON.stringify(settings) },
    create: {
      key: JOIN_SETTINGS_KEY,
      value: JSON.stringify(settings),
      isSecret: false,
      label: "申し込みページ設定",
    },
  });

  revalidatePath("/join");
  revalidatePath("/admin/content/join-settings");
}
