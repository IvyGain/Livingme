/**
 * 最初の管理者ユーザーを作成するスクリプト
 *
 * 使い方:
 *   ADMIN_EMAIL=you@example.com \
 *   ADMIN_PASSWORD=your-password \
 *   ADMIN_NAME="あなたの名前" \
 *   npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "管理者";

  if (!email || !password) {
    console.error("❌ 環境変数を設定してください:");
    console.error("   ADMIN_EMAIL=you@example.com");
    console.error("   ADMIN_PASSWORD=your-password");
    console.error("   ADMIN_NAME=あなたの名前（省略可）");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ パスワードは8文字以上にしてください");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        password: hashedPassword,
        role: "ADMIN",
        status: "MEMBER",
        name,
      },
      create: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name,
        role: "ADMIN",
        status: "MEMBER",
        joinedAt: new Date(),
      },
    });

    console.log("✅ 管理者ユーザーを作成しました");
    console.log(`   ID    : ${user.id}`);
    console.log(`   Email : ${user.email}`);
    console.log(`   Name  : ${user.name}`);
    console.log(`   Role  : ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log("");
    console.log(`👉 ${process.env.NEXT_PUBLIC_APP_URL ?? "https://livingme.vercel.app"}/login からログインしてください`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ エラー:", e.message);
  process.exit(1);
});
