import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { FORM_DEFS } from "@/lib/form-defs";
import { calcDaysSince } from "@/lib/membership-duration";

export default async function FormsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ambassadorType: true, joinedAt: true, startDate: true, referrals: { select: { id: true } } },
  });

  const isAmbassador = !!user?.ambassadorType;
  const membershipDays = calcDaysSince(user?.startDate, user?.joinedAt);
  const availableForms = FORM_DEFS.filter((f) => {
    if (f.ambassadorOnly && !isAmbassador) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ""}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#EFF4EF] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-[#6B4F3A]">{session.user.name}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#EFF4EF] text-[#7A9E7E]">
              会員
            </span>
            {isAmbassador && (
              <span className="inline-block ml-2 mt-1 text-xs px-2.5 py-0.5 rounded-full bg-[#FDF3EE] text-[#C07052] font-medium">
                アンバサダー
              </span>
            )}
          </div>
        </div>
        {membershipDays !== null && (
          <div className="mt-4 pt-4 border-t border-[#f0ebe5] flex items-baseline gap-2">
            <span className="text-xs text-[#9a8070]">Living Me 歴</span>
            <span className="text-2xl font-light text-[#C07052] tabular-nums">
              {membershipDays}
            </span>
            <span className="text-xs text-[#9a8070]">日目</span>
          </div>
        )}
      </div>

      {/* Forms section */}
      <div>
        <h2 className="text-sm font-medium text-[#6B4F3A] mb-3">申請フォーム</h2>
        {availableForms.length === 0 ? (
          <div className="text-center py-12 bg-[#FEFCF8] rounded-2xl border border-[#e8ddd5]">
            <p className="text-sm text-[#9a8070]">現在ご利用いただけるフォームはありません</p>
            {status === "TRIAL" && (
              <p className="text-xs text-[#b8a898] mt-2">通常会員になるとご利用できるフォームが増えます</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {availableForms.map((form) => (
              <Link
                key={form.slug}
                href={`/forms/${form.slug}`}
                className="block bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B4F3A] group-hover:text-[#C07052] transition-colors">
                      {form.title}
                    </p>
                    <p className="text-xs text-[#9a8070] mt-1 leading-relaxed">{form.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#b8a898] group-hover:text-[#C07052] transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal section */}
      <div className="pt-2">
        <h2 className="text-sm font-medium text-[#6B4F3A] mb-3">その他</h2>
        <Link
          href="/withdraw"
          className="block bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-5 hover:border-[#C07052]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#9a8070] group-hover:text-[#6B4F3A] transition-colors">退会申請</p>
              <p className="text-xs text-[#b8a898] mt-1">退会をご希望の場合はこちら</p>
            </div>
            <svg className="w-4 h-4 text-[#c0b0a0] group-hover:text-[#9a8070] transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Ambassador section */}
      {isAmbassador && (
        <div>
          <h2 className="text-sm font-medium text-[#6B4F3A] mb-3">アンバサダー</h2>
          <Link
            href="/ambassador"
            className="block bg-[#FDF3EE] border border-[#f0d8cc] rounded-2xl p-5 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#C07052]">アンバサダーダッシュボード</p>
                <p className="text-xs text-[#9a8070] mt-1">紹介状況・報酬・申請を管理できます</p>
              </div>
              <svg className="w-4 h-4 text-[#C07052] flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
