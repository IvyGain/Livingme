import Link from "next/link";
import { getChannels } from "@/server/actions/chat";
import type { ChatChannel } from "@prisma/client";

interface Props {
  userName?: string | null;
}

/**
 * 会員ページ全体で常時表示する左サイドバー。
 * チャンネル一覧をクリックするとチャットに遷移する。
 * /about（LivingMeとは）以外のすべての認証必須ページで表示。
 */
export async function ChannelSidebar({ userName }: Props) {
  let channels: ChatChannel[] = [];
  try {
    channels = await getChannels();
  } catch {
    // 未認証など → 空配列で続行
  }

  return (
    <aside
      className="w-52 flex-shrink-0 flex-col border-r overflow-y-auto hidden md:flex"
      style={{
        borderColor: "var(--lm-border)",
        backgroundColor: "var(--lm-card-bg)",
      }}
    >
      {/* Greeting */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-sm font-medium" style={{ color: "var(--lm-primary)" }}>
          {userName ? `${userName}さん` : "メンバー"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--lm-muted)" }}>
          今日も自分らしく
        </p>
      </div>

      <div className="border-t mx-3" style={{ borderColor: "var(--lm-border)" }} />

      {/* Channel list */}
      <div className="flex-1 py-3">
        <p
          className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--lm-muted)" }}
        >
          チャンネル
        </p>
        {channels.length === 0 ? (
          <p className="px-4 py-2 text-xs" style={{ color: "var(--lm-muted)" }}>
            チャンネルなし
          </p>
        ) : (
          <nav className="space-y-0.5 px-2">
            {channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/chat/${ch.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--lm-muted)" }}
              >
                <span className="font-medium">#</span>
                <span className="truncate">{ch.name}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
