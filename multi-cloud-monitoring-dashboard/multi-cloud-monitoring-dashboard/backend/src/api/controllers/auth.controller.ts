import { Request, Response } from "express";
import { env } from "../../config/env.js";

export class AuthController {
    public async login(req: Request, res: Response) {
        const { username, password } = req.body ?? {};
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const token = env.DEMO_TOKEN || "demo-token";
        return res.status(200).json({ token, user: { id: "u-1", name: username } });
    }
    
    public async logout(_req: Request, res: Response) {
        return res.status(204).send();
    }

    public async me(_req: Request, res: Response) {
        return res.status(200).json({ user: { id: "u-1", name: "Demo User" } });
    }
}