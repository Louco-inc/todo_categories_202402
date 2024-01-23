import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/prisma";
import { TodoStatusType } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    const status = req.query.status;
    const todoLists = await db.todo.findMany({
      include: {
        categories: true,
      },
      where: {
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(todoLists);
  } else if (req.method === "POST") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const params = JSON.parse(req.body);
    const { title, description, completionDate, status, categoryIds } = params;
    console.log({ title, description, completionDate, status, categoryIds });
    const newTodo = await db.todo.create({
      data: {
        title,
        description,
        completionDate,
        status,
        categories: {
          connect: categoryIds.map((id: number) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });
    res.status(200).json(newTodo);
  }
}
