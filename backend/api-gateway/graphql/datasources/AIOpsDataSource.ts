import axios, { AxiosInstance } from 'axios';
import { DataSource } from 'apollo-datasource';

export interface FailurePredictionRequest {
  service_name: string;
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_io: number;
    error_rate: number;
    response_time_ms: number;
  };
}

export interface CapacityForecastRequest {
  forecast_days: number;
  historical_data: {
    cpu_usage: number[];
    memory_usage: number[];
    storage_gb: number[];
    network_throughput_mbps: number[];
  };
}

export interface ThreatDetectionRequest {
  events: Array<{
    event_type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  network_traffic: {
    requests_per_second: number;
    failed_requests: number;
    response_codes: Record<string, number>;
  };
  access_logs: Array<{
    ip_address: string;
    endpoint: string;
    status_code: number;
    timestamp: string;
  }>;
}

export interface AnomalyDetectionRequest {
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_io: number;
    network_traffic: number;
    error_rate: number;
    response_time_ms: number;
    request_rate: number;
    active_connections: number;
  };
}

export interface PredictionResponse {
  prediction_id: string;
  prediction_type: string;
  service_name: string;
  timestamp: string;
  predicted_time?: string;
  probability: number;
  confidence: number;
  severity: string;
  affected_components: string[];
  recommended_actions: string[];
  details: any;
}

export interface ThreatResponse {
  detection_id: string;
  service_name: string;
  threats_detected: number;
  risk_level: string;
  threats: Array<{
    threat_type: string;
    severity: string;
    confidence: number;
    description: string;
  }>;
  recommended_actions: Array<{
    action: string;
    priority: string;
    description: string;
    automated: boolean;
  }>;
  timestamp: string;
}

export class AIOpsDataSource extends DataSource {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(config: { baseURL?: string; timeout?: number } = {}) {
    super();
    this.baseURL = config.baseURL || 'http://localhost:8100';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async initialize(config: any): Promise<void> {
    // Test AIOps service health
    try {
      const response = await this.client.get('/api/v3/aiops/health');
      console.log('✓ Connected to AIOps Engine:', response.data);
    } catch (error: any) {
      console.warn('⚠ AIOps Engine not available:', error.message);
    }
  }

  // ========================================================================
  // Failure Prediction
  // ========================================================================

  async predictFailure(
    serviceName: string,
    metrics: {
      cpuUsage?: number;
      memoryUsage?: number;
      diskIo?: number;
      errorRate?: number;
      responseTimeMs?: number;
    }
  ): Promise<PredictionResponse> {
    const request: FailurePredictionRequest = {
      service_name: serviceName,
      metrics: {
        cpu_usage: metrics.cpuUsage || 0,
        memory_usage: metrics.memoryUsage || 0,
        disk_io: metrics.diskIo || 0,
        error_rate: metrics.errorRate || 0,
        response_time_ms: metrics.responseTimeMs || 0,
      },
    };

    const response = await this.client.post(
      '/api/v3/aiops/predict/failure',
      request
    );

    return {
      prediction_id: response.data.prediction_id,
      prediction_type: 'failure',
      service_name: serviceName,
      timestamp: response.data.timestamp,
      predicted_time: response.data.predicted_failure_time,
      probability: response.data.failure_probability,
      confidence: response.data.confidence,
      severity: response.data.severity,
      affected_components: response.data.affected_components || [],
      recommended_actions: response.data.recommended_actions || [],
      details: response.data,
    };
  }

  // ========================================================================
  // Capacity Forecasting
  // ========================================================================

  async forecastCapacity(
    serviceName: string,
    forecastDays: number,
    historicalData: {
      cpuUsage: number[];
      memoryUsage: number[];
      storageGb: number[];
      networkThroughputMbps: number[];
    }
  ): Promise<PredictionResponse> {
    const request: CapacityForecastRequest = {
      forecast_days: forecastDays,
      historical_data: {
        cpu_usage: historicalData.cpuUsage,
        memory_usage: historicalData.memoryUsage,
        storage_gb: historicalData.storageGb,
        network_throughput_mbps: historicalData.networkThroughputMbps,
      },
    };

    const response = await this.client.post(
      '/api/v3/aiops/predict/capacity',
      request
    );

    return {
      prediction_id: response.data.prediction_id,
      prediction_type: 'capacity',
      service_name: serviceName,
      timestamp: response.data.timestamp,
      probability: 0.95,
      confidence: response.data.forecast_confidence || 0.85,
      severity: response.data.bottlenecks?.length > 0 ? 'high' : 'low',
      affected_components: response.data.bottlenecks || [],
      recommended_actions: response.data.scaling_recommendations?.map(
        (rec: any) => `${rec.action}: ${rec.description}`
      ) || [],
      details: response.data,
    };
  }

  // ========================================================================
  // Threat Detection
  // ========================================================================

  async detectThreats(
    serviceName: string,
    events: Array<{
      type: string;
      severity: string;
      message: string;
      timestamp: string;
    }>,
    networkTraffic?: any,
    accessLogs?: any[]
  ): Promise<ThreatResponse> {
    const request: ThreatDetectionRequest = {
      events: events.map(e => ({
        event_type: e.type,
        severity: e.severity,
        message: e.message,
        timestamp: e.timestamp,
      })),
      network_traffic: networkTraffic || {
        requests_per_second: 100,
        failed_requests: 5,
        response_codes: { '200': 90, '500': 5, '403': 5 },
      },
      access_logs: accessLogs || [],
    };

    const response = await this.client.post(
      '/api/v3/aiops/predict/threat',
      request
    );

    return {
      detection_id: response.data.detection_id,
      service_name: serviceName,
      threats_detected: response.data.threats_detected,
      risk_level: response.data.risk_level,
      threats: response.data.threats,
      recommended_actions: response.data.recommended_actions,
      timestamp: response.data.timestamp,
    };
  }

  // ========================================================================
  // Anomaly Detection
  // ========================================================================

  async detectAnomalies(
    serviceName: string,
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskIo: number;
      networkTraffic: number;
      errorRate: number;
      responseTimeMs: number;
      requestRate: number;
      activeConnections: number;
    }
  ): Promise<any> {
    const request: AnomalyDetectionRequest = {
      metrics: {
        cpu_usage: metrics.cpuUsage,
        memory_usage: metrics.memoryUsage,
        disk_io: metrics.diskIo,
        network_traffic: metrics.networkTraffic,
        error_rate: metrics.errorRate,
        response_time_ms: metrics.responseTimeMs,
        request_rate: metrics.requestRate,
        active_connections: metrics.activeConnections,
      },
    };

    const response = await this.client.post(
      '/api/v3/aiops/analyze/anomaly',
      request
    );

    return {
      analysis_id: response.data.analysis_id,
      service_name: serviceName,
      anomaly_score: response.data.anomaly_score,
      is_anomaly: response.data.is_anomaly,
      severity: response.data.severity,
      anomalies_detected: response.data.anomalies_detected,
      root_cause: response.data.root_cause,
      remediation_steps: response.data.remediation_steps,
      timestamp: response.data.timestamp,
    };
  }

  // ========================================================================
  // Health Check
  // ========================================================================

  async getHealth(): Promise<any> {
    const response = await this.client.get('/api/v3/aiops/health');
    return response.data;
  }

  // ========================================================================
  // Metrics
  // ========================================================================

  async getMetrics(): Promise<any> {
    const response = await this.client.get('/api/v3/aiops/metrics');
    return response.data;
  }
}
