/**
 * ML-Based Capacity Planning
 * Predictive analytics for resource planning and optimization
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface ResourceMetric {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface CapacityForecast {
  resource: 'cpu' | 'memory' | 'disk' | 'network';
  current: number;
  predicted: number[];
  timestamps: number[];
  confidence: number;
  threshold: number;
  daysUntilThreshold: number;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceOptimization {
  resource: string;
  currentUsage: number;
  optimalUsage: number;
  wastedPercentage: number;
  monthlyCost: number;
  potentialSavings: number;
  recommendation: string;
}

export interface ScalingRecommendation {
  service: string;
  currentCapacity: number;
  recommendedCapacity: number;
  scalingAction: 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in';
  reason: string;
  priority: number;
  estimatedImpact: string;
}

export class CapacityPlanning extends EventEmitter {
  private metrics: ResourceMetric[] = [];
  private maxHistorySize: number = 10080; // 7 days of minute-by-minute data
  private forecasts: Map<string, CapacityForecast> = new Map();
  private optimizations: ResourceOptimization[] = [];

  constructor() {
    super();
  }

  /**
   * Add resource metric
   */
  addMetric(metric: ResourceMetric): void {
    this.metrics.push(metric);

    // Keep only recent data
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }

    // Trigger forecasting periodically
    if (this.metrics.length % 60 === 0) { // Every 60 metrics
      this.generateForecasts();
    }
  }

  /**
   * Generate capacity forecasts
   */
  generateForecasts(): void {
    if (this.metrics.length < 100) {
      logger.debug('Insufficient data for forecasting');
      return;
    }

    const resources: Array<'cpu' | 'memory' | 'disk' | 'network'> = ['cpu', 'memory', 'disk', 'network'];

    resources.forEach(resource => {
      const forecast = this.forecastResource(resource);
      if (forecast) {
        this.forecasts.set(resource, forecast);
        this.emit('forecast_generated', forecast);

        // Alert if critical
        if (forecast.urgency === 'critical') {
          logger.error('Critical capacity forecast', forecast);
          this.emit('capacity_alert', forecast);
        }
      }
    });
  }

  /**
   * Forecast specific resource
   */
  private forecastResource(resource: 'cpu' | 'memory' | 'disk' | 'network'): CapacityForecast | null {
    const values = this.metrics.map(m => m[resource]);
    const timestamps = this.metrics.map(m => m.timestamp);

    // Use multiple forecasting methods
    const linearForecast = this.linearRegressionForecast(values, 30); // 30 periods ahead
    const movingAvgForecast = this.movingAverageForecast(values, 30);
    const exponentialForecast = this.exponentialSmoothingForecast(values, 30);

    // Ensemble: weighted average of methods
    const predicted = linearForecast.map((val, idx) => 
      (val * 0.4 + movingAvgForecast[idx] * 0.3 + exponentialForecast[idx] * 0.3)
    );

    // Calculate confidence based on variance
    const variance = this.calculateVariance(values);
    const confidence = Math.max(0, Math.min(100, 100 - (variance * 10)));

    // Determine threshold and urgency
    const threshold = this.getThreshold(resource);
    const current = values[values.length - 1];
    const maxPredicted = Math.max(...predicted);

    const daysUntilThreshold = this.calculateDaysUntilThreshold(predicted, threshold, 60); // 1 metric per minute
    
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (daysUntilThreshold < 7) urgency = 'critical';
    else if (daysUntilThreshold < 14) urgency = 'high';
    else if (daysUntilThreshold < 30) urgency = 'medium';

    const recommendation = this.generateRecommendation(resource, current, maxPredicted, threshold, daysUntilThreshold);

    return {
      resource,
      current,
      predicted,
      timestamps: this.generateFutureTimestamps(timestamps[timestamps.length - 1], 30),
      confidence,
      threshold,
      daysUntilThreshold,
      recommendation,
      urgency,
    };
  }

  /**
   * Linear regression forecast
   */
  private linearRegressionForecast(values: number[], periods: number): number[] {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    const forecast: number[] = [];
    for (let i = 0; i < periods; i++) {
      forecast.push(Math.max(0, Math.min(100, slope * (n + i) + intercept)));
    }

    return forecast;
  }

  /**
   * Moving average forecast
   */
  private movingAverageForecast(values: number[], periods: number): number[] {
    const windowSize = Math.min(20, Math.floor(values.length / 5));
    const recentAvg = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;
    
    // Assume trend continues
    const trend = (recentAvg - values[values.length - windowSize]) / windowSize;
    
    const forecast: number[] = [];
    for (let i = 0; i < periods; i++) {
      forecast.push(Math.max(0, Math.min(100, recentAvg + trend * i)));
    }

    return forecast;
  }

  /**
   * Exponential smoothing forecast
   */
  private exponentialSmoothingForecast(values: number[], periods: number): number[] {
    const alpha = 0.3; // Smoothing factor
    let smoothed = values[0];

    // Calculate smoothed values
    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
    }

    // Forecast remains at last smoothed value with slight trend
    const lastValues = values.slice(-10);
    const trend = (lastValues[lastValues.length - 1] - lastValues[0]) / lastValues.length;

    const forecast: number[] = [];
    for (let i = 0; i < periods; i++) {
      forecast.push(Math.max(0, Math.min(100, smoothed + trend * i)));
    }

    return forecast;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Get threshold for resource
   */
  private getThreshold(resource: string): number {
    const thresholds: Record<string, number> = {
      cpu: 80,
      memory: 85,
      disk: 90,
      network: 80,
    };
    return thresholds[resource] || 80;
  }

  /**
   * Calculate days until threshold
   */
  private calculateDaysUntilThreshold(predicted: number[], threshold: number, metricsPerDay: number): number {
    for (let i = 0; i < predicted.length; i++) {
      if (predicted[i] >= threshold) {
        return (i / metricsPerDay) * 1440; // Convert to days
      }
    }
    return Infinity;
  }

  /**
   * Generate future timestamps
   */
  private generateFutureTimestamps(lastTimestamp: number, periods: number): number[] {
    const interval = 60000; // 1 minute
    return Array.from({ length: periods }, (_, i) => lastTimestamp + (i + 1) * interval);
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(resource: string, current: number, predicted: number, threshold: number, days: number): string {
    if (predicted >= threshold) {
      if (days < 7) {
        return `⚠️ URGENT: ${resource} will reach ${threshold}% in ${days.toFixed(0)} days. Immediate action required!`;
      } else if (days < 14) {
        return `⚠️ ${resource} will reach ${threshold}% in ${days.toFixed(0)} days. Plan capacity expansion.`;
      } else {
        return `ℹ️ ${resource} trending towards ${threshold}% in ${days.toFixed(0)} days. Monitor closely.`;
      }
    }

    if (current < 30 && predicted < 40) {
      return `💰 ${resource} is underutilized. Consider downsizing to reduce costs.`;
    }

    return `✅ ${resource} capacity is adequate for forecasted demand.`;
  }

  /**
   * Analyze resource optimization opportunities
   */
  analyzeOptimization(costPerUnit: Record<string, number> = {}): ResourceOptimization[] {
    const optimizations: ResourceOptimization[] = [];

    const defaultCosts = {
      cpu: 50,    // $50/vCPU/month
      memory: 5,  // $5/GB/month
      disk: 0.1,  // $0.10/GB/month
      network: 10, // $10/Mbps/month
    };

    const costs = { ...defaultCosts, ...costPerUnit };

    ['cpu', 'memory', 'disk', 'network'].forEach(resource => {
      const values = this.metrics.map(m => m[resource as keyof ResourceMetric] as number);
      if (values.length === 0) return;

      const avgUsage = values.reduce((a, b) => a + b, 0) / values.length;
      const p95Usage = this.calculatePercentile(values, 95);

      // If average is much lower than capacity, we're wasting resources
      if (avgUsage < 40 && p95Usage < 60) {
        const optimalUsage = p95Usage + 10; // 10% buffer
        const wastedPercentage = 100 - avgUsage;
        const monthlyCost = costs[resource as keyof typeof costs] * 100;
        const potentialSavings = (monthlyCost * wastedPercentage) / 100;

        optimizations.push({
          resource,
          currentUsage: avgUsage,
          optimalUsage,
          wastedPercentage,
          monthlyCost,
          potentialSavings,
          recommendation: `Right-size ${resource} to ${optimalUsage.toFixed(0)}% capacity. Save $${potentialSavings.toFixed(2)}/month`,
        });
      }
    });

    this.optimizations = optimizations;
    if (optimizations.length > 0) {
      this.emit('optimization_opportunities', optimizations);
    }

    return optimizations;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Generate scaling recommendations
   */
  generateScalingRecommendations(): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    this.forecasts.forEach((forecast, resource) => {
      if (forecast.urgency === 'critical' || forecast.urgency === 'high') {
        recommendations.push({
          service: 'infrastructure',
          currentCapacity: forecast.current,
          recommendedCapacity: Math.ceil(forecast.predicted[forecast.predicted.length - 1] * 1.2), // 20% buffer
          scalingAction: 'scale_up',
          reason: `${resource} predicted to reach ${forecast.threshold}% in ${forecast.daysUntilThreshold.toFixed(0)} days`,
          priority: forecast.urgency === 'critical' ? 1 : 2,
          estimatedImpact: 'Prevent resource exhaustion and service degradation',
        });
      }
    });

    this.optimizations.forEach(opt => {
      if (opt.potentialSavings > 50) {
        recommendations.push({
          service: 'infrastructure',
          currentCapacity: opt.currentUsage,
          recommendedCapacity: opt.optimalUsage,
          scalingAction: 'scale_down',
          reason: `${opt.resource} is underutilized (${opt.currentUsage.toFixed(0)}% avg usage)`,
          priority: 3,
          estimatedImpact: `Save $${opt.potentialSavings.toFixed(2)}/month`,
        });
      }
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all forecasts
   */
  getForecasts(): CapacityForecast[] {
    return Array.from(this.forecasts.values());
  }

  /**
   * Get optimization opportunities
   */
  getOptimizations(): ResourceOptimization[] {
    return this.optimizations;
  }

  /**
   * Export capacity plan
   */
  exportCapacityPlan(): any {
    return {
      timestamp: new Date().toISOString(),
      forecasts: this.getForecasts(),
      optimizations: this.getOptimizations(),
      scalingRecommendations: this.generateScalingRecommendations(),
      summary: {
        totalForecast: this.forecasts.size,
        criticalAlerts: Array.from(this.forecasts.values()).filter(f => f.urgency === 'critical').length,
        optimizationOpportunities: this.optimizations.length,
        potentialMonthlySavings: this.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0),
      },
    };
  }
}
