/**
 * フォーム送信 Server Action テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma (for ambassador check)
const mockUserFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
  },
}));

const { submitForm } = await import("@/server/actions/forms");

const memberSession = {
  user: { id: "user-member-1", role: "MEMBER", name: "テストメンバー" },
};

describe("フォーム送信 Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(memberSession);
    mockUserFindUnique.mockResolvedValue(null);
  });

  test("存在しないスラグはエラーを返す", async () => {
    const result = await submitForm("non-existent-slug", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("見つかりません");
  });

  test("未認証ユーザーはエラーを返す", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await submitForm("maya-calendar", {
      motivation: "学びたい",
      experience: "まったく初めて",
      preferredDate: "できるだけ早く",
    });
    expect(result.success).toBe(false);
  });

  test("maya-calendar フォームを送信できる（認証済み会員）", async () => {
    const result = await submitForm("maya-calendar", {
      motivation: "マヤ暦に興味があります",
      experience: "まったく初めて",
      preferredDate: "1ヶ月以内",
    });
    expect(result.success).toBe(true);
  });

  test("personal-session フォームを送信できる（認証済み会員）", async () => {
    const result = await submitForm("personal-session", {
      concern: "自分軸を見つけたい",
      sessionType: "オンライン（Zoom）",
      preferredTime: "平日夜",
    });
    expect(result.success).toBe(true);
  });

  test("アンバサダー限定フォームを非アンバサダーが送信するとエラー", async () => {
    mockUserFindUnique.mockResolvedValue({ ambassadorType: null });
    const result = await submitForm("referral", {
      refereeName: "山田花子",
      refereeContact: "hanako@example.com",
      relationship: "友人",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("アンバサダー");
  });

  test("アンバサダーはアンバサダー限定フォームを送信できる", async () => {
    mockUserFindUnique.mockResolvedValue({ ambassadorType: "FREE" });
    const result = await submitForm("referral", {
      refereeName: "山田花子",
      refereeContact: "hanako@example.com",
      relationship: "友人",
    });
    expect(result.success).toBe(true);
  });

  test("必須フィールドが未入力の場合はエラーを返す", async () => {
    const result = await submitForm("maya-calendar", {
      motivation: "", // required but empty
      experience: "まったく初めて",
      preferredDate: "できるだけ早く",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("受講を希望する理由");
  });

  test("give-kai フォームをアンバサダーが送信できる", async () => {
    mockUserFindUnique.mockResolvedValue({ ambassadorType: "REFERRAL" });
    const result = await submitForm("give-kai", {
      theme: "瞑想入門",
      targetAudience: "初心者向け",
      format: "オンライン（Zoom）",
      preferredDate: "来月",
    });
    expect(result.success).toBe(true);
  });

  test("next-stage フォームを認証済み会員が送信できる", async () => {
    const result = await submitForm("next-stage", {
      currentSituation: "会社員として働いています",
      desiredState: "自分らしく生きたい",
      preferredTime: "土日午前",
    });
    expect(result.success).toBe(true);
  });
});
