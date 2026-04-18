/**
 * パスワードハッシュ ユニットテスト
 */
import { describe, test, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password", () => {
  describe("hashPassword", () => {
    test("salt:hash 形式で返す", async () => {
      const hashed = await hashPassword("mypassword");
      expect(hashed).toContain(":");
      const parts = hashed.split(":");
      expect(parts.length).toBe(2);
    });

    test("salt が 32文字のhex（16バイト）", async () => {
      const hashed = await hashPassword("mypassword");
      const [salt] = hashed.split(":");
      expect(salt.length).toBe(32);
    });

    test("hash が 128文字のhex（64バイト）", async () => {
      const hashed = await hashPassword("mypassword");
      const [, hash] = hashed.split(":");
      expect(hash.length).toBe(128);
    });

    test("同じパスワードでも毎回異なるハッシュを生成する（salt ランダム）", async () => {
      const h1 = await hashPassword("mypassword");
      const h2 = await hashPassword("mypassword");
      expect(h1).not.toBe(h2);
    });
  });

  describe("verifyPassword", () => {
    test("正しいパスワードで true を返す", async () => {
      const hashed = await hashPassword("correct-password");
      const result = await verifyPassword("correct-password", hashed);
      expect(result).toBe(true);
    });

    test("誤ったパスワードで false を返す", async () => {
      const hashed = await hashPassword("correct-password");
      const result = await verifyPassword("wrong-password", hashed);
      expect(result).toBe(false);
    });

    test("空のパスワードで false を返す", async () => {
      const hashed = await hashPassword("correct-password");
      const result = await verifyPassword("", hashed);
      expect(result).toBe(false);
    });

    test("不正な形式のハッシュで false を返す（クラッシュしない）", async () => {
      const result = await verifyPassword("password", "not-valid-hash");
      expect(result).toBe(false);
    });

    test("salt のみで hash がない場合 false を返す", async () => {
      const result = await verifyPassword("password", "onlysalt");
      expect(result).toBe(false);
    });

    test("日本語パスワードでも動作する", async () => {
      const hashed = await hashPassword("パスワード123");
      const result = await verifyPassword("パスワード123", hashed);
      expect(result).toBe(true);
    });
  });
});
