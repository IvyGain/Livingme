"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertTodayContent } from "@/server/actions/today";
import type { TodayContent } from "@/lib/content-types";

interface TodayContentFormProps {
  initialData: TodayContent | null;
  defaultDate: string;
}

export function TodayContentForm({ initialData, defaultDate }: TodayContentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [blackKin, setBlackKin] = useState(initialData?.mayanBlackKin ?? false);
  const [moonPhase, setMoonPhase] = useState<"" | "full" | "new">(
    initialData?.moonPhase ?? "",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await upsertTodayContent({
      date: formData.get("date") as string,
      energyShare: formData.get("energyShare") as string,
      journalingTheme: formData.get("journalingTheme") as string,
      morningNote: formData.get("morningNote") as string,
      isPublished,
      mayanInfo: formData.get("mayanInfo") as string,
      mayanBlackKin: blackKin,
      moonPhase: moonPhase === "" ? null : moonPhase,
      title: formData.get("title") as string,
      column: formData.get("column") as string,
      symbolNote: formData.get("symbolNote") as string,
      todayPoint: formData.get("todayPoint") as string,
    });

    if (result.success) {
      setMessage({ type: "success", text: "保存しました" });
    } else {
      setMessage({ type: "error", text: result.error ?? "保存に失敗しました" });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-gray-700">
          日付
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={
            initialData?.date
              ? new Date(initialData.date).toISOString().split("T")[0]
              : defaultDate
          }
          required
          className="max-w-xs"
        />
      </div>

      {/* ── エネルギーシェア構造化入力 ─────────────────── */}
      <fieldset className="space-y-4 border border-gray-200 rounded-lg p-4">
        <legend className="text-sm font-semibold text-[#6B4F3A] px-2">
          エネルギーシェア
        </legend>

        <div className="space-y-2">
          <Label htmlFor="mayanInfo" className="text-sm font-medium text-gray-700">
            マヤ暦情報
          </Label>
          <Textarea
            id="mayanInfo"
            name="mayanInfo"
            defaultValue={initialData?.mayanInfo ?? ""}
            rows={2}
            placeholder={"K〇〇 太陽の紋章 / ウェイブスペル / 音〇〇"}
            className="resize-none"
          />
          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={blackKin}
                onChange={(e) => setBlackKin(e.target.checked)}
                className="rounded"
              />
              <span>黒キン</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <span>月相</span>
              <select
                value={moonPhase}
                onChange={(e) => setMoonPhase(e.target.value as "" | "full" | "new")}
                className="h-8 px-2 text-sm border border-gray-200 rounded"
              >
                <option value="">—</option>
                <option value="full">🌝 満月</option>
                <option value="new">🌚 新月</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            今日のテーマ（タイトル）
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title ?? ""}
            placeholder="例: 受け取る勇気"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="column" className="text-sm font-medium text-gray-700">
            コラム（テーマ解説）
          </Label>
          <Textarea
            id="column"
            name="column"
            defaultValue={initialData?.column ?? ""}
            rows={5}
            placeholder="テーマの解説文..."
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symbolNote" className="text-sm font-medium text-gray-700">
            今日の紋章プチ解説
          </Label>
          <Textarea
            id="symbolNote"
            name="symbolNote"
            defaultValue={initialData?.symbolNote ?? ""}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="todayPoint" className="text-sm font-medium text-gray-700">
            💫 今日のポイント
          </Label>
          <Textarea
            id="todayPoint"
            name="todayPoint"
            defaultValue={initialData?.todayPoint ?? ""}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="energyShare" className="text-sm font-medium text-gray-700">
            自由記述（追加メッセージ）
          </Label>
          <Textarea
            id="energyShare"
            name="energyShare"
            defaultValue={initialData?.energyShare ?? ""}
            rows={3}
            placeholder="構造化フィールドで表現しきれないメッセージがあればここに..."
            className="resize-none"
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="journalingTheme" className="text-sm font-medium text-gray-700">
          ジャーナリングテーマ
        </Label>
        <Input
          id="journalingTheme"
          name="journalingTheme"
          defaultValue={initialData?.journalingTheme ?? ""}
          placeholder="今日のジャーナリングテーマ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="morningNote" className="text-sm font-medium text-gray-700">
          朝会メモ
        </Label>
        <Textarea
          id="morningNote"
          name="morningNote"
          defaultValue={initialData?.morningNote ?? ""}
          rows={3}
          placeholder="朝会のポイントや感想..."
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isPublished ? "bg-[#7A9E7E]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-600">
          {isPublished ? "公開する" : "下書き保存"}
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#C07052] hover:bg-[#a85e42] text-white"
        >
          {isLoading ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
