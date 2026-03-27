import type { NextFunction, Request, Response } from "express";
import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function listTasks(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const page = Math.max(Number(req.query["page"]) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query["limit"]) || 10, 1),
            100,
        );
        const skip = (page - 1) * limit;

        const rawStatus =
            typeof req.query["status"] === "string"
                ? req.query["status"]
                : undefined;

        const status: TaskStatus | undefined =
            rawStatus &&
            Object.values(TaskStatus).includes(rawStatus as TaskStatus)
                ? (rawStatus as TaskStatus)
                : undefined;

        const assignedUserId: number | undefined =
            typeof req.query["assignedUserId"] === "string" &&
            !Number.isNaN(Number(req.query["assignedUserId"]))
                ? Number(req.query["assignedUserId"])
                : undefined;

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

        res.status(200).json({
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
        return;
    } catch (error) {
        next(error);
    }
}

export async function createTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { title, description, status, assignedUserId } = req.body;

        if (typeof title !== "string" || title.trim().length === 0) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Title is required",
                },
            });
            return;
        }

        if (
            status !== undefined &&
            !Object.values(TaskStatus).includes(status as TaskStatus)
        ) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid status value",
                },
            });
            return;
        }

        if (
            assignedUserId !== undefined &&
            assignedUserId !== null &&
            (typeof assignedUserId !== "number" || Number.isNaN(assignedUserId))
        ) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "assignedUserId must be a number or null",
                },
            });
            return;
        }

        if (assignedUserId !== undefined && assignedUserId !== null) {
            const user = await prisma.user.findFirst({
                where: {
                    id: assignedUserId,
                    deletedAt: null,
                },
            });

            if (!user) {
                res.status(404).json({
                    error: {
                        code: "USER_NOT_FOUND",
                        message: "Assigned user not found",
                    },
                });
                return;
            }
        }

        const createTaskData: Prisma.TaskUncheckedCreateInput = {
            title: title.trim(),
            description: description ?? null,
            assignedUserId:
                assignedUserId ?? null,
            createdByUserId: req.user!.userId,
            ...(status !== undefined ? { status } : {}),
        };

        const createdTask = await prisma.task.create({
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

        res.status(201).json({
            data: createdTask,
        });
        return;
    } catch (error) {
        next(error);
    }
}

export async function updateTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const taskId = Number(req.params.id);

        if (Number.isNaN(taskId) || taskId < 1) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid task id",
                },
            });
            return;
        }

        const { title, description, status, assignedUserId } = req.body;

        if (typeof title !== "string" || title.trim().length === 0) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Title is required",
                },
            });
            return;
        }

        if (
            description !== null &&
            description !== undefined &&
            typeof description !== "string"
        ) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Description must be a string or null",
                },
            });
            return;
        }

        if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid status value",
                },
            });
            return;
        }

        if (
            assignedUserId !== null &&
            (typeof assignedUserId !== "number" || Number.isNaN(assignedUserId))
        ) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "assignedUserId must be a number or null",
                },
            });
            return;
        }

        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
            },
        });

        if (!existingTask) {
            res.status(404).json({
                error: {
                    code: "TASK_NOT_FOUND",
                    message: "Task not found",
                },
            });
            return;
        }

        if (assignedUserId !== null) {
            const user = await prisma.user.findFirst({
                where: {
                    id: assignedUserId,
                    deletedAt: null,
                },
            });

            if (!user) {
                res.status(404).json({
                    error: {
                        code: "USER_NOT_FOUND",
                        message: "Assigned user not found",
                    },
                });
                return;
            }
        }

        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                title: title.trim(),
                description: description ?? null,
                status: status as TaskStatus,
                assignedUserId,
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

        res.status(200).json({
            data: updatedTask,
        });
        return;
    } catch (error) {
        next(error);
    }
}

export async function deleteTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const taskId = Number(req.params.id);

        if (Number.isNaN(taskId) || taskId < 1) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid task id",
                },
            });
            return;
        }

        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
            },
        });

        if (!existingTask) {
            res.status(404).json({
                error: {
                    code: "TASK_NOT_FOUND",
                    message: "Task not found",
                },
            });
            return;
        }

        await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        res.status(200).json({
            data: {
                message: "Task deleted successfully",
            },
        });
        return;
    } catch (error) {
        next(error);
    }
}
