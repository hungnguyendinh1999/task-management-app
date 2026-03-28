import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    Response,
} from "express";
import { HttpError } from "../errors/app-error.js";

export function notFoundHandler(
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: "Route not found",
        },
    });
}

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
): void => {
    if (error instanceof HttpError) {
        const response: {
            error: {
                code: string;
                message: string;
                details?: unknown;
            };
        } = {
            error: {
                code: error.code,
                message: error.message,
            },
        };

        if (error.details !== undefined) {
            response.error.details = error.details;
        }

        res.status(error.status).json(response);
        return;
    }

    console.error("Unhandled error", error);

    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
        },
    });
};
