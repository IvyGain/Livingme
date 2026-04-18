import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHomeLayoutSettings, getNavItems } from "@/server/actions/home-layout";
import { getColorScheme } from "@/lib/home-layout";
import { HomeHeader } from "@/components/layout/HomeHeader";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    redirect("/login");
  }

  const [{ colorSchemeId }, navItems] = await Promise.all([
    getHomeLayoutSettings(),
    getNavItems(),
  ]);
  const scheme = getColorScheme(colorSchemeId);

  const themeVars = {
    "--lm-bg":        scheme.colors.background,
    "--lm-card-bg":   scheme.colors.cardBackground,
    "--lm-primary":   scheme.colors.primary,
    "--lm-accent":    scheme.colors.accent,
    "--lm-secondary": scheme.colors.secondary,
    "--lm-muted":     scheme.colors.muted,
    "--lm-border":    scheme.colors.border,
  } as React.CSSProperties;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ ...themeVars, backgroundColor: scheme.colors.background }}
    >
      <HomeHeader userName={session.user.name} isAdmin={isAdmin} navItems={navItems} />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
