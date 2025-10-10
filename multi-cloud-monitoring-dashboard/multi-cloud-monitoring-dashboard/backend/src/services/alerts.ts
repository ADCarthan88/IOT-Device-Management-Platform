import crypto from "node:crypto";
import { Alert, CreateAlert, UpdateAlert } from "../types/index.js";

export class AlertsService {
    private store = new Map<string, Alert>();

    public getAlerts(): Alert[] {
        return Array.from(this.store.values());
    }

    public createAlert(input: CreateAlert): Alert {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const alert: Alert = {
            id,
            name: input.name,
            provider: input.provider,
            metric: input.metric,
            threshold: input.threshold,
            comparison: input.comparison,
            enabled: input.enabled ?? true,
            createdAt: now,
            updatedAt: now
        };
        this.store.set(id, alert);
        return alert;
    }

    public updateAlert(id: string, input: UpdateAlert): Alert | undefined {
        const existing = this.store.get(id);
        if (!existing) return undefined;
        const updated: Alert = { ...existing, ...input, updatedAt: new Date().toISOString() };
        this.store.set(id, updated);
        return updated;
    }

    public deleteAlert(id: string): boolean {
        return this.store.delete(id);
    }
}