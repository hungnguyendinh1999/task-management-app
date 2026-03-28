import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

export async function registerUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json({
            data: result,
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

export async function loginUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await authService.loginUser(req.body);

        res.status(200).json({
            data: result,
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}
