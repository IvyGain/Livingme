import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 親 (member) layout の ChannelSidebar が左側に常駐するため、
  // ここではメインのチャット領域だけを描画する。
  // (member) layout の max-w-4xl + padding は突き破ってビューポート幅いっぱいに使う。
  return (
    <div className="-mx-4 sm:-mx-6 -my-6 lg:-my-8">
      <div
        className="flex flex-col bg-white overflow-hidden"
        style={{
          height: "calc(100dvh - 3.5rem - 5rem)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
