"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  // callbackUrl は必ず同一オリジンの相対パスに制限（オープンリダイレクト対策）
  const rawCallback = searchParams.get("callbackUrl") ?? "/home";
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/home";

  const error = searchParams.get("error");
  const invited = searchParams.get("invited");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setEmailError("メールアドレスまたはパスワードが正しくありません");
      } else {
        // フルリロードで遷移（proxy がクッキーを確実に読めるようにする）
        window.location.href = callbackUrl;
      }
    } catch {
      setEmailError("ログインに失敗しました。しばらくしてからお試しください");
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
          <CardHeader className="pb-3">
            <CardTitle className="text-[#6B4F3A] text-xl font-medium">ログイン</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {invited && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                パスワードの設定が完了しました。メールアドレスでログインしてください。
              </div>
            )}

            {error === "suspended" ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                アカウントが無効になっています。管理者にお問い合わせください。
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                ログインに失敗しました。もう一度お試しください。
              </div>
            ) : null}

            <form onSubmit={handleEmailLogin} className="space-y-3">
              {emailError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {emailError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6B4F3A]">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2.5 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6B4F3A]">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    required
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 pr-10 border border-[#e8ddd5] rounded-lg text-sm bg-white text-[#4a3728] placeholder-[#c0b0a0] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#9a8070] hover:text-[#6B4F3A] transition-colors"
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#6B4F3A] hover:bg-[#5a4030] disabled:opacity-60 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </button>

              <div className="text-center pt-1">
                <a
                  href="/forgot-password"
                  className="text-xs text-[#9a8070] hover:text-[#6B4F3A] transition-colors"
                >
                  パスワードをお忘れの方はこちら
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
