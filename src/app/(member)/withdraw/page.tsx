import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[#FDF3EE] border border-[#f0d8cc] rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-6 h-6 text-[#C07052] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-lg font-semibold text-[#C07052]">退会のご確認</h1>
        </div>
        <p className="text-sm text-[#6B4F3A] leading-relaxed">
          退会手続きを進める前に、以下の内容をご確認ください。
        </p>
      </div>

      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[#6B4F3A]">退会すると、以下のサービスが利用できなくなります</h2>
        <ul className="space-y-3">
          {[
            "会員限定コンテンツ・アーカイブへのアクセス",
            "ジャーナル機能（記録がすべて削除されます）",
            "イベントへの参加・申し込み",
            "コミュニティチャット",
            "アンバサダープログラムおよび紹介報酬",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B4F3A]">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-[#f0d8cc] text-[#C07052] flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#6B4F3A]">退会後のデータについて</h2>
        <p className="text-sm text-[#9a8070] leading-relaxed">
          退会後、アカウントは無効化されます。投稿データや利用履歴は一定期間保管後、削除されます。
          再入会をご希望の場合は、改めて申し込みが必要となります。
        </p>
      </div>

      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#6B4F3A]">一時的なお休みも可能です</h2>
        <p className="text-sm text-[#9a8070] leading-relaxed">
          長期のお休みや事情がある場合は、退会ではなく休会のご相談も承っております。
          お気軽に管理者までお問い合わせください。
        </p>
        <Link
          href="/contact"
          className="inline-block mt-1 text-sm text-[#C07052] hover:underline"
        >
          お問い合わせはこちら →
        </Link>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/withdraw/confirm"
          className="block text-center px-6 py-3 bg-[#C07052] text-white rounded-xl text-sm font-medium hover:bg-[#a85e42] transition-colors"
        >
          それでも退会申請を進める
        </Link>
        <Link
          href="/forms"
          className="block text-center px-6 py-3 border border-[#e8ddd5] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#f5f0eb] transition-colors"
        >
          キャンセル（マイページに戻る）
        </Link>
      </div>
    </div>
  );
}
