import { ChangePasswordForm } from "./ChangePasswordForm";

export default function SettingsPage() {
  return (
    <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--lm-bg)" }}>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-medium" style={{ color: "var(--lm-primary)" }}>
            アカウント設定
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--lm-muted)" }}>
            パスワードなどのアカウント情報を変更できます
          </p>
        </div>

        <section
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
        >
          <h2 className="text-base font-medium mb-4" style={{ color: "var(--lm-primary)" }}>
            パスワード変更
          </h2>
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  );
}
