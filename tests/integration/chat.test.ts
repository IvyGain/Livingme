/**
 * チャット Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockChannelFindMany = vi.fn();
const mockChannelCreate = vi.fn();
const mockChannelFindUnique = vi.fn();
const mockChannelDelete = vi.fn();
const mockMessageCreate = vi.fn();
const mockMessageFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatChannel: {
      findMany: mockChannelFindMany,
      create: mockChannelCreate,
      findUnique: mockChannelFindUnique,
      delete: mockChannelDelete,
    },
    chatMessage: {
      create: mockMessageCreate,
      findMany: mockMessageFindMany,
    },
  },
}));

// Mock Lark 同期
vi.mock("@/lib/lark", () => ({ createRecord: vi.fn() }));
vi.mock("@/lib/settings", () => ({ getSetting: vi.fn().mockResolvedValue(undefined) }));

const {
  getChannels,
  createChannel,
  sendMessage,
  getMessages,
  getThreadReplies,
  deleteChannel,
} = await import("@/server/actions/chat");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };
const freeSession = { user: { id: "free-1", role: "FREE_MEMBER" } };

describe("チャット Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
  });

  // ---------- getChannels ----------

  describe("getChannels", () => {
    const allChannels = [
      { id: "ch-1", name: "全員", requiredRole: null, isArchived: false, createdAt: new Date() },
      { id: "ch-2", name: "無料以上", requiredRole: "FREE_MEMBER", isArchived: false, createdAt: new Date() },
      { id: "ch-3", name: "有料以上", requiredRole: "MEMBER", isArchived: false, createdAt: new Date() },
      { id: "ch-4", name: "管理者のみ", requiredRole: "ADMIN", isArchived: false, createdAt: new Date() },
    ];

    test("ADMIN はすべてのチャンネルを取得できる", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockChannelFindMany.mockResolvedValue(allChannels);

      const result = await getChannels();

      expect(result).toHaveLength(4);
    });

    test("FREE_MEMBER は requiredRole=null または FREE_MEMBER のチャンネルのみ取得できる", async () => {
      mockAuth.mockResolvedValue(freeSession);
      mockChannelFindMany.mockResolvedValue(allChannels);

      const result = await getChannels();

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(["ch-1", "ch-2"]);
    });

    test("MEMBER は requiredRole=null, FREE_MEMBER, MEMBER のチャンネルを取得できる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      mockChannelFindMany.mockResolvedValue(allChannels);

      const result = await getChannels();

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(["ch-1", "ch-2", "ch-3"]);
    });

    test("FREE_MEMBER は requiredRole=MEMBER のチャンネルを取得できない", async () => {
      mockAuth.mockResolvedValue(freeSession);
      mockChannelFindMany.mockResolvedValue(allChannels);

      const result = await getChannels();

      expect(result.find((c) => c.id === "ch-3")).toBeUndefined();
    });

    test("未認証は redirect が投げられる", async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getChannels()).rejects.toThrow("NEXT_REDIRECT:");
    });
  });

  // ---------- createChannel ----------

  describe("createChannel", () => {
    test("ADMIN はチャンネルを作成できる（name, description, requiredRole, writeRole）", async () => {
      mockAuth.mockResolvedValue(adminSession);
      const created = {
        id: "ch-new",
        name: "新チャンネル",
        description: "説明",
        requiredRole: "MEMBER",
        writeRole: null,
        isArchived: false,
        createdAt: new Date(),
      };
      mockChannelCreate.mockResolvedValue(created);

      const result = await createChannel("新チャンネル", "説明", "MEMBER");

      expect(result).toEqual(created);
      expect(mockChannelCreate).toHaveBeenCalledWith({
        data: {
          name: "新チャンネル",
          description: "説明",
          requiredRole: "MEMBER",
          writeRole: null,
        },
      });
    });

    test("MEMBER は redirect が投げられる（権限なし）", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(createChannel("チャンネル")).rejects.toThrow("NEXT_REDIRECT:");
    });

    test("requiredRole=null で作成すると全員が見える", async () => {
      mockAuth.mockResolvedValue(adminSession);
      const created = {
        id: "ch-open",
        name: "全員向け",
        description: undefined,
        requiredRole: null,
        writeRole: null,
        isArchived: false,
        createdAt: new Date(),
      };
      mockChannelCreate.mockResolvedValue(created);

      const result = await createChannel("全員向け", undefined, null);

      expect(result.requiredRole).toBeNull();
      expect(mockChannelCreate).toHaveBeenCalledWith({
        data: {
          name: "全員向け",
          description: undefined,
          requiredRole: null,
          writeRole: null,
        },
      });
    });
  });

  // ---------- sendMessage ----------

  describe("sendMessage", () => {
    test("有効なチャンネルにメッセージを送信できる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      const channel = { id: "ch-1", requiredRole: null, isArchived: false };
      const message = {
        id: "msg-1",
        channelId: "ch-1",
        userId: "member-1",
        content: "こんにちは",
        parentId: null,
        createdAt: new Date(),
      };
      mockChannelFindUnique.mockResolvedValue(channel);
      mockMessageCreate.mockResolvedValue(message);

      const result = await sendMessage("ch-1", "こんにちは");

      expect(result).toEqual(message);
      expect(mockMessageCreate).toHaveBeenCalledWith({
        data: {
          channelId: "ch-1",
          userId: "member-1",
          content: "こんにちは",
          parentId: null,
        },
      });
    });

    test("アーカイブ済みチャンネルへの投稿は Error を投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      mockChannelFindUnique.mockResolvedValue({ id: "ch-archived", requiredRole: null, isArchived: true });

      await expect(sendMessage("ch-archived", "メッセージ")).rejects.toThrow("チャンネルが見つかりません");
    });

    test("FREE_MEMBER が requiredRole=MEMBER チャンネルに投稿すると閲覧権限エラー", async () => {
      mockAuth.mockResolvedValue(freeSession);
      mockChannelFindUnique.mockResolvedValue({ id: "ch-member", requiredRole: "MEMBER", writeRole: null, isArchived: false });

      await expect(sendMessage("ch-member", "メッセージ")).rejects.toThrow("このチャンネルを閲覧する権限がありません");
    });

    test("MEMBER が writeRole=ADMIN チャンネルに投稿すると書き込み権限エラー", async () => {
      mockAuth.mockResolvedValue(memberSession);
      mockChannelFindUnique.mockResolvedValue({ id: "ch-admin-write", requiredRole: null, writeRole: "ADMIN", isArchived: false });

      await expect(sendMessage("ch-admin-write", "メッセージ")).rejects.toThrow("このチャンネルへの書き込み権限がありません");
    });

    test("MEMBER が requiredRole=MEMBER チャンネルに投稿できる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      const channel = { id: "ch-member", requiredRole: "MEMBER", isArchived: false };
      const message = {
        id: "msg-2",
        channelId: "ch-member",
        userId: "member-1",
        content: "投稿",
        parentId: null,
        createdAt: new Date(),
      };
      mockChannelFindUnique.mockResolvedValue(channel);
      mockMessageCreate.mockResolvedValue(message);

      const result = await sendMessage("ch-member", "投稿");

      expect(result).toEqual(message);
    });
  });

  // ---------- getMessages ----------

  describe("getMessages", () => {
    test("チャンネルのメッセージ一覧を取得できる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      const messages = [
        {
          id: "msg-1",
          channelId: "ch-1",
          userId: "member-1",
          content: "こんにちは",
          parentId: null,
          createdAt: new Date(),
          user: { id: "member-1", name: "テスト", avatarUrl: null },
          _count: { replies: 0 },
        },
      ];
      mockMessageFindMany.mockResolvedValue(messages);

      const result = await getMessages("ch-1");

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe("こんにちは");
    });

    test("cursor指定でページネーションできる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      mockMessageFindMany.mockResolvedValue([]);

      const result = await getMessages("ch-1", new Date().toISOString());

      expect(result.messages).toHaveLength(0);
      expect(result.nextCursor).toBeUndefined();
    });

    test("50件取得できた場合はnextCursorを返す", async () => {
      mockAuth.mockResolvedValue(memberSession);
      const oldDate = new Date("2026-01-01");
      const messages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        channelId: "ch-1",
        userId: "member-1",
        content: `メッセージ${i}`,
        parentId: null,
        createdAt: oldDate,
        user: { id: "member-1", name: "テスト", avatarUrl: null },
        _count: { replies: 0 },
      }));
      mockMessageFindMany.mockResolvedValue(messages);

      const result = await getMessages("ch-1");

      expect(result.messages).toHaveLength(50);
      expect(result.nextCursor).toBeDefined();
    });
  });

  // ---------- getThreadReplies ----------

  describe("getThreadReplies", () => {
    test("parentId に対応するリプライを取得できる", async () => {
      mockAuth.mockResolvedValue(memberSession);
      const replies = [
        {
          id: "msg-reply-1",
          channelId: "ch-1",
          userId: "member-1",
          content: "リプライ1",
          parentId: "msg-parent",
          createdAt: new Date(),
          user: { id: "member-1", name: "テスト", avatarUrl: null },
          _count: { replies: 0 },
        },
        {
          id: "msg-reply-2",
          channelId: "ch-1",
          userId: "member-1",
          content: "リプライ2",
          parentId: "msg-parent",
          createdAt: new Date(),
          user: { id: "member-1", name: "テスト", avatarUrl: null },
          _count: { replies: 0 },
        },
      ];
      mockMessageFindMany.mockResolvedValue(replies);

      const result = await getThreadReplies("msg-parent");

      expect(result).toHaveLength(2);
      expect(mockMessageFindMany).toHaveBeenCalledWith({
        where: { parentId: "msg-parent" },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { replies: true } },
        },
      });
    });

    test("リプライが存在しない場合は空配列を返す", async () => {
      mockAuth.mockResolvedValue(memberSession);
      mockMessageFindMany.mockResolvedValue([]);

      const result = await getThreadReplies("msg-no-replies");

      expect(result).toEqual([]);
    });
  });

  // ---------- deleteChannel ----------

  describe("deleteChannel", () => {
    test("ADMIN はチャンネルを削除できる", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockChannelDelete.mockResolvedValue({});

      await deleteChannel("ch-1");

      expect(mockChannelDelete).toHaveBeenCalledWith({ where: { id: "ch-1" } });
    });

    test("MEMBER は redirect が投げられる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(deleteChannel("ch-1")).rejects.toThrow("NEXT_REDIRECT:");
    });
  });
});
