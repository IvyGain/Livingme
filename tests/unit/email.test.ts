/**
 * メール送信 ユニットテスト
 * nodemailer はモック化する（実際のメール送信はしない）
 */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer
const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

const { sendEmail, buildInviteEmailHtml, buildWelcomeEmailHtml } = await import("@/lib/email");

describe("email", () => {
  describe("sendEmail", () => {
    const originalGmailUser = process.env.GMAIL_USER;
    const originalGmailPass = process.env.GMAIL_APP_PASSWORD;

    beforeEach(() => {
      vi.clearAllMocks();
      process.env.GMAIL_USER = "test@gmail.com";
      process.env.GMAIL_APP_PASSWORD = "test-app-password";
      mockSendMail.mockResolvedValue({ messageId: "test-id" });
    });

    afterEach(() => {
      process.env.GMAIL_USER = originalGmailUser;
      process.env.GMAIL_APP_PASSWORD = originalGmailPass;
    });

    test("正常にメールを送信できる", async () => {
      await sendEmail({
        to: "recipient@example.com",
        subject: "テストメール",
        html: "<p>テスト</p>",
      });

      expect(mockSendMail).toHaveBeenCalledOnce();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "recipient@example.com",
          subject: "テストメール",
          html: "<p>テスト</p>",
        })
      );
    });

    test("GMAIL_USER が未設定の場合はエラーを投げる", async () => {
      delete process.env.GMAIL_USER;

      await expect(
        sendEmail({ to: "test@example.com", subject: "test", html: "<p>test</p>" })
      ).rejects.toThrow("GMAIL_USER");
    });

    test("GMAIL_APP_PASSWORD が未設定の場合はエラーを投げる", async () => {
      delete process.env.GMAIL_APP_PASSWORD;

      await expect(
        sendEmail({ to: "test@example.com", subject: "test", html: "<p>test</p>" })
      ).rejects.toThrow("GMAIL_APP_PASSWORD");
    });

    test("from アドレスに GMAIL_USER が使われる", async () => {
      process.env.GMAIL_USER = "sender@gmail.com";
      delete process.env.EMAIL_FROM;

      await sendEmail({ to: "test@example.com", subject: "test", html: "<p>test</p>" });

      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.from).toContain("sender@gmail.com");
    });
  });

  describe("buildInviteEmailHtml", () => {
    test("招待URLが含まれる", () => {
      const url = "https://example.com/invite/token123";
      const html = buildInviteEmailHtml(url);
      expect(html).toContain(url);
    });

    test("デフォルト有効期限（72時間）が含まれる", () => {
      const html = buildInviteEmailHtml("https://example.com/invite/test");
      expect(html).toContain("72");
    });

    test("カスタム有効期限を設定できる", () => {
      const html = buildInviteEmailHtml("https://example.com/invite/test", 48);
      expect(html).toContain("48");
    });

    test("有効なHTML文書を返す", () => {
      const html = buildInviteEmailHtml("https://example.com/invite/test");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });

    test("Living Me のブランド名が含まれる", () => {
      const html = buildInviteEmailHtml("https://example.com/invite/test");
      expect(html).toContain("Living Me");
    });

    test("パスワード設定ボタンが含まれる", () => {
      const html = buildInviteEmailHtml("https://example.com/invite/test");
      expect(html).toContain("パスワードを設定する");
    });
  });

  describe("buildWelcomeEmailHtml", () => {
    test("ログインURLが含まれる", () => {
      const url = "https://example.com/login";
      const html = buildWelcomeEmailHtml("田中", url);
      expect(html).toContain(url);
    });

    test("名前が含まれる", () => {
      const html = buildWelcomeEmailHtml("田中太郎", "https://example.com/login");
      expect(html).toContain("田中太郎");
    });

    test("名前が空の場合は「会員」を使う", () => {
      const html = buildWelcomeEmailHtml("", "https://example.com/login");
      expect(html).toContain("会員");
    });

    test("Living Me のブランド名が含まれる", () => {
      const html = buildWelcomeEmailHtml("田中", "https://example.com/login");
      expect(html).toContain("Living Me");
    });

    test("カスタム挨拶文を設定できる", () => {
      const html = buildWelcomeEmailHtml("田中", "https://example.com/login", "ようこそ！");
      expect(html).toContain("ようこそ！");
    });

    test("有効なHTML文書を返す", () => {
      const html = buildWelcomeEmailHtml("田中", "https://example.com/login");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });
  });
});
