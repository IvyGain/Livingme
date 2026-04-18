"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_SECTIONS,
  DEFAULT_COLOR_SCHEME_ID,
  DEFAULT_NAV_ITEMS,
  LAYOUT_SECTIONS_KEY,
  LAYOUT_COLOR_SCHEME_KEY,
  LAYOUT_NAV_ITEMS_KEY,
  type SectionConfig,
  type NavItemConfig,
} from "@/lib/home-layout";

export async function getHomeLayoutSettings(): Promise<{
  sections: SectionConfig[];
  colorSchemeId: string;
}> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [LAYOUT_SECTIONS_KEY, LAYOUT_COLOR_SCHEME_KEY] } },
  });

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  let sections: SectionConfig[] = DEFAULT_SECTIONS;
  try {
    if (map[LAYOUT_SECTIONS_KEY]) {
      sections = JSON.parse(map[LAYOUT_SECTIONS_KEY]);
    }
  } catch {
    sections = DEFAULT_SECTIONS;
  }

  return {
    sections,
    colorSchemeId: map[LAYOUT_COLOR_SCHEME_KEY] ?? DEFAULT_COLOR_SCHEME_ID,
  };
}

export async function getNavItems(): Promise<NavItemConfig[]> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: LAYOUT_NAV_ITEMS_KEY },
    });
    if (row?.value) {
      const parsed: NavItemConfig[] = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // DEFAULTに存在するがDBに未登録の項目を末尾に追加（新機能追加時の自動反映）
        const savedHrefs = new Set(parsed.map((i) => i.href));
        const newItems = DEFAULT_NAV_ITEMS.filter((i) => !savedHrefs.has(i.href));
        return newItems.length > 0 ? [...parsed, ...newItems] : parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_NAV_ITEMS;
}

export async function saveHomeLayoutSettings(
  sections: SectionConfig[],
  colorSchemeId: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  await prisma.setting.upsert({
    where: { key: LAYOUT_SECTIONS_KEY },
    update: { value: JSON.stringify(sections) },
    create: {
      key: LAYOUT_SECTIONS_KEY,
      value: JSON.stringify(sections),
      isSecret: false,
      label: "ホーム画面セクション設定",
    },
  });

  await prisma.setting.upsert({
    where: { key: LAYOUT_COLOR_SCHEME_KEY },
    update: { value: colorSchemeId },
    create: {
      key: LAYOUT_COLOR_SCHEME_KEY,
      value: colorSchemeId,
      isSecret: false,
      label: "ホーム画面カラースキーム",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/home-layout");
}

export async function saveNavItems(items: NavItemConfig[]): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  await prisma.setting.upsert({
    where: { key: LAYOUT_NAV_ITEMS_KEY },
    update: { value: JSON.stringify(items) },
    create: {
      key: LAYOUT_NAV_ITEMS_KEY,
      value: JSON.stringify(items),
      isSecret: false,
      label: "ホーム画面ナビゲーション設定",
    },
  });

  revalidatePath("/home");
  revalidatePath("/archive");
  revalidatePath("/events");
  revalidatePath("/journal");
  revalidatePath("/admin/home-layout");
}
