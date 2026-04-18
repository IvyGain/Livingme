/**
 * ユーティリティ関数 ユニットテスト
 */
import { describe, test, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    test("単一クラスをそのまま返す", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    test("複数クラスをスペースで結合する", () => {
      expect(cn("p-4", "m-2")).toBe("p-4 m-2");
    });

    test("Tailwind の競合するクラスは後勝ちで解決される", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");
    });

    test("条件付きクラスが正しく適用される", () => {
      expect(cn("base", true && "active")).toBe("base active");
      expect(cn("base", false && "inactive")).toBe("base");
    });

    test("undefined/null を無視する", () => {
      expect(cn("text-sm", undefined, null, "font-bold")).toBe("text-sm font-bold");
    });

    test("オブジェクト形式のクラスを処理できる", () => {
      expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
    });

    test("引数なしで空文字を返す", () => {
      expect(cn()).toBe("");
    });
  });
});
