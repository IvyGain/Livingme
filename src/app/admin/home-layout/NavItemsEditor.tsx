"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff, Save } from "lucide-react";
import { saveNavItems } from "@/server/actions/home-layout";
import type { NavItemConfig } from "@/lib/home-layout";

export function NavItemsEditor({ initialItems }: { initialItems: NavItemConfig[] }) {
  const [items, setItems] = useState<NavItemConfig[]>(initialItems);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateLabel(href: string, label: string) {
    setItems((prev) =>
      prev.map((item) => (item.href === href ? { ...item, label } : item))
    );
    setSaved(false);
  }

  function toggleVisible(href: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.href === href ? { ...item, visible: !item.visible } : item
      )
    );
    setSaved(false);
  }

  function move(href: string, dir: "up" | "down") {
    setItems((prev) => {
      const arr = [...prev];
      const i = arr.findIndex((item) => item.href === href);
      const target = dir === "up" ? i - 1 : i + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[i], arr[target]] = [arr[target], arr[i]];
      return arr;
    });
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveNavItems(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const inputCls =
    "flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white transition-colors";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#9a8070]">
        ナビゲーションの表示名・表示順・表示/非表示を変更できます。
        URLは変更できません。
      </p>
      <div className="space-y-2 max-w-md">
        {items.map((item, i) => (
          <div
            key={item.href}
            className={`flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl transition-colors ${
              item.visible !== false ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            {/* 並び替え */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(item.href, "up")}
                disabled={i === 0}
                className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => move(item.href, "down")}
                disabled={i === items.length - 1}
                className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>

            {/* URL（固定） */}
            <span className="text-xs text-gray-400 w-20 flex-shrink-0 font-mono">
              {item.href}
            </span>

            {/* ラベル入力 */}
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateLabel(item.href, e.target.value)}
              className={inputCls}
              placeholder="表示名"
            />

            {/* 表示/非表示 */}
            <button
              type="button"
              onClick={() => toggleVisible(item.href)}
              title={item.visible !== false ? "非表示にする" : "表示する"}
              className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                item.visible !== false
                  ? "text-[#C07052] bg-[#C07052]/10 hover:bg-[#C07052]/20"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.visible !== false ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-60 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isPending ? "保存中..." : "変更を保存する"}
        </button>
        {saved && (
          <span className="text-sm text-[#4a7a50] font-medium">✓ 保存しました</span>
        )}
      </div>
    </div>
  );
}
