"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  dynamicFieldSchema,
  dynamicFormSchema,
  type DynamicFormInput,
  type DynamicFormField,
} from "@/lib/dynamic-form-types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function listDynamicForms(): Promise<
  Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    fields: DynamicFormField[];
    ambassadorOnly: boolean;
    larkTableId: string | null;
    isPublished: boolean;
    sortOrder: number;
  }>
> {
  const rows = await prisma.dynamicForm.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    fields: Array.isArray(r.fields) ? (r.fields as DynamicFormField[]) : [],
    ambassadorOnly: r.ambassadorOnly,
    larkTableId: r.larkTableId ?? null,
    isPublished: r.isPublished,
    sortOrder: r.sortOrder,
  }));
}

export async function getDynamicFormBySlug(slug: string) {
  const row = await prisma.dynamicForm.findUnique({ where: { slug } });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    fields: Array.isArray(row.fields) ? (row.fields as DynamicFormField[]) : [],
    ambassadorOnly: row.ambassadorOnly,
    larkTableId: row.larkTableId ?? null,
    isPublished: row.isPublished,
  };
}

export async function createDynamicForm(
  data: DynamicFormInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();
    const v = dynamicFormSchema.parse(data);
    const existing = await prisma.dynamicForm.findUnique({ where: { slug: v.slug } });
    if (existing) {
      return { success: false, error: `slug "${v.slug}" は既に使われています` };
    }
    const created = await prisma.dynamicForm.create({ data: { ...v, fields: v.fields } });
    revalidatePath("/admin/content/forms");
    revalidatePath("/forms");
    return { success: true, id: created.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "作成に失敗しました",
    };
  }
}

export async function updateDynamicForm(
  id: string,
  data: DynamicFormInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const v = dynamicFormSchema.parse(data);
    await prisma.dynamicForm.update({
      where: { id },
      data: { ...v, fields: v.fields },
    });
    revalidatePath("/admin/content/forms");
    revalidatePath(`/forms/${v.slug}`);
    revalidatePath("/forms");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "更新に失敗しました",
    };
  }
}

export async function deleteDynamicForm(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await prisma.dynamicForm.delete({ where: { id } });
    revalidatePath("/admin/content/forms");
    revalidatePath("/forms");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "削除に失敗しました",
    };
  }
}

/** 認証済みユーザーが申請を送信 */
export async function submitDynamicForm(
  slug: string,
  data: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const form = await getDynamicFormBySlug(slug);
  if (!form || !form.isPublished) {
    return { success: false, error: "フォームが見つかりません" };
  }

  if (form.ambassadorOnly) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ambassadorType: true },
    });
    if (!user?.ambassadorType) {
      return { success: false, error: "このフォームはアンバサダー限定です" };
    }
  }

  for (const field of form.fields) {
    if (field.required && !data[field.name]?.trim()) {
      return { success: false, error: `「${field.label}」を入力してください` };
    }
  }

  // Lark 保存（テーブル ID が指定されていれば）
  void (async () => {
    try {
      const { getSetting } = await import("@/lib/settings");
      const { createRecord } = await import("@/lib/lark");
      const appToken = await getSetting("LARK_BASE_APP_TOKEN");
      const tableId =
        form.larkTableId || (await getSetting("LARK_FORM_TABLE_ID"));
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
      // ignore — UX をブロックしない
    }
  })();

  return { success: true };
}
