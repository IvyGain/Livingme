import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

// 許可する MIME タイプ
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// 最大ファイルサイズ: 10MB
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  // ADMIN のみ許可
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "JPEG・PNG・WebP・GIF のみアップロードできます" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "ファイルサイズは 10MB 以下にしてください" },
      { status: 400 }
    );
  }

  // ファイル名にタイムスタンプを付けて重複を防ぐ
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
