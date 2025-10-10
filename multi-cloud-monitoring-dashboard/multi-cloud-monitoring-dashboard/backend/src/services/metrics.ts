import { CloudProviderId, MetricPoint } from "../types/index.js";

export class MetricsService {
    async getMetrics(_provider: CloudProviderId, _params: { resource: string; range: string }): Promise<MetricPoint[]> {
        const now = Date.now();
        return Array.from({ length: 30 }).map((_, i) => ({
            ts: new Date(now - (29 - i) * 60_000).toISOString(),
            value: Math.round((Math.sin(i / 5) + 1) * 50 + Math.random() * 10)
        }));
    }
}