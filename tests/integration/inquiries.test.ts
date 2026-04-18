/**
 * 問い合わせ Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockContactInquiryCreate = vi.fn();
const mockContactInquiryFindMany = vi.fn();
const mockContactInquiryFindUnique = vi.fn();
const mockContactInquiryUpdate = vi.fn();
const mockInquiryReplyCreate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactInquiry: {
      create: mockContactInquiryCreate,
      findMany: mockContactInquiryFindMany,
      findUnique: mockContactInquiryFindUnique,
      update: mockContactInquiryUpdate,
    },
    inquiryReply: {
      create: mockInquiryReplyCreate,
    },
    $transaction: mockTransaction,
  },
}));

// Mock email
const mockSendEmail = vi.fn();
vi.mock("@/lib/email", () => ({ sendEmail: mockSendEmail }));

// Mock revalidatePath
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { submitInquiry, getInquiries, replyToInquiry, updateInquiryStatus } =
  await import("@/server/actions/inquiries");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

describe("問い合わせ Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
    mockSendEmail.mockResolvedValue(undefined);
    mockTransaction.mockImplementation(async (ops: unknown[]) => {
      for (const op of ops) await op;
    });
  });

  describe("submitInquiry", () => {
    const validInput = {
      name: "田中太郎",
      email: "tanaka@example.com",
      subject: "テスト件名",
      body: "お問い合わせ内容です",
    };

    test("有効なフォームデータで問い合わせを送信できる", async () => {
      mockContactInquiryCreate.mockResolvedValue({ id: "inq-1" });

      const result = await submitInquiry(validInput);

      expect(result.success).toBe(true);
      expect(mockContactInquiryCreate).toHaveBeenCalledOnce();
    });

    test("名前が空の場合はバリデーションエラー", async () => {
      const result = await submitInquiry({ ...validInput, name: "  " });

      expect(result.success).toBe(false);
      expect(result.error).toContain("必須");
      expect(mockContactInquiryCreate).not.toHaveBeenCalled();
    });

    test("メールが空の場合はバリデーションエラー", async () => {
      const result = await submitInquiry({ ...validInput, email: "" });

      expect(result.success).toBe(false);
      expect(mockContactInquiryCreate).not.toHaveBeenCalled();
    });

    test("本文が空の場合はバリデーションエラー", async () => {
      const result = await submitInquiry({ ...validInput, body: "" });

      expect(result.success).toBe(false);
      expect(mockContactInquiryCreate).not.toHaveBeenCalled();
    });

    test("件名が空でも送信できる（デフォルト件名を使用）", async () => {
      mockContactInquiryCreate.mockResolvedValue({ id: "inq-1" });

      const result = await submitInquiry({ ...validInput, subject: "" });

      expect(result.success).toBe(true);
    });

    test("GMAIL_USER設定時は管理者通知メールを送信する", async () => {
      process.env.GMAIL_USER = "admin@example.com";
      mockContactInquiryCreate.mockResolvedValue({ id: "inq-1" });

      await submitInquiry(validInput);

      expect(mockSendEmail).toHaveBeenCalledOnce();
      delete process.env.GMAIL_USER;
    });

    test("DBエラーはエラーオブジェクトで返す", async () => {
      mockContactInquiryCreate.mockRejectedValue(new Error("DB error"));

      const result = await submitInquiry(validInput);

      expect(result.success).toBe(false);
    });
  });

  describe("getInquiries", () => {
    test("ADMINは問い合わせ一覧を取得できる", async () => {
      const mockList = [{ id: "inq-1", name: "田中", status: "OPEN", replies: [] }];
      mockContactInquiryFindMany.mockResolvedValue(mockList);

      const result = await getInquiries();

      expect(result).toEqual(mockList);
      expect(mockContactInquiryFindMany).toHaveBeenCalledOnce();
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(getInquiries()).rejects.toThrow("Unauthorized");
    });
  });

  describe("replyToInquiry", () => {
    const mockInquiry = {
      id: "inq-1",
      name: "田中太郎",
      email: "tanaka@example.com",
      subject: "テスト",
      body: "内容",
    };

    test("ADMINは返信を送信できる", async () => {
      mockContactInquiryFindUnique.mockResolvedValue(mockInquiry);
      mockTransaction.mockResolvedValue([]);

      const result = await replyToInquiry("inq-1", "ご連絡ありがとうございます");

      expect(result.success).toBe(true);
    });

    test("存在しない問い合わせはエラーを返す", async () => {
      mockContactInquiryFindUnique.mockResolvedValue(null);

      const result = await replyToInquiry("non-existent", "返信");

      expect(result.success).toBe(false);
      expect(result.error).toContain("見つかりません");
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      const result = await replyToInquiry("inq-1", "返信");

      expect(result.success).toBe(false);
    });

    test("メール送信失敗でも返信は保存される", async () => {
      mockContactInquiryFindUnique.mockResolvedValue(mockInquiry);
      mockSendEmail.mockRejectedValue(new Error("SMTP error"));
      mockTransaction.mockResolvedValue([]);

      const result = await replyToInquiry("inq-1", "返信内容");

      expect(result.success).toBe(true);
    });
  });

  describe("updateInquiryStatus", () => {
    test("ADMINはステータスをCLOSEDに変更できる", async () => {
      mockContactInquiryUpdate.mockResolvedValue({});

      const result = await updateInquiryStatus("inq-1", "CLOSED");

      expect(result.success).toBe(true);
      expect(mockContactInquiryUpdate).toHaveBeenCalledWith({
        where: { id: "inq-1" },
        data: { status: "CLOSED" },
      });
    });

    test("ADMINはステータスをOPENに変更できる", async () => {
      mockContactInquiryUpdate.mockResolvedValue({});

      const result = await updateInquiryStatus("inq-1", "OPEN");

      expect(result.success).toBe(true);
    });

    test("ADMINでないとエラーを投げる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(updateInquiryStatus("inq-1", "CLOSED")).rejects.toThrow("Unauthorized");
    });
  });
});
