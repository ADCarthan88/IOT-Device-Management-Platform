import { Request, Response, NextFunction } from "express";
import { env } from "../../config/env.js";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; name: string; roles?: string[] };

        }
    }
}

function extractBearer(req: Request): string | undefined {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header) return undefined;
    const value = Array.isArray(header) ? header[0] : String(header);
    return value.startsWith("Bearer ") ? value.slice(7) : undefined;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearer(req);

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Demo token validation (replace with JWT if needed)
    const valid = token === (env.DEMO_TOKEN || "demo-token");
    if (!valid) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // Attach demo user
    req.user = { id: "u-1", name: "Demo User", roles: ["user"] };
    next();
};

export const authorize =
(roles: string[] = []) =>
(req: Request, res: Response, next: NextFunction) => {
    if (!roles.length) return next(); // No roles required

    const userRoles = req.user?.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) return res.status(403).json({ message: "Forbidden" });

    next();
};

// Backward-compatible export used in src/index.ts
export const authMiddleware = authenticate;