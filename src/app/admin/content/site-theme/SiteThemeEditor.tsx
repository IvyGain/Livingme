"use client";

import { useState, useTransition } from "react";
import { Save, RotateCcw } from "lucide-react";
import { saveSiteTheme } from "@/server/actions/site-theme";
import {
  DEFAULT_SITE_THEME,
  type SiteTheme,
} from "@/lib/site-theme-types";

const COLOR_FIELDS: Array<{ key: keyof SiteTheme; label: string; description: string }> = [
  { key: "accent", label: "アクセント", description: "CTA・リンクに使う強調色" },
  { key: "secondary", label: "セカンダリ", description: "補助アクション・情報パネル" },
  { key: "primary", label: "テキスト主色", description: "本文に使う文字色" },
  { key: "background", label: "背景", description: "画面全体の背景" },
  { key: "cardBg", label: "カード背景", description: "カード/パネルの背景" },
  { key: "muted", label: "ミュート", description: "補足文・メタ情報の文字色" },
  { key: "border", label: "ボーダー", description: "区切り線・枠線" },
];

export function SiteThemeEditor({ initial }: { initial: SiteTheme }) {
  const [theme, setTheme] = useState<SiteTheme>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(key: keyof SiteTheme, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }

  function resetToDefaults() {
    setTheme(DEFAULT_SITE_THEME);
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSiteTheme(theme);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "保存に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[#6B4F3A] mb-2">カラーパレット</legend>
        <div className="grid grid-cols-1 gap-3">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  {f.label}
                </label>
                <p className="text-xs text-gray-500">{f.description}</p>
              </div>
              <input
                type="color"
                value={theme[f.key] as string}
                onChange={(e) => updateField(f.key, e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={theme[f.key] as string}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder="#000000"
                className="w-24 h-9 px-2 text-xs font-mono tabular-nums border border-gray-200 rounded"
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[#6B4F3A] mb-2">
          グローバルバナー
        </legend>
        <p className="text-xs text-gray-500">
          全ページ上部に表示されるお知らせ文言。空欄で非表示。
        </p>
        <input
          type="text"
          value={theme.globalBanner}
          onChange={(e) => updateField("globalBanner", e.target.value)}
          placeholder="例: 11/25 はシステムメンテナンスのため一部機能が停止します"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
        />
      </fieldset>

      {/* Live preview */}
      <section className="rounded-lg overflow-hidden border border-gray-200">
        <div className="text-xs px-3 py-1 bg-gray-50 text-gray-500">プレビュー</div>
        <div className="p-4" style={{ backgroundColor: theme.background }}>
          {theme.globalBanner && (
            <div
              className="mb-3 px-3 py-1.5 text-center text-xs rounded"
              style={{ backgroundColor: theme.accent, color: "#fff" }}
            >
              {theme.globalBanner}
            </div>
          )}
          <div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <p className="text-base font-medium mb-1" style={{ color: theme.primary }}>
              サンプルカード
            </p>
            <p className="text-xs mb-3" style={{ color: theme.muted }}>
              これはテーマ確認用のプレビューです
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ backgroundColor: theme.accent, color: "#fff" }}
              >
                アクセント
              </button>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ backgroundColor: theme.secondary, color: "#fff" }}
              >
                セカンダリ
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isPending ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <RotateCcw className="w-4 h-4" />
          デフォルトに戻す
        </button>
        {saved && <span className="text-sm text-[#4a7a50] font-medium">✓ 保存しました</span>}
      </div>
    </div>
  );
}
