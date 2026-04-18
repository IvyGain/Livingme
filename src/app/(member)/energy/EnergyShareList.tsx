"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TodayContent } from "@/lib/content-types";

function EnergyShareCard({ item }: { item: TodayContent }) {
  const [expanded, setExpanded] = useState(false);

  const previewText = item.energyShare?.split("\n")[0] ?? "";
  const hasMore = item.energyShare
    ? item.energyShare.length > previewText.length || item.energyShare.split("\n").length > 1
    : false;

  const dateStr = item.date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div
      className="rounded-2xl border p-5 transition-shadow hover:shadow-sm"
      style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
    >
      <p className="text-xs mb-2" style={{ color: "var(--lm-muted)" }}>{dateStr}</p>
      {expanded ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--lm-primary)" }}>
          {item.energyShare}
        </p>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: "var(--lm-primary)" }}>
          {previewText}
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs transition-colors hover:opacity-70"
          style={{ color: "var(--lm-accent)" }}
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" />閉じる</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" />中身を見る</>
          )}
        </button>
      )}
    </div>
  );
}

export function EnergyShareList({ shares }: { shares: TodayContent[] }) {
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
        <div className="space-y-4">
          {shares.map((item) => (
            <EnergyShareCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
