import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config(); // .env を読み込む

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
