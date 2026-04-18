import { ContactForm } from "./ContactForm";
import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | Living Me",
  description: "Living Me へのご質問・ご相談はこちらからどうぞ。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--lm-bg)] text-[var(--lm-primary)]">
      {/* ヘッダー */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--lm-card-bg)]/90 backdrop-blur-sm border-b border-[var(--lm-border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg tracking-widest text-[var(--lm-primary)]">
            Living Me
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[var(--lm-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            今すぐ始める
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-4 uppercase">Contact</p>
            <h1 className="font-serif text-3xl font-semibold mb-3">お問い合わせ</h1>
            <p className="text-[var(--lm-muted)] text-sm leading-relaxed">
              ご質問・ご相談はお気軽にどうぞ。<br />
              通常2〜3営業日以内にご返信いたします。
            </p>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-8">
            <ContactForm />
          </div>

          <p className="mt-6 text-center text-xs text-[var(--lm-muted)]">
            すでに会員の方は{" "}
            <Link href="/api/auth/signin" className="text-[var(--lm-accent)] hover:underline">
              ログイン
            </Link>
            {" "}してチャットからもお問い合わせいただけます。
          </p>
        </div>
      </main>
    </div>
  );
}
