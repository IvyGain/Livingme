"use client";

import { useState } from "react";
import { submitInquiry } from "@/server/actions/inquiries";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const inputCls =
    "w-full px-4 py-2.5 border border-[var(--lm-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lm-accent)]/30 focus:border-[var(--lm-accent)] bg-white transition-colors";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await submitInquiry(form);
    setIsLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "送信に失敗しました。しばらくしてから再度お試しください。");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="font-semibold text-lg mb-2">送信が完了しました</h2>
        <p className="text-sm text-[var(--lm-muted)] leading-relaxed">
          お問い合わせありがとうございます。<br />
          通常2〜3営業日以内にご返信いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[var(--lm-primary)] mb-1.5">
          お名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputCls}
          placeholder="山田 花子"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--lm-primary)] mb-1.5">
          メールアドレス <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputCls}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--lm-primary)] mb-1.5">
          件名
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className={inputCls}
          placeholder="ご入会について"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--lm-primary)] mb-1.5">
          お問い合わせ内容 <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={5}
          className={inputCls}
          placeholder="ご質問・ご相談内容をお書きください"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[var(--lm-accent)] text-white font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        <Send className="w-4 h-4" />
        {isLoading ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
