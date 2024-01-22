import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("カテゴリのインサート");
  await Promise.all(
    [
      { name: "仕事", color: "gray", slug: "work" },
      { name: "学業", color: "red", slug: "school" },
      { name: "家事", color: "orange", slug: "housework" },
      { name: "健康", color: "yellow", slug: "health" },
      { name: "趣味", color: "green", slug: "hobby" },
      { name: "スポーツ", color: "teal", slug: "sports" },
      { name: "イベント", color: "blue", slug: "event" },
      { name: "買い物", color: "cyan", slug: "shopping" },
      { name: "旅行", color: "purple", slug: "trip" },
      { name: "社会活動", color: "pink", slug: "socialActivities" },
    ].map(async (category) => {
      await prisma.category.create({
        data: {
          name: category.name,
          isValid: true,
          color: category.color,
          slug: category.slug,
          todoLists: {
            create: [],
          },
        },
      });
    })
  );

  console.log("todoリストのインサート");
  await Promise.all(
    [...Array(10)].map(async (_, i) => {
      await prisma.todo.create({
        data: {
          title: `サンプル${i + 1}`,
          description: `これはサンプル${i + 1}のタスクです`,
          completionDate: new Date(),
          status: "todo",
          categories: {
            connect: [{ id: i + 1 }],
            // create: [],
          },
        },
      });
    })
  );

  console.log("inProgressリストのインサート");
  await Promise.all(
    [...Array(10)].map(async (_, i) => {
      await prisma.todo.create({
        data: {
          title: `サンプル${i + 1}`,
          description: `これはサンプル${i + 1}のタスクです`,
          completionDate: new Date(),
          status: "inProgress",
          categories: {
            connect: [{ id: i + 1 }],
            // create: [],
          },
        },
      });
    })
  );

  console.log("doneリストのインサート");
  await Promise.all(
    [...Array(10)].map(async (_, i) => {
      await prisma.todo.create({
        data: {
          title: `サンプル${i + 1}`,
          description: `これはサンプル${i + 1}のタスクです`,
          completionDate: new Date(),
          status: "done",
          categories: {
            connect: [{ id: i + 1 }],
            // create: [],
          },
        },
      });
    })
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
