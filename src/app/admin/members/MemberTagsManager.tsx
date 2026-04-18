"use client";

import { useState, useTransition } from "react";
import { createTag, deleteTag } from "@/server/actions/chat";
import type { TagWithCount } from "@/server/actions/chat";

interface Props {
  initialTags: TagWithCount[];
}

export function MemberTagsManager({ initialTags }: Props) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#9a8070");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    startTransition(async () => {
      try {
        const created = await createTag(trimmed, color);
        setTags((prev) => [...prev, { ...created, _count: { users: 0 } }]);
        setName("");
      } catch (err) {
        alert("タグの作成に失敗しました: " + (err instanceof Error ? err.message : "不明なエラー"));
      }
    });
  };

  const handleDelete = (tagId: string, tagName: string) => {
    if (!confirm(`「${tagName}」タグを削除しますか？会員からも削除されます。`)) return;
    startTransition(async () => {
      try {
        await deleteTag(tagId);
        setTags((prev) => prev.filter((t) => t.id !== tagId));
      } catch (err) {
        alert("タグの削除に失敗しました: " + (err instanceof Error ? err.message : "不明なエラー"));
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">会員タグ管理</h2>
      <div className="flex gap-2 items-center mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="タグ名（例: 初期会員、お助け隊）"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C07052]"
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5"
          title="タグカラー"
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim() || isPending}
          className="px-4 py-2 bg-[#C07052] text-white text-sm font-medium rounded-lg hover:bg-[#a85e42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-400">タグがありません</p>
        ) : (
          tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <span className="text-xs opacity-75">({tag._count.users})</span>
              <button
                onClick={() => handleDelete(tag.id, tag.name)}
                disabled={isPending}
                className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity"
                aria-label={`${tag.name}を削除`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
