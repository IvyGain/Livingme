import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WithdrawForm } from "./WithdrawForm";

export default async function WithdrawConfirmPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/withdraw" className="text-sm text-[#9a8070] hover:text-[#6B4F3A] flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </Link>
        <h1 className="text-xl font-semibold text-[#6B4F3A]">退会申請フォーム</h1>
        <p className="text-sm text-[#9a8070] mt-1">
          申請後、管理者が確認し退会処理を行います。
        </p>
      </div>

      <WithdrawForm />
    </div>
  );
}
