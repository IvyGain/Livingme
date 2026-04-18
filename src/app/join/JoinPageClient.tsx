"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { registerFree } from "@/server/actions/register";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { JoinPageSettings, PlanBlock } from "@/lib/join-settings";

type Step = "select" | "form" | "payment";

export function JoinPageClient({
  settings,
  inviteToken,
  inviteEmail,
  inviteError,
}: {
  settings: JoinPageSettings;
  inviteToken?: string | null;
  inviteEmail?: string | null;
  inviteError?: string | null;
}) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanBlock | null>(null);
  const [step, setStep] = useState<Step>("select");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(inviteEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(inviteError ?? null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const visiblePlans = settings.plans.filter((p) => p.visible);
  const isFree = selectedPlan?.price.includes("¥0") || selectedPlan?.price === "無料";
  const hasValidInvite = Boolean(inviteToken && inviteEmail && !inviteError);

  function handleSelectPlan(plan: PlanBlock) {
    setSelectedPlan(plan);
    setStep("form");
    setError(null);
  }

  function handleBack() {
    if (step === "form") { setStep("select"); setSelectedPlan(null); }
    else if (step === "payment") { setStep("form"); }
    setError(null);
  }

  function handleFreeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteToken || !hasValidInvite) {
      setError("無料会員登録には招待リンクが必要です。招待メールのリンクからアクセスしてください。");
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      setError("すべての項目を入力してください");
      return;
    }
    startTransition(async () => {
      const result = await registerFree(inviteToken, name, email, password);
      if (!result.success) {
        setError(result.error ?? "エラーが発生しました");
        return;
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        router.push("/login?registered=1");
        return;
      }
      router.push("/home");
    });
  }

  function handlePaidFormNext(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("お名前とメールアドレスを入力してください");
      return;
    }
    setError(null);
    // 外部決済URLが設定されている場合はリダイレクト
    if (selectedPlan?.paymentUrl) {
      window.location.href = selectedPlan.paymentUrl;
      return;
    }
    setStep("payment");
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);
    try {
      const paymentUrl = selectedPlan?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "エラーが発生しました"); return; }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--lm-bg)] text-[var(--lm-primary)] flex flex-col">
      <header className="bg-[var(--lm-card-bg)] border-b border-[var(--lm-border)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {step !== "select" ? (
            <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-[var(--lm-muted)] hover:text-[var(--lm-primary)] transition-colors">
              <ChevronLeft className="w-4 h-4" /> 戻る
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--lm-muted)] hover:text-[var(--lm-primary)] transition-colors">
              <ChevronLeft className="w-4 h-4" /> トップに戻る
            </Link>
          )}
          <span className="font-serif text-lg tracking-widest text-[var(--lm-primary)]">Living Me</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* プラン選択 */}
          {step === "select" && (
            <div>
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl font-semibold mb-2">Living Me に参加する</h1>
                <p className="text-sm text-[var(--lm-muted)]">ご希望のプランをお選びください</p>
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(visiblePlans.length, 3)} gap-5`}>
                {visiblePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
                ))}
              </div>
              <p className="text-center text-xs text-[var(--lm-muted)] mt-6">
                すでにアカウントをお持ちの方は{" "}
                <Link href="/login" className="underline underline-offset-2 hover:text-[var(--lm-primary)]">ログイン</Link>
              </p>
            </div>
          )}

          {/* 情報入力 */}
          {step === "form" && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl font-semibold mb-2">
                  {selectedPlan?.name}登録
                </h1>
                <p className="text-sm text-[var(--lm-muted)]">
                  {isFree
                    ? hasValidInvite
                      ? "招待メールに記載のアドレスで登録します。お名前とパスワードを入力してください"
                      : "お名前・メールアドレス・パスワードを入力してください"
                    : "まずはお名前とメールアドレスを教えてください"}
                </p>
              </div>

              {isFree && !hasValidInvite ? (
                <div className="bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl p-6 text-center space-y-4">
                  <p className="text-sm text-[var(--lm-primary)] leading-relaxed">
                    Living Me は招待制コミュニティです。<br />
                    無料会員登録には招待リンクが必要です。
                  </p>
                  <p className="text-xs text-[var(--lm-muted)]">
                    すでに招待メールをお持ちの方は、メール本文のボタン（またはリンク）からお進みください。
                  </p>
                  {inviteError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {inviteError}
                    </p>
                  )}
                  <Link
                    href="/login"
                    className="inline-block px-5 h-10 leading-10 rounded-full border border-[var(--lm-accent)] text-[var(--lm-accent)] text-sm hover:bg-[var(--lm-accent)] hover:text-white transition-colors"
                  >
                    既にアカウントをお持ちの方はログイン
                  </Link>
                </div>
              ) : (
                <form onSubmit={isFree ? handleFreeSubmit : handlePaidFormNext} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">お名前</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="山田 花子" required
                      className="w-full h-11 px-4 rounded-xl border border-[var(--lm-border)] bg-white text-sm placeholder:text-[var(--lm-muted)] focus:outline-none focus:border-[var(--lm-accent)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      メールアドレス
                      {hasValidInvite && (
                        <span className="ml-2 text-xs text-[var(--lm-muted)]">（招待メールと一致する必要があります）</span>
                      )}
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="hanako@example.com" required readOnly={isFree && hasValidInvite}
                      className="w-full h-11 px-4 rounded-xl border border-[var(--lm-border)] bg-white text-sm placeholder:text-[var(--lm-muted)] focus:outline-none focus:border-[var(--lm-accent)] transition-colors read-only:bg-[var(--lm-card-bg)] read-only:cursor-not-allowed" />
                  </div>
                  {isFree && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">パスワード</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="8文字以上" required minLength={8}
                        className="w-full h-11 px-4 rounded-xl border border-[var(--lm-border)] bg-white text-sm placeholder:text-[var(--lm-muted)] focus:outline-none focus:border-[var(--lm-accent)] transition-colors" />
                    </div>
                  )}
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                  )}
                  {/* 外部申し込みURLがある場合はそちらへ誘導 */}
                  {!isFree && selectedPlan?.joinUrl ? (
                    <a
                      href={selectedPlan.joinUrl}
                      className="block w-full h-12 rounded-full bg-[var(--lm-accent)] text-white font-medium text-base hover:opacity-90 transition-opacity text-center leading-[3rem]"
                    >
                      申し込みページへ
                    </a>
                  ) : (
                    <button type="submit" disabled={isPending}
                      className="w-full h-12 rounded-full bg-[var(--lm-accent)] text-white font-medium text-base hover:opacity-90 disabled:opacity-60 transition-opacity">
                      {isPending ? "処理中..." : isFree ? "無料会員として登録する" : "次へ（お支払い情報の入力）"}
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* 有料決済 */}
          {step === "payment" && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl font-semibold mb-2">お支払い情報</h1>
                <p className="text-sm text-[var(--lm-muted)]">安全な決済ページでお手続きいただきます</p>
              </div>
              <div className="bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--lm-muted)]">お名前</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--lm-muted)]">メールアドレス</span>
                  <span className="font-medium truncate max-w-[200px]">{email}</span>
                </div>
                <div className="border-t border-[var(--lm-border)] pt-3 flex justify-between">
                  <span className="text-sm text-[var(--lm-muted)]">プラン</span>
                  <span className="font-semibold">{selectedPlan?.name} {selectedPlan?.price}</span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
              )}
              <button onClick={handlePayment} disabled={loading}
                className="w-full h-12 rounded-full bg-[var(--lm-accent)] text-white font-medium text-base hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? "処理中..." : "お支払いへ進む"}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[var(--lm-muted)]">
                <Lock className="w-3.5 h-3.5" />
                <span>安全な決済ページへ移動します</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 px-4 text-center text-xs text-[var(--lm-muted)] border-t border-[var(--lm-border)]">
        <p>{settings.footerText}</p>
      </footer>
    </div>
  );
}

function PlanCard({ plan, onSelect }: { plan: PlanBlock; onSelect: (p: PlanBlock) => void }) {
  if (plan.isHighlighted) {
    return (
      <button type="button" onClick={() => onSelect(plan)}
        className="group text-left bg-[var(--lm-accent)] border-2 border-[var(--lm-accent)] rounded-2xl p-6 transition-all hover:shadow-md hover:opacity-95">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-base font-semibold text-white">{plan.name}</span>
          <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">おすすめ</span>
        </div>
        <div className="text-2xl font-light text-white mb-4">
          {plan.price}
        </div>
        <ul className="space-y-2 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/90">
              <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
        <div className="w-full py-2.5 rounded-full bg-white text-[var(--lm-accent)] text-sm font-semibold text-center">
          {plan.name}になる
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onSelect(plan)}
      className="group text-left bg-[var(--lm-card-bg)] border-2 border-[var(--lm-border)] hover:border-[var(--lm-accent)] rounded-2xl p-6 transition-all hover:shadow-md">
      <p className="text-base font-semibold mb-1">{plan.name}</p>
      <div className="text-2xl font-light mb-4">
        {plan.price}
      </div>
      <ul className="space-y-2 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--lm-muted)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--lm-secondary)] flex-shrink-0" />{f}
          </li>
        ))}
      </ul>
      <div className="w-full py-2.5 rounded-full border border-[var(--lm-accent)] text-[var(--lm-accent)] text-sm font-medium text-center group-hover:bg-[var(--lm-accent)] group-hover:text-white transition-colors">
        {plan.name}で始める
      </div>
    </button>
  );
}
