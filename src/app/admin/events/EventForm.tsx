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
import { EventType } from "@/lib/content-types";
import { createEvent, updateEvent } from "@/server/actions/events";
import type { RegistrationField } from "@/lib/content-types";
import { useRouter } from "next/navigation";

export interface EventFormInitialValues {
  id?: string;
  title?: string;
  description?: string | null;
  eventType?: EventType;
  startsAt?: string;
  endsAt?: string;
  location?: string | null;
  meetingUrl?: string | null;
  isPublished?: boolean;
  registrationEnabled?: boolean;
  registrationFields?: RegistrationField[];
}

const eventTypeOptions = [
  { value: EventType.MORNING_SESSION, label: "朝会" },
  { value: EventType.EVENING_SESSION, label: "夜会" },
  { value: EventType.ONLINE_EVENT, label: "オンラインイベント" },
  { value: EventType.OFFLINE_EVENT, label: "オフラインイベント" },
  { value: EventType.GIVE_KAI, label: "ギブ会" },
  { value: EventType.STUDY_GROUP, label: "勉強会" },
];

const fieldTypeLabels: Record<RegistrationField["type"], string> = {
  text: "テキスト（1行）",
  textarea: "テキスト（複数行）",
  select: "選択肢",
  checkbox: "チェックボックス",
};

function newField(): RegistrationField {
  return {
    id: Math.random().toString(36).slice(2),
    label: "",
    type: "text",
    required: false,
    options: [],
  };
}

export function EventForm({ initial }: { initial?: EventFormInitialValues } = {}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPublished, setIsPublished] = useState(Boolean(initial?.isPublished));
  const [eventType, setEventType] = useState<EventType>(
    initial?.eventType ?? EventType.MORNING_SESSION,
  );
  const [registrationEnabled, setRegistrationEnabled] = useState(
    Boolean(initial?.registrationEnabled),
  );
  const [fields, setFields] = useState<RegistrationField[]>(
    initial?.registrationFields ?? [],
  );

  function addField() {
    setFields((prev) => [...prev, newField()]);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function updateField(id: string, changes: Partial<RegistrationField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      eventType,
      startsAt: formData.get("startsAt") as string,
      endsAt: (formData.get("endsAt") as string) || undefined,
      location: formData.get("location") as string,
      meetingUrl: formData.get("meetingUrl") as string,
      isPublished,
      registrationEnabled,
      registrationFields: registrationEnabled ? fields : [],
    };

    const result = isEdit && initial?.id
      ? await updateEvent(initial.id, payload)
      : await createEvent(payload);

    if (result.success) {
      setSuccess(true);
      if (isEdit) {
        router.push("/admin/events");
        router.refresh();
      } else {
        form.reset();
        setFields([]);
        setRegistrationEnabled(false);
        router.refresh();
      }
    } else {
      setError(result.error ?? (isEdit ? "更新に失敗しました" : "作成に失敗しました"));
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
          {isEdit ? "イベントを更新しました" : "イベントを作成しました"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">タイトル *</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="イベントタイトル"
            defaultValue={initial?.title ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>種別 *</Label>
          <Select
            value={eventType}
            onValueChange={(v) => { if (v) setEventType(v as EventType); }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">場所</Label>
          <Input
            id="location"
            name="location"
            placeholder="Zoom / 東京..."
            defaultValue={initial?.location ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startsAt">開始日時 *</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={initial?.startsAt ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endsAt">終了日時</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={initial?.endsAt ?? ""}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="meetingUrl">参加URL</Label>
          <Input
            id="meetingUrl"
            name="meetingUrl"
            type="url"
            placeholder="https://zoom.us/..."
            defaultValue={initial?.meetingUrl ?? ""}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            placeholder="イベントの説明..."
            defaultValue={initial?.description ?? ""}
          />
        </div>
      </div>

      {/* Registration toggle */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRegistrationEnabled(!registrationEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              registrationEnabled ? "bg-[#C07052]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                registrationEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">申込受付を有効にする</span>
        </div>

        {/* Registration form builder */}
        {registrationEnabled && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700">申込フォームの項目</p>

            {fields.length === 0 && (
              <p className="text-xs text-gray-400">項目を追加してください（追加しない場合、名前・メールのみで申し込みできます）</p>
            )}

            {fields.map((field, idx) => (
              <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">項目 {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">ラベル *</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="例: 参加動機"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">種類</Label>
                    <Select
                      value={field.type}
                      onValueChange={(v) =>
                        updateField(field.id, { type: v as RegistrationField["type"] })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(fieldTypeLabels) as RegistrationField["type"][]).map((t) => (
                          <SelectItem key={t} value={t}>
                            {fieldTypeLabels[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {field.type === "select" && (
                  <div>
                    <Label className="text-xs">選択肢（カンマ区切り）</Label>
                    <Input
                      value={field.options?.join(",") ?? ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="例: 初参加,リピーター,スタッフ"
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`req-${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">
                    必須項目
                  </Label>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addField}
              className="w-full border-dashed border-gray-300 text-gray-500 hover:border-[#C07052] hover:text-[#C07052]"
            >
              + 項目を追加
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-[#C07052] hover:bg-[#a85e42] text-white"
      >
        {isLoading
          ? isEdit
            ? "更新中..."
            : "作成中..."
          : isEdit
            ? "イベントを更新"
            : "イベントを作成"}
      </Button>
    </form>
  );
}
