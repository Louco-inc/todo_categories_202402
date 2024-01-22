import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    const todoLists = await db.todo.findMany({
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(todoLists);
  } else if (req.method === "POST") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const params = JSON.parse(req.body);
    const { title, description, completionDate, status } = params;
    const newTodo = await db.todo.create({
      data: {
        title,
        description,
        completionDate,
        status,
      },
    });
    res.status(200).json(newTodo);
  }
}
