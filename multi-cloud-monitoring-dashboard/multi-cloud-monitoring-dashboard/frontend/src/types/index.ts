export interface Metric {
    id: string;
    name: string;
    value: number;
    timestamp: Date;
}

export interface Alert {
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
}

export interface CloudService {
    id: string;
    name: string;
    type: 'AWS' | 'Azure' | 'GCP';
}

export interface DashboardData {
    metrics: Metric[];
    alerts: Alert[];
    cloudServices: CloudService[];
}