"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  dynamicFormSchema,
  type DynamicFormInput,
  type DynamicFormField,
} from "@/lib/dynamic-form-types";

const MAX_TEXT_LEN = 5000;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T.*)?$/;

function buildSubmissionSchema(fields: DynamicFormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodTypeAny;
    switch (f.type) {
      case "select":
        s = z.string().refine(
          (v) => !v || (f.options ?? []).includes(v),
          { message: `${f.label}: 不正な選択肢です` },
        );
        break;
      case "date":
        s = z.string().refine(
          (v) => !v || ISO_DATE_RE.test(v),
          { message: `${f.label}: 日付形式が不正です` },
        );
        break;
      case "text":
      case "textarea":
      default:
        s = z.string().max(MAX_TEXT_LEN, `${f.label}: ${MAX_TEXT_LEN}文字以内で入力してください`);
        break;
    }
    if (!f.required) s = s.optional().default("");
    shape[f.name] = s;
  }
  return z.object(shape).strict();
}

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
  data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };
  if (session.user.isActive === false) {
    return { success: false, error: "アカウントが無効です" };
  }

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

  // ── 動的 Zod スキーマで送信値を検証（未定義キーは reject、型/長さ/選択肢チェック） ──
  const submissionSchema = buildSubmissionSchema(form.fields);
  const parsed = submissionSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "入力内容に誤りがあります" };
  }
  const safeData = parsed.data as Record<string, string>;

  // 必須チェック（trim 後の空文字を弾く）
  for (const field of form.fields) {
    if (field.required && !String(safeData[field.name] ?? "").trim()) {
      return { success: false, error: `「${field.label}」を入力してください` };
    }
  }

  // ── Lark 保存（テーブル ID が指定されていれば）──
  let larkWarning: string | undefined;
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
        answers: JSON.stringify(safeData),
        submittedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[dynamic-form] Lark sync failed:", err instanceof Error ? err.message : err);
    larkWarning = "外部連携に失敗しましたが、申込は受け付けられました";
  }

  return larkWarning ? { success: true, warning: larkWarning } : { success: true };
}
