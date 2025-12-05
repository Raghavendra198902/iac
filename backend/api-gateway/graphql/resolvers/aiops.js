"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiopsResolvers = void 0;
exports.aiopsResolvers = {
    Query: {
        predictions: async (_, args, { dataSources }) => {
            // TODO: Implement prediction history retrieval
            // For now, return empty array
            return [];
        },
        metrics: async (_, args, { dataSources }) => {
            // TODO: Implement time-series metrics retrieval from Prometheus/TimescaleDB
            return [];
        },
    },
    Mutation: {
        predictFailure: async (_, { serviceId, metrics }, { dataSources, user }) => {
            const prediction = await dataSources.aiops.predictFailure(serviceId, {
                cpuUsage: metrics.cpuUsage,
                memoryUsage: metrics.memoryUsage,
                diskIo: metrics.diskIo,
                errorRate: metrics.errorRate,
                responseTimeMs: metrics.responseTimeMs,
            });
            // Create audit log
            await dataSources.postgres.createAuditLog({
                userId: user?.id,
                action: 'PREDICT_FAILURE',
                resourceType: 'prediction',
                resourceId: prediction.prediction_id,
                details: { serviceId, predictionType: 'failure' },
            });
            return {
                id: prediction.prediction_id,
                predictionType: 'FAILURE',
                serviceId,
                serviceName: prediction.service_name,
                timestamp: prediction.timestamp,
                predictedTime: prediction.predicted_time,
                probability: prediction.probability,
                confidence: prediction.confidence,
                severity: prediction.severity.toUpperCase(),
                affectedComponents: prediction.affected_components,
                recommendedActions: prediction.recommended_actions,
                details: prediction.details,
            };
        },
        predictCapacity: async (_, { serviceId, forecastDays }, { dataSources, user }) => {
            // Generate sample historical data
            const historicalData = {
                cpuUsage: Array(30).fill(0).map(() => Math.random() * 100),
                memoryUsage: Array(30).fill(0).map(() => Math.random() * 100),
                storageGb: Array(30).fill(0).map(() => Math.random() * 1000),
                networkThroughputMbps: Array(30).fill(0).map(() => Math.random() * 1000),
            };
            const prediction = await dataSources.aiops.forecastCapacity(serviceId, forecastDays || 30, historicalData);
            // Create audit log
            await dataSources.postgres.createAuditLog({
                userId: user?.id,
                action: 'PREDICT_CAPACITY',
                resourceType: 'prediction',
                resourceId: prediction.prediction_id,
                details: { serviceId, forecastDays, predictionType: 'capacity' },
            });
            return {
                id: prediction.prediction_id,
                predictionType: 'CAPACITY',
                serviceId,
                serviceName: prediction.service_name,
                timestamp: prediction.timestamp,
                probability: prediction.probability,
                confidence: prediction.confidence,
                severity: prediction.severity.toUpperCase(),
                affectedComponents: prediction.affected_components,
                recommendedActions: prediction.recommended_actions,
                details: prediction.details,
            };
        },
        detectThreat: async (_, { serviceId, events }, { dataSources, user }) => {
            const detection = await dataSources.aiops.detectThreats(serviceId, events);
            // Create audit log
            await dataSources.postgres.createAuditLog({
                userId: user?.id,
                action: 'DETECT_THREAT',
                resourceType: 'threat_detection',
                resourceId: detection.detection_id,
                details: { serviceId, threatsDetected: detection.threats_detected },
            });
            return {
                id: detection.detection_id,
                serviceId,
                threatsDetected: detection.threats_detected,
                riskLevel: detection.risk_level,
                threats: detection.threats.map((t) => ({
                    threatType: t.threat_type,
                    severity: t.severity.toUpperCase(),
                    confidence: t.confidence,
                    description: t.description,
                })),
                recommendedActions: detection.recommended_actions.map((a) => ({
                    action: a.action,
                    priority: a.priority,
                    description: a.description,
                    automated: a.automated,
                })),
                timestamp: detection.timestamp,
            };
        },
    },
    Prediction: {
        predictedTime: (parent) => parent.predictedTime || null,
    },
};
//# sourceMappingURL=aiops.js.map