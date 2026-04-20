import Link from "next/link";
import { listDynamicForms } from "@/server/actions/dynamic-forms";
import { FormsAdmin } from "./FormsAdmin";

export const dynamic = "force-dynamic";

export default async function FormsAdminPage() {
  const forms = await listDynamicForms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B4F3A]">申請フォーム管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          フォームの追加・項目編集・Lark 保存先テーブルの指定ができます。静的な既定フォームはソースコード側（<code>src/lib/form-defs.ts</code>）で定義されたままとなり、slug が重複する場合は DB の定義が優先されます。
        </p>
      </div>
      <FormsAdmin initial={forms} />
      <div className="text-xs text-gray-400">
        公開中のフォーム一覧（会員向けページ）は{" "}
        <Link href="/forms" className="text-[#C07052] underline">/forms</Link>{" "}
        から確認できます。
      </div>
    </div>
  );
}
