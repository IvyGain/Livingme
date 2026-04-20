"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormDef, type FormDef } from "@/lib/form-defs";

async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function resolveForm(
  slug: string,
): Promise<(FormDef & { larkTableId?: string | null }) | null> {
  // DB の動的フォームを優先
  const dynamic = await prisma.dynamicForm
    .findUnique({ where: { slug } })
    .catch(() => null);
  if (dynamic && dynamic.isPublished) {
    return {
      slug: dynamic.slug,
      title: dynamic.title,
      description: dynamic.description,
      fields: Array.isArray(dynamic.fields) ? (dynamic.fields as unknown as FormDef["fields"]) : [],
      ambassadorOnly: dynamic.ambassadorOnly,
      larkTableId: dynamic.larkTableId,
    };
  }
  return getFormDef(slug) ?? null;
}

export async function submitForm(
  slug: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireMember();
    const form = await resolveForm(slug);
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
    const formLarkTableId = (form as { larkTableId?: string | null }).larkTableId;
    void (async () => {
      try {
        const { getSetting } = await import("@/lib/settings");
        const { createRecord } = await import("@/lib/lark");
        const appToken = await getSetting("LARK_BASE_APP_TOKEN");
        const tableId =
          formLarkTableId || (await getSetting("LARK_FORM_TABLE_ID"));
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
