import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/Providers";
import { getSiteTheme } from "@/server/actions/site-theme";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Living Me | 会員サイト",
  description: "リビングのような温かさ・自然・安心感のある会員コミュニティ",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getSiteTheme().catch(() => null);

  const themeVars = theme
    ? ({
        "--lm-accent": theme.accent,
        "--lm-secondary": theme.secondary,
        "--lm-primary": theme.primary,
        "--lm-bg": theme.background,
        "--lm-card-bg": theme.cardBg,
        "--lm-muted": theme.muted,
        "--lm-border": theme.border,
      } as React.CSSProperties)
    : undefined;

  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`} style={themeVars}>
      <body className={`${notoSansJP.className} antialiased min-h-full`}>
        {theme?.globalBanner && (
          <div
            className="px-4 py-2 text-center text-xs"
            style={{ backgroundColor: "var(--lm-accent)", color: "#fff" }}
          >
            {theme.globalBanner}
          </div>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
