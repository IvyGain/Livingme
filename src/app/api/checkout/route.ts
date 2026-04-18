import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getSetting("UNIVAPAY_APP_TOKEN");
  if (!token) {
    return NextResponse.json(
      { error: "ユニバペイが未設定です。管理画面 > 外部サービス設定 から登録してください。" },
      { status: 500 }
    );
  }

  // TODO: UnivaPay チェックアウトセッション作成
  // ユニバペイの接続実装はアプリトークン確認後に実装します
  return NextResponse.json(
    { error: "ユニバペイ連携は準備中です。管理者にお問い合わせください。" },
    { status: 501 }
  );
}
