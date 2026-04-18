"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerForEvent, cancelRegistration } from "@/server/actions/registrations";
import type { RegistrationField } from "@/lib/content-types";
import { useRouter } from "next/navigation";

interface Props {
  eventId: string;
  fields: RegistrationField[];
  maxAttendees?: number | null;
  registrationCount: number;
  alreadyRegistered: boolean;
}

export function RegistrationForm({
  eventId,
  fields,
  maxAttendees,
  registrationCount,
  alreadyRegistered,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isFull = maxAttendees != null && registrationCount >= maxAttendees;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await registerForEvent(eventId, answers);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "申し込みに失敗しました");
    }
    setIsLoading(false);
  }

  async function handleCancel() {
    setIsLoading(true);
    setError(null);
    const result = await cancelRegistration(eventId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "キャンセルに失敗しました");
    }
    setIsLoading(false);
  }

  if (alreadyRegistered) {
    return (
      <div className="bg-[#EFF4EF] border border-[#d0e4d0] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-[#5a7e5e]">申し込み済みです</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
          className="text-gray-500 border-gray-300 hover:border-red-300 hover:text-red-600"
        >
          {isLoading ? "処理中..." : "申し込みをキャンセルする"}
        </Button>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">定員に達しました</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-5 space-y-4">
      <h3 className="text-base font-medium text-[#6B4F3A]">イベントに申し込む</h3>

      {maxAttendees && (
        <p className="text-xs text-[#9a8070]">
          残席: {maxAttendees - registrationCount}名 / 定員{maxAttendees}名
        </p>
      )}

      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label htmlFor={field.id} className="text-sm text-[#6B4F3A]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {field.type === "text" && (
            <Input
              id={field.id}
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
              required={field.required}
              className="border-[#e8ddd5] focus:border-[#C07052]"
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.id}
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
              required={field.required}
              rows={3}
              className="border-[#e8ddd5] focus:border-[#C07052]"
            />
          )}

          {field.type === "select" && (
            <Select
              value={answers[field.id] ?? ""}
              onValueChange={(v) => { if (v) setAnswers((prev) => ({ ...prev, [field.id]: v })); }}
            >
              <SelectTrigger className="border-[#e8ddd5]">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "checkbox" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={field.id}
                checked={answers[field.id] === "yes"}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [field.id]: e.target.checked ? "yes" : ("no" as string),
                  }))
                }
                required={field.required}
                className="rounded"
              />
              <Label htmlFor={field.id} className="text-sm cursor-pointer">
                {field.label}
              </Label>
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#C07052] hover:bg-[#a85e42] text-white"
      >
        {isLoading ? "申し込み中..." : "申し込む"}
      </Button>
    </form>
  );
}
