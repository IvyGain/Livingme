"use client";

import { useState, useTransition } from "react";
import { saveLPSettings } from "@/server/actions/lp-settings";
import type { LPSettings, LPSectionConfig, LPVideo, LPActivity, LPTestimonial } from "@/lib/lp-settings";
import type { Archive } from "@/lib/content-types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { LPPreview } from "./LPPreview";

/* ─── 定数 ──────────────────────────────────────── */

const SECTION_LABELS: Record<string, string> = {
  hero: "ファーストビュー",
  about: "コンセプト説明",
  videos: "お試し動画",
  activities: "活動内容",
  testimonials: "口コミ",
  cta: "最終CTA",
};

const SECTION_ICONS: Record<string, string> = {
  hero: "🏠",
  about: "💡",
  videos: "▶",
  activities: "✦",
  testimonials: "💬",
  cta: "🚀",
};

/** 背景色プリセット */
const BG_PRESETS: { label: string; value: string; text: string }[] = [
  { label: "デフォルト", value: "", text: "#333" },
  { label: "クリーム", value: "#FFF8F0", text: "#6B4F3A" },
  { label: "ホワイト", value: "#FEFCF8", text: "#444" },
  { label: "グレー", value: "#F5F5F3", text: "#444" },
  { label: "ラベンダー", value: "#F2EEF8", text: "#5A4A6A" },
  { label: "ミント", value: "#EEF8F2", text: "#3A6A4A" },
  { label: "スカイ", value: "#EEF3FC", text: "#3A4A6A" },
  { label: "ピーチ", value: "#FCF0EC", text: "#6A3A2A" },
  { label: "ダーク", value: "#1E1E1E", text: "#F5F5F5" },
];

/* ─── ユーティリティ ─────────────────────────────── */

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white transition-colors";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── メインコンポーネント ────────────────────────── */

export function LPEditor({
  initialSettings,
  availableArchives = [],
}: {
  initialSettings: LPSettings;
  availableArchives?: Archive[];
}) {
  const [settings, setSettings] = useState<LPSettings>({
    ...initialSettings,
    larkArchiveIds: initialSettings.larkArchiveIds ?? [],
    activities: initialSettings.activities ?? [],
    testimonials: initialSettings.testimonials ?? [],
    ctaLoginButtonText: initialSettings.ctaLoginButtonText ?? "会員ページにログインする",
  });
  const [openSection, setOpenSection] = useState<string | null>("hero");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  /* セクション更新 */
  function updateSection(id: string, patch: Partial<LPSectionConfig>) {
    setSettings((s) => ({
      ...s,
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
    }));
  }

  /* セクション並び替え */
  function moveSection(id: string, dir: "up" | "down") {
    setSettings((s) => {
      const arr = [...s.sections];
      const idx = arr.findIndex((sec) => sec.id === id);
      if (idx === -1) return s;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return s;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...s, sections: arr };
    });
  }

  /* 動画 */
  function addVideo() {
    if (settings.videos.length >= 30) return;
    const v: LPVideo = { id: `v_${Date.now()}`, title: "", url: "", description: "" };
    setSettings((s) => ({ ...s, videos: [...s.videos, v] }));
  }
  function updateVideo(id: string, patch: Partial<LPVideo>) {
    setSettings((s) => ({ ...s, videos: s.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  }
  function removeVideo(id: string) {
    setSettings((s) => ({ ...s, videos: s.videos.filter((v) => v.id !== id) }));
  }

  /* Larkアーカイブ選択 */
  function toggleArchive(id: string) {
    setSettings((s) => {
      const ids = s.larkArchiveIds ?? [];
      return {
        ...s,
        larkArchiveIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  }

  /* 活動内容 */
  function addActivity() {
    const a: LPActivity = { id: `act_${Date.now()}`, title: "", description: "", imageUrl: "" };
    setSettings((s) => ({ ...s, activities: [...s.activities, a] }));
  }
  function updateActivity(id: string, patch: Partial<LPActivity>) {
    setSettings((s) => ({ ...s, activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  }
  function removeActivity(id: string) {
    setSettings((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));
  }

  /* 口コミ */
  function addTestimonial() {
    const t: LPTestimonial = { id: `tm_${Date.now()}`, name: "", role: "", body: "", avatarUrl: "" };
    setSettings((s) => ({ ...s, testimonials: [...s.testimonials, t] }));
  }
  function updateTestimonial(id: string, patch: Partial<LPTestimonial>) {
    setSettings((s) => ({ ...s, testimonials: s.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }
  function removeTestimonial(id: string) {
    setSettings((s) => ({ ...s, testimonials: s.testimonials.filter((t) => t.id !== id) }));
  }

  /* コンセプト */
  function addConcept() {
    setSettings((s) => ({ ...s, concepts: [...s.concepts, ""] }));
  }
  function updateConcept(i: number, val: string) {
    setSettings((s) => ({ ...s, concepts: s.concepts.map((c, j) => (j === i ? val : c)) }));
  }
  function removeConcept(i: number) {
    setSettings((s) => ({ ...s, concepts: s.concepts.filter((_, j) => j !== i) }));
  }

  /* 保存 */
  function handleSave() {
    startTransition(async () => {
      await saveLPSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="flex gap-6 items-start">
      {/* ─── 左パネル: エディター ─── */}
      <div className="w-[420px] flex-shrink-0 space-y-4">

        {/* CTAボタンテキスト */}
        <Card title="CTAボタン" subtitle="全ページ共通のボタン文言">
          <Field label="メインボタン（新規登録）">
            <input
              type="text"
              value={settings.ctaButtonText}
              onChange={(e) => setSettings((s) => ({ ...s, ctaButtonText: e.target.value }))}
              className={inputCls}
              placeholder="今すぐ始める"
            />
          </Field>
          <Field label="ログインボタン" hint="（空にすると非表示）">
            <input
              type="text"
              value={settings.ctaLoginButtonText}
              onChange={(e) => setSettings((s) => ({ ...s, ctaLoginButtonText: e.target.value }))}
              className={inputCls}
              placeholder="会員ページにログインする"
            />
          </Field>
        </Card>

        {/* セクション設定 */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B4F3A] mb-2">セクション</h2>
          <p className="text-xs text-gray-400 mb-3">↑↓ で順番変更。チェックで表示/非表示を切り替え。</p>
          <div className="space-y-2">
            {settings.sections.map((sec, idx) => (
              <SectionAccordion
                key={sec.id}
                sec={sec}
                isOpen={openSection === sec.id}
                isFirst={idx === 0}
                isLast={idx === settings.sections.length - 1}
                onToggle={() => setOpenSection(openSection === sec.id ? null : sec.id)}
                onUpdate={(patch) => updateSection(sec.id, patch)}
                onMove={(dir) => moveSection(sec.id, dir)}
              />
            ))}
          </div>
        </div>

        {/* コンセプトリスト */}
        <Card
          title="コンセプト文言"
          subtitle="コンセプト説明セクションに表示されます"
          action={
            <button type="button" onClick={addConcept} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
              <PlusCircle className="w-3.5 h-3.5" /> 追加
            </button>
          }
        >
          {settings.concepts.length === 0 && (
            <p className="text-xs text-gray-400">文言がありません。「追加」ボタンで追加してください。</p>
          )}
          <div className="space-y-2">
            {settings.concepts.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[var(--lm-accent)] flex-shrink-0 text-sm">♥</span>
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateConcept(i, e.target.value)}
                  className={`${inputCls} flex-1`}
                  placeholder="コンセプト文言"
                />
                <button type="button" onClick={() => removeConcept(i)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* 動画リスト */}
        <Card
          title={`お試し動画 (${settings.videos.length}/30)`}
          subtitle="YouTube の埋め込みURLを貼り付けてください"
          action={
            settings.videos.length < 30 ? (
              <button type="button" onClick={addVideo} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
                <PlusCircle className="w-3.5 h-3.5" /> 追加
              </button>
            ) : null
          }
        >
          {settings.videos.length === 0 && (
            <p className="text-xs text-gray-400">動画がまだありません。「追加」で登録できます。</p>
          )}
          <div className="space-y-4">
            {settings.videos.map((video, i) => (
              <VideoRow
                key={video.id}
                video={video}
                index={i}
                onUpdate={(patch) => updateVideo(video.id, patch)}
                onRemove={() => removeVideo(video.id)}
              />
            ))}
          </div>
        </Card>

        {/* 活動内容 */}
        <Card
          title={`活動内容 (${settings.activities.length}件)`}
          subtitle="活動内容セクションに表示されるブロック"
          action={
            <button type="button" onClick={addActivity} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
              <PlusCircle className="w-3.5 h-3.5" /> 追加
            </button>
          }
        >
          {settings.activities.length === 0 && (
            <p className="text-xs text-gray-400">活動内容がありません。「追加」で登録できます。</p>
          )}
          <div className="space-y-4">
            {settings.activities.map((act, i) => (
              <ActivityRow
                key={act.id}
                activity={act}
                index={i}
                onUpdate={(patch) => updateActivity(act.id, patch)}
                onRemove={() => removeActivity(act.id)}
              />
            ))}
          </div>
        </Card>

        {/* 口コミ */}
        <Card
          title={`口コミ (${settings.testimonials.length}件)`}
          subtitle="口コミセクションに表示されるカード"
          action={
            <button type="button" onClick={addTestimonial} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
              <PlusCircle className="w-3.5 h-3.5" /> 追加
            </button>
          }
        >
          {settings.testimonials.length === 0 && (
            <p className="text-xs text-gray-400">口コミがありません。「追加」で登録できます。</p>
          )}
          <div className="space-y-4">
            {settings.testimonials.map((tm, i) => (
              <TestimonialRow
                key={tm.id}
                testimonial={tm}
                index={i}
                onUpdate={(patch) => updateTestimonial(tm.id, patch)}
                onRemove={() => removeTestimonial(tm.id)}
              />
            ))}
          </div>
        </Card>

        {/* Lark アーカイブ選択 */}
        {availableArchives.length > 0 && (
          <Card
            title={`Larkアーカイブから選択 (${(settings.larkArchiveIds ?? []).length}件選択中)`}
            subtitle="選択したアーカイブがお試し動画セクションに表示されます"
          >
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableArchives.map((archive) => {
                const selected = (settings.larkArchiveIds ?? []).includes(archive.id);
                return (
                  <button
                    key={archive.id}
                    type="button"
                    onClick={() => toggleArchive(archive.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      selected
                        ? "border-[#7A9E7E] bg-[#f0f8f0]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selected ? "border-[#7A9E7E] bg-[#7A9E7E]" : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {archive.thumbnailUrl && (
                      <img src={archive.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{archive.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(archive.date).toLocaleDateString("ja-JP")}
                        {archive.videoUrl && " · 動画あり"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* 保存 */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-60 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isPending ? "保存中..." : "変更を保存する"}
          </button>
          {saved && <span className="text-sm text-[#4a7a50] font-medium">✓ 保存しました</span>}
        </div>
      </div>

      {/* ─── 右パネル: リアルタイムプレビュー ─── */}
      <div className="flex-1 sticky top-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-[#C07052]" />
          <span className="text-sm font-semibold text-[#6B4F3A]">リアルタイムプレビュー</span>
          <span className="text-xs text-gray-400 ml-1">— 保存前に確認できます</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-[#C07052] hover:underline"
          >
            実際のページを見る ↗
          </a>
        </div>
        {/* ブラウザ風フレーム */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          {/* ブラウザバー */}
          <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-[10px] text-gray-400 text-center">
              livingme.com
            </div>
          </div>
          {/* プレビュー本体（スクロール可能） */}
          <div className="h-[calc(100vh-16rem)] overflow-y-auto">
            <LPPreview settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── セクションアコーディオン ────────────────────── */

function SectionAccordion({
  sec,
  isOpen,
  isFirst,
  isLast,
  onToggle,
  onUpdate,
  onMove,
}: {
  sec: LPSectionConfig;
  isOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<LPSectionConfig>) => void;
  onMove: (dir: "up" | "down") => void;
}) {
  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-colors ${sec.visible ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* 並び替え */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={isFirst}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={isLast}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        {/* アイコン */}
        <span className="text-base w-6 text-center flex-shrink-0">
          {SECTION_ICONS[sec.type] ?? "□"}
        </span>

        {/* ラベル */}
        <button type="button" onClick={onToggle} className="flex-1 text-left">
          <span className="text-sm font-medium text-gray-800">
            {SECTION_LABELS[sec.type] ?? sec.type}
          </span>
          {!sec.visible && (
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">非表示</span>
          )}
        </button>

        {/* 表示/非表示トグル */}
        <button
          type="button"
          onClick={() => onUpdate({ visible: !sec.visible })}
          title={sec.visible ? "非表示にする" : "表示する"}
          className={`p-1.5 rounded-md transition-colors ${sec.visible ? "text-[#C07052] bg-[#C07052]/10 hover:bg-[#C07052]/20" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
        >
          {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* 開閉 */}
        <button type="button" onClick={onToggle} className="p-1 text-gray-400 hover:text-gray-600">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 内容 */}
      {isOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4 bg-gray-50/50">

          {/* 見出し */}
          <Field label="見出し" hint="（\\n で改行）">
            <input
              type="text"
              value={sec.heading}
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className={inputCls}
              placeholder="見出しテキスト"
            />
          </Field>

          {/* サブ見出し */}
          {sec.type !== "activities" && (
            <Field label="サブ見出し">
              <input
                type="text"
                value={sec.subheading}
                onChange={(e) => onUpdate({ subheading: e.target.value })}
                className={inputCls}
                placeholder="見出しの下に表示するテキスト"
              />
            </Field>
          )}

          {/* 本文（about のみ） */}
          {sec.type === "about" && (
            <Field label="本文テキスト">
              <textarea
                value={sec.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                rows={3}
                className={inputCls}
                placeholder="コミュニティの説明文を入力"
              />
            </Field>
          )}

          {/* 背景色プリセット */}
          <Field label="背景色">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  title={p.label}
                  onClick={() => onUpdate({ bgColor: p.value })}
                  className={`relative h-7 px-2 rounded text-[10px] font-medium border-2 transition-all ${
                    sec.bgColor === p.value
                      ? "border-[#C07052] ring-2 ring-[#C07052]/30 scale-105"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{
                    background: p.value || "#f0ede8",
                    color: p.text,
                    minWidth: "52px",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* カスタムカラー */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={sec.bgColor || "#FFF8F0"}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="h-8 w-10 rounded border border-gray-200 cursor-pointer flex-shrink-0"
                title="カスタムカラー"
              />
              <input
                type="text"
                value={sec.bgColor}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                placeholder="カスタム（例: #FAF5FF）"
                className={`${inputCls} flex-1 text-xs`}
              />
              {sec.bgColor && (
                <button
                  type="button"
                  onClick={() => onUpdate({ bgColor: "" })}
                  className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                >
                  クリア
                </button>
              )}
            </div>
          </Field>

          {/* 背景画像 */}
          <ImageUpload
            label="背景画像"
            hint="（任意・背景色より優先）"
            value={sec.bgImageUrl}
            onChange={(url) => onUpdate({ bgImageUrl: url })}
            previewClass="h-16 w-28 object-cover rounded-lg border border-gray-200 flex-shrink-0"
          />

          {/* コンテンツ画像 */}
          <ImageUpload
            label="コンテンツ画像"
            hint="（任意・セクション内に表示）"
            value={sec.imageUrl}
            onChange={(url) => onUpdate({ imageUrl: url })}
            previewClass="h-20 w-32 object-cover rounded-lg border border-gray-200 flex-shrink-0"
          />
        </div>
      )}
    </div>
  );
}

/* ─── 動画行 ─────────────────────────────────────── */

function VideoRow({
  video,
  index,
  onUpdate,
  onRemove,
}: {
  video: LPVideo;
  index: number;
  onUpdate: (patch: Partial<LPVideo>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">動画 {index + 1}</span>
        <button type="button" onClick={onRemove} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <Field label="タイトル">
        <input
          type="text"
          value={video.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={inputCls}
          placeholder="例：朝会 2024年1月"
        />
      </Field>
      <Field label="YouTube 埋め込みURL" hint="（/embed/ を含むURL）">
        <input
          type="url"
          value={video.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className={inputCls}
          placeholder="https://www.youtube.com/embed/xxxxxxxxxx"
        />
        {video.url && (
          <p className="mt-1 text-[10px] text-gray-400">
            ※ 通常の YouTube URLではなく、embed URLを使用してください
          </p>
        )}
      </Field>
      <Field label="説明" hint="（任意）">
        <input
          type="text"
          value={video.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className={inputCls}
          placeholder="この動画について一言"
        />
      </Field>
    </div>
  );
}

/* ─── 活動内容行 ─────────────────────────────────── */

function ActivityRow({
  activity,
  index,
  onUpdate,
  onRemove,
}: {
  activity: LPActivity;
  index: number;
  onUpdate: (patch: Partial<LPActivity>) => void;
  onRemove: () => void;
}) {
  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white transition-colors";
  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">ブロック {index + 1}</span>
        <button type="button" onClick={onRemove} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <Field label="タイトル">
        <input
          type="text"
          value={activity.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={inputCls}
          placeholder="例：朝会・夜会"
        />
      </Field>
      <Field label="説明文">
        <textarea
          value={activity.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          className={inputCls}
          placeholder="この活動内容について一言"
        />
      </Field>
      <ImageUpload
        label="画像"
        hint="（任意）"
        value={activity.imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        previewClass="h-16 w-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
      />
    </div>
  );
}

/* ─── 口コミ行 ───────────────────────────────────── */

function TestimonialRow({
  testimonial,
  index,
  onUpdate,
  onRemove,
}: {
  testimonial: LPTestimonial;
  index: number;
  onUpdate: (patch: Partial<LPTestimonial>) => void;
  onRemove: () => void;
}) {
  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white transition-colors";
  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">口コミ {index + 1}</span>
        <button type="button" onClick={onRemove} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <Field label="投稿者名">
        <input
          type="text"
          value={testimonial.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className={inputCls}
          placeholder="例：Aさん（30代）"
        />
      </Field>
      <Field label="肩書き・補足" hint="（任意）">
        <input
          type="text"
          value={testimonial.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          className={inputCls}
          placeholder="例：主婦 / 会員歴1年"
        />
      </Field>
      <Field label="口コミ本文">
        <textarea
          value={testimonial.body}
          onChange={(e) => onUpdate({ body: e.target.value })}
          rows={3}
          className={inputCls}
          placeholder="参加して感じたこと、変化など…"
        />
      </Field>
      <ImageUpload
        label="アバター画像"
        hint="（任意）"
        value={testimonial.avatarUrl}
        onChange={(url) => onUpdate({ avatarUrl: url })}
        previewClass="h-12 w-12 object-cover rounded-full border border-gray-200 flex-shrink-0"
      />
    </div>
  );
}

/* ─── カードラッパー ──────────────────────────────── */

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
