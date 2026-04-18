import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        const isVideo = ["mp4", "webm", "mov", "avi"].includes(ext);
        return {
          allowedContentTypes: isVideo
            ? ALLOWED_VIDEO_TYPES
            : ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: isVideo
            ? 500 * 1024 * 1024 // 500MB for video
            : 10 * 1024 * 1024,  // 10MB for image
        };
      },
      onUploadCompleted: async () => {
        // 必要に応じてDB記録などを行う
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
