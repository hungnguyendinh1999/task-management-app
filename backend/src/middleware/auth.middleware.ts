import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Missing or invalid authorization header",
                },
            });
            return;
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Invalid Authorization header format",
                },
            });
            return;
        }

        const payload = verifyAccessToken(token);
        req.user = payload;

        next();
        return;
    } catch {
        res.status(401).json({
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid or expired token",
            },
        });
        return;
    }
}
