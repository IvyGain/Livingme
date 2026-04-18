"use client";

import { useState } from "react";

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

export function UnivaPayHelpButton({ webhookUrl }: { webhookUrl: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"token" | "webhook" | "price">("token");
  const [copied, setCopied] = useState(false);

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
        UnivaPay設定のヘルプを見る
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-[#6B4F3A]">UnivaPay 設定ガイド</h2>
                <p className="text-xs text-gray-400 mt-0.5">① → ② → ③ の順に設定してください</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {(["token", "webhook", "price"] as const).map((t) => {
                const labels = {
                  token: "① アプリトークン",
                  webhook: "② Webhook設定",
                  price: "③ 価格設定",
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
                  ① アプリトークン
              ════════════════════════════════════════════ */}
              {tab === "token" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>UnivaPay（ユニバペイ）</strong> ＝ オンライン決済サービスです。このシステムで月額料金を受け取るために使います。</div>
                      <div><strong>マーチャントポータル</strong> ＝ UnivaPay の管理画面（ウェブサイト）のことです。売上や設定を管理する場所です。</div>
                      <div><strong>アプリトークン</strong> ＝ このシステムが UnivaPay に「アクセスしてよい」と認証するための番号です。</div>
                      <div><strong>シークレット</strong> ＝ アプリトークンとセットで使うパスワードのようなものです。絶対に他人に見せないでください。</div>
                    </div>
                  </div>

                  <WarnBox>
                    <strong>はじめに確認：</strong> UnivaPay の加盟店アカウントが必要です。
                    まだお持ちでない場合は、先に UnivaPay の担当者へ加盟店申請を行ってください。
                  </WarnBox>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        パソコンのブラウザ（Chrome や Safari など）で UnivaPay マーチャントポータルを開く。<br />
                        <a
                          href="https://merchant.univapay.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[#C07052] text-white rounded-lg text-xs font-bold hover:bg-[#a05040] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          ここをクリック → merchant.univapay.com を開く
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">※ UnivaPay のアカウントでログインしてください。</span>
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        ログイン後、画面左側のメニューから{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">設定</strong>{" "}
                        →{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">アプリトークン</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        右上または画面中央にある{" "}
                        <strong className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">+ 新規作成</strong>{" "}
                        ボタンをクリックする。
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        トークンの名前（メモ用。何でも構いません）を入力して作成する。
                      </Step>
                      <Step n={5} color="bg-[#C07052]">
                        作成完了画面に{" "}
                        <strong>アプリトークン</strong>（<code className="bg-gray-100 px-1 rounded font-mono text-xs">ap_live_xxx…</code>）と{" "}
                        <strong>シークレット</strong>（長い英数字の文字列）が表示されます。<br />
                        両方をコピーして、管理画面の対応する欄に貼り付ける。<br />
                        <span className="text-xs text-gray-500">※ シークレットはこの画面を閉じると<strong>二度と表示されません</strong>。必ず今コピーしてください。</span>
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
                        merchant.univapay.com / アプリトークン 新規作成
                      </div>
                    </div>
                    <div className="bg-white p-4 space-y-3">
                      <p className="text-xs font-bold text-gray-700">作成完了後に表示される画面（例）</p>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">アプリトークン</p>
                          <div className="flex items-center gap-2 border-2 border-[#7A9E7E] rounded-lg px-3 py-2 bg-[#f0f8f0]">
                            <span className="text-xs font-mono text-gray-700 flex-1">ap_live_xxxxxxxxxxxxxxxx</span>
                            <svg className="w-3.5 h-3.5 text-[#7A9E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#7A9E7E] font-bold">← ここをコピー → 管理画面の「UnivaPay アプリトークン」に貼り付け</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">シークレット</p>
                          <div className="flex items-center gap-2 border-2 border-[#C07052] rounded-lg px-3 py-2 bg-[#fff5f2]">
                            <span className="text-xs font-mono text-gray-700 flex-1">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>
                            <svg className="w-3.5 h-3.5 text-[#C07052]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#C07052] font-bold">← ここをコピー → 管理画面の「UnivaPay アプリシークレット」に貼り付け</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DangerBox>
                    <strong>重要：</strong> シークレットはトークン作成時にのみ表示されます。
                    画面を閉じると二度と確認できません。必ずコピーしてから閉じてください。
                    もし閉じてしまった場合は、新しいトークンを作り直してください。
                  </DangerBox>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  ② Webhook設定
              ════════════════════════════════════════════ */}
              {tab === "webhook" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>Webhook（ウェブフック）</strong> ＝ UnivaPay で支払いが行われたとき、このシステムに自動で「支払いがありました」と知らせる仕組みです。これを設定しないと、会員の有効化・停止が自動で行われません。</div>
                      <div><strong>Webhook URL</strong> ＝ UnivaPay からの通知を受け取る、このシステム専用の「受付窓口」のアドレスです。</div>
                      <div><strong>イベント</strong> ＝ 「支払い成功」「支払い失敗」「解約」などの出来事のことです。</div>
                    </div>
                  </div>

                  <InfoBox>
                    <strong>このタブでやること：</strong> UnivaPay での支払いが発生したとき、このシステムに自動で通知が届くよう設定します。
                    設定しないと会員の状態が自動更新されません。
                  </InfoBox>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        パソコンのブラウザで UnivaPay マーチャントポータルを開く。<br />
                        <a
                          href="https://merchant.univapay.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[#C07052] text-white rounded-lg text-xs font-bold hover:bg-[#a05040] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          ここをクリック → merchant.univapay.com を開く
                        </a>
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        画面左側のメニューから{" "}
                        <strong className="bg-[#FFF0EB] text-[#C07052] px-1.5 py-0.5 rounded">Webhook</strong>{" "}
                        をクリックする。
                      </Step>
                      <Step n={3} color="bg-[#C07052]">
                        <strong>+ 新規作成</strong> ボタンをクリックし、「URL」の欄に以下のアドレスを貼り付ける。<br />
                        <span className="text-xs text-gray-500 mb-1 block">※ 下のボタンでコピーできます。</span>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mt-1">
                          <span className="text-xs font-mono text-gray-700 flex-1 break-all">{webhookUrl}</span>
                          <button
                            type="button"
                            onClick={copyWebhookUrl}
                            className="flex-shrink-0 text-xs px-3 py-1.5 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#5a7e5e] transition-colors font-bold"
                          >
                            {copied ? "✓ コピー済" : "コピー"}
                          </button>
                        </div>
                      </Step>
                      <Step n={4} color="bg-[#C07052]">
                        「通知するイベント」の設定画面で、以下の<strong>3つ</strong>にチェックを入れる。<br />
                        <div className="mt-2 space-y-1.5">
                          {[
                            { key: "subscription_payment", label: "定期支払い成功", color: "bg-green-100 text-green-700" },
                            { key: "subscription_failure", label: "支払い失敗", color: "bg-red-100 text-red-700" },
                            { key: "subscription_canceled", label: "解約", color: "bg-gray-100 text-gray-700" },
                          ].map(({ key, label, color }) => (
                            <div key={key} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded bg-[#7A9E7E] flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <code className="text-xs font-mono text-gray-600">{key}</code>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${color}`}>{label}</span>
                            </div>
                          ))}
                        </div>
                      </Step>
                      <Step n={5} color="bg-[#C07052]">
                        「<strong>保存</strong>」ボタンをクリックして完了。
                      </Step>
                    </ol>
                  </div>

                  {/* Webhook URL 解説 */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold">Webhook設定画面のイメージ（例）</p>
                    </div>
                    <div className="bg-white p-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Webhook URL</p>
                        <div className="flex items-center gap-2 border-2 border-[#7A9E7E] rounded-lg px-3 py-2 bg-[#f0f8f0]">
                          <span className="text-xs font-mono text-gray-600 flex-1 break-all">
                            {webhookUrl || "https://your-domain.com/api/webhooks/univapay"}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A9E7E] font-bold">↑ 上記のアドレスをここに貼り付ける</p>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">通知するイベント（チェックを入れる3つ）</p>
                        {[
                          { key: "subscription_payment", label: "定期支払い成功", color: "bg-green-100 text-green-700" },
                          { key: "subscription_failure", label: "支払い失敗", color: "bg-red-100 text-red-700" },
                          { key: "subscription_canceled", label: "解約", color: "bg-gray-100 text-gray-700" },
                        ].map(({ key, label, color }) => (
                          <div key={key} className="flex items-center gap-2 mb-1.5">
                            <div className="w-3.5 h-3.5 rounded border-2 border-[#7A9E7E] bg-[#7A9E7E] flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <code className="text-xs font-mono text-gray-600">{key}</code>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${color}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <WarnBox>
                    <strong>注意：</strong> Webhook URL には<strong>本番環境（https://…）</strong>のURLを使用してください。
                    「http://localhost…」のようなローカル開発環境のURLは使えません。
                    サイトが公開されてから設定してください。
                  </WarnBox>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  ③ 価格設定
              ════════════════════════════════════════════ */}
              {tab === "price" && (
                <div className="space-y-4">

                  {/* 用語解説 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-yellow-800">📖 このページで出てくる言葉の意味</p>
                    <div className="space-y-1.5 text-xs text-yellow-900">
                      <div><strong>UnivaPay 価格（円）</strong> ＝ 会員が毎月支払う月額料金です。円で入力します（例：5500）。</div>
                      <div><strong>サブスクリプション</strong> ＝ 毎月自動で引き落とされる定期課金のことです。</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4F3A] mb-3">手順</p>
                    <ol className="space-y-3">
                      <Step n={1} color="bg-[#C07052]">
                        この画面（外部サービス設定ページ）の「UnivaPay 価格（円）」欄に、月額料金を<strong>半角数字</strong>で入力する。<br />
                        <span className="text-xs text-gray-500">例：月額5,500円なら <code className="bg-gray-100 px-1 rounded">5500</code> と入力</span>
                      </Step>
                      <Step n={2} color="bg-[#C07052]">
                        ページ下の{" "}
                        <strong className="bg-[#C07052] text-white px-2 py-0.5 rounded text-xs">保存する</strong>{" "}
                        ボタンをクリックして保存する。
                      </Step>
                    </ol>
                  </div>

                  {/* 入力例 */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 font-mono">
                        管理画面 / 外部サービス設定
                      </div>
                    </div>
                    <div className="bg-white p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-700">UnivaPay セクション</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">UnivaPay 価格（円）</p>
                        <div className="flex items-center gap-2 border-2 border-[#C07052] rounded-lg px-3 py-2 bg-[#fff5f2]">
                          <span className="text-xs font-mono text-gray-700">5500</span>
                        </div>
                        <p className="text-xs text-[#C07052] font-bold">↑ 月額料金を円（税込）で入力。例：5,500円 → <code className="bg-red-50 px-1 rounded">5500</code></p>
                      </div>
                    </div>
                  </div>

                  <WarnBox>
                    <strong>注意：</strong><br />
                    ・価格変更後は、<strong>新規入会の申込みから</strong>新しい金額が適用されます。<br />
                    ・すでに契約中の会員の料金は変わりません。<br />
                    ・<strong>税込み</strong>の金額を入力してください。カンマ（,）は不要です。
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
