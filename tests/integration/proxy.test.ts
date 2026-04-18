/**
 * I-002: Auth Middleware (proxy.ts) テスト
 * 現在の実装: isActive boolean で制御（MemberStatus enum は廃止済み）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

// Mock next-auth/jwt
const mockGetToken = vi.fn<() => Promise<JWT | null>>();
vi.mock("next-auth/jwt", () => ({
  getToken: () => mockGetToken(),
}));

// Import after mock
const { proxy } = await import("@/proxy");

function makeRequest(pathname: string) {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe("I-002: Auth Middleware", () => {
  beforeEach(() => {
    mockGetToken.mockReset();
  });

  describe("未認証ユーザー", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue(null);
    });

    test("/ は通過する（公開LP）", async () => {
      const res = await proxy(makeRequest("/"));
      expect(res.status).not.toBe(307);
    });

    test("/home → /login にリダイレクト", async () => {
      const res = await proxy(makeRequest("/home"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    test("/archive → /login にリダイレクト", async () => {
      const res = await proxy(makeRequest("/archive"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    test("/journal → /login にリダイレクト", async () => {
      const res = await proxy(makeRequest("/journal"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    test("/login はリダイレクトしない", async () => {
      const res = await proxy(makeRequest("/login"));
      expect(res.status).not.toBe(307);
    });

    test("/demo は通過する（公開パス）", async () => {
      const res = await proxy(makeRequest("/demo"));
      expect(res.status).not.toBe(307);
    });

    test("/api/webhooks は通過する（公開パス）", async () => {
      const res = await proxy(makeRequest("/api/webhooks/stripe"));
      expect(res.status).not.toBe(307);
    });

    test("callbackUrl が付与される", async () => {
      const res = await proxy(makeRequest("/journal"));
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("callbackUrl");
    });
  });

  describe("アクティブメンバー (isActive: true)", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue({ isActive: true, role: "MEMBER", sub: "user-1" } as JWT);
    });

    test("/ → /home にリダイレクト（認証済みのためLP不要）", async () => {
      const res = await proxy(makeRequest("/"));
      expect(res.headers.get("location")).toContain("/home");
    });

    test("/home にアクセス可能", async () => {
      const res = await proxy(makeRequest("/home"));
      expect(res.status).not.toBe(307);
    });

    test("/archive にアクセス可能", async () => {
      const res = await proxy(makeRequest("/archive/some-id"));
      expect(res.status).not.toBe(307);
    });

    test("/journal にアクセス可能", async () => {
      const res = await proxy(makeRequest("/journal/new"));
      expect(res.status).not.toBe(307);
    });

    test("/forms にアクセス可能", async () => {
      const res = await proxy(makeRequest("/forms"));
      expect(res.headers.get("location")).toBeNull();
    });

    test("/admin → / にリダイレクト（非ADMIN）", async () => {
      const res = await proxy(makeRequest("/admin"));
      expect(res.headers.get("location")).toContain("/");
      expect(res.headers.get("location")).not.toContain("/admin");
    });

    test("/login → /home にリダイレクト（認証済みのため）", async () => {
      const res = await proxy(makeRequest("/login"));
      expect(res.headers.get("location")).toContain("/home");
    });
  });

  describe("非アクティブメンバー (isActive: false)", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue({ isActive: false, role: "MEMBER", sub: "user-inactive" } as JWT);
    });

    test("/ → /login?error=suspended にリダイレクト", async () => {
      const res = await proxy(makeRequest("/"));
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("/login");
      expect(location).toContain("suspended");
    });

    test("/journal → /login?error=suspended にリダイレクト", async () => {
      const res = await proxy(makeRequest("/journal"));
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("suspended");
    });

    test("/login → /login?error=suspended にリダイレクト（停止中）", async () => {
      const res = await proxy(makeRequest("/login"));
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("suspended");
    });
  });

  describe("ADMINユーザー (isActive: true, role: ADMIN)", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue({ isActive: true, role: "ADMIN", sub: "admin-1" } as JWT);
    });

    test("/admin にアクセス可能", async () => {
      const res = await proxy(makeRequest("/admin"));
      expect(res.status).not.toBe(307);
    });

    test("/admin/members にアクセス可能", async () => {
      const res = await proxy(makeRequest("/admin/members"));
      expect(res.status).not.toBe(307);
    });

    test("/ → /home にリダイレクト（認証済み）", async () => {
      const res = await proxy(makeRequest("/"));
      expect(res.headers.get("location")).toContain("/home");
    });
  });

  describe("FREE_MEMBERユーザー (isActive: true, role: FREE_MEMBER)", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue({ isActive: true, role: "FREE_MEMBER", sub: "user-free" } as JWT);
    });

    test("/home にアクセス可能", async () => {
      const res = await proxy(makeRequest("/home"));
      expect(res.status).not.toBe(307);
    });

    test("/journal にアクセス可能", async () => {
      const res = await proxy(makeRequest("/journal"));
      expect(res.status).not.toBe(307);
    });

    test("/admin → / にリダイレクト（非ADMIN）", async () => {
      const res = await proxy(makeRequest("/admin"));
      expect(res.headers.get("location")).toContain("/");
      expect(res.headers.get("location")).not.toContain("/admin");
    });
  });

  describe("MEMBER ユーザー (isActive: true, role: MEMBER)", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue({ isActive: true, role: "MEMBER", sub: "user-member" } as JWT);
    });

    test("/home にアクセス可能", async () => {
      const res = await proxy(makeRequest("/home"));
      expect(res.status).not.toBe(307);
    });

    test("/journal にアクセス可能", async () => {
      const res = await proxy(makeRequest("/journal/new"));
      expect(res.status).not.toBe(307);
    });
  });

  describe("isActive が undefined のトークン（旧形式互換）", () => {
    beforeEach(() => {
      // isActive フィールドなし → true 扱い
      mockGetToken.mockResolvedValue({ role: "MEMBER", sub: "user-old" } as JWT);
    });

    test("/home にアクセス可能（isActive: undefined は true 扱い）", async () => {
      const res = await proxy(makeRequest("/home"));
      expect(res.status).not.toBe(307);
    });
  });
});
