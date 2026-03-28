import type { NextFunction, Request, Response } from "express";
import * as taskService from "../services/task.service.js";

export async function listTasks(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await taskService.listTasks({
            page: req.query["page"],
            limit: req.query["limit"],
            status: req.query["status"],
            assignedUserId: req.query["assignedUserId"],
        });

        res.status(200).json(result);
        return;
    } catch (error) {
        next(error);
        return;
    }
}

export async function createTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const createdTask = await taskService.createTask({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            assignedUserId: req.body.assignedUserId,
            createdByUserId: req.user!.userId,
        });

        res.status(201).json({
            data: createdTask,
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

export async function updateTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const taskId = Number(req.params["id"]);

        const updatedTask = await taskService.updateTask(taskId, {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            assignedUserId: req.body.assignedUserId,
        });

        res.status(200).json({
            data: updatedTask,
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

export async function deleteTask(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const taskId = Number(req.params["id"]);

        await taskService.deleteTask(taskId);

        res.status(200).json({
            data: {
                message: "Task deleted successfully",
            },
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}
