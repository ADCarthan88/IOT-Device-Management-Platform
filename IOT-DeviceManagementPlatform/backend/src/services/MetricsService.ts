import { logger } from '../utils/logger';

export class MetricsService {
  private static metrics: Map<string, number> = new Map();

  static initialize(): void {
    logger.info('Metrics service initialized (simple mode)');
  }

  // Record HTTP request metrics
  static recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const key = `http_${method}_${route}_${statusCode}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
    
    const durationKey = `http_duration_${method}_${route}`;
    this.metrics.set(durationKey, duration);
  }

  // Update WebSocket connection count
  static updateActiveConnections(count: number): void {
    this.metrics.set('websocket_connections_active', count);
  }

  // Update device counts
  static updateDeviceCount(total: number, active: number): void {
    this.metrics.set('devices_total', total);
    this.metrics.set('devices_active', active);
  }

  // Record alert
  static recordAlert(type: string, severity: string, deviceId?: string): void {
    const key = `alerts_${type}_${severity}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  // Record device command
  static recordDeviceCommand(deviceId: string, commandType: string, status: string): void {
    const key = `commands_${deviceId}_${commandType}_${status}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  // Record data point
  static recordDataPoint(deviceId: string, dataType: string): void {
    const key = `data_points_${deviceId}_${dataType}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  // Get all metrics in Prometheus format
  static async getMetrics(): Promise<string> {
    let output = '';
    
    for (const [key, value] of this.metrics) {
      output += `# HELP ${key} IoT Platform metric\n`;
      output += `# TYPE ${key} counter\n`;
      output += `${key} ${value}\n\n`;
    }
    
    return output;
  }

  // System health metrics
  static recordSystemHealth(cpuUsage: number, memoryUsage: number, diskUsage: number): void {
    this.metrics.set('system_cpu_usage', cpuUsage);
    this.metrics.set('system_memory_usage', memoryUsage);
    this.metrics.set('system_disk_usage', diskUsage);
  }

  // Database metrics
  static recordDatabaseQuery(operation: string, duration: number, success: boolean): void {
    const key = `database_query_${operation}_${success ? 'success' : 'error'}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
    
    this.metrics.set(`database_query_duration_${operation}`, duration);
  }

  // Cache metrics
  static recordCacheOperation(operation: string, hit: boolean): void {
    const key = `cache_${operation}_${hit ? 'hit' : 'miss'}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  // Get specific metric
  static getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  // Reset all metrics
  static reset(): void {
    this.metrics.clear();
  }

  // Get all metrics as object
  static getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}