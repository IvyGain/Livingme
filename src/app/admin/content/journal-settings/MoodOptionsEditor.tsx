"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Trash2, GripVertical, Save } from "lucide-react";
import { saveJournalMoodOptions } from "@/server/actions/journal-settings";

export function MoodOptionsEditor({ initialOptions }: { initialOptions: string[] }) {
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function updateOption(i: number, val: string) {
    setOptions((prev) => prev.map((o, j) => (j === i ? val : o)));
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, j) => j !== i));
  }

  function moveOption(i: number, dir: "up" | "down") {
    setOptions((prev) => {
      const arr = [...prev];
      const target = dir === "up" ? i - 1 : i + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[i], arr[target]] = [arr[target], arr[i]];
      return arr;
    });
  }

  function handleSave() {
    const nonEmpty = options.filter((o) => o.trim().length > 0);
    startTransition(async () => {
      await saveJournalMoodOptions(nonEmpty);
      setOptions(nonEmpty);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const inputCls =
    "flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white transition-colors";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-700">気分の選択肢</h2>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-[#C07052] hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            追加
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          ジャーナル入力画面の「今日の気分」ボタンに表示される選択肢です。絵文字＋テキストの形式を推奨します。
        </p>
        {options.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            選択肢がありません。「追加」ボタンで追加してください。
          </p>
        )}
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveOption(i, "up")}
                  disabled={i === 0}
                  className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveOption(i, "down")}
                  disabled={i === options.length - 1}
                  className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className={inputCls}
                placeholder="例: 😊 穏やか"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* プレビュー */}
      {options.filter((o) => o.trim()).length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">プレビュー（ジャーナル画面での表示）</p>
          <div className="flex gap-2 flex-wrap">
            {options
              .filter((o) => o.trim())
              .map((opt, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#e8ddd5] text-[#9a8070] bg-white"
                >
                  {opt}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-60 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isPending ? "保存中..." : "変更を保存する"}
        </button>
        {saved && (
          <span className="text-sm text-[#4a7a50] font-medium">✓ 保存しました</span>
        )}
      </div>
    </div>
  );
}
