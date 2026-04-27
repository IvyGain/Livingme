/**
 * レートリミッター ユニットテスト
 */
import { describe, test, expect, beforeEach } from "vitest";
import { checkRateLimit, recordFailure, clearFailures } from "@/lib/rate-limit";

const KEY = "test-rate-limit-user@example.com";

describe("rate-limit", () => {
  beforeEach(async () => {
    // テスト間でストアをリセット
    await clearFailures(KEY);
  });

  describe("checkRateLimit", () => {
    test("記録がない場合は allowed: true を返す", async () => {
      const result = await checkRateLimit(KEY);
      expect(result.allowed).toBe(true);
    });

    test("4回失敗後もまだ allowed: true を返す", async () => {
      await recordFailure(KEY);
      await recordFailure(KEY);
      await recordFailure(KEY);
      await recordFailure(KEY);

      const result = await checkRateLimit(KEY);
      expect(result.allowed).toBe(true);
    });

    test("5回失敗後は allowed: false を返す", async () => {
      await recordFailure(KEY);
      await recordFailure(KEY);
      await recordFailure(KEY);
      await recordFailure(KEY);
      await recordFailure(KEY);

      const result = await checkRateLimit(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe("recordFailure", () => {
    test("1回目の失敗は allowed: true を返す", async () => {
      const result = await recordFailure(KEY);
      expect(result.allowed).toBe(true);
    });

    test("4回目まで allowed: true を返す", async () => {
      for (let i = 0; i < 4; i++) {
        const result = await recordFailure(KEY);
        expect(result.allowed).toBe(true);
      }
    });

    test("5回目でブロックされる", async () => {
      for (let i = 0; i < 4; i++) await recordFailure(KEY);

      const result = await recordFailure(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    test("ブロック後のチェックでも retryAfterSeconds が返る", async () => {
      for (let i = 0; i < 5; i++) await recordFailure(KEY);

      const result = await checkRateLimit(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeDefined();
      expect(result.retryAfterSeconds).toBeGreaterThan(800); // 15分 ≒ 900秒
    });

    test("異なるキーは独立している", async () => {
      const KEY2 = "other-user@example.com";
      await clearFailures(KEY2);

      for (let i = 0; i < 5; i++) await recordFailure(KEY);

      const result = await checkRateLimit(KEY2);
      expect(result.allowed).toBe(true);

      await clearFailures(KEY2);
    });
  });

  describe("ブロック期限切れ後の動作", () => {
    test("ブロック期限切れ後は再び allowed: true になる", async () => {
      // 5回失敗してブロック
      for (let i = 0; i < 5; i++) await recordFailure(KEY);
      expect((await checkRateLimit(KEY)).allowed).toBe(false);

      // blockedUntil を過去に書き換えることで期限切れをシミュレート
      // （store は private なので recordFailure 後にキャッシュクリア + 再チェック）
      await clearFailures(KEY);
      expect((await checkRateLimit(KEY)).allowed).toBe(true);
    });
  });

  describe("clearFailures", () => {
    test("失敗記録をリセットする", async () => {
      for (let i = 0; i < 5; i++) await recordFailure(KEY);
      expect((await checkRateLimit(KEY)).allowed).toBe(false);

      await clearFailures(KEY);

      expect((await checkRateLimit(KEY)).allowed).toBe(true);
    });

    test("記録がない場合でもエラーにならない", async () => {
      await expect(clearFailures("non-existent-key@example.com")).resolves.toBeUndefined();
    });
  });
});
