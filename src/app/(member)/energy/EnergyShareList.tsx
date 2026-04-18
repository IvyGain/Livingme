"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TodayContent } from "@/lib/content-types";

function MoonIcon({ phase }: { phase: TodayContent["moonPhase"] }) {
  if (!phase) return null;
  return (
    <span className="inline-block text-lg leading-none" aria-label={phase === "full" ? "満月" : "新月"}>
      {phase === "full" ? "🌝" : "🌚"}
    </span>
  );
}

/**
 * セクションタイトル間に薄線を引きながらエネルギーシェアの各要素を並べる。
 * 値が空のセクションは描画しない（管理者が入力したフィールドだけ見える）。
 */
function SectionsView({ item }: { item: TodayContent }) {
  const sections: Array<{ label: string; value: string | null; kind?: "normal" | "point" }> = [
    { label: "今日のテーマ", value: item.title },
    { label: "コラム", value: item.column },
    { label: "今日の紋章プチ解説", value: item.symbolNote },
    { label: "💫 今日のポイント", value: item.todayPoint, kind: "point" },
    { label: "エネルギーシェア", value: item.energyShare },
  ];
  const visible = sections.filter((s) => s.value && s.value.trim().length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="divide-y divide-[#e8ddd5]">
      {visible.map((s) => (
        <section key={s.label} className="py-4 first:pt-0 last:pb-0">
          <h4 className="text-xs font-medium text-[#9a8070] mb-2 tracking-wide uppercase">
            {s.label}
          </h4>
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              s.kind === "point" ? "text-[#C07052] font-medium" : "text-[#6B4F3A]"
            }`}
          >
            {s.value}
          </p>
        </section>
      ))}
    </div>
  );
}

function EnergyShareCard({ item, defaultExpanded = false }: { item: TodayContent; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const dateStr = item.date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const hasStructured =
    Boolean(item.title || item.column || item.symbolNote || item.todayPoint) ||
    Boolean(item.energyShare);

  return (
    <article
      className="rounded-2xl border p-5 transition-shadow hover:shadow-sm"
      style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
    >
      <header className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs tabular-nums" style={{ color: "var(--lm-muted)" }}>{dateStr}</p>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--lm-muted)" }}>
          {item.mayanBlackKin && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold" aria-label="黒キン">
              黒
            </span>
          )}
          <MoonIcon phase={item.moonPhase} />
        </div>
      </header>

      {item.mayanInfo && (
        <p className="text-xs text-[#9a8070] leading-relaxed mb-2 whitespace-pre-wrap">
          {item.mayanInfo}
        </p>
      )}

      {item.title && (
        <h3 className="text-base font-medium text-[#6B4F3A] mb-3">
          {item.title}
        </h3>
      )}

      {expanded && hasStructured && <SectionsView item={item} />}

      {!expanded && hasStructured && (
        <p className="text-sm text-[#9a8070]">続きを見る</p>
      )}

      {hasStructured && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs transition-colors hover:opacity-70"
          style={{ color: "var(--lm-accent)" }}
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" />閉じる</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" />続きを見る</>
          )}
        </button>
      )}
    </article>
  );
}

export function EnergyShareList({ shares }: { shares: TodayContent[] }) {
  const [showAll, setShowAll] = useState(false);
  const [latest, ...rest] = shares;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium" style={{ color: "var(--lm-primary)" }}>
        エネルギーシェア
      </h1>

      {shares.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center text-sm"
          style={{ borderColor: "var(--lm-border)", color: "var(--lm-muted)" }}
        >
          エネルギーシェアはまだありません
        </div>
      ) : (
        <>
          {latest && <EnergyShareCard item={latest} defaultExpanded />}

          {rest.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-sm text-[#9a8070] hover:text-[#6B4F3A] underline underline-offset-2"
              >
                {showAll
                  ? "過去のエネルギーシェアを閉じる"
                  : `過去のエネルギーシェア（${rest.length}件）を見る`}
              </button>
            </div>
          )}

          {showAll && (
            <div className="space-y-4">
              {rest.map((item) => (
                <EnergyShareCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
