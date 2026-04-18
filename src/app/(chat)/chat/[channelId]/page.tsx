import { getChannels, getMessages } from "@/server/actions/chat";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ChatView } from "./ChatView";

const ROLE_RANK: Record<string, number> = {
  FREE_MEMBER: 1,
  MEMBER: 2,
  ADMIN: 3,
};

interface Props {
  params: Promise<{ channelId: string }>;
}

export default async function ChannelPage({ params }: Props) {
  const { channelId } = await params;

  // チャンネル存在確認
  const channels = await getChannels();
  const channel = channels.find((ch) => ch.id === channelId);
  if (!channel) {
    notFound();
  }

  const session = await auth();
  const userRole = session?.user?.role ?? "FREE_MEMBER";
  const canWrite = channel.writeRole
    ? (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[channel.writeRole] ?? 99)
    : true;

  const { messages } = await getMessages(channelId);

  return (
    <ChatView
      channel={{ id: channel.id, name: channel.name }}
      initialMessages={messages}
      canWrite={canWrite}
    />
  );
}
