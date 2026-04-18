"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/server/actions/password-change";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? "送信に失敗しました");
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-[#6B4F3A]">メールを送信しました</p>
          <p className="text-sm text-[#9a8070] mt-1">
            パスワードリセット用のリンクをお送りしました。<br />
            メールをご確認ください（有効期限：1時間）
          </p>
        </div>
        <Link
          href="/login"
          className="block text-sm text-[#6B4F3A] hover:underline"
        >
          ログイン画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-[#6B4F3A] font-medium mb-1">パスワードリセット</p>
        <p className="text-xs text-[#9a8070]">
          登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#6B4F3A]">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="example@email.com"
            className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#6B4F3A] hover:bg-[#5a4030] disabled:opacity-60 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {isLoading ? "送信中..." : "リセットメールを送信"}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-[#9a8070] hover:text-[#6B4F3A] transition-colors"
        >
          ← ログイン画面に戻る
        </Link>
      </div>
    </div>
  );
}
