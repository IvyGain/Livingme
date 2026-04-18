const DEFAULT_DATE = "2026-03-20";

export default function DemoAdminTodayPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">今日の表示更新</h1>
        <p className="text-sm text-gray-500 mt-1">2026年3月20日(金) のコンテンツ</p>
      </div>

      <form className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">日付</label>
          <input
            type="date"
            defaultValue={DEFAULT_DATE}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052]"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">エネルギーシェア</label>
          <p className="text-xs text-gray-400">今日の波動メッセージ。会員ホームのTodayCardに表示されます。</p>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#C07052] min-h-[100px]"
            defaultValue="今日は「受け取る」波動が強い日。誰かの言葉、空の色、風の感触…感じたことをそのまま信じてみましょう。正しいか間違いかではなく、あなたが感じたことがすべてです。"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">ジャーナリングテーマ</label>
          <p className="text-xs text-gray-400">今日のジャーナリング問いかけ。会員がジャーナルを書く際に表示されます。</p>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C07052]"
            defaultValue="今日、自分が「楽しい」と感じた瞬間はいつ？"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">朝の一言メモ（任意）</label>
          <p className="text-xs text-gray-400">朝の波動シェア会の内容を簡単にシェア。会員ホームのTodayCardに表示されます。</p>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#C07052] min-h-[80px]"
            defaultValue="今朝の波動シェアでは「楽しむために生まれてきた」をテーマに話しました。義務や正しさではなく、純粋な楽しさから動いてみるとどうなるか。みんなで小さな実験を始めています。"
            readOnly
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <span className="px-4 py-2 bg-[#C07052] text-white text-sm rounded-lg cursor-pointer hover:bg-[#a85e42] transition-colors">
            保存する
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-[#7A9E7E] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            今日のコンテンツは設定済みです
          </p>
        </div>
      </form>
    </div>
  );
}
