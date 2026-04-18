"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/server/actions/password-change";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-600">無効なリセットリンクです。</p>
        <Link href="/forgot-password" className="text-sm text-[#6B4F3A] hover:underline">
          もう一度メールを送信する
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, password);
    setIsLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error ?? "リセットに失敗しました");
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-[#6B4F3A]">パスワードを変更しました</p>
          <p className="text-sm text-[#9a8070] mt-1">新しいパスワードでログインしてください</p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full py-3 bg-[#6B4F3A] text-white font-medium rounded-lg text-sm text-center hover:bg-[#5a4030] transition-colors"
        >
          ログイン画面へ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-[#6B4F3A] font-medium mb-1">新しいパスワードの設定</p>
        <p className="text-xs text-[#9a8070]">8文字以上のパスワードを入力してください。</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#6B4F3A]">
            新しいパスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="8文字以上"
            className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#6B4F3A]">
            新しいパスワード（確認）
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#6B4F3A] hover:bg-[#5a4030] disabled:opacity-60 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {isLoading ? "変更中..." : "パスワードを変更する"}
        </button>
      </form>
    </div>
  );
}
