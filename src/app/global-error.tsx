"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backgroundColor: "#FEFCF8",
            color: "#6B4F3A",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
              予期しないエラーが発生しました
            </h1>
            <p style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              {error.digest ? `エラーID: ${error.digest}` : "問題が継続する場合は管理者にご連絡ください。"}
            </p>
            <button
              onClick={() => reset()}
              style={{
                display: "inline-block",
                padding: "0.5rem 1.25rem",
                backgroundColor: "#C07052",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              再試行
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
