import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";

// NextAuth v5: cookie name は本番（NODE_ENV=production）で __Secure- プレフィックス。
// auth.ts の useSecureCookies と同じ判定にして整合させる。
const USE_SECURE_COOKIES = process.env.NODE_ENV === "production";
const SESSION_COOKIE_NAME = USE_SECURE_COOKIES
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";
function cookieName(_req: NextRequest): string {
  return SESSION_COOKIE_NAME;
}

const SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

const IS_PROD = process.env.NODE_ENV === "production";

// 公開パス（認証不要）
const PUBLIC_PATHS = [
  "/",           // 公開LP
  "/login",
  "/join",
  "/invite",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/invite",
  "/api/webhooks",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  // /demo は dev のみ公開。prod では下のチェックで 404 にする。
  ...(IS_PROD ? [] : ["/demo"]),
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── /demo は本番では存在しない扱い ────────────────────────────
  if (IS_PROD && pathname.startsWith("/demo")) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

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
