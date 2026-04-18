"use client";

import { useState } from "react";
import { replyToInquiry, updateInquiryStatus } from "@/server/actions/inquiries";
import { Mail, ChevronDown, ChevronUp, Send, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  createdAt: Date;
  replies: { id: string; content: string; sentByEmail: boolean; createdAt: Date }[];
};

const STATUS_LABELS = {
  OPEN: "未対応",
  REPLIED: "返信済み",
  CLOSED: "クローズ",
};

const STATUS_COLORS = {
  OPEN: "bg-red-100 text-red-700",
  REPLIED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const [openId, setOpenId] = useState<string | null>(inquiries[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <InquiryCard
          key={inq.id}
          inquiry={inq}
          isOpen={openId === inq.id}
          onToggle={() => setOpenId(openId === inq.id ? null : inq.id)}
        />
      ))}
    </div>
  );
}

function InquiryCard({
  inquiry,
  isOpen,
  onToggle,
}: {
  inquiry: Inquiry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReply() {
    if (!replyText.trim()) return;
    setIsSending(true);
    setError(null);
    const result = await replyToInquiry(inquiry.id, replyText.trim());
    setIsSending(false);
    if (result.success) {
      setReplyText("");
      router.refresh();
    } else {
      setError(result.error ?? "返信に失敗しました");
    }
  }

  async function handleStatusChange(status: "OPEN" | "REPLIED" | "CLOSED") {
    await updateInquiryStatus(inquiry.id, status);
    router.refresh();
  }

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${inquiry.status === "OPEN" ? "border-red-200" : "border-gray-200"}`}>
      {/* ヘッダー */}
      <button
        type="button"
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 text-sm">{inquiry.subject}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inquiry.status]}`}>
              {STATUS_LABELS[inquiry.status]}
            </span>
            {inquiry.replies.length > 0 && (
              <span className="text-xs text-gray-400">{inquiry.replies.length}件の返信</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-medium text-gray-700">{inquiry.name}</span>
            {" "}
            &lt;{inquiry.email}&gt;
            {" · "}
            {inquiry.createdAt.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {/* 詳細 */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-4">
          {/* 送信者情報 */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">送信者メール:</span>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-xs text-[#C07052] hover:underline font-medium"
            >
              {inquiry.email}
            </a>
          </div>

          {/* 本文 */}
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{inquiry.body}</p>
          </div>

          {/* 返信履歴 */}
          {inquiry.replies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">返信履歴</p>
              {inquiry.replies.map((reply) => (
                <div key={reply.id} className="bg-[#FFF8F0] border border-[#e8ddd5] rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">
                      {reply.createdAt.toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {reply.sentByEmail ? (
                      <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> メール送信済み
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <X className="w-3 h-3" /> メール未送信
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 返信フォーム */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">返信（メールで自動送信されます）</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder={`${inquiry.name} さんへの返信を入力...`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white resize-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("REPLIED")}
                  className="text-xs text-green-600 hover:underline"
                >
                  返信済みに変更
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => handleStatusChange("CLOSED")}
                  className="text-xs text-gray-500 hover:underline"
                >
                  クローズ
                </button>
                {inquiry.status !== "OPEN" && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("OPEN")}
                      className="text-xs text-red-500 hover:underline"
                    >
                      未対応に戻す
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleReply}
                disabled={isSending || !replyText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#C07052] text-white text-xs font-medium rounded-lg hover:bg-[#a85e42] disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? "送信中..." : "返信を送る"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
