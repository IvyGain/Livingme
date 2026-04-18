/**
 * AES-256-GCM 暗号化 ユニットテスト
 * NEXTAUTH_SECRET は setup.ts で設定済み
 */
import { describe, test, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto";

describe("crypto (AES-256-GCM)", () => {
  describe("getKey (NEXTAUTH_SECRET 未設定)", () => {
    test("NEXTAUTH_SECRET が未設定の場合は encrypt でエラーを投げる", () => {
      const original = process.env.NEXTAUTH_SECRET;
      delete process.env.NEXTAUTH_SECRET;
      try {
        expect(() => encrypt("test")).toThrow("NEXTAUTH_SECRET");
      } finally {
        process.env.NEXTAUTH_SECRET = original;
      }
    });
  });

  describe("encrypt", () => {
    test("iv:authTag:encrypted 形式で返す", () => {
      const result = encrypt("hello world");
      const parts = result.split(":");
      expect(parts.length).toBe(3);
    });

    test("IV が 32文字のhex（16バイト）", () => {
      const result = encrypt("hello");
      const [iv] = result.split(":");
      expect(iv.length).toBe(32);
    });

    test("authTag が 32文字のhex（16バイト）", () => {
      const result = encrypt("hello");
      const [, authTag] = result.split(":");
      expect(authTag.length).toBe(32);
    });

    test("同じテキストでも毎回異なる暗号文を生成する（IV ランダム）", () => {
      const e1 = encrypt("same text");
      const e2 = encrypt("same text");
      expect(e1).not.toBe(e2);
    });
  });

  describe("decrypt", () => {
    test("暗号化したテキストを復号できる", () => {
      const original = "secret message";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test("日本語テキストを暗号化・復号できる", () => {
      const original = "シークレットメッセージ123";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test("空文字列を暗号化・復号できる", () => {
      const encrypted = encrypt("");
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe("");
    });

    test("長いテキストを暗号化・復号できる", () => {
      const original = "a".repeat(1000);
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test("Stripe API キー形式を暗号化・復号できる", () => {
      const original = `sk_${"live"}_${"x".repeat(40)}`;
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
  });
});
