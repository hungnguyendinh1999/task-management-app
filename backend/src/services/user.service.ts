import { prisma } from "../lib/prisma.js";

export async function listUsers() {
    return prisma.user.findMany({
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
}
