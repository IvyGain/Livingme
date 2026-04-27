import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// 本番では DATABASE_URL は既にホスティング側から注入されているため、
// .env / .env.local を読み込むのはローカル開発時のみに限定する。
if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
  config();
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
