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

  // (member) layout の max-w-4xl + padding を全て突き破ってビューポート幅いっぱいに
  // チャットを展開する。`relative left-1/2 -ml-[50vw] w-screen` は親の max-width を
  // 貫通する常套手段。
  // 高さは: ヘッダー(3.5rem) + 親の pb (mobile: pb-20=5rem / desktop: pb-8=2rem) を
  // 控えてビューポートピッタリに収める。
  return (
    <div className="relative left-1/2 -ml-[50vw] w-screen -my-6 lg:-my-8">
      <div
        className="flex overflow-hidden bg-white h-[calc(100dvh-3.5rem-5rem)] md:h-[calc(100dvh-3.5rem-2rem)]"
      >
        {/* Sidebar */}
        <aside className="w-56 sm:w-60 flex-shrink-0 flex flex-col bg-[#3d2a1c] text-white/90">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold tracking-wide text-white">
              チャット
            </p>
          </div>

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
        </aside>

        {/* Main area */}
        <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
