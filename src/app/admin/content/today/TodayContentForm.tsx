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

      <div className="space-y-2">
        <Label htmlFor="energyShare" className="text-sm font-medium text-gray-700">
          エネルギーシェア
        </Label>
        <Textarea
          id="energyShare"
          name="energyShare"
          defaultValue={initialData?.energyShare ?? ""}
          rows={4}
          placeholder="今日のエネルギーメッセージ..."
          className="resize-none"
        />
      </div>

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
