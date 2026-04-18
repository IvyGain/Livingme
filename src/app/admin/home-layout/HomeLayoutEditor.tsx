"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveHomeLayoutSettings } from "@/server/actions/home-layout";
import { COLOR_SCHEMES, type SectionConfig, type ColorScheme } from "@/lib/home-layout";

// ---- ドラッグ可能なセクション行 ----
function SortableSection({
  section,
  onToggle,
}: {
  section: SectionConfig;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-[#e8ddd5] rounded-xl shadow-sm"
    >
      {/* ドラッグハンドル */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#c0b0a0] hover:text-[#9a8070] touch-none p-1"
        aria-label="ドラッグして並び替え"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="3" width="10" height="2" rx="1" />
          <rect x="3" y="7" width="10" height="2" rx="1" />
          <rect x="3" y="11" width="10" height="2" rx="1" />
        </svg>
      </button>

      <span className="flex-1 text-sm font-medium text-[#6B4F3A]">
        {section.label}
      </span>

      {/* 表示/非表示トグル */}
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C07052] focus:ring-offset-1 ${
          section.visible ? "bg-[#C07052]" : "bg-gray-200"
        }`}
        role="switch"
        aria-checked={section.visible}
        aria-label={`${section.label}を${section.visible ? "非表示" : "表示"}にする`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            section.visible ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs text-[#9a8070] w-10 text-right">
        {section.visible ? "表示" : "非表示"}
      </span>
    </div>
  );
}

// ---- カラースキームカード ----
function ColorSchemeCard({
  scheme,
  selected,
  onClick,
}: {
  scheme: ColorScheme;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? "border-[#C07052] shadow-md"
          : "border-[#e8ddd5] hover:border-[#c0b0a0]"
      }`}
      style={{ backgroundColor: scheme.colors.background }}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-[#C07052] rounded-full flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      )}
      {/* カラーパレットプレビュー */}
      <div className="flex gap-1 mb-3">
        {[
          scheme.colors.primary,
          scheme.colors.accent,
          scheme.colors.secondary,
          scheme.colors.muted,
          scheme.colors.border,
        ].map((color, i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color: scheme.colors.primary }}>
        {scheme.label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: scheme.colors.muted }}>
        {scheme.description}
      </p>
    </button>
  );
}

// ---- メインエディタ ----
export function HomeLayoutEditor({
  initialSections,
  initialColorSchemeId,
}: {
  initialSections: SectionConfig[];
  initialColorSchemeId: string;
}) {
  const [sections, setSections] = useState<SectionConfig[]>(initialSections);
  const [colorSchemeId, setColorSchemeId] = useState(initialColorSchemeId);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setSaved(false);
    }
  }

  function handleToggle(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveHomeLayoutSettings(sections, colorSchemeId);
      setSaved(true);
    });
  }

  const currentScheme = COLOR_SCHEMES.find((s) => s.id === colorSchemeId) ?? COLOR_SCHEMES[0];

  return (
    <div className="space-y-10">
      {saved && (
        <div className="px-4 py-3 bg-[#EFF4EF] border border-[#d0e4d0] rounded-lg text-sm text-[#4a7a50] font-medium">
          ✓ 設定を保存しました。メンバー画面に即時反映されます。
        </div>
      )}

      {/* セクション順序設定 */}
      <section>
        <h2 className="text-base font-semibold text-[#6B4F3A] border-b border-[#e8ddd5] pb-2 mb-4">
          セクションの表示順・表示設定
        </h2>
        <p className="text-sm text-[#9a8070] mb-4">
          ドラッグして表示順を変更できます。トグルで表示/非表示を切り替えられます。
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-w-md">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* カラースキーム設定 */}
      <section>
        <h2 className="text-base font-semibold text-[#6B4F3A] border-b border-[#e8ddd5] pb-2 mb-4">
          カラースキーム
        </h2>
        <p className="text-sm text-[#9a8070] mb-4">
          季節やシーンに合わせてサイト全体の配色を選択してください。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {COLOR_SCHEMES.map((scheme) => (
            <ColorSchemeCard
              key={scheme.id}
              scheme={scheme}
              selected={colorSchemeId === scheme.id}
              onClick={() => {
                setColorSchemeId(scheme.id);
                setSaved(false);
              }}
            />
          ))}
        </div>

        {/* プレビュー */}
        <div className="rounded-xl border border-[#e8ddd5] overflow-hidden max-w-sm">
          <div
            className="px-4 py-3 text-xs font-medium"
            style={{ backgroundColor: currentScheme.colors.primary, color: "#fff" }}
          >
            プレビュー
          </div>
          <div className="p-4 space-y-3" style={{ backgroundColor: currentScheme.colors.background }}>
            <p className="text-lg font-light" style={{ color: currentScheme.colors.primary }}>
              こんにちは、〇〇さん
            </p>
            <div
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: currentScheme.colors.cardBackground,
                borderColor: currentScheme.colors.border,
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: currentScheme.colors.primary }}>
                今日のコンテンツ
              </p>
              <p className="text-xs" style={{ color: currentScheme.colors.muted }}>
                エネルギーシェア・ジャーナリングテーマ
              </p>
            </div>
            <p
              className="text-xs"
              style={{ color: currentScheme.colors.accent }}
            >
              すべて見る →
            </p>
          </div>
        </div>
      </section>

      {/* 保存ボタン */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-[#C07052] text-white text-sm font-medium rounded-lg hover:bg-[#a85e42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
