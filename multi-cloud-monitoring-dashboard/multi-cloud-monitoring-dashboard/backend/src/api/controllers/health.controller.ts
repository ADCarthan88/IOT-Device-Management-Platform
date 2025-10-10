import { Request, Response } from "express";
export class HealthController {
    public async getHealth(_req: Request, res: Response) {
        res.status(200).json({ status: "ok", time: new Date().toISOString() });
    }
}