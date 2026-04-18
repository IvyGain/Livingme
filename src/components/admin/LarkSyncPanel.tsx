"use client";

import { useState } from "react";

type Status = { ok: boolean; message: string } | null;

export function LarkSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const handleTest = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/lark?action=test");
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      setStatus({ ok: data.ok, message: data.message ?? data.error ?? "不明なエラー" });
    } catch {
      setStatus({ ok: false, message: "リクエストに失敗しました" });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/lark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-all" }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
        counts?: Record<string, number>;
      };
      if (data.ok) {
        const countStr = data.counts
          ? Object.entries(data.counts)
              .map(([k, v]) => `${k}: ${v}件`)
              .join(", ")
          : "";
        setStatus({ ok: true, message: `${data.message ?? "完了"}${countStr ? `（${countStr}）` : ""}` });
      } else {
        setStatus({ ok: false, message: data.error ?? "失敗しました" });
      }
    } catch {
      setStatus({ ok: false, message: "リクエストに失敗しました" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t border-[#e8ddd5] pt-8">
      <h2 className="text-base font-semibold text-[#6B4F3A] mb-1">Lark Base 同期</h2>
      <p className="text-sm text-gray-500 mb-4">
        アーカイブ・イベント・コラム・チャンネルなどのデータを Lark Base に一括エクスポートします。
        ジャーナル・フォーム回答は書き込み時点でリアルタイムに同期されます。
      </p>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "処理中..." : "接続テスト"}
        </button>
        <button
          onClick={handleSyncAll}
          disabled={loading}
          className="px-4 py-2 bg-[#6B4F3A] text-white text-sm font-medium rounded-lg hover:bg-[#5a4130] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "同期中..." : "Lark Base 全同期"}
        </button>
      </div>
      {status && (
        <p className={`mt-3 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
          {status.ok ? "✓ " : "✗ "}{status.message}
        </p>
      )}
    </div>
  );
}
