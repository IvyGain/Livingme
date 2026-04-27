"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold" style={{ color: "#6B4F3A" }}>
          問題が発生しました
        </h1>
        <p className="text-sm" style={{ color: "#6B4F3A" }}>
          ページの表示中にエラーが発生しました。少し時間をおいて再度お試しください。
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium text-white transition"
          style={{ backgroundColor: "#C07052" }}
        >
          再読み込み
        </button>
      </div>
    </main>
  );
}
