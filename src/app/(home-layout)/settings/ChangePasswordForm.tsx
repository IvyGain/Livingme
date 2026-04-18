"use client";

import { useState } from "react";
import { changePassword } from "@/server/actions/password-change";

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (next !== confirm) {
      setMessage({ type: "error", text: "新しいパスワードが一致しません" });
      return;
    }
    if (next.length < 8) {
      setMessage({ type: "error", text: "パスワードは8文字以上で入力してください" });
      return;
    }

    setIsLoading(true);
    const result = await changePassword(current, next);
    setIsLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "パスワードを変更しました" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setMessage({ type: "error", text: result.error ?? "変更に失敗しました" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "var(--lm-primary)" }}>
          現在のパスワード
        </label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20"
          style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-bg)", color: "var(--lm-primary)" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "var(--lm-primary)" }}>
          新しいパスワード
        </label>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="8文字以上"
          className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20"
          style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-bg)", color: "var(--lm-primary)" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "var(--lm-primary)" }}>
          新しいパスワード（確認）
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20"
          style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-bg)", color: "var(--lm-primary)" }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--lm-accent)" }}
      >
        {isLoading ? "変更中..." : "パスワードを変更する"}
      </button>
    </form>
  );
}
