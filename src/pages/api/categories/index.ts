import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(categories);
  }
}
