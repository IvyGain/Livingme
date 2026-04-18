import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const AMBASSADOR_LABELS: Record<string, string> = {
  FREE: "無料アンバサダー",
  REFERRAL: "紹介アンバサダー",
  PARTNER: "提携アンバサダー",
};

const REFERRAL_LIMITS: Record<string, number | null> = {
  FREE: 3,
  REFERRAL: 10,
  PARTNER: null,
};

export default async function AmbassadorPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ambassadorType: true,
      referrals: {
        orderBy: { joinedAt: "desc" },
        select: { id: true, name: true, avatarUrl: true, isActive: true, joinedAt: true },
      },
    },
  });

  if (!user?.ambassadorType) {
    redirect("/forms");
  }

  const ambassadorType = user.ambassadorType;
  const referrals = user.referrals;
  const limit = REFERRAL_LIMITS[ambassadorType] ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">アンバサダー</h1>
        <p className="text-sm text-[#9a8070]">
          {AMBASSADOR_LABELS[ambassadorType]}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5">
          <p className="text-xs text-[#9a8070] uppercase tracking-wide">紹介人数</p>
          <p className="text-3xl font-light text-[#6B4F3A] mt-1 tabular-nums">
            {referrals.length}
            {limit !== null && (
              <span className="text-lg text-[#b8a898]">/{limit}</span>
            )}
          </p>
        </div>
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5">
          <p className="text-xs text-[#9a8070] uppercase tracking-wide">有効会員</p>
          <p className="text-3xl font-light text-[#6B4F3A] mt-1 tabular-nums">
            {referrals.filter((r) => r.isActive).length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#6B4F3A]">申請</h2>
        <Link
          href="/forms/referral"
          className="flex items-center justify-between bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="text-sm font-medium text-[#6B4F3A] group-hover:text-[#C07052] transition-colors">
              新規紹介 申請
            </p>
            <p className="text-xs text-[#9a8070] mt-0.5">新しいメンバーをご紹介する際にご申請ください</p>
          </div>
          <svg className="w-4 h-4 text-[#b8a898] group-hover:text-[#C07052] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          href="/forms/give-kai"
          className="flex items-center justify-between bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="text-sm font-medium text-[#6B4F3A] group-hover:text-[#C07052] transition-colors">
              ギブ会 申請
            </p>
            <p className="text-xs text-[#9a8070] mt-0.5">コミュニティへのギブイベントを企画しませんか</p>
          </div>
          <svg className="w-4 h-4 text-[#b8a898] group-hover:text-[#C07052] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Referral list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#6B4F3A]">
          紹介した方（{referrals.length}名）
        </h2>
        {referrals.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFCF8] rounded-2xl border border-[#e8ddd5]">
            <p className="text-sm text-[#9a8070]">まだ紹介した方はいません</p>
          </div>
        ) : (
          referrals.map((r) => (
            <div key={r.id} className="flex items-center gap-3 bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-4">
              <div className="w-9 h-9 rounded-full bg-[#EFF4EF] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#6B4F3A] font-medium truncate">{r.name ?? "名前未設定"}</p>
                {r.joinedAt && (
                  <p className="text-xs text-[#9a8070] tabular-nums">
                    {format(r.joinedAt, "yyyy年M月d日 入会", { locale: ja })}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                r.isActive
                  ? "bg-[#EFF4EF] text-[#7A9E7E]"
                  : "bg-[#f9f0ee] text-[#C07052]"
              }`}>
                {r.isActive ? "有効" : "無効"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
