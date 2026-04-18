"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEFAULT_LP_SETTINGS, LP_SETTINGS_KEY, type LPSettings } from "@/lib/lp-settings";

export async function getLPSettings(): Promise<LPSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: LP_SETTINGS_KEY } });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      return {
        ...DEFAULT_LP_SETTINGS,
        ...parsed,
        sections: (parsed.sections ?? DEFAULT_LP_SETTINGS.sections).map(
          (sec: Record<string, unknown>) => ({
            bgImageUrl: "",
            ...sec,
          })
        ),
        videos: parsed.videos ?? [],
        concepts: parsed.concepts ?? DEFAULT_LP_SETTINGS.concepts,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_LP_SETTINGS;
}

export async function saveLPSettings(settings: LPSettings): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  await prisma.setting.upsert({
    where: { key: LP_SETTINGS_KEY },
    update: { value: JSON.stringify(settings) },
    create: {
      key: LP_SETTINGS_KEY,
      value: JSON.stringify(settings),
      isSecret: false,
      label: "LP設定",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/lp-settings");
}
