import { auth } from "@/lib/auth";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { MobileNav } from "@/components/layout/Sidebar";
import { getHomeLayoutSettings, getNavItems } from "@/server/actions/home-layout";
import { getColorScheme } from "@/lib/home-layout";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // セッション情報はヘッダー表示用のみ
  // アクセス制御はミドルウェア (proxy.ts) が唯一の責務
  // ここで redirect() すると middleware ↔ layout 間のリダイレクトループが起きる
  const session = await auth().catch(() => null);
  const [{ colorSchemeId }, navItems] = await Promise.all([
    getHomeLayoutSettings(),
    getNavItems(),
  ]);
  const scheme = getColorScheme(colorSchemeId);

  const isAdmin = session?.user?.role === "ADMIN";

  // CSS変数を上書きするインラインスタイルを生成
  const themeVars = {
    "--lm-bg":       scheme.colors.background,
    "--lm-card-bg":  scheme.colors.cardBackground,
    "--lm-primary":  scheme.colors.primary,
    "--lm-accent":   scheme.colors.accent,
    "--lm-secondary":scheme.colors.secondary,
    "--lm-muted":    scheme.colors.muted,
    "--lm-border":   scheme.colors.border,
  } as React.CSSProperties;

  return (
    <div className="min-h-dvh" style={{ ...themeVars, backgroundColor: scheme.colors.background }}>
      <HomeHeader userName={session?.user?.name} isAdmin={isAdmin} navItems={navItems} />
      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
