import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const adminNavItems = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/members", label: "会員管理" },
  { href: "/admin/referrals", label: "紹介管理" },
  { href: "/admin/inquiries", label: "問い合わせ" },
  { href: "/admin/content/today", label: "今日の表示" },
  { href: "/admin/content/archives", label: "アーカイブ" },
  { href: "/admin/content/journal-settings", label: "ジャーナル設定" },
  { href: "/admin/content/join-settings", label: "申し込みページ設定" },
  { href: "/admin/events", label: "イベント管理" },
  { href: "/admin/lp-settings", label: "LP設定" },
  { href: "/admin/home-layout", label: "ホーム画面設定" },
  { href: "/admin/settings", label: "外部サービス設定" },
  { href: "/admin/chat", label: "チャット管理" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-[#6B4F3A] text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-lg font-medium tracking-wide">
              Living Me 管理画面
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm text-white/70 hover:text-white">
              会員サイトへ
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm text-white/70 hover:text-white">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0">
        {/* Admin sidebar */}
        <aside className="w-52 min-h-screen bg-white border-r border-gray-200 pt-6">
          <nav className="space-y-1 px-3">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
