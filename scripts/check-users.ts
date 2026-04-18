import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter } as any);

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  console.log("\n=== ユーザー一覧 ===");
  for (const u of users) {
    const active = u.isActive ? "✅ 有効" : "❌ 無効";
    console.log(`${active} | ${u.role.padEnd(6)} | ${u.email} | ${u.name ?? "（名前未設定）"}`);
  }

  const inactive = users.filter((u) => !u.isActive);
  if (inactive.length > 0) {
    console.log(`\n⚠️  無効ユーザーが ${inactive.length} 名います。`);
    console.log("修正が必要な場合は fix-active コマンドを実行してください。");
  } else {
    console.log("\n✅ 全ユーザーが有効状態です。");
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
