/**
 * 権限判定 ユニットテスト
 */
import { describe, test, expect } from "vitest";
import { isAdmin } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

describe("permissions", () => {
  describe("isAdmin", () => {
    test("ADMIN ロールは true を返す", () => {
      expect(isAdmin(UserRole.ADMIN)).toBe(true);
    });

    test("MEMBER ロールは false を返す", () => {
      expect(isAdmin(UserRole.MEMBER)).toBe(false);
    });
  });
});
