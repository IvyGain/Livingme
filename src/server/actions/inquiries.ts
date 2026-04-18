"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

/** 公開フォームからの問い合わせ送信 */
export async function submitInquiry(formData: {
  name: string;
  email: string;
  subject: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!formData.name.trim() || !formData.email.trim() || !formData.body.trim()) {
      return { success: false, error: "必須項目を入力してください" };
    }

    await prisma.contactInquiry.create({
      data: {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim() || "お問い合わせ",
        body: formData.body.trim(),
      },
    });

    // 管理者へ通知メール
    const adminEmail = process.env.GMAIL_USER;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `【Living Me】新しいお問い合わせ: ${formData.subject || "お問い合わせ"}`,
        html: `
          <p>新しいお問い合わせが届きました。</p>
          <p><strong>氏名:</strong> ${escapeHtml(formData.name)}<br/>
          <strong>メール:</strong> ${escapeHtml(formData.email)}<br/>
          <strong>件名:</strong> ${escapeHtml(formData.subject || "（未入力）")}</p>
          <p><strong>内容:</strong><br/>${escapeHtml(formData.body).replace(/\n/g, "<br/>")}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/inquiries">管理画面で確認する</a></p>
        `,
      }).catch(() => {/* 通知失敗しても問い合わせ保存は成功 */});
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "送信に失敗しました";
    return { success: false, error: message };
  }
}

/** 問い合わせ一覧 */
export async function getInquiries() {
  await requireAdmin();
  return prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });
}

/** 返信を送信してメールも送る */
export async function replyToInquiry(
  inquiryId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const inquiry = await prisma.contactInquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) return { success: false, error: "問い合わせが見つかりません" };

    let sentByEmail = false;
    try {
      await sendEmail({
        to: inquiry.email,
        subject: `Re: ${inquiry.subject} — Living Me`,
        html: `
          <p>${escapeHtml(inquiry.name)} 様</p>
          <p>${escapeHtml(content).replace(/\n/g, "<br/>")}</p>
          <hr style="border:none;border-top:1px solid #e0d6ce;margin:24px 0;" />
          <p style="font-size:12px;color:#9a8070;">Living Me サポート</p>
        `,
      });
      sentByEmail = true;
    } catch {
      // メール送信失敗しても返信は保存
    }

    await prisma.$transaction([
      prisma.inquiryReply.create({
        data: { inquiryId, content, sentByEmail },
      }),
      prisma.contactInquiry.update({
        where: { id: inquiryId },
        data: { status: "REPLIED" },
      }),
    ]);

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "返信に失敗しました";
    return { success: false, error: message };
  }
}

/** ステータス変更 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: "OPEN" | "REPLIED" | "CLOSED"
): Promise<{ success: boolean }> {
  await requireAdmin();
  await prisma.contactInquiry.update({ where: { id: inquiryId }, data: { status } });
  revalidatePath("/admin/inquiries");
  return { success: true };
}
