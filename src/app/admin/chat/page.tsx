import { getChannels, createChannel, deleteChannel } from "@/server/actions/chat";
import { prisma } from "@/lib/prisma";
import { AdminChatClient } from "./AdminChatClient";
import type { ChatChannel } from "@prisma/client";

interface ChannelWithCount extends ChatChannel {
  messageCount: number;
}

async function getChannelsWithCount(): Promise<ChannelWithCount[]> {
  const channels = await getChannels();
  const counts = await prisma.chatMessage.groupBy({
    by: ["channelId"],
    where: { channelId: { in: channels.map((c) => c.id) } },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.channelId, c._count.id]));
  return channels.map((ch) => ({ ...ch, messageCount: countMap[ch.id] ?? 0 }));
}

export default async function AdminChatPage() {
  const channels = await getChannelsWithCount();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">チャット管理</h1>
        <p className="text-sm text-gray-500 mt-1">チャンネルの作成・削除、Lark連携の設定</p>
      </div>

      <AdminChatClient
        channels={channels}
        createChannelAction={createChannel}
        deleteChannelAction={deleteChannel}
      />
    </div>
  );
}
