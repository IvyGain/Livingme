import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./password";
import { checkRateLimit, recordFailure, clearFailures } from "./rate-limit";

/**
 * タイミング攻撃対策: ユーザーが存在しない場合も必ず verifyPassword を実行する
 * ダミーハッシュを遅延生成してキャッシュする
 */
let _dummyHash: string | undefined;
async function getDummyHash(): Promise<string> {
  if (!_dummyHash) _dummyHash = await hashPassword("__dummy_timing_safety__");
  return _dummyHash;
}

// NextAuth v5 は AUTH_SECRET を読む（v4 の NEXTAUTH_SECRET とは異なる）
// Vercel 環境変数との後方互換性のため両方を参照する
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const useSecureCookies = process.env.NODE_ENV === "production";
const sessionTokenCookieName = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret,
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: sessionTokenCookieName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials, request) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : null;
        const password = typeof credentials?.password === "string" ? credentials.password : null;
        if (!email || !password) return null;

        // ── レートリミット確認（メールアドレス単位）──────────────
        const rateLimitKey = `login:${email}`;
        const rateCheck = await checkRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          const ip = (request as Request | undefined)
            ?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
          console.warn(`[auth] Login blocked for ${email} (ip: ${ip}), retry after ${rateCheck.retryAfterSeconds}s`);
          return null;
        }

        // ── ユーザー取得 ────────────────────────────────────────
        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (dbErr) {
          console.error("[auth/credentials] DB lookup failed:", dbErr);
          return null;
        }

        const storedHash = user?.password ?? await getDummyHash();
        const valid = await verifyPassword(password, storedHash);

        if (!valid || !user?.password) {
          const result = await recordFailure(rateLimitKey);
          if (!result.allowed) {
            console.warn(`[auth] Account ${email} locked after repeated failures`);
          }
          return null;
        }

        await clearFailures(rateLimitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.avatarUrl ?? null,
          isActive: user.isActive,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,  // refresh once per day
  },
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials ログイン時にDBのIDとロールをトークンに保存
      if (account?.provider === "credentials" && user) {
        const u = user as { id: string; isActive: boolean; role: UserRole };
        token.dbId = u.id;
        token.isActive = u.isActive ?? true;
        token.role = u.role ?? "MEMBER";
      }

      // role/isActive が未設定のトークンを補正（古いセッション対策）
      if (token.isActive === undefined) token.isActive = true;
      if (!token.role) token.role = "MEMBER";

      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.dbId ?? token.sub ?? "") as string;
      session.user.isActive = (token.isActive ?? true) as boolean;
      session.user.role = (token.role ?? "MEMBER") as UserRole;
      session.user.name = token.name as string;
      session.user.image = token.image as string | null;
      return session;
    },
  },
});
