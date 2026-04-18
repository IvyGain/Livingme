import { getSettingsForAdmin, saveSettings } from "@/server/actions/settings";
import { LarkHelpButton } from "@/components/admin/LarkHelpModal";
import { LarkSyncPanel } from "@/components/admin/LarkSyncPanel";
import { UnivaPayHelpButton } from "@/components/admin/UnivaPayHelpModal";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const settings = await getSettingsForAdmin();
  const { saved } = await searchParams;

  // グループ別に整理
  const groups: Record<string, [string, typeof settings[string]][]> = {};
  for (const [key, setting] of Object.entries(settings)) {
    if (!groups[setting.group]) groups[setting.group] = [];
    groups[setting.group].push([key, setting]);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[#6B4F3A] mb-2">外部サービス設定</h1>
      <p className="text-sm text-gray-500 mb-6">
        各サービスの API キーを登録します。シークレット値は暗号化して保存されます。<br />
        既に登録済みの項目は <code className="bg-gray-100 px-1 rounded">••••••••</code> と表示されます。変更しない場合は空のままにしてください。
      </p>

      {saved === "1" && (
        <div className="mb-6 px-4 py-3 bg-[#EFF4EF] border border-[#d0e4d0] rounded-lg text-sm text-[#4a7a50] font-medium">
          ✓ 設定を保存しました
        </div>
      )}

      <form action={saveSettings} className="space-y-10">
        {Object.entries(groups).map(([group, items]) => (
          <section key={group}>
            <div className="flex items-center justify-between border-b border-[#e8ddd5] pb-2 mb-4">
              <h2 className="text-base font-semibold text-[#6B4F3A]">{group}</h2>
              {group === "Lark" && <LarkHelpButton />}
              {group === "UnivaPay" && (
                <UnivaPayHelpButton
                  webhookUrl={`${process.env.NEXTAUTH_URL ?? ""}/api/webhooks/univapay`}
                />
              )}
            </div>
            <div className="space-y-4">
              {items.map(([key, setting]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.label}
                    {setting.value === "••••••••" && (
                      <span className="ml-2 text-xs text-[#7A9E7E] font-normal">登録済み</span>
                    )}
                    {setting.value && setting.value !== "••••••••" && (
                      <span className="ml-2 text-xs text-[#7A9E7E] font-normal">登録済み</span>
                    )}
                  </label>
                  <input
                    type={setting.isSecret ? "password" : "text"}
                    name={key}
                    defaultValue={setting.isSecret ? "" : setting.value}
                    placeholder={
                      setting.value
                        ? "変更する場合のみ入力"
                        : "未設定"
                    }
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/40 focus:border-[#C07052]"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#C07052] text-white text-sm font-medium rounded-lg hover:bg-[#a85e42] transition-colors"
          >
            保存する
          </button>
        </div>
      </form>

      <LarkSyncPanel />
    </div>
  );
}
