"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  SITE_THEME_KEY,
  DEFAULT_SITE_THEME,
  sanitizeSiteTheme,
  type SiteTheme,
} from "@/lib/site-theme-types";

export async function getSiteTheme(): Promise<SiteTheme> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SITE_THEME_KEY } });
    if (!row?.value) return DEFAULT_SITE_THEME;
    const parsed = JSON.parse(row.value);
    return sanitizeSiteTheme(parsed);
  } catch {
    return DEFAULT_SITE_THEME;
  }
}

export async function saveSiteTheme(
  input: Partial<SiteTheme>,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const clean = sanitizeSiteTheme(input);

  await prisma.setting.upsert({
    where: { key: SITE_THEME_KEY },
    update: { value: JSON.stringify(clean) },
    create: {
      key: SITE_THEME_KEY,
      value: JSON.stringify(clean),
      isSecret: false,
      label: "サイトテーマ",
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
