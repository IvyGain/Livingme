"use client";

import { useState, useTransition } from "react";
import type { ChatChannel } from "@prisma/client";

interface ChannelWithCount extends ChatChannel {
  messageCount: number;
}

const ROLE_OPTIONS = [
  { value: "", label: "全員（ログインユーザー）" },
  { value: "FREE_MEMBER", label: "無料会員以上" },
  { value: "MEMBER", label: "有料会員以上" },
  { value: "ADMIN", label: "管理者のみ" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  FREE_MEMBER: "無料以上",
  MEMBER: "有料以上",
  ADMIN: "管理者のみ",
};

interface Props {
  channels: ChannelWithCount[];
  createChannelAction: (name: string, description?: string, requiredRole?: string | null, writeRole?: string | null) => Promise<ChatChannel>;
  deleteChannelAction: (channelId: string) => Promise<void>;
}

export function AdminChatClient({ channels: initialChannels, createChannelAction, deleteChannelAction }: Props) {
  const [channels, setChannels] = useState(initialChannels);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredRole, setRequiredRole] = useState<string>("");
  const [writeRole, setWriteRole] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName || isPending) return;

    startTransition(async () => {
      try {
        const created = await createChannelAction(trimmedName, description.trim() || undefined, requiredRole || null, writeRole || null);
        setChannels((prev) => [...prev, { ...created, messageCount: 0 }]);
        setName("");
        setDescription("");
        setRequiredRole("");
        setWriteRole("");
      } catch (err) {
        alert("チャンネルの作成に失敗しました: " + (err instanceof Error ? err.message : "不明なエラー"));
      }
    });
  };

  const handleDelete = (channelId: string, channelName: string) => {
    if (!confirm(`「${channelName}」チャンネルとすべてのメッセージを削除しますか？`)) return;

    startTransition(async () => {
      try {
        await deleteChannelAction(channelId);
        setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
      } catch (err) {
        alert("チャンネルの削除に失敗しました: " + (err instanceof Error ? err.message : "不明なエラー"));
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* チャンネル作成フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">新しいチャンネルを作成</h2>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              チャンネル名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: general"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C07052]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="チャンネルの説明"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C07052]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">閲覧権限</label>
            <select
              value={requiredRole}
              onChange={(e) => setRequiredRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C07052] bg-white"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">書き込み権限</label>
            <select
              value={writeRole}
              onChange={(e) => setWriteRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C07052] bg-white"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isPending}
            className="px-4 py-2 bg-[#C07052] text-white text-sm font-medium rounded-lg hover:bg-[#a85e42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            作成
          </button>
        </div>
      </div>

      {/* チャンネル一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">チャンネル一覧</h2>
          <p className="text-sm text-gray-500 mt-0.5">{channels.length}件</p>
        </div>
        {channels.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            チャンネルがありません
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">チャンネル名</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 hidden md:table-cell">説明</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 hidden sm:table-cell">閲覧権限</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 hidden sm:table-cell">書き込み権限</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">メッセージ数</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600 hidden lg:table-cell">作成日</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch, i) => (
                <tr
                  key={ch.id}
                  className={`${i !== channels.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-3">
                    <span className="font-medium text-gray-900"># {ch.name}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 hidden md:table-cell">
                    {ch.description ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">
                    {ch.requiredRole ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {ROLE_LABELS[ch.requiredRole] ?? ch.requiredRole}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">全員</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">
                    {ch.writeRole ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        {ROLE_LABELS[ch.writeRole] ?? ch.writeRole}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">全員</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{ch.messageCount}</td>
                  <td className="px-6 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(ch.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(ch.id, ch.name)}
                      disabled={isPending}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
