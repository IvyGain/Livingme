import { PrismaClient, UserRole, ArchiveCategory, EventType } from "@prisma/client";
import { addDays, subDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create test users
  const trialUser = await prisma.user.upsert({
    where: { email: "trial@example.com" },
    update: {},
    create: {
      email: "trial@example.com",
      name: "体験ユーザー",
      isActive: true,
      role: UserRole.MEMBER,
      joinedAt: new Date(),
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      email: "member@example.com",
      name: "通常会員",
      isActive: true,
      role: UserRole.MEMBER,
      joinedAt: subDays(new Date(), 30),
      stripeCustomerId: "cus_test_member",
    },
  });

  const inactiveUser = await prisma.user.upsert({
    where: { email: "inactive@example.com" },
    update: {},
    create: {
      email: "inactive@example.com",
      name: "停止中ユーザー",
      isActive: false,
      role: UserRole.MEMBER,
      joinedAt: subDays(new Date(), 60),
      stripeCustomerId: "cus_test_inactive",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "管理者",
      isActive: true,
      role: UserRole.ADMIN,
      joinedAt: subDays(new Date(), 90),
    },
  });

  console.log("Users created:", { trialUser, memberUser, inactiveUser, adminUser });

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: "マインドフルネス" }, update: {}, create: { name: "マインドフルネス" } }),
    prisma.tag.upsert({ where: { name: "エネルギー" }, update: {}, create: { name: "エネルギー" } }),
    prisma.tag.upsert({ where: { name: "朝ルーティン" }, update: {}, create: { name: "朝ルーティン" } }),
    prisma.tag.upsert({ where: { name: "内観" }, update: {}, create: { name: "内観" } }),
    prisma.tag.upsert({ where: { name: "セルフケア" }, update: {}, create: { name: "セルフケア" } }),
  ]);

  console.log("Tags created");

  // Create archives
  const archives = await Promise.all([
    prisma.archive.create({
      data: {
        title: "朝会 - 今日の意図を設定する",
        description: "一日の始まりに意図を設定し、エネルギーを整える朝会の記録です。",
        date: subDays(new Date(), 1),
        category: ArchiveCategory.MORNING_SESSION,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://picsum.photos/seed/archive1/400/225",
        minutes: "45",
        summary: "今日の朝会では意図設定の重要性について話しました。一日の始まりに自分が何を創り出したいかを明確にすることで、行動がより意識的になります。",
        energyShare: "今日は穏やかで落ち着いたエネルギーを感じています。まるで朝靄の中の森のような静けさです。",
        journalingTheme: "今日、私が大切にしたいことは何ですか？",
        isPublished: true,
        tags: {
          create: [
            { tagId: tags[0].id },
            { tagId: tags[2].id },
          ],
        },
      },
    }),
    prisma.archive.create({
      data: {
        title: "夜会 - 一日を振り返る時間",
        description: "一日の終わりに感謝と学びを振り返る夜会のアーカイブ。",
        date: subDays(new Date(), 3),
        category: ArchiveCategory.EVENING_SESSION,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://picsum.photos/seed/archive2/400/225",
        minutes: "60",
        summary: "今日の夜会では感謝の実践について深掘りしました。感謝は単なる感情ではなく、人生の質を変えるパワフルな実践です。",
        energyShare: "夕暮れ時の柔らかいオレンジ色のような温かいエネルギーです。",
        journalingTheme: "今日、あなたが感謝できることを3つ書いてみましょう。",
        isPublished: true,
        tags: {
          create: [
            { tagId: tags[3].id },
            { tagId: tags[4].id },
          ],
        },
      },
    }),
    prisma.archive.create({
      data: {
        title: "学びの時間 - エネルギーマネジメント入門",
        description: "自分のエネルギーを管理し、最高の状態を維持するための実践的な方法を学びます。",
        date: subDays(new Date(), 7),
        category: ArchiveCategory.LEARNING,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://picsum.photos/seed/archive3/400/225",
        minutes: "90",
        summary: "エネルギーマネジメントの基礎を学び、実践的なワークを行いました。体・心・精神のレベルでのエネルギー管理が重要です。",
        energyShare: "知識を得る喜びと期待感に満ちたエネルギーです。",
        isPublished: true,
        tags: {
          create: [
            { tagId: tags[1].id },
            { tagId: tags[0].id },
          ],
        },
      },
    }),
  ]);

  console.log("Archives created");

  // Create today's content
  const today = startOfDay(new Date());
  await prisma.todayContent.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      energyShare: "今日は穏やかな春の風のようなエネルギーを感じています。新しいことを始めるのに最適な日です。あなたの内側の声に耳を傾けて、今日一日を丁寧に過ごしてみましょう。",
      journalingTheme: "私が今、本当に大切にしたいことは何ですか？",
      morningNote: "今朝の朝会では「自分軸を大切にすること」について話しました。外の声に流されず、自分の内側から生きる喜びを見つけていきましょう。",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log("Today content created");

  // Create upcoming events
  await Promise.all([
    prisma.event.create({
      data: {
        title: "朝会 - 水曜日",
        description: "毎週水曜日の朝会です。今週は「つながりのエネルギー」について話します。",
        eventType: EventType.MORNING_SESSION,
        startsAt: addDays(new Date(new Date().setHours(7, 0, 0, 0)), 1),
        endsAt: addDays(new Date(new Date().setHours(8, 0, 0, 0)), 1),
        meetingUrl: "https://zoom.us/j/example",
        isPublished: true,
      },
    }),
    prisma.event.create({
      data: {
        title: "夜会 - 木曜日",
        description: "週の折り返し、夜の振り返り会です。",
        eventType: EventType.EVENING_SESSION,
        startsAt: addDays(new Date(new Date().setHours(21, 0, 0, 0)), 2),
        endsAt: addDays(new Date(new Date().setHours(22, 0, 0, 0)), 2),
        meetingUrl: "https://zoom.us/j/example",
        isPublished: true,
      },
    }),
    prisma.event.create({
      data: {
        title: "ギブ会 - 月末",
        description: "月末のギブ会。それぞれが持ち寄ったギフトをシェアする時間です。",
        eventType: EventType.GIVE_KAI,
        startsAt: addDays(new Date(new Date().setHours(20, 0, 0, 0)), 7),
        endsAt: addDays(new Date(new Date().setHours(21, 30, 0, 0)), 7),
        meetingUrl: "https://zoom.us/j/example",
        isPublished: true,
      },
    }),
  ]);

  console.log("Events created");

  // Create a column
  await prisma.column.create({
    data: {
      title: "自分らしく生きるということ",
      body: `自分らしく生きるとはどういうことでしょうか。\n\n私はよく「本当にやりたいことがわからない」という声を聞きます。でも、実はほとんどの人が「やりたいこと」は知っている。ただ、それを許可していないだけなんです。\n\n社会の目、親の期待、友人との比較。そういった外の声が、だんだんと自分の本当の声を覆い隠してしまう。\n\nLiving Meは、そんなあなたが自分の本当の声を取り戻す場所です。毎日の朝会や夜会、ジャーナリング、仲間との交流を通じて、少しずつ「本当の自分」に近づいていきましょう。\n\n今日も一日、あなたらしく。`,
      isPublished: true,
      publishedAt: subDays(new Date(), 2),
      authorId: adminUser.id,
    },
  });

  console.log("Column created");

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
