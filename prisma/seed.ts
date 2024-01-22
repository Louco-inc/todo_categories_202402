import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("カテゴリのインサート");
  await Promise.all(
    [
      { name: "仕事" },
      { name: "学業" },
      { name: "家事" },
      { name: "健康" },
      { name: "趣味" },
      { name: "スポーツ" },
      { name: "イベント" },
      { name: "買い物" },
      { name: "旅行" },
      { name: "社会活動" },
    ].map(async (category) => {
      await prisma.category.create({
        data: {
          name: category.name,
          isValid: true,
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
