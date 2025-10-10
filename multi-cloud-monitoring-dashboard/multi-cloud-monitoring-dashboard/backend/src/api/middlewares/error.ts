import type { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger.js";

export function notFoundMiddleware(_req: Request, res: Response) {
    res.status(404).json({ message: "Route not found "});
}

export function errorMiddleware(
    err: any & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    const status = err?.status ?? 500;
    const body: Record<string, unknown> = {
        message: err?.message || "Internal Server Error"
    };

    if (process.env.NODE_ENV !== "production" && err?.stack) {
        body.stack = err.stack;
    }

    logger.error(err);
    res.status(status).json(body);
}