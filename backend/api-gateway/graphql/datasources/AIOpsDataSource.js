"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOpsDataSource = void 0;
const axios_1 = __importDefault(require("axios"));
const apollo_datasource_1 = require("apollo-datasource");
class AIOpsDataSource extends apollo_datasource_1.DataSource {
    constructor(config = {}) {
        super();
        this.baseURL = config.baseURL || 'http://localhost:8100';
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async initialize(config) {
        // Test AIOps service health
        try {
            const response = await this.client.get('/api/v3/aiops/health');
            console.log('✓ Connected to AIOps Engine:', response.data);
        }
        catch (error) {
            console.warn('⚠ AIOps Engine not available:', error.message);
        }
    }
    // ========================================================================
    // Failure Prediction
    // ========================================================================
    async predictFailure(serviceName, metrics) {
        const request = {
            service_name: serviceName,
            metrics: {
                cpu_usage: metrics.cpuUsage || 0,
                memory_usage: metrics.memoryUsage || 0,
                disk_io: metrics.diskIo || 0,
                error_rate: metrics.errorRate || 0,
                response_time_ms: metrics.responseTimeMs || 0,
            },
        };
        const response = await this.client.post('/api/v3/aiops/predict/failure', request);
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
    async forecastCapacity(serviceName, forecastDays, historicalData) {
        const request = {
            forecast_days: forecastDays,
            historical_data: {
                cpu_usage: historicalData.cpuUsage,
                memory_usage: historicalData.memoryUsage,
                storage_gb: historicalData.storageGb,
                network_throughput_mbps: historicalData.networkThroughputMbps,
            },
        };
        const response = await this.client.post('/api/v3/aiops/predict/capacity', request);
        return {
            prediction_id: response.data.prediction_id,
            prediction_type: 'capacity',
            service_name: serviceName,
            timestamp: response.data.timestamp,
            probability: 0.95,
            confidence: response.data.forecast_confidence || 0.85,
            severity: response.data.bottlenecks?.length > 0 ? 'high' : 'low',
            affected_components: response.data.bottlenecks || [],
            recommended_actions: response.data.scaling_recommendations?.map((rec) => `${rec.action}: ${rec.description}`) || [],
            details: response.data,
        };
    }
    // ========================================================================
    // Threat Detection
    // ========================================================================
    async detectThreats(serviceName, events, networkTraffic, accessLogs) {
        const request = {
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
        const response = await this.client.post('/api/v3/aiops/predict/threat', request);
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
    async detectAnomalies(serviceName, metrics) {
        const request = {
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
        const response = await this.client.post('/api/v3/aiops/analyze/anomaly', request);
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
    async getHealth() {
        const response = await this.client.get('/api/v3/aiops/health');
        return response.data;
    }
    // ========================================================================
    // Metrics
    // ========================================================================
    async getMetrics() {
        const response = await this.client.get('/api/v3/aiops/metrics');
        return response.data;
    }
}
exports.AIOpsDataSource = AIOpsDataSource;
//# sourceMappingURL=AIOpsDataSource.js.map