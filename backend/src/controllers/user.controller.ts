import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        res.status(200).json({
            data: users,
        });
        return;
    } catch (error) {
        next(error);
    }
}
