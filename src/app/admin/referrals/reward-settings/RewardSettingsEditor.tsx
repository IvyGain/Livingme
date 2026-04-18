"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { saveRewardSettings } from "@/server/actions/reward-settings";
import type { RewardSettings } from "@/lib/reward-settings-types";

const STATUS_LABELS: Record<keyof RewardSettings, string> = {
  FREE: "一般会員（無料アンバサダー）",
  REFERRAL: "紹介アンバサダー",
  PARTNER: "提携アンバサダー",
};

export function RewardSettingsEditor({ initialSettings }: { initialSettings: RewardSettings }) {
  const [settings, setSettings] = useState<RewardSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(
    status: keyof RewardSettings,
    field: "joinReward" | "monthlyReward",
    value: string
  ) {
    const num = parseInt(value, 10);
    setSettings((prev) => ({
      ...prev,
      [status]: { ...prev[status], [field]: isNaN(num) ? 0 : num },
    }));
    setSaved(false);
    setError(null);
  }

  function updateMaxReferrals(status: keyof RewardSettings, value: string) {
    setSettings((prev) => {
      if (value === "") {
        return { ...prev, [status]: { ...prev[status], maxReferrals: null } };
      }
      const num = parseInt(value, 10);
      return {
        ...prev,
        [status]: { ...prev[status], maxReferrals: isNaN(num) ? null : Math.max(0, num) },
      };
    });
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveRewardSettings(settings);
      if (result.success) {
        setError(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "保存に失敗しました");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white text-right tabular-nums transition-colors";

  return (
    <div className="space-y-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 w-48">
              会員ステータス
            </th>
            <th className="py-2 px-3 text-xs font-medium text-gray-500 w-36 text-right">
              入会時報酬（円）
            </th>
            <th className="py-2 px-3 text-xs font-medium text-gray-500 w-36 text-right">
              継続報酬 / 月（円）
            </th>
            <th className="py-2 px-3 text-xs font-medium text-gray-500 w-36 text-right">
              紹介人数上限
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {(["FREE", "REFERRAL", "PARTNER"] as const).map((status) => (
            <tr key={status}>
              <td className="py-3 pr-4 font-medium text-gray-700">
                {STATUS_LABELS[status]}
              </td>
              <td className="py-3 px-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={settings[status].joinReward}
                    onChange={(e) => update(status, "joinReward", e.target.value)}
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={settings[status].monthlyReward}
                    onChange={(e) => update(status, "monthlyReward", e.target.value)}
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </td>
              <td className="py-3 px-3">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={settings[status].maxReferrals ?? ""}
                  placeholder="無制限"
                  onChange={(e) => updateMaxReferrals(status, e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
        <p><strong>入会時報酬</strong>: 新規会員が入会した際に紹介者へ支払われる報酬</p>
        <p><strong>継続報酬</strong>: 会員が継続している間、毎月紹介者へ支払われる報酬</p>
        <p><strong>紹介人数上限</strong>: そのステータスで受け入れ可能な紹介者数。空欄＝無制限。既に上限を超えて紹介しているメンバーがいる場合、上限を下回る値には保存できません。</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
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
