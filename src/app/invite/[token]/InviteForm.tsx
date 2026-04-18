"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteFormProps {
  token: string;
  email: string;
}

export function InviteForm({ token, email }: InviteFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }

      // 登録完了後は自動ログインして会員画面へ
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        // 自動ログイン失敗時はログインページへ案内
        router.push("/login?invited=1");
        return;
      }
      router.push("/home");
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-widest text-[#6B4F3A] mb-2">Living Me</h1>
          <p className="text-sm text-[#9a8070]">あなたのリビングへようこそ</p>
        </div>

        <Card className="border-[#e8ddd5] bg-[#FEFCF8] shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#6B4F3A] text-xl font-medium">パスワードの設定</CardTitle>
            <CardDescription className="text-[#9a8070]">
              招待メールアドレス: <span className="text-[#6B4F3A] font-medium">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6B4F3A]">
                  お名前（任意）
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：山田 花子"
                  className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6B4F3A]">
                  パスワード <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8文字以上"
                  required
                  className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6B4F3A]">
                  パスワード（確認） <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="もう一度入力してください"
                  required
                  className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#6B4F3A] hover:bg-[#5a4030] disabled:opacity-60 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {isLoading ? "登録中..." : "登録を完了する"}
              </button>

              <p className="text-xs text-center text-[#9a8070]">
                パスワードを設定後、メールアドレスとパスワードでログインできます
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
