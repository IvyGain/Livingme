import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// トークンの有効性確認
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json({ valid: true, email: invite.email, role: invite.role });
}

// パスワード設定 & ユーザー作成
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const password = typeof body.password === "string" ? body.password : null;
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  // トークン検証（レースコンディション対策のため DB から再取得）
  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "招待リンクが無効または期限切れです" },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(password);

  // 既存ユーザーの確認（メールアドレスで）
  const existing = await prisma.user.findUnique({ where: { email: invite.email } });

  let userId: string;

  if (existing) {
    // 既存ユーザーにパスワードとロールを設定
    // ロールは招待トークンの値を使用（降格は行わず昇格のみ）
    const newRole = invite.role === "ADMIN" ? "ADMIN" : existing.role;

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashed,
        role: newRole,
        ...(name && !existing.name ? { name } : {}),
        joinedAt: existing.joinedAt ?? new Date(),
      },
    });
    userId = existing.id;
  } else {
    // 新規ユーザー作成（ロールは招待トークンから）
    const newUser = await prisma.user.create({
      data: {
        email: invite.email,
        name: name ?? null,
        password: hashed,
        isActive: true,
        role: invite.role,
        joinedAt: new Date(),
      },
    });
    userId = newUser.id;
  }

  // トークンを使用済みにする（アトミックな更新）
  await prisma.inviteToken.update({
    where: { token },
    data: { usedAt: new Date(), userId },
  });

  return NextResponse.json({ ok: true });
}
