"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export interface RegisterFreeResult {
  success: boolean;
  error?: string;
}

/**
 * 招待トークンを用いて無料会員として自己登録する。
 *
 * セキュリティ方針:
 *   - 招待トークンが有効（未使用・期限内）であること
 *   - トークンの email とユーザー入力の email が一致すること
 *   - 登録後にトークンを usedAt 更新（アトミック）
 *
 * 入口が `registerFree` であっても、Living Me は招待制であるため、
 * 招待トークンなしでは登録不可とする。
 */
export async function registerFree(
  inviteToken: string,
  name: string,
  email: string,
  password: string,
): Promise<RegisterFreeResult> {
  const trimmedToken = inviteToken.trim();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedToken) {
    return { success: false, error: "招待リンクが必要です。招待メールのリンクからアクセスしてください。" };
  }
  if (!trimmedName || !trimmedEmail) {
    return { success: false, error: "お名前とメールアドレスを入力してください" };
  }
  if (password.length < 8) {
    return { success: false, error: "パスワードは8文字以上で入力してください" };
  }

  const invite = await prisma.inviteToken.findUnique({ where: { token: trimmedToken } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return { success: false, error: "招待リンクが無効または期限切れです" };
  }

  if (invite.email.toLowerCase() !== trimmedEmail) {
    return { success: false, error: "招待されたメールアドレスと一致しません" };
  }

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    return { success: false, error: "このメールアドレスはすでに登録されています" };
  }

  const hashed = await hashPassword(password);

  const now = new Date();
  const created = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      password: hashed,
      role: invite.role === "ADMIN" ? "ADMIN" : invite.role,
      isActive: true,
      joinedAt: now,
      startDate: now,
    },
  });

  await prisma.inviteToken.update({
    where: { token: trimmedToken },
    data: { usedAt: new Date(), userId: created.id },
  });

  return { success: true };
}
