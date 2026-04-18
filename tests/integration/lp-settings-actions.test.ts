/**
 * LP設定 Server Actions テスト
 */
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

// Mock Prisma
const mockSettingFindUnique = vi.fn();
const mockSettingUpsert = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    setting: {
      findUnique: mockSettingFindUnique,
      upsert: mockSettingUpsert,
    },
  },
}));

// Mock revalidatePath and redirect
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`); }) }));

const { getLPSettings, saveLPSettings } = await import("@/server/actions/lp-settings");

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const memberSession = { user: { id: "member-1", role: "MEMBER" } };

describe("LP設定 Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(adminSession);
  });

  describe("getLPSettings", () => {
    test("DBに設定がない場合はデフォルト値を返す", async () => {
      mockSettingFindUnique.mockResolvedValue(null);

      const result = await getLPSettings();

      expect(result).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(Array.isArray(result.sections)).toBe(true);
    });

    test("DBに保存されたLP設定を返す", async () => {
      const storedSettings = {
        sections: [{ id: "hero", type: "hero", visible: true, heading: "テスト", bgColor: "", bgImageUrl: "", imageUrl: "" }],
        videos: [],
        concepts: [],
        ctaButtonText: "参加する",
      };
      mockSettingFindUnique.mockResolvedValue({
        key: "lp_settings",
        value: JSON.stringify(storedSettings),
      });

      const result = await getLPSettings();

      expect(result.ctaButtonText).toBe("参加する");
    });

    test("不正なJSONの場合はデフォルト値を返す", async () => {
      mockSettingFindUnique.mockResolvedValue({ key: "lp_settings", value: "invalid-json" });

      const result = await getLPSettings();

      expect(result).toBeDefined();
      expect(result.sections).toBeDefined();
    });
  });

  describe("saveLPSettings", () => {
    test("ADMINはLP設定を保存できる", async () => {
      mockSettingUpsert.mockResolvedValue({});

      const settings = {
        sections: [],
        videos: [],
        concepts: [],
        ctaButtonText: "参加する",
        ctaLoginButtonText: "ログイン",
        activities: [],
        testimonials: [],
      };

      await saveLPSettings(settings as any);

      expect(mockSettingUpsert).toHaveBeenCalledOnce();
    });

    test("ADMINでないと / にリダイレクトされる", async () => {
      mockAuth.mockResolvedValue(memberSession);

      await expect(saveLPSettings({} as any)).rejects.toThrow("NEXT_REDIRECT:/");
    });
  });
});
