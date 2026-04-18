import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";

// NextAuth v5: cookie name は secure prefix + "authjs.session-token"
function cookieName(req: NextRequest): string {
  const secure = req.url.startsWith("https://");
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

const SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

// 公開パス（認証不要）
const PUBLIC_PATHS = [
  "/",           // 公開LP
  "/login",
  "/join",
  "/invite",
  "/demo",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/invite",
  "/api/webhooks",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── JWT をクッキーから直接読む ──────────────────────────────────
  const name = cookieName(req);
  let token: Record<string, unknown> | null = null;
  try {
    token = await getToken({ req, secret: SECRET, cookieName: name, salt: name });
  } catch {
    // 復号失敗 → 未認証扱い
  }

  const isActive = token?.isActive !== false; // undefined は true 扱い
  const role     = token?.role as UserRole | undefined;

  // ── 公開パス ──────────────────────────────────────────────────
  const isPublicPath = PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
  if (isPublicPath) {
    // ログイン済みで / や /login に来た場合は会員ホームへ
    if ((pathname === "/" || pathname === "/login") && token) {
      if (!isActive) {
        return NextResponse.redirect(new URL("/login?error=suspended", req.url));
      }
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // ── 未認証 ────────────────────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── アカウント無効 ────────────────────────────────────────────
  if (!isActive) {
    return NextResponse.redirect(new URL("/login?error=suspended", req.url));
  }

  // ── /admin ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ── /forms は全アクティブユーザーで通す ─────────────────────
  if (pathname.startsWith("/forms")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)" ],
};
