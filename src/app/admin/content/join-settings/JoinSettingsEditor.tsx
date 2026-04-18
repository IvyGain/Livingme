"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Trash2, ChevronUp, ChevronDown, Save, Eye, EyeOff } from "lucide-react";
import { saveJoinSettings } from "@/server/actions/join-settings";
import type { JoinPageSettings, PlanBlock } from "@/lib/join-settings";

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

function PlanEditor({
  plan,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: {
  plan: PlanBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<PlanBlock>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const [open, setOpen] = useState(index === 0);

  function addFeature() {
    onUpdate({ features: [...plan.features, ""] });
  }
  function updateFeature(i: number, val: string) {
    onUpdate({ features: plan.features.map((f, j) => (j === i ? val : f)) });
  }
  function removeFeature(i: number) {
    onUpdate({ features: plan.features.filter((_, j) => j !== i) });
  }

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${plan.visible ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={() => onMove("up")} disabled={isFirst}
            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={isLast}
            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-left">
          <span className="text-sm font-medium text-gray-800">{plan.name || "（名称未入力）"}</span>
          <span className="ml-2 text-xs text-gray-400">{plan.price}</span>
          {!plan.visible && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">非表示</span>}
          {plan.isHighlighted && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">おすすめ</span>}
        </button>
        <button type="button" onClick={() => onUpdate({ visible: !plan.visible })}
          className={`p-1.5 rounded-md transition-colors ${plan.visible ? "text-[#C07052] bg-[#C07052]/10" : "text-gray-400 hover:bg-gray-100"}`}>
          {plan.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} className="p-1 text-gray-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-3">
            <Field label="会員ステータス名">
              <input type="text" value={plan.name} onChange={(e) => onUpdate({ name: e.target.value })}
                className={inputCls} placeholder="例: 無料会員" />
            </Field>
            <Field label="金額表示">
              <input type="text" value={plan.price} onChange={(e) => onUpdate({ price: e.target.value })}
                className={inputCls} placeholder="例: ¥5,500/月（税込）" />
            </Field>
          </div>

          <Field label="内容一覧（特典リスト）" hint={`${plan.features.length}件`}>
            <div className="space-y-2 mb-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)}
                    className={`${inputCls} flex-1`} placeholder="特典・内容" />
                  <button type="button" onClick={() => removeFeature(i)} className="p-1.5 text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
              <PlusCircle className="w-3.5 h-3.5" /> 追加
            </button>
          </Field>

          <Field label="申し込みリンク" hint="（空の場合は内部フォームを使用）">
            <input type="url" value={plan.joinUrl} onChange={(e) => onUpdate({ joinUrl: e.target.value })}
              className={inputCls} placeholder="https://..." />
          </Field>

          <Field label="決済リンク" hint="（空の場合は/api/checkoutを使用）">
            <input type="url" value={plan.paymentUrl} onChange={(e) => onUpdate({ paymentUrl: e.target.value })}
              className={inputCls} placeholder="https://..." />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={plan.isHighlighted}
              onChange={(e) => onUpdate({ isHighlighted: e.target.checked })}
              className="w-4 h-4 accent-[#C07052]" />
            <span className="text-sm text-gray-700">「おすすめ」バッジを表示する</span>
          </label>
        </div>
      )}
    </div>
  );
}

export function JoinSettingsEditor({ initialSettings }: { initialSettings: JoinPageSettings }) {
  const [settings, setSettings] = useState<JoinPageSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addPlan() {
    const newPlan: PlanBlock = {
      id: `plan_${Date.now()}`,
      name: "",
      price: "",
      features: [],
      joinUrl: "",
      paymentUrl: "",
      isHighlighted: false,
      visible: true,
    };
    setSettings((s) => ({ ...s, plans: [...s.plans, newPlan] }));
  }

  function updatePlan(id: string, patch: Partial<PlanBlock>) {
    setSettings((s) => ({
      ...s,
      plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }

  function removePlan(id: string) {
    setSettings((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) }));
  }

  function movePlan(id: string, dir: "up" | "down") {
    setSettings((s) => {
      const arr = [...s.plans];
      const i = arr.findIndex((p) => p.id === id);
      const target = dir === "up" ? i - 1 : i + 1;
      if (target < 0 || target >= arr.length) return s;
      [arr[i], arr[target]] = [arr[target], arr[i]];
      return { ...s, plans: arr };
    });
  }

  function handleSave() {
    startTransition(async () => {
      await saveJoinSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-8">
      {/* プランブロック */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">プランブロック</h2>
          <button type="button" onClick={addPlan} className="flex items-center gap-1 text-xs text-[#C07052] hover:underline">
            <PlusCircle className="w-3.5 h-3.5" /> ブロックを追加
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          各プランのステータス名・金額・内容一覧・申し込みリンクを設定できます。
        </p>
        <div className="space-y-2">
          {settings.plans.map((plan, i) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              index={i}
              isFirst={i === 0}
              isLast={i === settings.plans.length - 1}
              onUpdate={(patch) => updatePlan(plan.id, patch)}
              onRemove={() => removePlan(plan.id)}
              onMove={(dir) => movePlan(plan.id, dir)}
            />
          ))}
        </div>
      </section>

      {/* フッター文言 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">ページ下部の文言</h2>
        <textarea
          value={settings.footerText}
          onChange={(e) => setSettings((s) => ({ ...s, footerText: e.target.value }))}
          rows={3}
          className={inputCls}
          placeholder="いつでもキャンセル可能です..."
        />
      </section>

      {/* 保存 */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={handleSave} disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-60 transition-colors shadow-sm">
          <Save className="w-4 h-4" />
          {isPending ? "保存中..." : "変更を保存する"}
        </button>
        {saved && <span className="text-sm text-[#4a7a50] font-medium">✓ 保存しました</span>}
      </div>
    </div>
  );
}
