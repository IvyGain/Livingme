"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormDef } from "@/lib/form-defs";

async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function submitForm(
  slug: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const form = getFormDef(slug);
    if (!form) return { success: false, error: "フォームが見つかりません" };

    if (form.ambassadorOnly) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { ambassadorType: true },
      });
      if (!user?.ambassadorType) {
        return { success: false, error: "このフォームはアンバサダー限定です" };
      }
    }

    // 必須フィールドのバリデーション
    for (const field of form.fields) {
      if (field.required && !data[field.name]?.trim()) {
        return { success: false, error: `「${field.label}」を入力してください` };
      }
    }

    // Lark Base に非同期保存（エラーは無視してUXをブロックしない）
    void (async () => {
      try {
        const { getSetting } = await import("@/lib/settings");
        const { createRecord } = await import("@/lib/lark");
        const appToken = await getSetting("LARK_BASE_APP_TOKEN");
        const tableId = await getSetting("LARK_FORM_TABLE_ID");
        if (appToken && tableId) {
          await createRecord(appToken, tableId, {
            formId: slug,
            formTitle: form.title,
            userId: session.user.id,
            userName: session.user.name ?? "",
            answers: JSON.stringify(data),
            submittedAt: new Date().toISOString(),
          });
        }
      } catch {
        // Lark 保存失敗はサイレントに無視
      }
    })();

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "送信に失敗しました";
    return { success: false, error: message };
  }
}
