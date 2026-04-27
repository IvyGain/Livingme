import { getChannels } from "@/server/actions/chat";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ChatPage() {
  const channels = await getChannels();

  if (channels.length > 0) {
    redirect(`/chat/${channels[0].id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <p className="text-[#9a8070] mb-4">チャンネルがまだありません</p>
      <Link
        href="/admin/chat"
        className="text-sm text-[#C07052] hover:text-[#a85e42] underline underline-offset-2"
      >
        管理画面でチャンネルを作成する
      </Link>
    </div>
  );
}
