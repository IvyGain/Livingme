"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export interface RegisterFreeResult {
  success: boolean;
  error?: string;
}

/**
 * 無料会員として自己登録する
 * - パスワードをハッシュ化して User を作成 (role = FREE_MEMBER, isActive = true)
 * - 登録後に自動ログイン
 */
export async function registerFree(
  name: string,
  email: string,
  password: string,
): Promise<RegisterFreeResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail) {
    return { success: false, error: "お名前とメールアドレスを入力してください" };
  }
  if (password.length < 8) {
    return { success: false, error: "パスワードは8文字以上で入力してください" };
  }

  // 既存ユーザーチェック
  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    return { success: false, error: "このメールアドレスはすでに登録されています" };
  }

  const hashed = await hashPassword(password);

  await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      password: hashed,
      role: "FREE_MEMBER",
      isActive: true,
      joinedAt: new Date(),
    },
  });

  return { success: true };
}
