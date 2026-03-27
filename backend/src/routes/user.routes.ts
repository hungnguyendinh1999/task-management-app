import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedTasks: true
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

export default router;