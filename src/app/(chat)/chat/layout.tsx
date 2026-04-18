import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getChannels } from "@/server/actions/chat";
import type { ChatChannel } from "@prisma/client";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  let channels: ChatChannel[] = [];
  try {
    channels = await getChannels();
  } catch {
    // セッションエラーなどは無視して空配列で続行
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#3d2a1c] text-white/90">
        {/* Logo header */}
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-base font-semibold tracking-wide text-white">Living Me</p>
          <p className="text-xs text-white/50 mt-0.5">チャット</p>
        </div>

        {/* Channel list */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
            チャンネル
          </p>
          {channels.length === 0 ? (
            <p className="px-2 py-2 text-xs text-white/40">チャンネルなし</p>
          ) : (
            channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/chat/${ch.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="text-white/50 font-medium">#</span>
                <span className="truncate">{ch.name}</span>
              </Link>
            ))
          )}
        </nav>

        {/* Footer link back */}
        <div className="px-4 py-3 border-t border-white/10">
          <Link href="/home" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            ← ホームへ戻る
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}
