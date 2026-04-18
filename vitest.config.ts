import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/integration/setup.ts"],
    include: ["tests/integration/**/*.test.ts", "tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/proxy.ts",
        "src/lib/**/*.ts",
        "src/server/**/*.ts",
      ],
      exclude: [
        // フレームワーク設定・インフラ（ユニットテスト不可）
        "src/lib/auth.ts",
        "src/lib/auth-edge.ts",
        "src/lib/prisma.ts",
        // 外部APIクライアント（常にモック化されるため除外）
        "src/lib/lark.ts",
        // 型定義
        "src/**/*.d.ts",
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
      },
    },
    reporters: ["verbose"],
    outputFile: {
      json: ".test-logs/latest/tests/integration-results.json",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
