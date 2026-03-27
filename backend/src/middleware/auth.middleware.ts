import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Missing or invalid authorization header",
                },
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Invalid Authorization header format",
                },
            });
        }

        const payload = verifyAccessToken(token);
        req.user = payload;

        next();
    } catch {
        return res.status(401).json({
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid or expired token",
            },
        });
    }
}
