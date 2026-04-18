"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { clearSettingsCache, SETTING_META, type SettingKey } from "@/lib/settings";
import { redirect } from "next/navigation";

export async function saveSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const entries = Array.from(formData.entries()) as [string, string][];

  for (const [key, rawValue] of entries) {
    if (!(key in SETTING_META)) continue;
    const meta = SETTING_META[key as SettingKey];

    // 空文字・マスク値はスキップ（変更なし）
    if (!rawValue || rawValue === "••••••••") continue;

    const value = meta.isSecret ? encrypt(rawValue) : rawValue;

    await prisma.setting.upsert({
      where: { key },
      update: { value, isSecret: meta.isSecret, label: meta.label },
      create: { key, value, isSecret: meta.isSecret, label: meta.label },
    });
  }

  clearSettingsCache();
  redirect("/admin/settings?saved=1");
}

export async function getSettingsForAdmin(): Promise<Record<string, { value: string; isSecret: boolean; label: string; group: string }>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const rows = await prisma.setting.findMany();
  const dbMap = Object.fromEntries(rows.map((r) => [r.key, r]));

  const result: Record<string, { value: string; isSecret: boolean; label: string; group: string }> = {};

  for (const [key, meta] of Object.entries(SETTING_META) as [SettingKey, typeof SETTING_META[SettingKey]][]) {
    const dbRow = dbMap[key];
    const hasValue = !!dbRow || !!process.env[key];
    result[key] = {
      value: hasValue ? (meta.isSecret ? "••••••••" : (dbRow?.value ?? process.env[key] ?? "")) : "",
      isSecret: meta.isSecret,
      label: meta.label,
      group: meta.group,
    };
  }

  return result;
}
