import { getHomeLayoutSettings, getNavItems } from "@/server/actions/home-layout";
import { HomeLayoutEditor } from "./HomeLayoutEditor";
import { NavItemsEditor } from "./NavItemsEditor";

export default async function AdminHomeLayoutPage() {
  const [{ sections, colorSchemeId }, navItems] = await Promise.all([
    getHomeLayoutSettings(),
    getNavItems(),
  ]);

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B4F3A] mb-2">ホーム画面設定</h1>
        <p className="text-sm text-gray-500 mb-8">
          メンバーのホーム画面に表示するセクションの順序・表示設定と、サイト全体のカラースキームを管理します。
          変更は保存後すぐにメンバー画面へ反映されます。
        </p>
        <HomeLayoutEditor
          initialSections={sections}
          initialColorSchemeId={colorSchemeId}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#6B4F3A] mb-1 border-t border-[#e8ddd5] pt-8">
          メニューバー設定
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          上部ナビゲーションバーの表示名・表示順・表示/非表示を変更できます。
        </p>
        <NavItemsEditor initialItems={navItems} />
      </div>
    </div>
  );
}
