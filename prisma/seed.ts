import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("カテゴリのインサート");
  await Promise.all(
    [
      { name: "Biz", color: "gray", slug: "business" },
      { name: "調査", color: "red", slug: "research" },
      { name: "企画", color: "orange", slug: "planning" },
      { name: "マーケ", color: "yellow", slug: "marketing" },
      { name: "デザイン", color: "green", slug: "design" },
      { name: "設計", color: "teal", slug: "architecture" },
      { name: "実装", color: "blue", slug: "implementation" },
      { name: "テスト", color: "cyan", slug: "testing" },
      { name: "デプロイ", color: "purple", slug: "deployment" },
      { name: "保守・運用", color: "pink", slug: "maintenance-operations" },
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
    [
      {
        category: 1,
        title: "財務分析",
        description: "企業の財務データを分析する",
      },
      {
        category: 2,
        title: "市場調査",
        description: "商品の検証のための市場調査を実施する",
      },
      {
        category: 3,
        title: "プロジェクト計画",
        description: "プロジェクト実行のための詳細な計画を作成する",
      },
      {
        category: 4,
        title: "マーケティングキャンペーン",
        description: "マーケティングキャンペーンを計画し実行する",
      },
      {
        category: 5,
        title: "UI/UXデザイン",
        description: "ユーザーインターフェースとユーザーエクスペリエンスの設計",
      },
      {
        category: 6,
        title: "システムアーキテクチャ",
        description: "プロジェクトのためのシステムアーキテクチャを定義する",
      },
      {
        category: 7,
        title: "コーディング",
        description: "機能の実装のためのコードを記述する",
      },
      {
        category: 8,
        title: "ユニットテスト",
        description: "コード品質のためのユニットテストを実施する",
      },
      {
        category: 9,
        title: "デプロイ自動化",
        description: "デプロイプロセスを自動化する",
      },
      {
        category: 10,
        title: "システム保守",
        description: "継続的な保守とサポートを提供する",
      },
    ].map(async (task, i) => {
      await prisma.todo.create({
        data: {
          title: task.title,
          description: task.description,
          completionDate: new Date(),
          status: "todo",
          categories: {
            connect: [{ id: task.category }],
          },
        },
      });
    })
  );

  console.log("inprogressリストのインサート");
  await Promise.all(
    [
      {
        category: 1,
        title: "会議準備",
        description: "次回の会議のための資料準備を行う",
      },
      {
        category: 2,
        title: "調査レポート",
        description: "市場の最新動向に関するレポートを作成する",
      },
      {
        category: 3,
        title: "新規プロジェクト",
        description: "新規プロジェクトのアイデアを検討し企画を立てる",
      },
      {
        category: 4,
        title: "デジタルキャンペーン",
        description: "デジタル広告キャンペーンを計画し実施する",
      },
      {
        category: 5,
        title: "ユーザビリティテスト",
        description: "ウェブサイトのユーザビリティをテストする",
      },
      {
        category: 6,
        title: "アーキテクチャ設計",
        description: "新しいシステムのアーキテクチャを設計する",
      },
      { category: 7, title: "機能開発", description: "新しい機能の開発を行う" },
      {
        category: 8,
        title: "QAテスト",
        description: "品質保証のためにシステムをテストする",
      },
      {
        category: 9,
        title: "本番環境デプロイ",
        description: "本番環境へのシステムデプロイを実施する",
      },
      {
        category: 10,
        title: "サポート対応",
        description: "ユーザーサポートに対応し、トラブルシューティングを行う",
      },
    ].map(async (task) => {
      await prisma.todo.create({
        data: {
          title: task.title,
          description: task.description,
          completionDate: new Date(),
          status: "inprogress",
          categories: {
            connect: [{ id: task.category }],
          },
        },
      });
    })
  );

  console.log("doneリストのインサート");
  await Promise.all(
    [
      {
        category: 1,
        title: "プロジェクト計画",
        description: "次のプロジェクトの計画を策定する",
      },
      {
        category: 2,
        title: "ユーザー調査",
        description: "製品のターゲットユーザーに関する調査を行う",
      },
      {
        category: 3,
        title: "アイデアブレスト",
        description: "新しいプロジェクトのアイデアをブレストする",
      },
      {
        category: 4,
        title: "デジタル広告",
        description: "デジタル広告キャンペーンを実施する",
      },
      {
        category: 5,
        title: "UI/UXデザイン",
        description:
          "ユーザーインターフェースとユーザーエクスペリエンスのデザイン",
      },
      {
        category: 6,
        title: "システム設計",
        description: "新しいシステムの設計を行う",
      },
      {
        category: 7,
        title: "機能開発",
        description: "新しい機能の開発を進める",
      },
      {
        category: 8,
        title: "品質テスト",
        description: "システムの品質を確認するためにテストを行う",
      },
      {
        category: 9,
        title: "本番環境デプロイ",
        description: "本番環境へのシステムデプロイを実施する",
      },
      {
        category: 10,
        title: "トラブルシューティング",
        description: "ユーザーサポートに対応し、トラブルシューティングを行う",
      },
    ].map(async (task, i) => {
      await prisma.todo.create({
        data: {
          title: task.title,
          description: task.description,
          completionDate: new Date(),
          status: "done",
          categories: {
            connect: [{ id: task.category }],
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
