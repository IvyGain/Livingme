"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { upsertJournal } from "@/server/actions/journals";

interface JournalEditorProps {
  date: string;
  initialBody: string;
  initialMood: string;
  theme: string | null;
  moodOptions?: string[];
}

const DEFAULT_MOOD_OPTIONS = ["😊 穏やか", "🌟 元気", "😌 落ち着いた", "💭 考え中", "😢 つらい"];

export function JournalEditor({ date, initialBody, initialMood, theme, moodOptions }: JournalEditorProps) {
  const moods = moodOptions && moodOptions.length > 0 ? moodOptions : DEFAULT_MOOD_OPTIONS;
  const [body, setBody] = useState(initialBody);
  const [mood, setMood] = useState(initialMood);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const dateLabel = format(new Date(date), "yyyy年M月d日(E)", { locale: ja });
  const isEditing = initialBody.length > 0;

  function handleSave() {
    if (!body.trim()) {
      setError("内容を入力してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await upsertJournal({ body, mood, date });
      if (result.success) {
        setSaved(true);
        setTimeout(() => {
          router.push("/journal");
        }, 800);
      } else {
        setError(result.error ?? "保存に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 text-sm text-[#9a8070] hover:text-[#6B4F3A] transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ジャーナル一覧に戻る
          </Link>
          <h1 className="text-xl font-light text-[#6B4F3A]">
            {isEditing ? "記録を編集する" : "ジャーナルを書く"}
          </h1>
          <time className="text-xs text-[#9a8070] tabular-nums">{dateLabel}</time>
        </div>
      </div>

      {/* Theme card */}
      {theme && (
        <div className="bg-[#EFF4EF] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#7A9E7E] uppercase tracking-wide mb-2">
            今日のテーマ
          </p>
          <p className="text-[#6B4F3A] leading-relaxed">「{theme}」</p>
        </div>
      )}

      {/* Editor */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-[#9a8070] uppercase tracking-wide">
            今日の気づき・思い
          </span>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setSaved(false); }}
            rows={10}
            placeholder={theme ? `「${theme}」について、自由に書いてみましょう…` : "今日感じたこと、気づいたことを自由に書いてみましょう…"}
            className="mt-2 w-full resize-none bg-transparent text-[#6B4F3A] placeholder:text-[#b8a898] leading-relaxed focus:outline-none text-sm"
          />
        </label>

        {/* Mood */}
        <div className="pt-3 border-t border-[#e8ddd5]">
          <p className="text-xs font-medium text-[#9a8070] uppercase tracking-wide mb-2">
            今日の気分
          </p>
          <div className="flex gap-2 flex-wrap">
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? "" : m)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  mood === m
                    ? "bg-[#C07052] text-white border-[#C07052]"
                    : "border-[#e8ddd5] text-[#9a8070] hover:border-[#C07052]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Save button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending || saved}
          className="flex-1 bg-[#C07052] hover:bg-[#a85e42] disabled:opacity-60 text-white font-medium py-3.5 rounded-full transition-colors"
        >
          {saved ? "✓ 保存しました" : isPending ? "保存中…" : isEditing ? "更新する" : "保存する"}
        </button>
        <Link
          href="/journal"
          className="px-6 py-3.5 border border-[#e8ddd5] text-[#9a8070] hover:bg-[#f5f0ea] rounded-full transition-colors text-sm text-center"
        >
          キャンセル
        </Link>
      </div>
    </div>
  );
}
