import { Request, Response } from "express";
import { AlertsService } from "../../services/alerts.js";
import { z } from "zod";

const createAlertSchema = z.object({
	name: z.string().min(1),
	provider: z.enum(["aws", "azure", "gcp"]),
	metric: z.string().min(1),
	threshold: z.number(),
	comparison: z.enum(["gt", "gte", "lt", "lte", "eq"]),
	enabled: z.boolean().optional().default(true)
});

const updateAlertSchema = createAlertSchema.partial();

const service = new AlertsService();

export class AlertsController {
	public async getAlerts(_req: Request, res: Response) {
		return res.status(200).json({ data: service.getAlerts() });
	}

	public async createAlert(req: Request, res: Response) {
		const parsed = createAlertSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ message: "Invalid alert payload", issues: parsed.error.issues });
		}
		const created = service.createAlert(parsed.data);
		return res.status(201).json({ data: created });
	}

	public async updateAlert(req: Request, res: Response) {
		const id = req.params.id;
		if (!id) return res.status(400).json({ message: "id param required" });
		const parsed = updateAlertSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ message: "Invalid alert payload", issues: parsed.error.issues });
		}
		const updated = service.updateAlert(id, parsed.data);
		if (!updated) return res.status(404).json({ message: "Alert not found" });
		return res.status(200).json({ data: updated });
	}

	public async deleteAlert(req: Request, res: Response) {
		const id = req.params.id;
		if (!id) return res.status(400).json({ message: "id param required" });
		const ok = service.deleteAlert(id);
		if (!ok) return res.status(404).json({ message: "Alert not found" });
		return res.status(204).send();
	}
}
