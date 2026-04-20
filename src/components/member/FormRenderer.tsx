"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FormDef } from "@/lib/form-defs";
import { submitForm } from "@/server/actions/forms";
import { submitDynamicForm } from "@/server/actions/dynamic-forms";

interface FormRendererProps {
  form: FormDef;
  isDynamic?: boolean;
}

export function FormRenderer({ form, isDynamic = false }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = isDynamic
        ? await submitDynamicForm(form.slug, values)
        : await submitForm(form.slug, values);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "送信に失敗しました");
      }
    });
  }

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-[#EFF4EF] rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-light text-[#6B4F3A]">送信が完了しました</h2>
        <p className="text-sm text-[#9a8070]">
          申請を受け付けました。担当者より改めてご連絡いたします。
        </p>
        <button
          onClick={() => router.push("/forms")}
          className="mt-4 inline-block text-sm text-[#C07052] hover:underline"
        >
          ← わたしページに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-2xl p-6 space-y-5">
        {form.fields.map((field) => (
          <label key={field.name} className="block">
            <span className="text-xs font-medium text-[#9a8070] uppercase tracking-wide">
              {field.label}
              {field.required && <span className="text-[#C07052] ml-1">*</span>}
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="mt-2 w-full resize-none bg-transparent text-[#6B4F3A] placeholder:text-[#b8a898] leading-relaxed focus:outline-none text-sm border-b border-[#e8ddd5] pb-2"
              />
            ) : field.type === "select" ? (
              <select
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-2 w-full bg-transparent text-[#6B4F3A] text-sm border-b border-[#e8ddd5] pb-2 focus:outline-none"
              >
                <option value="">選択してください</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-2 w-full bg-transparent text-[#6B4F3A] placeholder:text-[#b8a898] text-sm border-b border-[#e8ddd5] pb-2 focus:outline-none"
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 bg-[#C07052] hover:bg-[#a85e42] disabled:opacity-60 text-white font-medium py-3.5 rounded-full transition-colors"
        >
          {isPending ? "送信中…" : "申請を送信する"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3.5 border border-[#e8ddd5] text-[#9a8070] hover:bg-[#f5f0ea] rounded-full transition-colors text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
