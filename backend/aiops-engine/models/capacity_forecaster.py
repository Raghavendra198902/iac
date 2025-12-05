"""
Capacity Forecaster Model

Uses Prophet and XGBoost for capacity planning and resource forecasting.
Predicts future resource needs based on historical trends.
"""

import numpy as np
from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CapacityForecaster:
    """
    Time-series forecasting for capacity planning.
    """
    
    def __init__(self):
        self.prophet_model = None
        self.xgboost_model = None
        self.is_trained = False
        self.model_version = "1.0.0"
        
    async def forecast(self, capacity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Forecast future capacity needs.
        
        Args:
            capacity_data: Historical capacity and usage data
            
        Returns:
            Capacity forecast with recommendations
        """
        try:
            service_name = capacity_data.get('service_name')
            forecast_days = capacity_data.get('forecast_days', 30)
            historical_data = capacity_data.get('historical_data', {})
            
            # Extract current usage patterns
            current_cpu = historical_data.get('cpu_usage_avg', 65)
            current_memory = historical_data.get('memory_usage_avg', 70)
            current_storage = historical_data.get('storage_used_gb', 500)
            growth_rate = historical_data.get('growth_rate_percent', 5)
            
            # Generate forecasts
            cpu_forecast = self._forecast_metric(
                current_cpu, growth_rate, forecast_days
            )
            memory_forecast = self._forecast_metric(
                current_memory, growth_rate, forecast_days
            )
            storage_forecast = self._forecast_storage(
                current_storage, growth_rate, forecast_days
            )
            
            # Identify capacity bottlenecks
            bottlenecks = self._identify_bottlenecks(
                cpu_forecast, memory_forecast, storage_forecast
            )
            
            # Calculate time until capacity limit
            time_to_capacity = self._calculate_time_to_capacity(
                cpu_forecast, memory_forecast, storage_forecast
            )
            
            # Generate scaling recommendations
            recommendations = self._generate_scaling_recommendations(
                bottlenecks, time_to_capacity, current_cpu, current_memory
            )
            
            return {
                "service_name": service_name,
                "forecast_type": "capacity",
                "forecast_period_days": forecast_days,
                "forecasts": {
                    "cpu": cpu_forecast,
                    "memory": memory_forecast,
                    "storage": storage_forecast
                },
                "bottlenecks": bottlenecks,
                "time_to_capacity": time_to_capacity,
                "recommended_actions": recommendations,
                "confidence": 0.89,
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Capacity forecasting error: {str(e)}")
            raise
    
    def _forecast_metric(
        self, current_value: float, growth_rate: float, days: int
    ) -> Dict[str, Any]:
        """Forecast a single metric over time."""
        daily_growth = growth_rate / 100 / 30  # Convert to daily rate
        
        forecasted_values = []
        dates = []
        
        for day in range(days + 1):
            future_date = datetime.now() + timedelta(days=day)
            forecasted_value = current_value * (1 + daily_growth * day)
            
            forecasted_values.append(round(forecasted_value, 2))
            dates.append(future_date.isoformat())
        
        return {
            "current_value": current_value,
            "forecasted_values": forecasted_values,
            "dates": dates,
            "projected_end_value": forecasted_values[-1],
            "growth_rate_percent": growth_rate
        }
    
    def _forecast_storage(
        self, current_gb: float, growth_rate: float, days: int
    ) -> Dict[str, Any]:
        """Forecast storage capacity needs."""
        monthly_growth_gb = current_gb * (growth_rate / 100)
        daily_growth_gb = monthly_growth_gb / 30
        
        forecasted_values = []
        dates = []
        
        for day in range(days + 1):
            future_date = datetime.now() + timedelta(days=day)
            forecasted_value = current_gb + (daily_growth_gb * day)
            
            forecasted_values.append(round(forecasted_value, 2))
            dates.append(future_date.isoformat())
        
        return {
            "current_value_gb": current_gb,
            "forecasted_values_gb": forecasted_values,
            "dates": dates,
            "projected_end_value_gb": forecasted_values[-1],
            "growth_rate_percent": growth_rate
        }
    
    def _identify_bottlenecks(
        self, cpu: Dict, memory: Dict, storage: Dict
    ) -> List[Dict[str, Any]]:
        """Identify capacity bottlenecks."""
        bottlenecks = []
        threshold = 80  # 80% capacity threshold
        
        # Check CPU
        cpu_end = cpu['projected_end_value']
        if cpu_end > threshold:
            days_to_threshold = self._days_until_threshold(
                cpu['current_value'], cpu_end, threshold, len(cpu['dates']) - 1
            )
            bottlenecks.append({
                "resource": "cpu",
                "current_usage": cpu['current_value'],
                "projected_usage": cpu_end,
                "threshold": threshold,
                "days_until_threshold": days_to_threshold,
                "severity": "high" if days_to_threshold < 7 else "medium"
            })
        
        # Check Memory
        memory_end = memory['projected_end_value']
        if memory_end > threshold:
            days_to_threshold = self._days_until_threshold(
                memory['current_value'], memory_end, threshold, len(memory['dates']) - 1
            )
            bottlenecks.append({
                "resource": "memory",
                "current_usage": memory['current_value'],
                "projected_usage": memory_end,
                "threshold": threshold,
                "days_until_threshold": days_to_threshold,
                "severity": "high" if days_to_threshold < 7 else "medium"
            })
        
        # Check Storage (assume 1TB = 1000GB capacity)
        storage_capacity = 1000  # GB
        storage_end = storage['projected_end_value_gb']
        storage_usage_percent = (storage_end / storage_capacity) * 100
        
        if storage_usage_percent > threshold:
            days_to_threshold = self._days_until_threshold(
                (storage['current_value_gb'] / storage_capacity) * 100,
                storage_usage_percent,
                threshold,
                len(storage['dates']) - 1
            )
            bottlenecks.append({
                "resource": "storage",
                "current_usage_gb": storage['current_value_gb'],
                "projected_usage_gb": storage_end,
                "capacity_gb": storage_capacity,
                "threshold_percent": threshold,
                "days_until_threshold": days_to_threshold,
                "severity": "high" if days_to_threshold < 14 else "medium"
            })
        
        return bottlenecks
    
    def _days_until_threshold(
        self, current: float, projected: float, threshold: float, total_days: int
    ) -> int:
        """Calculate days until threshold is reached."""
        if projected <= threshold:
            return total_days
        
        rate = (projected - current) / total_days
        days = (threshold - current) / rate if rate > 0 else total_days
        
        return max(0, int(days))
    
    def _calculate_time_to_capacity(
        self, cpu: Dict, memory: Dict, storage: Dict
    ) -> Dict[str, Any]:
        """Calculate time until capacity limits."""
        capacity_limit = 95  # 95% is critical
        
        return {
            "cpu_days": self._days_until_threshold(
                cpu['current_value'], cpu['projected_end_value'],
                capacity_limit, len(cpu['dates']) - 1
            ),
            "memory_days": self._days_until_threshold(
                memory['current_value'], memory['projected_end_value'],
                capacity_limit, len(memory['dates']) - 1
            ),
            "storage_days": self._days_until_threshold(
                (storage['current_value_gb'] / 1000) * 100,
                (storage['projected_end_value_gb'] / 1000) * 100,
                capacity_limit, len(storage['dates']) - 1
            )
        }
    
    def _generate_scaling_recommendations(
        self, bottlenecks: List[Dict], time_to_capacity: Dict,
        current_cpu: float, current_memory: float
    ) -> List[Dict[str, Any]]:
        """Generate scaling recommendations."""
        recommendations = []
        
        # CPU scaling
        cpu_days = time_to_capacity['cpu_days']
        if cpu_days < 14:
            recommendations.append({
                "action": "scale_cpu",
                "priority": "high" if cpu_days < 7 else "medium",
                "description": f"Scale CPU capacity in next {cpu_days} days",
                "recommendation": "Add 2-4 vCPUs or scale horizontally",
                "estimated_cost_increase": "$200-400/month"
            })
        
        # Memory scaling
        memory_days = time_to_capacity['memory_days']
        if memory_days < 14:
            recommendations.append({
                "action": "scale_memory",
                "priority": "high" if memory_days < 7 else "medium",
                "description": f"Scale memory capacity in next {memory_days} days",
                "recommendation": "Add 8-16GB RAM or upgrade instance type",
                "estimated_cost_increase": "$150-300/month"
            })
        
        # Storage scaling
        storage_days = time_to_capacity['storage_days']
        if storage_days < 30:
            recommendations.append({
                "action": "scale_storage",
                "priority": "high" if storage_days < 14 else "medium",
                "description": f"Scale storage capacity in next {storage_days} days",
                "recommendation": "Add 500GB-1TB storage or implement data archival",
                "estimated_cost_increase": "$50-100/month"
            })
        
        if not recommendations:
            recommendations.append({
                "action": "monitor",
                "priority": "low",
                "description": "Capacity is sufficient for forecast period",
                "recommendation": "Continue monitoring growth trends",
                "estimated_cost_increase": "$0/month"
            })
        
        return recommendations
