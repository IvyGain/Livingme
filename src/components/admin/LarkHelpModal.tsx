"use client";

import { useState } from "react";

// ─── 用語ツールチップ ────────────────────────────────────────────
function Term({ label, desc }: { label: string; desc: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="border-b border-dashed border-blue-500 text-blue-600 font-medium cursor-pointer"
      >
        {label}
      </button>
      {show && (
        <span className="absolute z-50 bottom-full left-0 mb-1 w-64 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl leading-relaxed">
          {desc}
          <button
            type="button"
            onClick={() => setShow(false)}
            className="ml-2 text-gray-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </span>
      )}
    </span>
  );
}

// ─── 手順ステップ ────────────────────────────────────────────────
function Step({ n, color, children }: { n: number; color: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className={`flex-shrink-0 w-6 h-6 ${color} text-white rounded-full text-xs flex items-center justify-center font-bold mt-0.5`}
      >
        {n}
      </span>
      <div className="flex-1 text-sm text-gray-700 leading-relaxed">{children}</div>
    </li>
  );
}

// ─── インフォボックス ────────────────────────────────────────────
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 leading-relaxed">
      {children}
    </div>
  );
}
function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
      {children}
    </div>
  );
}
function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-800 leading-relaxed">
      {children}
    </div>
  );
}
function GoodBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-800 leading-relaxed">
      {children}
    </div>
  );
}

// ─── メインコンポーネント ────────────────────────────────────────
export function LarkHelpButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"app" | "base" | "perm" | "table">("app");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-[#7A9E7E] hover:text-[#5a7e5e] underline underline-offset-2 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lark設定のヘルプを見る
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-[#6B4F3A]">Lark 設定ガイド</h2>
                <p className="text-xs text-gray-400 mt-0.5">① → ② → ③ → ④ の順に設定してください</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {(["app", "base", "perm", "table"] as const).map((t) => {
                const labels = {
                  app: "① App ID / Secret",
                  base: "② Base トークン",
                  perm: "③ 権限・招待",
                  table: "④ テーブルID",
                };
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                      tab === t ? "border-[#C07052] text-[#C07052]" : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* ════════════════════════════════════════════
                  ① App ID / App Secret
              ════════════════════════════════════════════ */}
              {tab === "app" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>開発者コンソール</strong> ＝ Lark のアプリを作ったり管理したりするための専用ウェブサイト（open.larksuite.com）。Lark アプリとは別のサイトです。</div>
                      <div><strong>App ID（アプリID）</strong> ＝ アプリを識別するための番号。マイナンバーのようなもの。英数字の文字列です。</div>
                      <div><strong>App Secret（アプリシークレット）</strong> ＝ アプリのパスワード。絶対に他人に見せないでください。</div>
                    </div>
                  </div>

                  <WarnBox>
                    <strong>注意：</strong> 開発者コンソール（open.larksuite.com）は<strong>英語・中国語のみ</strong>表示されます。日本語には切り替えられません。このガイドでは実際に表示される英語のボタン名を記載しています。
                  </WarnBox>

                  {/* 手順 */}
                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        パソコンのブラウザ（Chrome や Safari など）で Lark 開発者コンソールを開く。<br />
                        <a
                          href="https://open.larksuite.com/app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[#C07052] text-white rounded-lg text-xs font-bold hover:bg-[#a05040] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          ここをクリック → open.larksuite.com/app を開く
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">※ Lark にログインしていない場合は、Lark のアカウントでログインしてください。</span>
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        ページに表示されているアプリの一覧から、設定に使うアプリを<strong>クリックして選択</strong>する。<br />
                        <span className="text-xs text-gray-500">※ アプリがまだない場合は「Create App」ボタンから新規作成してください。</span>
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        画面の<strong>左側に並んでいるメニュー</strong>の中から{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">Credentials &amp; Basic Info</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        右側の画面が表示されたら、<strong>ページの一番上までスクロール</strong>する。<br />
                        <span className="text-xs text-gray-500">※ 下の方には「Multi-lingual app details」や「More actions」が表示されますが、App ID と App Secret はページの<strong>一番上</strong>にあります。</span>
                      </Step>
                      <Step n={5} color="bg-[#C07052]">
                        「<strong>App ID</strong>」の横のコピーアイコン（□が2つ重なったマーク）をクリックしてコピーし、管理画面の「<strong>Lark アプリID</strong>」欄に貼り付ける。
                      </Step>
                      <Step n={6} color="bg-[#C07052]">
                        「<strong>App Secret</strong>」の横の「<strong>Show</strong>」ボタンをクリックすると文字が表示されます。コピーして管理画面の「<strong>Lark アプリシークレット</strong>」欄に貼り付ける。<br />
                        <span className="text-xs text-gray-500">※ App Secret は他人に見せないでください。パスワードと同じです。</span>
                      </Step>
                    </ol>
                  </div>

                  {/* 画面イメージ */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">
                        open.larksuite.com/app/…/credentials
                      </div>
                    </div>
                    <div className="bg-white p-4 flex gap-3">
                      {/* Sidebar */}
                      <div className="w-44 flex-shrink-0 space-y-1 text-xs">
                        <div className="px-2 py-1.5 text-gray-400 rounded">Overview</div>
                        <div className="px-2 py-1.5 bg-[#FFF0EB] text-[#C07052] rounded font-medium border border-[#f5c5b0]">
                          ▶ Credentials &amp; Basic Info
                        </div>
                        <div className="px-2 py-1.5 text-gray-400 rounded">Permissions &amp; Scopes</div>
                        <div className="px-2 py-1.5 text-gray-400 rounded">Bot</div>
                      </div>
                      {/* Main */}
                      <div className="flex-1 space-y-3">
                        <p className="text-xs font-bold text-gray-700">Credentials <span className="text-[#C07052] font-normal text-[10px]">← ページ一番上にスクロールするとここが見えます</span></p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">App ID</p>
                          <div className="flex items-center gap-2 border-2 border-[#7A9E7E] rounded-lg px-3 py-2 bg-[#f0f8f0]">
                            <span className="text-xs font-mono text-gray-700 flex-1">cli_a1b2c3d4e5f6g7h8</span>
                            <svg className="w-3.5 h-3.5 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#7A9E7E] font-bold">← ここをコピー → 管理画面の「Lark アプリID」に貼り付け</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">App Secret</p>
                          <div className="flex items-center gap-2 border-2 border-[#C07052] rounded-lg px-3 py-2 bg-[#fff5f2]">
                            <span className="text-xs font-mono text-gray-700 flex-1">••••••••••••••••</span>
                            <span className="text-xs text-[#C07052] font-medium cursor-pointer underline">Show</span>
                          </div>
                          <p className="text-xs text-[#C07052] font-bold">← 「Show」をクリックして表示 → コピー → 「Lark アプリシークレット」に貼り付け</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  ② Base App Token
              ════════════════════════════════════════════ */}
              {tab === "base" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>Lark Base（ビタベース）</strong> ＝ Lark の中にある表計算・データベース機能です。Excel や Google スプレッドシートのような画面です。このシステムのデータの保存先として使います。</div>
                      <div><strong>アプリトークン</strong> ＝ Base を識別するための番号です。URLの中に含まれています。</div>
                      <div><strong>URL・アドレスバー</strong> ＝ ブラウザの画面の一番上にある「https://…」から始まる文字が表示されている入力欄のことです。</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        ブラウザで Lark を開き、データの同期先にする <strong>Base（ビタベース）</strong> を開く。<br />
                        <a
                          href="https://www.larksuite.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[#7A9E7E] text-white rounded-lg text-xs font-bold hover:bg-[#5a7e5e] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          ここをクリック → larksuite.com を開く
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">※ どの Base を使うかわからない場合は、新しく Base を作成してください。</span>
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        Base を開いたら、ブラウザの<strong>アドレスバー</strong>（画面の一番上、「https://…」と書いてある細長い入力欄）に表示されている URL を確認する。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        URLの中に <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">/base/</code> という部分があります。その<strong>直後から次の「/」まで</strong>の文字列（英数字の長い文字列）がアプリトークンです。
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        そのアプリトークンをコピーして、管理画面の「<strong>Lark Base アプリトークン</strong>」欄に貼り付ける。
                      </Step>
                    </ol>
                  </div>

                  {/* URL解説モックアップ */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white border-2 border-blue-400 rounded px-3 py-1.5 text-xs font-mono flex items-center flex-wrap gap-0">
                        <span className="text-gray-400">https://</span>
                        <span className="text-gray-400">xxx.larksuite.com</span>
                        <span className="text-gray-400">/base/</span>
                        <span className="bg-[#fff0d4] text-[#b86c00] px-1 rounded font-bold border border-[#f5d58a]">HBHcbV5TNa1dCxsEFOVce5Xsn0g</span>
                        <span className="text-gray-400">/table/…</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 space-y-3">
                      <p className="text-xs text-blue-600 font-bold">↑ ブラウザの一番上にある「アドレスバー」の内容です</p>
                      <div className="bg-[#fff8e8] border-2 border-[#f5d58a] rounded-xl px-4 py-3 text-center">
                        <p className="text-xs font-bold text-[#b86c00] mb-1">📋 コピーする部分（Base アプリトークン）</p>
                        <p className="text-sm font-mono font-bold text-[#b86c00]">HBHcbV5TNa1dCxsEFOVce5Xsn0g</p>
                        <p className="text-xs text-gray-600 mt-1.5">「/base/」の直後から次の「/」の手前までの文字列</p>
                        <p className="text-xs text-gray-600">これをコピーして管理画面の「Lark Base アプリトークン」に貼り付け</p>
                      </div>
                    </div>
                  </div>

                  <InfoBox>
                    <strong>Lark のドメインについて：</strong><br />
                    ・グローバル版（日本を含む多くの国）: <code>larksuite.com</code><br />
                    ・中国版: <code>feishu.cn</code><br />
                    URLのドメイン部分が上記のどちらかで異なります。管理画面の「Lark API ベースURL」も合わせて変更してください。
                  </InfoBox>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  ③ 権限・アクセス設定
              ════════════════════════════════════════════ */}
              {tab === "perm" && (
                <div className="space-y-5">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>Bot（ボット）機能</strong> ＝ アプリが Lark の中で動ける「自動操作アカウント」の機能。これを有効にして初めて、Lark Base の共有でアプリ名が検索できるようになります。</div>
                      <div><strong>権限（パーミッション）</strong> ＝ アプリに「何をしてよいか」を許可すること。権限がないとデータにアクセスできず 403 エラーになります。</div>
                      <div><strong>スコープ（Scope）</strong> ＝ 権限の種類のこと。「bitable:app」は「Base の読み書きを許可する」という意味のスコープです。</div>
                      <div><strong>バージョン公開</strong> ＝ 設定を変更しただけでは反映されません。「公開申請」をして Lark に承認させることで、設定が有効になります。</div>
                    </div>
                  </div>

                  <DangerBox>
                    <strong>HTTP 403 エラーが出た場合：</strong> 以下の A・B・C を<strong>すべて</strong>完了していないとエラーになります。一つでも抜けると動きません。
                  </DangerBox>

                  {/* ── Part A: Bot 機能を有効にする ─────────── */}
                  <div className="border-2 border-[#C07052] rounded-xl p-4 space-y-3 bg-[#fffaf8]">
                    <p className="text-sm font-bold text-[#C07052]">A. Bot 機能を有効にする（検索に出てこない場合は必ずここから）</p>
                    <DangerBox>
                      <strong>「共有」でアプリ名を検索しても出てこない原因はほぼここです。</strong><br />
                      Bot機能を有効にしないと、Lark Base の共有画面でアプリ名がどこにも表示されません。<br />
                      以下の手順でまず Bot 機能を ON にしてください。
                    </DangerBox>
                    <InfoBox>
                      <strong>どの画面で行うか：</strong>{" "}
                      <a href="https://open.larksuite.com/app" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                        open.larksuite.com/app
                      </a>{" "}
                      の開発者コンソールです。（① App ID/Secret と同じ画面です）
                    </InfoBox>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        画面<strong>左側のメニュー</strong>の「<strong>Features</strong>」セクションにある{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">Add Features</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        表示された機能一覧の中から「<strong>Bot</strong>」を探し、右側の{" "}
                        <strong className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Enable</strong>{" "}
                        ボタン（または「有効にする」ボタン）をクリックする。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        「Bot が有効になりました」のような確認メッセージが出れば完了。<br />
                        <span className="text-xs text-gray-500">※ すでに Bot が有効な場合は「Enabled」と表示されています。その場合はこの手順はスキップしてください。</span>
                      </Step>
                    </ol>

                    {/* Bot mockup */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">open.larksuite.com/app/.../features</div>
                      </div>
                      <div className="bg-white p-4 flex gap-3">
                        <div className="w-44 flex-shrink-0 space-y-1 text-xs">
                          <div className="text-gray-400 px-2 py-1">Credentials &amp; Basic Info</div>
                          <div className="text-gray-400 px-2 py-1 text-gray-500 font-medium border-t border-gray-100 pt-2">Features</div>
                          <div className="px-2 py-1.5 bg-[#FFF0EB] text-[#C07052] rounded font-bold border border-[#f5c5b0]">▶ Add Features</div>
                          <div className="text-gray-400 px-2 py-1 border-t border-gray-100 pt-2">Permissions &amp; Scopes</div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="text-xs font-bold text-gray-700">Add Features</p>
                          <div className="border-2 border-[#C07052] rounded-xl px-4 py-3 bg-[#fffaf8] flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-gray-800">🤖 Bot</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Lark メッセージや文書でボットとして動作できるようになります</p>
                            </div>
                            <div className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold flex-shrink-0">Enable</div>
                          </div>
                          <p className="text-xs text-[#C07052] font-bold">↑ 「Bot」の「Enable」ボタンをクリック</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Part B ─────────────────────────────── */}
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-[#6B4F3A]">B. 権限（bitable:app）を追加する</p>
                    <InfoBox>
                      <strong>どの画面で行うか：</strong> 開発者コンソール（open.larksuite.com）のアプリ管理画面です。<br />
                      ブラウザで{" "}
                      <a href="https://open.larksuite.com/app" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                        open.larksuite.com/app
                      </a>{" "}
                      を開き、アプリを選択してください。
                    </InfoBox>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        画面<strong>左側のメニュー</strong>から{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">Permissions &amp; Scopes</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        右側の画面に表示される青い{" "}
                        <strong className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Add permission scopes to app</strong>{" "}
                        ボタンをクリックする。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        ポップアップが表示されます。上部の<strong>検索欄</strong>に{" "}
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">bitable</code>{" "}
                        と入力する（キーボードで打ち込む）。
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        検索結果に「<strong>View, comment, edit and manage Base</strong>」という項目が表示されます。その<strong>左端のチェックボックス（□）をクリックしてチェック</strong>を入れる。<br />
                        <span className="text-xs text-gray-500">※ スコープ名: bitable:app</span>
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        右下の青い{" "}
                        <strong className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Add Scopes</strong>{" "}
                        ボタンをクリックして閉じる。
                      </Step>
                    </ol>

                    {/* Mockup */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Add permission scopes to app（ポップアップ画面）</span>
                        <span className="text-gray-400 text-sm">✕</span>
                      </div>
                      <div className="bg-white p-4 space-y-3">
                        <div className="flex items-center gap-2 border-2 border-blue-400 rounded-lg px-3 py-2 bg-white">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-xs font-mono text-gray-600">bitable</span>
                        </div>
                        <p className="text-xs text-blue-600 font-bold">↑ 検索欄に「bitable」と入力する</p>
                        <div className="flex gap-4 border-b border-gray-200 pb-1 text-xs">
                          <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Tenant token scopes (2)</span>
                          <span className="text-gray-400">User token scopes (2)</span>
                        </div>
                        {/* bitable:app row */}
                        <div className="flex items-start gap-3 border-2 border-[#7A9E7E] bg-[#f0f8f0] rounded-lg px-3 py-2.5">
                          <div className="w-4 h-4 mt-0.5 border-2 border-[#7A9E7E] bg-[#7A9E7E] rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">View, comment, edit and manage Base</p>
                            <p className="text-[10px] font-mono text-[#7A9E7E]">bitable:app</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#7A9E7E] font-bold">↑ この項目のチェックボックス（□）をクリックしてチェックを入れる</p>
                        <div className="flex justify-end gap-2 pt-1">
                          <div className="px-3 py-1.5 border border-gray-300 text-gray-500 text-xs rounded">Cancel</div>
                          <div className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded font-bold">Add Scopes</div>
                        </div>
                        <p className="text-xs text-blue-600 font-bold text-right">↑ 「Add Scopes」ボタンをクリックして完了</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Part C ─────────────────────────────── */}
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-[#6B4F3A]">C. バージョンを公開する（設定を有効にする）</p>
                    <WarnBox>
                      <strong>なぜ必要？</strong> 権限を追加しただけでは<strong>まだ動きません</strong>。「バージョン公開」という手続きをして、Lark に設定変更を承認させる必要があります。<br />
                      <strong>どの画面で行うか：</strong> 引き続き開発者コンソール（open.larksuite.com）のアプリ管理画面です。
                    </WarnBox>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        画面<strong>左側のメニュー</strong>から{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">Version Management &amp; Release</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        「<strong>App version</strong>」という入力欄に{" "}
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">1.0.0</code>{" "}
                        と入力する（初回の場合。2回目以降は 1.0.1、1.0.2 などと増やしてください）。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        「<strong>Update notes</strong>」という入力欄に何か入力する（例:{" "}
                        <code className="bg-gray-100 px-1 rounded font-mono">Added Bitable access</code>
                        ）。<br />
                        <span className="text-xs text-gray-500">※ 内容は何でも大丈夫です。変更内容のメモです。</span>
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        <strong>ページの一番下</strong>にある申請・公開ボタンをクリックする。<br />
                        <span className="text-xs text-gray-500">※ ボタンのラベルは環境によって「Submit for release」「Publish」などと表示されます。</span>
                      </Step>
                    </ol>

                    {/* Mockup */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">open.larksuite.com/app/.../version/create</div>
                      </div>
                      <div className="bg-white p-4 flex gap-3">
                        <div className="w-44 flex-shrink-0 space-y-1 text-xs">
                          <div className="text-gray-400 px-2 py-1">Permissions &amp; Scopes</div>
                          <div className="text-gray-400 px-2 py-1 border-t border-gray-100 pt-2 font-medium text-gray-500">App Versions</div>
                          <div className="px-2 py-1.5 bg-[#FFF0EB] text-[#C07052] rounded font-bold border border-[#f5c5b0]">▶ Version Management &amp; Release</div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm font-bold text-gray-800">Version Details</p>
                          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
                            The current configuration will take effect after the app is published.
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">App version <span className="text-red-500">*</span></p>
                            <div className="border-2 border-[#7A9E7E] rounded-lg px-3 py-2 text-xs font-mono text-gray-800 bg-[#f0f8f0]">1.0.0</div>
                            <p className="text-xs text-[#7A9E7E] font-bold">← 「1.0.0」と入力する（2回目以降は 1.0.1, 1.0.2 …）</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Update notes <span className="text-red-500">*</span></p>
                            <div className="border-2 border-[#7A9E7E] rounded-lg px-3 py-2 text-xs text-gray-800 bg-[#f0f8f0]">Added Bitable access</div>
                            <p className="text-xs text-[#7A9E7E] font-bold">← 何か入力する（内容は自由）</p>
                          </div>
                          <div className="flex justify-end">
                            <div className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg font-bold">Submit for release</div>
                          </div>
                          <p className="text-xs text-blue-600 font-bold text-right">↑ ページ一番下のこのボタンをクリックして公開申請</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Part D ─────────────────────────────── */}
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-[#6B4F3A]">D. Lark Base にボットを招待する</p>

                    {/* ── 前提：アプリが「公開済み」か確認 ── */}
                    <DangerBox>
                      <strong>⚠️ この手順を始める前に必ず確認：アプリのステータスが「Available（公開済み）」になっているか？</strong><br />
                      C の手順で「Submit for release」を押しただけでは<strong>まだ「審査中（Under Review）」</strong>の状態です。<br />
                      ステータスが「Under Review」「Rejected」のままだと、共有でいくら検索しても<strong>ボットは絶対に表示されません</strong>。<br /><br />
                      <strong>確認方法：</strong><br />
                      開発者コンソール（open.larksuite.com）→ 左メニュー「<strong>Version Management &amp; Release</strong>」をクリック。<br />
                      画面に「<strong>Available</strong>」または「<strong>Live</strong>」と緑色で表示されていれば OK です。<br />
                      「<strong>Under Review</strong>」と表示されている場合は、<strong>同じ組織の管理者（admin）に承認を依頼してください</strong>。<br />
                      ※ 個人の Lark アカウントで作成した内部アプリの場合、自分が管理者であれば自動的に承認されることもあります。
                    </DangerBox>

                    <InfoBox>
                      <strong>どの画面で行うか：</strong> ここからは<strong>開発者コンソールではありません</strong>。<br />
                      <strong>Lark アプリ（または Lark のブラウザ版）</strong>を開いて、同期先の Base（ビタベース）の文書を表示してください。<br /><br />
                      <strong>ボット名（アプリ名）の確認方法：</strong><br />
                      開発者コンソール（open.larksuite.com）を開くと、<strong>画面の左上にアプリのアイコンとアプリ名が表示されています</strong>。<br />
                      例えば「<strong>Living Me</strong>」と表示されていれば、ボット名は「<strong>Living Me</strong>」です。<br />
                      また、「Credentials &amp; Basic Info」ページの「<strong>Multi-lingual app details</strong>」セクションの「<strong>Name</strong>」欄にも同じ名前が表示されています。
                    </InfoBox>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#7A9E7E]">
                        Lark アプリ（またはブラウザの Lark）で、データの同期先にしている <strong>Base（ビタベース）</strong> の文書を開く。<br />
                        <span className="text-xs text-gray-500">※ Lark を開いてホーム画面左側のサイドバーから Base（ビタベース）の文書名をクリックして開いてください。</span>
                      </Step>
                      <Step n={2} color="bg-[#7A9E7E]">
                        Base の文書が開いたら、<strong>画面の右上</strong>（文書のタイトルが書いてあるバーの右端）にある「<strong>共有</strong>」ボタンをクリックする。<br />
                        <span className="text-xs text-gray-500">※ 文書のページ内ではなく、ウィンドウの最上部のバー（タイトルバー）の右端にあります。見当たらない場合は「・・・」（もっと見る）ボタンの中にあることもあります。</span>
                      </Step>
                      <Step n={3} color="bg-[#7A9E7E]">
                        「共有」パネルが開きます。パネルの<strong>上部にある検索欄</strong>（「名前またはメールアドレスで検索」と書かれた入力欄）に、開発者コンソールのアプリ名を<strong>正確に</strong>入力する。<br />
                        <span className="text-xs text-gray-500">例：開発者コンソールで「<strong>Living Me</strong>」と表示されていれば、「Living Me」と入力する。大文字・小文字・スペースも含めて一致させてください。</span><br />
                        <span className="text-xs text-[#C07052] font-bold">※ 検索結果に出てこない場合 → 上の「⚠️ 前提確認」に戻ってアプリが「Available」になっているか確認してください。</span>
                      </Step>
                      <Step n={4} color="bg-[#7A9E7E]">
                        入力すると候補が表示されます。<strong>アプリ名（ボット）</strong> が表示されたらクリックして選択する。<br />
                        <span className="text-xs text-gray-500">※ ボットはアプリのアイコン（ロボットや四角いアイコン）で表示されます（人物のアイコンではありません）。</span>
                      </Step>
                      <Step n={5} color="bg-[#7A9E7E]">
                        右側に権限のプルダウン（選択メニュー）があります。「<strong>閲覧者</strong>」と表示されている場合は、クリックして「<strong>編集者</strong>」に変更する。
                      </Step>
                      <Step n={6} color="bg-[#7A9E7E]">
                        「<strong>送信</strong>」ボタンをクリックして完了。
                      </Step>
                    </ol>

                    {/* ── それでも出てこない場合 ── */}
                    <WarnBox>
                      <strong>それでも「Living Me」が検索に出てこない場合のチェックリスト：</strong><br />
                      <ol className="mt-1 space-y-1 list-decimal list-inside">
                        <li>開発者コンソールで Bot 機能が「<strong>Enabled（有効）</strong>」になっているか（A の手順）</li>
                        <li>「bitable:app」権限が追加されているか（B の手順）</li>
                        <li>バージョンのステータスが「<strong>Available</strong>」または「<strong>Live</strong>」になっているか（C の手順 → 上の前提確認）</li>
                        <li>Lark Base（ビタベース）の文書と、アプリを作成した Lark アカウントが<strong>同じ組織（ワークスペース）</strong>に属しているか</li>
                        <li>アプリ名を<strong>完全一致</strong>で入力しているか（大文字・小文字・スペースに注意）</li>
                      </ol>
                      上記をすべて確認してもまだ解決しない場合は、管理者ページ（<strong>admin.larksuite.com</strong>）にログインし、「<strong>アプリ管理</strong>」からアプリが承認されているか確認してください。
                    </WarnBox>

                    {/* Mockup */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">
                          Lark アプリ または ブラウザの Lark — Base（ビタベース）の文書画面
                        </div>
                      </div>
                      <div className="bg-white p-4 space-y-3">
                        {/* Title bar */}
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-xs font-bold text-gray-700">📊 同期先の Base のタイトル（例: Living Me データ）</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border border-[#C07052] bg-[#FFF0EB] text-[#C07052] text-xs px-2.5 py-1 rounded-lg font-bold">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              共有
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-[#C07052] font-bold text-right">↑ 画面右上のタイトルバーにある「共有」ボタンをクリック</p>

                        {/* Share panel */}
                        <div className="border-2 border-gray-300 rounded-xl shadow-xl bg-white p-4 space-y-3">
                          <p className="text-sm font-bold text-gray-800">共有</p>

                          <div>
                            <div className="flex items-center gap-2 border-2 border-[#7A9E7E] rounded-lg px-3 py-2 bg-white">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <span className="text-xs text-gray-600">MyLivingMeApp</span>
                            </div>
                            <p className="text-xs text-[#7A9E7E] font-bold mt-1">↑ 「共有」パネル上部の検索欄に App Name（アプリ名）を入力</p>
                          </div>

                          {/* Search result */}
                          <div className="border-2 border-[#7A9E7E] bg-[#f0f8f0] rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#7A9E7E] rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-800">MyLivingMeApp</p>
                                <p className="text-[10px] text-gray-500">ボット（自動操作用アカウント）</p>
                              </div>
                              <div className="border border-[#7A9E7E] bg-white text-[#7A9E7E] text-xs px-2 py-0.5 rounded font-bold">編集者 ▼</div>
                            </div>
                            <p className="text-xs text-[#7A9E7E] font-bold mt-2">↑ ボットをクリックして選択 → 右のプルダウンを「編集者」に変更</p>
                          </div>

                          <div className="flex justify-end">
                            <div className="px-5 py-2 bg-[#7A9E7E] text-white text-xs font-bold rounded-lg">送信</div>
                          </div>
                          <p className="text-xs text-[#7A9E7E] font-bold text-right">↑「送信」をクリックして完了</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <GoodBox>
                    <strong>A・B・C・D すべて完了したら：</strong><br />
                    管理画面に戻り、「<strong>Lark Base 全同期</strong>」ボタンをクリックしてください。正常に動作すれば成功です。
                  </GoodBox>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  ④ Table ID
              ════════════════════════════════════════════ */}
              {tab === "table" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>テーブルID</strong> ＝ Lark Base の中の「シート（テーブル）」を識別する番号。チャンネル・ジャーナル・フォームなど機能ごとに別々のテーブルがあります。</div>
                      <div><strong>全同期ボタン</strong> ＝ このシステムの管理画面にあるボタン。クリックするだけで、テーブルを自動作成してデータをエクスポートしてくれます。手動でテーブルIDを調べる必要はありません。</div>
                    </div>
                  </div>

                  <GoodBox>
                    テーブルID は<strong>手動で入力する必要はありません</strong>。「全同期」ボタンを1回クリックするだけで自動的に設定されます。
                  </GoodBox>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#7A9E7E]">
                        先に ①②③ の設定をすべて保存しておく。
                      </Step>
                      <Step n={2} color="bg-[#7A9E7E]">
                        この管理画面のページを下にスクロールして「<strong>Lark Base 同期</strong>」というセクションを探す。
                      </Step>
                      <Step n={3} color="bg-[#7A9E7E]">
                        「<strong>Lark Base 全同期</strong>」ボタンをクリックする。<br />
                        <span className="text-xs text-gray-500">※ 処理に少し時間がかかります。完了メッセージが出るまで待ってください。</span>
                      </Step>
                      <Step n={4} color="bg-[#7A9E7E]">
                        完了すると、全テーブルが自動作成されてデータが Lark Base に書き込まれます。テーブルIDも自動保存されます。
                      </Step>
                    </ol>
                  </div>

                  {/* Mockup */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">/admin/settings （管理画面）</div>
                    </div>
                    <div className="bg-white p-4 space-y-2">
                      <p className="text-xs font-bold text-gray-700">Lark Base 同期</p>
                      <p className="text-xs text-gray-500 mb-3">アーカイブ・イベント・コラムなどを Lark Base に一括エクスポート</p>
                      <div className="flex gap-2">
                        <div className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">接続テスト</div>
                        <div className="px-4 py-2 bg-[#6B4F3A] text-white text-xs font-bold rounded-lg border-2 border-[#C07052] shadow-md">
                          Lark Base 全同期
                        </div>
                      </div>
                      <p className="text-xs text-[#7A9E7E] font-bold mt-1">↑ このボタンを1回クリックするだけで全て自動設定されます</p>
                    </div>
                  </div>

                  <WarnBox>
                    <strong>注意：</strong> 全テーブルID（チャンネル・メッセージ・ジャーナル・フォーム・アーカイブ等）は全同期後に自動保存されます。手動で変更する必要はありません。
                  </WarnBox>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-[#6B4F3A] text-white text-sm font-medium rounded-lg hover:bg-[#5a4030] transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
