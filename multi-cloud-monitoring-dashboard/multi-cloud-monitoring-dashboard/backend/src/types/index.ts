// Legacy UI/system types (optional)
export type UINotification = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
};

export type CloudService = {
  id: string;
  name: string;
  provider: "AWS" | "Azure" | "GCP";
  status: "active" | "inactive";
};

export type Metric = {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
};

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
};

export type HealthCheck = {
  service: string;
  status: "up" | "down";
  timestamp: Date;
};

// App types used by backend services/controllers
export type CloudProviderId = "aws" | "azure" | "gcp";
export type Comparison = "gt" | "gte" | "lt" | "lte" | "eq";

export interface Alert {
  id: string;
  name: string;
  provider: CloudProviderId;
  metric: string;
  threshold: number;
  comparison: Comparison;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateAlert = Omit<Alert, "id" | "createdAt" | "updatedAt">;
export type UpdateAlert = Partial<CreateAlert>;

export interface MetricPoint {
  ts: string;
  value: number;
}