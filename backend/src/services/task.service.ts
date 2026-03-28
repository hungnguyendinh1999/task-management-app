import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../errors/app-error.js";

type ListTasksInput = {
    page?: unknown;
    limit?: unknown;
    status?: unknown;
    assignedUserId?: unknown;
};

type UpsertTaskInput = {
    title: unknown;
    description: unknown;
    status: unknown;
    assignedUserId: unknown;
};

function normalizeListParams(input: ListTasksInput) {
    const page = Math.max(Number(input.page) || 1, 1);
    const limit = Math.min(Math.max(Number(input.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const rawStatus = typeof input.status === "string" ? input.status : undefined;

    if (rawStatus !== undefined && !Object.values(TaskStatus).includes(rawStatus as TaskStatus)) {
        throw new HttpError(
            400,
            "VALIDATION_ERROR",
            `Invalid status value. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
        );
    }

    const status = rawStatus as TaskStatus | undefined;

    const rawAssignedUserId =
        typeof input.assignedUserId === "string" ? input.assignedUserId : undefined;

    if (rawAssignedUserId !== undefined && Number.isNaN(Number(rawAssignedUserId))) {
        throw new HttpError(400, "VALIDATION_ERROR", "assignedUserId must be a number");
    }

    const assignedUserId: number | undefined =
        rawAssignedUserId !== undefined ? Number(rawAssignedUserId) : undefined;

    return {
        page,
        limit,
        skip,
        status,
        assignedUserId,
    };
}

async function assertAssignedUserExists(assignedUserId: number): Promise<void> {
    const user = await prisma.user.findFirst({
        where: {
            id: assignedUserId,
            deletedAt: null,
        },
    });

    if (!user) {
        throw new HttpError(404, "USER_NOT_FOUND", "Assigned user not found");
    }
}

export async function listTasks(input: ListTasksInput) {
    const { page, limit, skip, status, assignedUserId } = normalizeListParams(input);

    const where: Prisma.TaskWhereInput = {
        deletedAt: null,
        ...(status !== undefined ? { status } : {}),
        ...(assignedUserId !== undefined ? { assignedUserId } : {}),
    };

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            include: {
                assignedUser: {
                    select: { id: true, name: true, email: true },
                },
                createdByUser: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.task.count({ where }),
    ]);

    return {
        data: tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function createTask(input: UpsertTaskInput & { createdByUserId: number }) {
    const { title, description, status, assignedUserId, createdByUserId } = input;

    if (typeof title !== "string" || title.trim().length === 0) {
        throw new HttpError(400, "VALIDATION_ERROR", "Title is required");
    }

    if (status !== undefined && !Object.values(TaskStatus).includes(status as TaskStatus)) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid status value");
    }

    if (description !== null && description !== undefined && typeof description !== "string") {
        throw new HttpError(400, "VALIDATION_ERROR", "Description must be a string or null");
    }

    if (
        assignedUserId !== undefined &&
        assignedUserId !== null &&
        (typeof assignedUserId !== "number" || Number.isNaN(assignedUserId))
    ) {
        throw new HttpError(400, "VALIDATION_ERROR", "assignedUserId must be a number or null");
    }

    if (assignedUserId !== undefined && assignedUserId !== null) {
        await assertAssignedUserExists(assignedUserId);
    }

    const createTaskData: Prisma.TaskUncheckedCreateInput = {
        title: title.trim(),
        description: description as string | null | undefined ?? null,
        assignedUserId: assignedUserId ?? null,
        createdByUserId,
        ...(status !== undefined ? { status: status as TaskStatus } : {}),
    };

    return prisma.task.create({
        data: createTaskData,
        include: {
            assignedUser: {
                select: { id: true, name: true, email: true },
            },
            createdByUser: {
                select: { id: true, name: true, email: true },
            },
        },
    });
}

export async function updateTask(taskId: number, input: UpsertTaskInput) {
    const { title, description, status, assignedUserId } = input;

    if (Number.isNaN(taskId) || taskId < 1) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid task id");
    }

    if (typeof title !== "string" || title.trim().length === 0) {
        throw new HttpError(400, "VALIDATION_ERROR", "Title is required");
    }

    if (description !== null && description !== undefined && typeof description !== "string") {
        throw new HttpError(400, "VALIDATION_ERROR", "Description must be a string or null");
    }

    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid status value");
    }

    if (
        assignedUserId !== null &&
        (typeof assignedUserId !== "number" || Number.isNaN(assignedUserId))
    ) {
        throw new HttpError(400, "VALIDATION_ERROR", "assignedUserId must be a number or null");
    }

    const existingTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
        },
    });

    if (!existingTask) {
        throw new HttpError(404, "TASK_NOT_FOUND", "Task not found");
    }

    if (assignedUserId !== null) {
        await assertAssignedUserExists(assignedUserId as number);
    }

    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            title: title.trim(),
            description: description ?? null,
            status: status as TaskStatus,
            assignedUserId: assignedUserId as number | null,
        },
        include: {
            assignedUser: {
                select: { id: true, name: true, email: true },
            },
            createdByUser: {
                select: { id: true, name: true, email: true },
            },
        },
    });
}

export async function deleteTask(taskId: number) {
    if (Number.isNaN(taskId) || taskId < 1) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid task id");
    }

    const existingTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
        },
    });

    if (!existingTask) {
        throw new HttpError(404, "TASK_NOT_FOUND", "Task not found");
    }

    await prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
