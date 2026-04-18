"use client";

import { useState, useTransition } from "react";
import { submitWithdrawalRequest } from "@/server/actions/withdrawal";

export function WithdrawForm() {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!agreed) return;
    setError(null);
    startTransition(async () => {
      const result = await submitWithdrawalRequest(reason);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "申請に失敗しました");
      }
    });
  }

  if (submitted) {
    return (
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#EFF4EF] flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#6B4F3A]">退会申請を受け付けました</h2>
        <p className="text-sm text-[#9a8070] leading-relaxed">
          ご申請ありがとうございました。<br />
          管理者が確認の上、退会手続きを行います。<br />
          完了後にご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6B4F3A] mb-2">
            退会理由（任意）
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="退会の理由をお聞かせいただけると、サービス改善に役立てることができます（任意）"
            className="w-full px-3 py-2 border border-[#e8ddd5] rounded-lg text-sm text-[#6B4F3A] placeholder:text-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white resize-none transition-colors"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#C07052] flex-shrink-0"
          />
          <span className="text-sm text-[#6B4F3A] leading-relaxed">
            退会すると、すべてのコンテンツへのアクセスが失われることを理解しました。この操作は取り消せません。
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!agreed || isPending}
        className="w-full px-6 py-3 bg-[#C07052] text-white rounded-xl text-sm font-medium hover:bg-[#a85e42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "送信中..." : "退会申請を送信する"}
      </button>
    </div>
  );
}
