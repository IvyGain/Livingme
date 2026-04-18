"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/home",
    label: "ホーム",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/archive",
    label: "アーカイブ",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "イベント",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "ジャーナル",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-[#FEFCF8] border-r border-[#e8ddd5] min-h-screen pt-6 pb-8 px-3">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[#EFF4EF] text-[#6B4F3A] font-medium"
                  : "text-[#9a8070] hover:bg-[#f5f0ea] hover:text-[#6B4F3A]"
              )}
            >
              <span className={isActive ? "text-[#7A9E7E]" : "text-[#b8a898]"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="mt-auto pt-8">
        <div className="px-3 py-4 bg-[#EFF4EF] rounded-xl">
          <p className="text-xs text-[#9a8070] leading-relaxed">
            毎日の小さな積み重ねが、
            <br />
            あなたらしい生き方をつくる。
          </p>
        </div>
      </div>
    </aside>
  );
}

// Mobile bottom nav (5 tabs)
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FEFCF8]/95 backdrop-blur-sm border-t border-[#e8ddd5] z-50 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 min-w-[44px] min-h-[44px] justify-center rounded-lg text-xs",
                isActive ? "text-[#C07052]" : "text-[#9a8070]"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        {/* わたし tab */}
        <MeButton pathname={pathname} />
      </div>
    </nav>
  );
}

function MeButton({ pathname }: { pathname: string }) {
  const isActive = ["/forms", "/ambassador"].some((p) => pathname.startsWith(p));
  return (
    <Link
      href="/forms"
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-1 min-w-[44px] min-h-[44px] justify-center rounded-lg text-xs",
        isActive ? "text-[#C07052]" : "text-[#9a8070]"
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>わたし</span>
    </Link>
  );
}
