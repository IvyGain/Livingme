"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  JOURNAL_MOOD_OPTIONS_KEY,
  DEFAULT_MOOD_OPTIONS,
} from "@/lib/journal-settings-types";

export async function getJournalMoodOptions(): Promise<string[]> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: JOURNAL_MOOD_OPTIONS_KEY },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_MOOD_OPTIONS;
}

export async function saveJournalMoodOptions(
  options: string[]
): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  await prisma.setting.upsert({
    where: { key: JOURNAL_MOOD_OPTIONS_KEY },
    update: { value: JSON.stringify(options) },
    create: {
      key: JOURNAL_MOOD_OPTIONS_KEY,
      value: JSON.stringify(options),
      isSecret: false,
      label: "ジャーナル気分選択肢",
    },
  });

  revalidatePath("/journal/new");
  revalidatePath("/admin/content/journal-settings");
}
