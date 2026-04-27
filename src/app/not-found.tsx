import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm tracking-widest uppercase" style={{ color: "#C07052" }}>
          404
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "#6B4F3A" }}>
          ページが見つかりません
        </h1>
        <p className="text-sm" style={{ color: "#6B4F3A" }}>
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium text-white transition"
          style={{ backgroundColor: "#C07052" }}
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
