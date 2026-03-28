import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";

export async function listUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const users = await userService.listUsers();

        res.status(200).json({
            data: users,
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}
