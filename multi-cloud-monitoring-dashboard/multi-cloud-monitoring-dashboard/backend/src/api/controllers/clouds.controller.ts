import { Request, Response } from "express";
import { MetricsService } from "../../services/metrics.js";
import { CloudProviderId } from "../../types/index.js";

const metrics = new MetricsService();

export class CloudsController {
  public async getProviders(_req: Request, res: Response) {
    res.status(200).json({
      data: [
        { id: "aws", name: "Amazon Web Services" },
        { id: "azure", name: "Microsoft Azure" },
        { id: "gcp", name: "Google Cloud Platform" }
      ]
    });
  }

  public async getMetrics(req: Request, res: Response) {
    const provider = (req.params.provider || "").toLowerCase() as CloudProviderId;
    const { resource = "demo", range = "1h" } = req.query as { resource?: string; range?: string };

    if (!["aws", "azure", "gcp"].includes(provider)) {
      return res.status(400).json({ message: "Unsupported provider" });
    }
    try {
      const data = await metrics.getMetrics(provider, { resource, range });
      res.status(200).json({ data });
    } catch (err: any) {
      res.status(502).json({ message: "Failed to fetch metrics", error: err?.message });
    }
  }
}