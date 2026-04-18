"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/demo/admin", label: "ダッシュボード" },
  { href: "/demo/admin/members", label: "会員管理" },
  { href: "/demo/admin/content/today", label: "今日の表示" },
  { href: "/demo/admin/content/archives", label: "アーカイブ" },
  { href: "/demo/admin/events", label: "イベント管理" },
];

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#6B4F3A] text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/demo/admin" className="text-lg font-medium tracking-wide">
              アートライフ 管理画面
            </Link>
            <span className="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full">
              デモ
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="text-sm text-white/70 hover:text-white transition-colors">
              会員サイトへ戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0">
        <aside className="w-52 min-h-screen bg-white border-r border-gray-200 pt-6">
          <nav className="space-y-1 px-3">
            {adminNavItems.map((item) => {
              const isActive =
                item.href === "/demo/admin"
                  ? pathname === "/demo/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-[#f5f0ea] text-[#6B4F3A] font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
