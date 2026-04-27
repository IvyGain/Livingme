"use client";

import { useState, useTransition } from "react";
import type { DynamicFormInput, DynamicFormField } from "@/lib/dynamic-form-types";
import {
  createDynamicForm,
  updateDynamicForm,
  deleteDynamicForm,
} from "@/server/actions/dynamic-forms";

interface FormsAdminProps {
  initial: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    fields: DynamicFormField[];
    ambassadorOnly: boolean;
    larkTableId: string | null;
    isPublished: boolean;
    sortOrder: number;
  }>;
}

export function FormsAdmin({ initial }: FormsAdminProps) {
  const [forms, setForms] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setCreating(true);
    setEditing(null);
  }

  function handleEdit(id: string) {
    setEditing(id);
    setCreating(false);
  }

  function handleCancel() {
    setEditing(null);
    setCreating(false);
  }

  async function handleSave(data: DynamicFormInput, id?: string) {
    startTransition(async () => {
      if (id) {
        const result = await updateDynamicForm(id, data);
        if (result.success) {
          setForms((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...data } : f))
          );
          setEditing(null);
        } else {
          alert(result.error ?? "更新に失敗しました");
        }
      } else {
        const result = await createDynamicForm(data);
        if (result.success && result.id) {
          setForms((prev) => [
            ...prev,
            { id: result.id!, ...data } as typeof prev[0],
          ]);
          setCreating(false);
        } else {
          alert(result.error ?? "作成に失敗しました");
        }
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？")) return;
    startTransition(async () => {
      const result = await deleteDynamicForm(id);
      if (result.success) {
        setForms((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(result.error ?? "削除に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 bg-[#C07052] hover:bg-[#a85e42] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          + 新規フォーム作成
        </button>
      </div>

      {creating && (
        <FormEditor
          onSave={(data) => handleSave(data)}
          onCancel={handleCancel}
          isPending={isPending}
        />
      )}

      <div className="space-y-3">
        {forms.map((form) => (
          <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editing === form.id ? (
              <FormEditor
                initial={form}
                onSave={(data) => handleSave(data, form.id)}
                onCancel={handleCancel}
                isPending={isPending}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{form.title}</h3>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      /{form.slug}
                    </code>
                    {!form.isPublished && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        非公開
                      </span>
                    )}
                    {form.ambassadorOnly && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        アンバサダー限定
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                  <div className="text-xs text-gray-500">
                    {form.fields.length} 項目
                    {form.larkTableId && (
                      <span className="ml-2">
                        | Lark: <code className="bg-gray-100 px-1 rounded">{form.larkTableId}</code>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(form.id)}
                    className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {forms.length === 0 && !creating && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">フォームが登録されていません</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-sm text-[#C07052] hover:underline"
          >
            最初のフォームを作成
          </button>
        </div>
      )}
    </div>
  );
}

interface FormEditorProps {
  initial?: Partial<DynamicFormInput>;
  onSave: (data: DynamicFormInput) => void;
  onCancel: () => void;
  isPending: boolean;
}

function FormEditor({ initial, onSave, onCancel, isPending }: FormEditorProps) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ambassadorOnly, setAmbassadorOnly] = useState(initial?.ambassadorOnly ?? false);
  const [larkTableId, setLarkTableId] = useState(initial?.larkTableId ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [fields, setFields] = useState<DynamicFormField[]>(initial?.fields ?? []);

  function addField() {
    setFields([
      ...fields,
      { name: "", label: "", type: "text", required: false },
    ]);
  }

  function updateField(index: number, updated: Partial<DynamicFormField>) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updated } : f))
    );
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (!slug || !title) {
      alert("slug と title は必須です");
      return;
    }
    onSave({
      slug,
      title,
      description,
      fields,
      ambassadorOnly,
      larkTableId: larkTableId || null,
      isPublished,
      sortOrder,
    });
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-300">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-700 uppercase">Slug *</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="例: event-2024"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#C07052] focus:border-transparent"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 uppercase">タイトル *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: イベント参加申請"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#C07052] focus:border-transparent"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-gray-700 uppercase">説明</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#C07052] focus:border-transparent resize-none"
        />
      </label>

      <div className="grid grid-cols-3 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-700 uppercase">Lark Table ID</span>
          <input
            type="text"
            value={larkTableId}
            onChange={(e) => setLarkTableId(e.target.value)}
            placeholder="オプション"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#C07052] focus:border-transparent"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 uppercase">ソート順</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#C07052] focus:border-transparent"
          />
        </label>

        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-[#C07052] border-gray-300 rounded focus:ring-[#C07052]"
            />
            <span className="text-sm text-gray-700">公開</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ambassadorOnly}
              onChange={(e) => setAmbassadorOnly(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">アンバサダー限定</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">フォーム項目</h4>
          <button
            onClick={addField}
            type="button"
            className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            + 項目追加
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={i} className="bg-white p-3 rounded border border-gray-200 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(i, { name: e.target.value })}
                  placeholder="name (例: email)"
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  placeholder="ラベル (例: メールアドレス)"
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded"
                />
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(i, { type: e.target.value as DynamicFormField["type"] })
                  }
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded"
                >
                  <option value="text">テキスト</option>
                  <option value="textarea">テキストエリア</option>
                  <option value="select">選択</option>
                  <option value="date">日付</option>
                </select>
              </div>

              <input
                type="text"
                value={field.placeholder ?? ""}
                onChange={(e) => updateField(i, { placeholder: e.target.value })}
                placeholder="placeholder (オプション)"
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              />

              {field.type === "select" && (
                <input
                  type="text"
                  value={field.options?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateField(i, {
                      options: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="選択肢（カンマ区切り: 選択肢A, 選択肢B, 選択肢C）"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) => updateField(i, { required: e.target.checked })}
                    className="w-3 h-3 text-[#C07052] border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-600">必須</span>
                </label>
                <button
                  onClick={() => removeField(i)}
                  className="text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              「+ 項目追加」ボタンでフォーム項目を追加してください
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 bg-[#C07052] hover:bg-[#a85e42] text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中…" : "保存"}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded text-sm transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
