import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { subDays } from "date-fns";
import { config } from "dotenv";
import { hashPassword } from "../src/lib/password";

config({ path: ".env.local" });
config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool: any = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter: any = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await hashPassword("password123");
  console.log("Test password: password123");

  const trialUser = await prisma.user.upsert({
    where: { email: "trial@example.com" },
    update: { password: hashedPassword },
    create: {
      email: "trial@example.com",
      name: "体験ユーザー",
      password: hashedPassword,
      isActive: true,
      role: UserRole.MEMBER,
      joinedAt: new Date(),
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { password: hashedPassword },
    create: {
      email: "member@example.com",
      name: "通常会員",
      password: hashedPassword,
      isActive: true,
      role: UserRole.MEMBER,
      joinedAt: subDays(new Date(), 30),
      stripeCustomerId: "cus_test_member",
    },
  });

  const inactiveUser = await prisma.user.upsert({
    where: { email: "inactive@example.com" },
    update: { password: hashedPassword },
    create: {
      email: "inactive@example.com",
      name: "停止中ユーザー",
      password: hashedPassword,
      isActive: false,
      role: UserRole.MEMBER,
      joinedAt: subDays(new Date(), 60),
      stripeCustomerId: "cus_test_inactive",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@example.com",
      name: "管理者",
      password: hashedPassword,
      isActive: true,
      role: UserRole.ADMIN,
      joinedAt: subDays(new Date(), 90),
    },
  });

  console.log("Users created:", {
    trial: trialUser.email,
    member: memberUser.email,
    inactive: inactiveUser.email,
    admin: adminUser.email,
  });

  await prisma.dynamicForm.upsert({
    where: { slug: "event-2024" },
    update: {},
    create: {
      slug: "event-2024",
      title: "2024年イベント参加申込",
      description: "Living Me主催のイベントへの参加申込フォームです。",
      fields: [
        { name: "name", label: "お名前", type: "text", required: true, placeholder: "山田太郎" },
        { name: "email", label: "メールアドレス", type: "text", required: true, placeholder: "you@example.com" },
        { name: "menu", label: "希望メニュー", type: "select", required: true, options: ["朝会", "夜会", "ギブ会"] },
        { name: "note", label: "備考", type: "textarea", required: false, placeholder: "ご質問など" },
      ],
      ambassadorOnly: false,
      isPublished: true,
      sortOrder: 1,
    },
  });

  await prisma.dynamicForm.upsert({
    where: { slug: "seminar-beginner" },
    update: {},
    create: {
      slug: "seminar-beginner",
      title: "初心者向けセミナー",
      description: "Living Meをはじめての方向けの入門セミナー申込です。",
      fields: [
        { name: "name", label: "お名前", type: "text", required: true },
        { name: "email", label: "メールアドレス", type: "text", required: true },
        { name: "experience", label: "瞑想経験", type: "select", required: true, options: ["未経験", "1年未満", "1〜3年", "3年以上"] },
      ],
      ambassadorOnly: false,
      isPublished: true,
      sortOrder: 2,
    },
  });

  await prisma.dynamicForm.upsert({
    where: { slug: "ambassador-only" },
    update: {},
    create: {
      slug: "ambassador-only",
      title: "アンバサダー限定フォーム",
      description: "アンバサダー会員のみ閲覧・申込ができるフォームです。",
      fields: [
        { name: "name", label: "お名前", type: "text", required: true },
        { name: "request", label: "リクエスト内容", type: "textarea", required: true },
      ],
      ambassadorOnly: true,
      isPublished: true,
      sortOrder: 3,
    },
  });

  console.log("DynamicForms created: event-2024, seminar-beginner, ambassador-only");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
