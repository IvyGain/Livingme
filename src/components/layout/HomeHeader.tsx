"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  visible?: boolean;
}

interface HomeHeaderProps {
  userName?: string | null;
  isAdmin?: boolean;
  navItems?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { href: "/home",    label: "ホーム" },
  { href: "/archive", label: "アーカイブ" },
  { href: "/events",  label: "イベント" },
  { href: "/journal", label: "ジャーナル" },
  { href: "/forms",   label: "わたし" },
  { href: "/about",   label: "Living Meとは" },
];

export function HomeHeader({ userName, isAdmin, navItems }: HomeHeaderProps) {
  const pathname = usePathname();
  const visibleNavItems = (navItems ?? DEFAULT_NAV_ITEMS).filter(
    (item) => item.visible !== false
  );

  return (
    <header
      className="flex-shrink-0 flex items-center h-14 px-4 border-b gap-4 z-10"
      style={{ backgroundColor: "var(--lm-card-bg)", borderColor: "var(--lm-border)" }}
    >
      {/* Logo */}
      <Link
        href="/home"
        className="text-base font-light tracking-widest flex-shrink-0"
        style={{ color: "var(--lm-primary)" }}
      >
        Living Me
      </Link>

      {/* Nav */}
      <nav className="hidden sm:flex items-center gap-1 ml-2">
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "font-medium"
                  : "hover:opacity-80"
              )}
              style={
                isActive
                  ? { backgroundColor: "var(--lm-bg)", color: "var(--lm-primary)" }
                  : { color: "var(--lm-muted)" }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        {isAdmin && (
          <Link
            href="/admin"
            className="hidden sm:block text-xs px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--lm-accent)", color: "var(--lm-accent)" }}
          >
            管理画面
          </Link>
        )}
        <span className="hidden md:block text-sm" style={{ color: "var(--lm-muted)" }}>
          {userName ?? "メンバー"}
        </span>
        <Link
          href="/settings"
          className="text-sm transition-colors hover:opacity-70"
          style={{ color: "var(--lm-muted)" }}
        >
          設定
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm transition-colors hover:opacity-70"
          style={{ color: "var(--lm-muted)" }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
