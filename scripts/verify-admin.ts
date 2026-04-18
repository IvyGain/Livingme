import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) { console.log("Hash format invalid"); return false; }
    const hashBuffer = Buffer.from(hash, "hex");
    const derivedHash = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuffer, derivedHash);
  } catch (e) {
    console.log("Verify error:", e);
    return false;
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const user = await prisma.user.findUnique({ where: { email: "a-fujimoto@lanalife.co.jp" } });
  if (!user) {
    console.log("❌ ユーザーが見つかりません");
  } else {
    console.log("✅ ユーザー発見");
    console.log("   ID     :", user.id);
    console.log("   Email  :", user.email);
    console.log("   Role   :", user.role);
    console.log("   Status :", user.status);
    console.log("   Password stored:", !!user.password);

    if (user.password) {
      const ok = await verifyPassword("password", user.password);
      console.log("   パスワード検証:", ok ? "✅ 一致" : "❌ 不一致");
    } else {
      console.log("❌ パスワードが DB に保存されていません");
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
