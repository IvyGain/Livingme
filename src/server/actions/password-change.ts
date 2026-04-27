"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { checkAndRecordCustomLimit } from "@/lib/rate-limit";

/** ログイン中ユーザーがパスワードを変更する */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return { success: false, error: "このアカウントはパスワード認証を使用していません" };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "新しいパスワードは8文字以上で入力してください" };
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return { success: false, error: "現在のパスワードが正しくありません" };
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch {
    return { success: false, error: "パスワードの変更に失敗しました" };
  }
}

/** パスワードリセットメールを送信する（ログイン前） */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // メールアドレス単位でレート制限（10分間に3回まで）
    const rateLimitKey = `pwd-reset:${email.toLowerCase()}`;
    const limit = await checkAndRecordCustomLimit(rateLimitKey, {
      maxAttempts: 3,
      windowMs: 10 * 60_000,
      blockMs: 10 * 60_000,
    });
    if (!limit.allowed) {
      return { success: true }; // ユーザーには成功を返す（タイミング攻撃防止）
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // ユーザーが存在しない場合も成功を返す（メールアドレス存在の列挙を防ぐ）
    if (!user) return { success: true };

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1時間

    // 既存のリセットトークンを削除してから新規作成
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });
    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token, expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "【Living Me】パスワードリセット",
      html: buildPasswordResetEmailHtml(resetUrl),
    });

    return { success: true };
  } catch {
    return { success: false, error: "送信に失敗しました。しばらくしてからお試しください" };
  }
}

/** トークンを検証して新しいパスワードを設定する */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (newPassword.length < 8) {
      return { success: false, error: "パスワードは8文字以上で入力してください" };
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || !record.identifier.startsWith("reset:")) {
      return { success: false, error: "無効なリセットリンクです" };
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return { success: false, error: "リセットリンクの有効期限が切れています。もう一度お試しください" };
    }

    const email = record.identifier.replace("reset:", "");
    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return { success: true };
  } catch {
    return { success: false, error: "パスワードのリセットに失敗しました" };
  }
}

function buildPasswordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>パスワードリセット</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#FEFCF8;border-radius:12px;border:1px solid #e8ddd5;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #f0ebe5;">
              <h1 style="margin:0;font-size:28px;font-weight:300;letter-spacing:0.2em;color:#6B4F3A;">Living Me</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#9a8070;">あなたのリビングへようこそ</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;font-size:18px;font-weight:500;color:#4a3728;">パスワードリセット</h2>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#6b5a4e;">
                パスワードリセットのリクエストを受け付けました。<br />
                下記のボタンから新しいパスワードを設定してください。
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#6B4F3A;">
                    <a href="${resetUrl}" style="display:block;padding:14px 32px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;letter-spacing:0.05em;">
                      パスワードを再設定する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#9a8070;">
                このリンクは1時間有効です。<br />
                心当たりのない場合は、このメールを無視してください。
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#b0a090;word-break:break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0ebe5;">
              <p style="margin:0;font-size:11px;color:#b0a090;">
                このメールはパスワードリセットのリクエストに応じて送信されました。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
