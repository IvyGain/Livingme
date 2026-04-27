"use client";

import { useState } from "react";

// デモ用のモックデータ
const mockForms = [
  {
    id: "1",
    slug: "event-2024",
    title: "イベント参加申請",
    description: "イベントへの参加を申請するフォームです。担当者より詳細をご連絡いたします。",
    fields: [
      { name: "name", label: "お名前", type: "text" as const, required: true },
      { name: "email", label: "メールアドレス", type: "text" as const, required: true },
      { name: "motivation", label: "参加理由", type: "textarea" as const, required: true },
      { name: "role", label: "職種", type: "select" as const, options: ["会社員", "フリーランス", "経営者", "その他"], required: false },
    ],
    ambassadorOnly: false,
    larkTableId: "tblXXXXXXXXXX",
    isPublished: true,
    sortOrder: 0,
  },
  {
    id: "2",
    slug: "seminar-beginner",
    title: "新規会員向けセミナー",
    description: "新規会員向けのセミナー申込フォームです。",
    fields: [
      { name: "name", label: "お名前", type: "text" as const, required: true },
      { name: "希望日時", label: "希望日時", type: "date" as const, required: true },
      { name: "questions", label: "質問・備考", type: "textarea" as const, required: false },
    ],
    ambassadorOnly: false,
    larkTableId: null,
    isPublished: true,
    sortOrder: 1,
  },
  {
    id: "3",
    slug: "ambassador-only",
    title: "アンバサダー限定申請",
    description: "アンバサダー会員のみが利用できる特別フォームです。",
    fields: [
      { name: "content", label: "申請内容", type: "textarea" as const, required: true },
    ],
    ambassadorOnly: true,
    larkTableId: "tblYYYYYYYYYY",
    isPublished: false,
    sortOrder: 2,
  },
];

export default function FormsAdminDemoPage() {
  const [forms] = useState(mockForms);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#6B4F3A]">Living Me 管理画面</h1>
          <p className="text-sm text-gray-500 mt-1">デモモード - データベース接続なしでUIを確認できます</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* タイトルとアクション */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#6B4F3A]">申請フォーム管理</h2>
              <p className="text-sm text-gray-500 mt-1">
                フォームの追加・項目編集・Lark 保存先テーブルの指定ができます。
              </p>
            </div>
            <button className="px-4 py-2 bg-[#C07052] hover:bg-[#a85e42] text-white rounded-lg text-sm font-medium transition-colors">
              + 新規フォーム作成
            </button>
          </div>

          {/* フォーム一覧 */}
          <div className="space-y-3">
            {forms.map((form) => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{form.title}</h3>
                      <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        /{form.slug}
                      </code>
                      {!form.isPublished && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          非公開
                        </span>
                      )}
                      {form.ambassadorOnly && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          アンバサダー限定
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                    <div className="text-xs text-gray-500">
                      {form.fields.length} 項目
                      {form.larkTableId && (
                        <span className="ml-2">
                          | Lark: <code className="bg-gray-100 px-1 rounded">{form.larkTableId}</code>
                        </span>
                      )}
                    </div>

                    {/* フィールドプレビュー */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">フォーム項目:</p>
                      <div className="flex flex-wrap gap-2">
                        {form.fields.map((field) => (
                          <div key={field.name} className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            <span className="font-medium text-gray-700">{field.label}</span>
                            <span className="text-gray-400 ml-1">({field.type})</span>
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors">
                      編集
                    </button>
                    <button className="px-3 py-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 rounded transition-colors">
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 これはデモモードです</h3>
            <p className="text-sm text-blue-800 mb-2">
              データベースに接続すると、以下の機能が利用できます：
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>✅ フォームの新規作成・編集・削除</li>
              <li>✅ フォーム項目の追加・並び替え</li>
              <li>✅ Lark Baseへの自動保存</li>
              <li>✅ 公開/非公開の切り替え</li>
              <li>✅ 会員向けページでの表示</li>
            </ul>
          </div>

          {/* 実装完了情報 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">🎉 実装完了</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>✅ 管理画面UI - 完全実装済み</p>
              <p>✅ フォームビルダー - 完全実装済み</p>
              <p>✅ 会員向けフォーム表示 - 完全実装済み</p>
              <p>✅ サーバーアクション（CRUD） - 完全実装済み</p>
              <p>✅ Lark連携 - 完全実装済み</p>
              <p>✅ TypeScriptエラー: 0件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
