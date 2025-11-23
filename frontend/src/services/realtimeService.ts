import { apiClient } from '../lib/advancedApiClient';

export interface RealTimeMetrics {
  timestamp: string;
  requestsPerSecond: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface ServiceStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  lastHeartbeat: string;
  responseTime: number;
  errorCount: number;
  requestCount: number;
}

export interface SystemMetrics {
  services: ServiceStatus[];
  database: {
    connections: number;
    qps: number;
    cacheHitRate: number;
  };
  redis: {
    connectedClients: number;
    memoryUsage: string;
    opsPerSec: number;
    hitRate: number;
  };
  infrastructure: {
    totalServers: number;
    healthyServers: number;
    totalCost: number;
    costTrend: number;
  };
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
}

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  service: string;
  operation: string;
  startTime: string;
  duration: number;
  tags: Record<string, any>;
  logs: any[];
}

class RealtimeService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  // WebSocket connection for real-time metrics
  subscribeToMetrics(callback: (metrics: RealTimeMetrics) => void): () => void {
    return this.createWebSocketSubscription('/realtime/metrics', callback);
  }

  // Subscribe to service status updates
  subscribeToServiceStatus(callback: (status: ServiceStatus[]) => void): () => void {
    return this.createWebSocketSubscription('/realtime/services', callback);
  }

  // Subscribe to alerts
  subscribeToAlerts(callback: (alert: Alert) => void): () => void {
    return this.createWebSocketSubscription('/realtime/alerts', callback);
  }

  // Subscribe to logs
  subscribeToLogs(
    filters: { service?: string; level?: string },
    callback: (log: LogEntry) => void
  ): () => void {
    const queryParams = new URLSearchParams(filters as any).toString();
    return this.createWebSocketSubscription(`/realtime/logs?${queryParams}`, callback);
  }

  // Generic WebSocket subscription handler
  private createWebSocketSubscription<T>(
    path: string,
    callback: (data: T) => void
  ): () => void {
    const ws = apiClient.createWebSocket(path);
    const connectionKey = path;

    ws.onopen = () => {
      console.log(`[WebSocket] Connected to ${path}`);
      this.reconnectAttempts.set(connectionKey, 0);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WebSocket] Error on ${path}:`, error);
    };

    ws.onclose = () => {
      console.log(`[WebSocket] Disconnected from ${path}`);
      this.wsConnections.delete(connectionKey);
      
      // Attempt reconnection
      const attempts = this.reconnectAttempts.get(connectionKey) || 0;
      if (attempts < this.maxReconnectAttempts) {
        this.reconnectAttempts.set(connectionKey, attempts + 1);
        setTimeout(() => {
          console.log(`[WebSocket] Reconnecting to ${path} (attempt ${attempts + 1})`);
          this.createWebSocketSubscription(path, callback);
        }, Math.min(1000 * Math.pow(2, attempts), 30000));
      }
    };

    this.wsConnections.set(connectionKey, ws);

    // Return unsubscribe function
    return () => {
      ws.close();
      this.wsConnections.delete(connectionKey);
      this.reconnectAttempts.delete(connectionKey);
    };
  }

  // REST APIs for metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiClient.get('/api/metrics/system');
  }

  async getServiceMetrics(service: string, timeRange: string = '1h'): Promise<any> {
    return apiClient.get(`/api/metrics/services/${service}`, {
      params: { timeRange },
    });
  }

  async getAlerts(filters?: {
    severity?: string;
    service?: string;
    acknowledged?: boolean;
  }): Promise<Alert[]> {
    return apiClient.get('/api/alerts', { params: filters });
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    return apiClient.post(`/api/alerts/${alertId}/acknowledge`);
  }

  async resolveAlert(alertId: string): Promise<void> {
    return apiClient.post(`/api/alerts/${alertId}/resolve`);
  }

  async getLogs(filters: {
    service?: string;
    level?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    return apiClient.get('/api/logs', { params: filters });
  }

  async searchLogs(query: string, filters?: any): Promise<LogEntry[]> {
    return apiClient.post('/api/logs/search', { query, ...filters });
  }

  async getTrace(traceId: string): Promise<TraceSpan[]> {
    return apiClient.get(`/api/traces/${traceId}`);
  }

  async searchTraces(filters: {
    service?: string;
    operation?: string;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
  }): Promise<any[]> {
    return apiClient.get('/api/traces', { params: filters });
  }

  // Performance metrics
  async getPerformanceMetrics(timeRange: string = '24h'): Promise<any> {
    return apiClient.get('/api/metrics/performance', {
      params: { timeRange },
    });
  }

  async getResourceUtilization(resource: string, timeRange: string = '1h'): Promise<any> {
    return apiClient.get(`/api/metrics/resources/${resource}`, {
      params: { timeRange },
    });
  }

  // Cleanup all connections
  disconnectAll(): void {
    this.wsConnections.forEach((ws) => ws.close());
    this.wsConnections.clear();
    this.reconnectAttempts.clear();
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
