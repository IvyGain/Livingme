import { auth } from "@/lib/auth";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { MobileNav } from "@/components/layout/Sidebar";
import { ChannelSidebar } from "@/components/layout/ChannelSidebar";
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
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ ...themeVars, backgroundColor: scheme.colors.background }}
    >
      <HomeHeader userName={session?.user?.name} isAdmin={isAdmin} navItems={navItems} />
      <div className="flex flex-1 overflow-hidden">
        <ChannelSidebar userName={session?.user?.name} />
        <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
