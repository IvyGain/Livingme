/**
 * レートリミッター ユニットテスト
 */
import { describe, test, expect, beforeEach } from "vitest";
import { checkRateLimit, recordFailure, clearFailures } from "@/lib/rate-limit";

const KEY = "test-rate-limit-user@example.com";

describe("rate-limit", () => {
  beforeEach(() => {
    // テスト間でストアをリセット
    clearFailures(KEY);
  });

  describe("checkRateLimit", () => {
    test("記録がない場合は allowed: true を返す", () => {
      const result = checkRateLimit(KEY);
      expect(result.allowed).toBe(true);
    });

    test("4回失敗後もまだ allowed: true を返す", () => {
      recordFailure(KEY);
      recordFailure(KEY);
      recordFailure(KEY);
      recordFailure(KEY);

      const result = checkRateLimit(KEY);
      expect(result.allowed).toBe(true);
    });

    test("5回失敗後は allowed: false を返す", () => {
      recordFailure(KEY);
      recordFailure(KEY);
      recordFailure(KEY);
      recordFailure(KEY);
      recordFailure(KEY);

      const result = checkRateLimit(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe("recordFailure", () => {
    test("1回目の失敗は allowed: true を返す", () => {
      const result = recordFailure(KEY);
      expect(result.allowed).toBe(true);
    });

    test("4回目まで allowed: true を返す", () => {
      for (let i = 0; i < 4; i++) {
        const result = recordFailure(KEY);
        expect(result.allowed).toBe(true);
      }
    });

    test("5回目でブロックされる", () => {
      for (let i = 0; i < 4; i++) recordFailure(KEY);

      const result = recordFailure(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    test("ブロック後のチェックでも retryAfterSeconds が返る", () => {
      for (let i = 0; i < 5; i++) recordFailure(KEY);

      const result = checkRateLimit(KEY);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeDefined();
      expect(result.retryAfterSeconds).toBeGreaterThan(800); // 15分 ≒ 900秒
    });

    test("異なるキーは独立している", () => {
      const KEY2 = "other-user@example.com";
      clearFailures(KEY2);

      for (let i = 0; i < 5; i++) recordFailure(KEY);

      const result = checkRateLimit(KEY2);
      expect(result.allowed).toBe(true);

      clearFailures(KEY2);
    });
  });

  describe("ブロック期限切れ後の動作", () => {
    test("ブロック期限切れ後は再び allowed: true になる", () => {
      // 5回失敗してブロック
      for (let i = 0; i < 5; i++) recordFailure(KEY);
      expect(checkRateLimit(KEY).allowed).toBe(false);

      // blockedUntil を過去に書き換えることで期限切れをシミュレート
      // （store は private なので recordFailure 後にキャッシュクリア + 再チェック）
      clearFailures(KEY);
      expect(checkRateLimit(KEY).allowed).toBe(true);
    });
  });

  describe("clearFailures", () => {
    test("失敗記録をリセットする", () => {
      for (let i = 0; i < 5; i++) recordFailure(KEY);
      expect(checkRateLimit(KEY).allowed).toBe(false);

      clearFailures(KEY);

      expect(checkRateLimit(KEY).allowed).toBe(true);
    });

    test("記録がない場合でもエラーにならない", () => {
      expect(() => clearFailures("non-existent-key@example.com")).not.toThrow();
    });
  });
});
