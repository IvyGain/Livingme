"use client";

import { useState } from "react";

type Role = "MEMBER" | "ADMIN";

const ROLE_LABELS: Record<Role, string> = {
  MEMBER: "一般会員",
  ADMIN: "管理者",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  MEMBER: "通常の会員権限でログインできます",
  ADMIN: "管理画面へのアクセス権限が付与されます",
};

export function InviteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "warning" | "error"; message: string; inviteUrl?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error ?? "エラーが発生しました" });
      } else {
        const label = ROLE_LABELS[role];
        if (data.emailSkipped || data.emailError) {
          // メール未設定 or 送信失敗 → URLを手動共有
          setResult({
            type: "warning",
            message: `メール送信をスキップしました。招待URLを手動で${email}に共有してください（${label}）`,
            inviteUrl: data.inviteUrl,
          });
        } else {
          setResult({
            type: "success",
            message: `${email} に招待メールを送信しました（${label}）`,
            inviteUrl: data.inviteUrl,
          });
        }
        setEmail("");
        setRole("MEMBER");
      }
    } catch {
      setResult({ type: "error", message: "ネットワークエラーが発生しました" });
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setEmail("");
    setRole("MEMBER");
    setResult(null);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#6B4F3A] hover:bg-[#5a4030] text-white text-sm font-medium rounded-lg transition-colors"
      >
        招待メールを送る
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">会員を招待する</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                招待リンクをメールで送信します。リンクは 72 時間有効です。
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {result && (
                  <div
                    className={`p-3 rounded-lg text-sm space-y-2 ${
                      result.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : result.type === "warning"
                        ? "bg-amber-50 border border-amber-200 text-amber-700"
                        : "bg-red-50 border border-red-200 text-red-600"
                    }`}
                  >
                    <p>{result.message}</p>
                    {result.inviteUrl && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">招待URL（72時間有効）</p>
                        <div className="flex gap-2 items-center">
                          <input
                            readOnly
                            value={result.inviteUrl}
                            className="flex-1 text-xs bg-white border border-current/20 rounded px-2 py-1 font-mono overflow-x-auto"
                            onFocus={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(result.inviteUrl!)}
                            className="shrink-0 text-xs px-2 py-1 bg-white border border-current/20 rounded hover:bg-white/80"
                          >
                            コピー
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                  />
                </div>

                {/* ロール選択 */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    権限 <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["MEMBER", "ADMIN"] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          role === r
                            ? "border-[#6B4F3A] bg-[#6B4F3A]/5 text-[#6B4F3A]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-sm font-medium">{ROLE_LABELS[r]}</div>
                        <div className="text-xs mt-0.5 opacity-70">{ROLE_DESCRIPTIONS[r]}</div>
                      </button>
                    ))}
                  </div>

                  {role === "ADMIN" && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                      <p className="text-xs text-amber-700">
                        管理者権限は会員管理・コンテンツ管理などすべての管理機能にアクセスできます。
                        信頼できる相手にのみ付与してください。
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-[#6B4F3A] hover:bg-[#5a4030] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? "送信中..." : "招待メールを送信"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
