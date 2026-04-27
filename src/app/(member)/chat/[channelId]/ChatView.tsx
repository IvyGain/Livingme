"use client";

import { useTransition, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { sendMessage, getMessages, getThreadReplies } from "@/server/actions/chat";
import type { MessageWithMeta } from "@/server/actions/chat";

// ---------- 型 ----------

interface Channel {
  id: string;
  name: string;
}

interface Props {
  channel: Channel;
  initialMessages: MessageWithMeta[];
  canWrite: boolean;
}

// ---------- 時刻フォーマット ----------

function formatTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  if (isToday) {
    return `${hh}:${mm}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

// ---------- アバターカラー ----------

const WARM_COLORS = [
  "#C07052",
  "#B5814A",
  "#A0705A",
  "#C09050",
  "#8B6355",
  "#9A7060",
  "#B46A3C",
  "#C08060",
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return WARM_COLORS[Math.abs(hash) % WARM_COLORS.length];
}

function getInitial(name: string | null): string {
  if (!name) return "?";
  return [...name][0].toUpperCase();
}

// ---------- Avatar ----------

function Avatar({ userId, name }: { userId: string; name: string | null }) {
  const color = useMemo(() => getAvatarColor(userId), [userId]);
  const initial = useMemo(() => getInitial(name), [name]);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}

// ---------- MessageItem ----------

interface MessageItemProps {
  message: MessageWithMeta;
  onThreadOpen: (msg: MessageWithMeta) => void;
}

function MessageItem({ message, onThreadOpen }: MessageItemProps) {
  const replyCount = message._count.replies;

  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-gray-50 group">
      <Avatar userId={message.user.id} name={message.user.name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {message.user.name ?? "名無し"}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(new Date(message.createdAt))}
          </span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-0.5">
          {message.content}
        </p>
        <button
          onClick={() => onThreadOpen(message)}
          className="mt-1 text-xs text-[#9a8070] hover:text-[#C07052] transition-colors"
        >
          {replyCount > 0 ? `返信 ${replyCount}件` : "返信する"}
        </button>
      </div>
    </div>
  );
}

// ---------- ThreadPanel ----------

interface ThreadPanelProps {
  channelId: string;
  parentMessage: MessageWithMeta;
  onClose: () => void;
  canWrite: boolean;
}

function ThreadPanel({ channelId, parentMessage, onClose, canWrite }: ThreadPanelProps) {
  const [replies, setReplies] = useState<MessageWithMeta[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // スレッドが開いたときにリプライをサーバーから取得
  useEffect(() => {
    let cancelled = false;
    getThreadReplies(parentMessage.id).then((data) => {
      if (!cancelled) setReplies(data);
    }).catch(() => {
      if (!cancelled) setReplies([]);
    });
    return () => { cancelled = true; };
  }, [parentMessage.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    setInput("");

    // 楽観的更新
    const optimistic: MessageWithMeta = {
      id: `optimistic-${Date.now()}`,
      channelId,
      userId: parentMessage.user.id,
      content: trimmed,
      parentId: parentMessage.id,
      larkRecordId: null,
      editedAt: null,
      createdAt: new Date(),
      user: parentMessage.user,
      _count: { replies: 0 },
    };
    setReplies((prev) => [...prev, optimistic]);

    startTransition(async () => {
      try {
        const saved = await sendMessage(channelId, trimmed, parentMessage.id);
        setReplies((prev) =>
          prev.map((r) =>
            r.id === optimistic.id
              ? {
                  ...saved,
                  user: optimistic.user,
                  _count: { replies: 0 },
                }
              : r,
          ),
        );
      } catch {
        setReplies((prev) => prev.filter((r) => r.id !== optimistic.id));
        setInput(trimmed);
      }
    });
  }, [input, isPending, channelId, parentMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // IME 変換中（日本語入力で変換確定の Enter など）は送信しない。
      // nativeEvent.isComposing が true の間と、IME による Enter の互換ガードとして
      // keyCode 229 もチェックする。
      if (e.nativeEvent.isComposing || e.key === "Process" || e.keyCode === 229) {
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-800">スレッド</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="スレッドを閉じる"
        >
          ×
        </button>
      </div>

      {/* Parent message */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <Avatar userId={parentMessage.user.id} name={parentMessage.user.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-gray-900">
                {parentMessage.user.name ?? "名無し"}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(new Date(parentMessage.createdAt))}
              </span>
            </div>
            <p className="text-xs text-gray-700 whitespace-pre-wrap break-words mt-0.5">
              {parentMessage.content}
            </p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0">
        {replies.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            まだ返信はありません
          </p>
        ) : (
          replies.map((r) => (
            <div key={r.id} className="flex gap-2 px-4 py-2 hover:bg-gray-50">
              <Avatar userId={r.user.id} name={r.user.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-900">
                    {r.user.name ?? "名無し"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(new Date(r.createdAt))}
                  </span>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap break-words mt-0.5">
                  {r.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        {canWrite ? (
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="返信する..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C07052] placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="px-3 py-2 bg-[#C07052] text-white rounded-lg text-xs font-medium hover:bg-[#a85e42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              送信
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
            このチャンネルへの書き込み権限がありません
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- ChatView ----------

export function ChatView({ channel, initialMessages, canWrite }: Props) {
  // getMessages は desc 順で返るので逆順にして古い順に表示
  const [messages, setMessages] = useState<MessageWithMeta[]>(
    () => [...initialMessages].reverse(),
  );
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [threadMessage, setThreadMessage] = useState<MessageWithMeta | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新規メッセージ追加時に最下部へスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    setInput("");

    // 楽観的更新（仮のIDを付与）
    const optimistic: MessageWithMeta = {
      id: `optimistic-${Date.now()}`,
      channelId: channel.id,
      userId: "me",
      content: trimmed,
      parentId: null,
      larkRecordId: null,
      editedAt: null,
      createdAt: new Date(),
      user: { id: "me", name: null, avatarUrl: null },
      _count: { replies: 0 },
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      try {
        const saved = await sendMessage(channel.id, trimmed);
        // 楽観的メッセージを実際の結果で置き換え（ユーザー情報は別途取得不可なので保持）
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? { ...saved, user: optimistic.user, _count: { replies: 0 } }
              : m,
          ),
        );
        // 最新メッセージを再取得してユーザー情報を補完
        const { messages: fresh } = await getMessages(channel.id);
        setMessages([...fresh].reverse());
      } catch {
        // 失敗時は楽観的メッセージを削除して入力を戻す
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(trimmed);
      }
    });
  }, [input, isPending, channel.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // IME 変換中（日本語入力で変換確定の Enter など）は送信しない。
      // nativeEvent.isComposing が true の間と、IME による Enter の互換ガードとして
      // keyCode 229 もチェックする。
      if (e.nativeEvent.isComposing || e.key === "Process" || e.keyCode === 229) {
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleThreadOpen = useCallback((msg: MessageWithMeta) => {
    setThreadMessage(msg);
  }, []);

  const handleThreadClose = useCallback(() => {
    setThreadMessage(null);
  }, []);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* メインエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-white">
          <span className="text-gray-400 font-medium">#</span>
          <h1 className="text-sm font-semibold text-gray-800">{channel.name}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <p className="text-gray-400 text-sm">
                まだメッセージはありません。最初のメッセージを送りましょう。
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onThreadOpen={handleThreadOpen}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {canWrite ? (
            <>
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`#${channel.name} にメッセージを送る`}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C07052] placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isPending}
                  className="px-4 py-2.5 bg-[#C07052] text-white rounded-lg text-sm font-medium hover:bg-[#a85e42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter で送信 / Shift+Enter で改行
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">
              このチャンネルへの書き込み権限がありません
            </p>
          )}
        </div>
      </div>

      {/* Thread panel */}
      {threadMessage && (
        <ThreadPanel
          channelId={channel.id}
          parentMessage={threadMessage}
          onClose={handleThreadClose}
          canWrite={canWrite}
        />
      )}
    </div>
  );
}
