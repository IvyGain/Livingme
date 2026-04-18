"use client";

import { useState, useTransition } from "react";
import { processWithdrawalRequest } from "@/server/actions/withdrawal";

type Request = {
  id: string;
  reason: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    joinedAt: Date | null;
  };
};

export function WithdrawalRequests({ requests }: { requests: Request[] }) {
  const [list, setList] = useState(requests);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleProcess(requestId: string) {
    if (!confirm("この退会申請を処理（アカウントを無効化）しますか？")) return;
    setProcessing(requestId);
    startTransition(async () => {
      const result = await processWithdrawalRequest(requestId);
      if (result.success) {
        setList((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        alert(result.error ?? "処理に失敗しました");
      }
      setProcessing(null);
    });
  }

  if (list.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
        退会申請はありません
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">会員</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">申請日時</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">退会理由</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {list.map((req, index) => (
            <tr
              key={req.id}
              className={`${index !== list.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{req.user.name ?? "（名前未設定）"}</p>
                <p className="text-xs text-gray-500">{req.user.email}</p>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell whitespace-nowrap">
                {req.createdAt.toLocaleDateString("ja-JP")}{" "}
                {req.createdAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                {req.reason ? (
                  <p className="line-clamp-2">{req.reason}</p>
                ) : (
                  <span className="text-gray-400 text-xs">（理由なし）</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleProcess(req.id)}
                  disabled={isPending && processing === req.id}
                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {isPending && processing === req.id ? "処理中..." : "退会処理"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
