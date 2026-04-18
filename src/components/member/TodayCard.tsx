"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TodayCardProps {
  energyShare?: string | null;
  journalingTheme?: string | null;
  morningNote?: string | null;
  date: Date;
}

export function TodayCard({
  energyShare,
  journalingTheme,
  morningNote,
  date,
}: TodayCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // 最初の1行（改行まで or 全体）をプレビューとして表示
  const previewText = energyShare?.split("\n")[0] ?? "";
  const hasMore = energyShare ? energyShare.length > previewText.length || energyShare.split("\n").length > 1 : false;

  return (
    <Card className="bg-gradient-to-br from-[#FEFCF8] to-[#EFF4EF] border-[#e8ddd5] shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#C07052] to-[#7A9E7E]" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#6B4F3A]">
            今日のエネルギー
          </CardTitle>
          <span className="text-xs text-[#9a8070] bg-white px-3 py-1 rounded-full border border-[#e8ddd5]">
            {dateStr}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {energyShare ? (
          <div>
            <p className="text-xs font-medium text-[#7A9E7E] mb-1 uppercase tracking-wide">
              エネルギーシェア
            </p>
            {expanded ? (
              <p className="text-[#6B4F3A] leading-relaxed text-sm whitespace-pre-wrap">{energyShare}</p>
            ) : (
              <p className="text-[#6B4F3A] leading-relaxed text-sm">{previewText}</p>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 flex items-center gap-1 text-xs text-[#C07052] hover:underline transition-colors"
              >
                {expanded ? (
                  <><ChevronUp className="w-3.5 h-3.5" />閉じる</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" />中身を見る</>
                )}
              </button>
            )}
          </div>
        ) : null}

        {journalingTheme ? (
          <div className="pt-3 border-t border-[#e8ddd5]">
            <p className="text-xs font-medium text-[#C07052] mb-1 uppercase tracking-wide">
              ジャーナリングテーマ
            </p>
            <p className="text-[#6B4F3A] leading-relaxed text-sm font-medium">
              {journalingTheme}
            </p>
          </div>
        ) : null}

        {morningNote ? (
          <div className="pt-3 border-t border-[#e8ddd5]">
            <p className="text-xs font-medium text-[#9a8070] mb-1 uppercase tracking-wide">
              朝会より
            </p>
            <p className="text-[#9a8070] leading-relaxed text-sm">{morningNote}</p>
          </div>
        ) : null}

        {!energyShare && !journalingTheme && !morningNote && (
          <p className="text-sm text-[#9a8070] text-center py-2">
            今日のコンテンツはまだ投稿されていません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
