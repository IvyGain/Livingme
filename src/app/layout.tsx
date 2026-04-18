import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/Providers";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className={`${notoSansJP.className} antialiased min-h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
