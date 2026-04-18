/**
 * Edge Runtime 対応の最小 NextAuth 設定
 * proxy.ts (Middleware) からのみ使用する
 * Prisma や getSetting は使わない
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";

export const { auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    // Edge Runtime では authorize は実行されないが、プロバイダー登録は必要
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
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
