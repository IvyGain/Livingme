import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildInviteEmailHtml } from "@/lib/email";
import type { UserRole } from "@prisma/client";

const EXPIRES_HOURS = 72;

export async function POST(req: NextRequest) {
  // 管理者のみ許可
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
  }

  // role は "ADMIN" または "MEMBER" のみ許可（それ以外は MEMBER にフォールバック）
  const requestedRole = body.role === "ADMIN" ? "ADMIN" : "MEMBER";
  const role: UserRole = requestedRole;

  // 既存の未使用トークンを無効化（同一メール宛の招待を再送する場合）
  await prisma.inviteToken.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRES_HOURS * 60 * 60 * 1000);

  await prisma.inviteToken.create({
    data: { token, email, role, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;

  // Gmail SMTP が未設定の場合は招待URLを返して管理者が手動共有できるようにする
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[invite] GMAIL_USER / GMAIL_APP_PASSWORD is not configured. Returning invite URL for manual sharing.");
    return NextResponse.json({ ok: true, inviteUrl, emailSkipped: true });
  }

  try {
    await sendEmail({
      to: email,
      subject: "Living Me への招待",
      html: buildInviteEmailHtml(inviteUrl, EXPIRES_HOURS),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to send invite email:", message);
    // メール送信失敗でも招待URLを返す（管理者が手動共有可能）
    return NextResponse.json({ ok: true, inviteUrl, emailError: message });
  }

  return NextResponse.json({ ok: true, inviteUrl });
}
