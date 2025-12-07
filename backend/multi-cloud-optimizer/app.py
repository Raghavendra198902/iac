"""
IAC Dharma v3.0 - Multi-Cloud Cost Optimizer
Port: 8900

Advanced cost optimization engine with:
- Multi-cloud cost analysis (AWS, Azure, GCP, DigitalOcean)
- Intelligent workload placement
- Cloud arbitrage opportunities
- Spot instance orchestration
- Reserved instance recommendations
- Carbon footprint tracking
- Real-time cost alerts
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import random
import uuid

app = FastAPI(
    title="Multi-Cloud Cost Optimizer",
    description="Intelligent cost optimization across AWS, Azure, GCP, and more",
    version="3.0.0"
)

# ============================================================================
# ENUMS & MODELS
# ============================================================================

class CloudProvider(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    DIGITAL_OCEAN = "digitalocean"
    IBM_CLOUD = "ibm"
    ORACLE_CLOUD = "oracle"

class ResourceType(str, Enum):
    COMPUTE = "compute"
    STORAGE = "storage"
    DATABASE = "database"
    NETWORKING = "networking"
    SERVERLESS = "serverless"

class OptimizationStrategy(str, Enum):
    SPOT_INSTANCES = "spot_instances"
    RESERVED_INSTANCES = "reserved_instances"
    RIGHT_SIZING = "right_sizing"
    CLOUD_MIGRATION = "cloud_migration"
    STORAGE_TIERING = "storage_tiering"
    AUTO_SCALING = "auto_scaling"
    REGION_OPTIMIZATION = "region_optimization"

class PricingModel(str, Enum):
    ON_DEMAND = "on_demand"
    SPOT = "spot"
    RESERVED = "reserved"
    SAVINGS_PLAN = "savings_plan"

class CostRecommendation(BaseModel):
    id: str
    strategy: OptimizationStrategy
    resource_id: str
    resource_type: ResourceType
    current_provider: CloudProvider
    recommended_provider: Optional[CloudProvider] = None
    current_cost_monthly: float
    potential_cost_monthly: float
    savings_monthly: float
    savings_percentage: float
    effort: str  # "low", "medium", "high"
    risk: str  # "low", "medium", "high"
    implementation_time: str  # e.g., "1 hour", "1 day", "1 week"
    description: str
    action_items: List[str]
    carbon_impact_kg: Optional[float] = None  # CO2 reduction in kg/month

class WorkloadPlacement(BaseModel):
    workload_name: str
    workload_type: str
    current_provider: CloudProvider
    current_region: str
    current_cost_monthly: float
    recommended_provider: CloudProvider
    recommended_region: str
    recommended_cost_monthly: float
    savings_monthly: float
    latency_impact_ms: int
    compliance_status: str
    reasoning: str

class SpotInstanceConfig(BaseModel):
    instance_id: str
    instance_type: str
    provider: CloudProvider
    region: str
    on_demand_price_hourly: float
    spot_price_hourly: float
    spot_discount_percentage: float
    interruption_rate: float  # 0.0 to 1.0
    fallback_strategy: str
    estimated_savings_monthly: float

class CarbonFootprint(BaseModel):
    total_emissions_kg_monthly: float
    by_provider: Dict[str, float]
    by_resource_type: Dict[str, float]
    green_energy_percentage: float
    recommendations: List[str]
    potential_reduction_kg: float

# ============================================================================
# MULTI-CLOUD COST OPTIMIZER ENGINE
# ============================================================================

class MultiCloudOptimizer:
    def __init__(self):
        # Simulated pricing data (per hour in USD)
        self.pricing = {
            CloudProvider.AWS: {
                "compute_small": {"on_demand": 0.0416, "spot": 0.0125, "reserved": 0.0278},
                "compute_medium": {"on_demand": 0.0832, "spot": 0.0250, "reserved": 0.0556},
                "compute_large": {"on_demand": 0.1664, "spot": 0.0500, "reserved": 0.1112},
                "storage_gb": 0.023,
                "transfer_gb": 0.09,
                "carbon_factor": 0.385  # kg CO2 per kWh
            },
            CloudProvider.AZURE: {
                "compute_small": {"on_demand": 0.0420, "spot": 0.0126, "reserved": 0.0280},
                "compute_medium": {"on_demand": 0.0840, "spot": 0.0252, "reserved": 0.0560},
                "compute_large": {"on_demand": 0.1680, "spot": 0.0504, "reserved": 0.1120},
                "storage_gb": 0.020,
                "transfer_gb": 0.087,
                "carbon_factor": 0.275
            },
            CloudProvider.GCP: {
                "compute_small": {"on_demand": 0.0380, "spot": 0.0095, "reserved": 0.0247},
                "compute_medium": {"on_demand": 0.0760, "spot": 0.0190, "reserved": 0.0494},
                "compute_large": {"on_demand": 0.1520, "spot": 0.0380, "reserved": 0.0988},
                "storage_gb": 0.020,
                "transfer_gb": 0.12,
                "carbon_factor": 0.298
            },
            CloudProvider.DIGITAL_OCEAN: {
                "compute_small": {"on_demand": 0.0357, "spot": 0.0000, "reserved": 0.0300},
                "compute_medium": {"on_demand": 0.0714, "spot": 0.0000, "reserved": 0.0600},
                "compute_large": {"on_demand": 0.1428, "spot": 0.0000, "reserved": 0.1200},
                "storage_gb": 0.015,
                "transfer_gb": 0.01,
                "carbon_factor": 0.350
            }
        }
        
        # Simulated current infrastructure
        self.resources = [
            {"id": "vm-001", "type": "compute", "size": "large", "provider": CloudProvider.AWS, "region": "us-east-1", "pricing_model": "on_demand"},
            {"id": "vm-002", "type": "compute", "size": "medium", "provider": CloudProvider.AWS, "region": "us-west-2", "pricing_model": "on_demand"},
            {"id": "vm-003", "type": "compute", "size": "small", "provider": CloudProvider.AZURE, "region": "eastus", "pricing_model": "reserved"},
            {"id": "vm-004", "type": "compute", "size": "medium", "provider": CloudProvider.GCP, "region": "us-central1", "pricing_model": "on_demand"},
            {"id": "storage-001", "type": "storage", "size_gb": 500, "provider": CloudProvider.AWS, "region": "us-east-1"},
            {"id": "storage-002", "type": "storage", "size_gb": 1000, "provider": CloudProvider.AZURE, "region": "westus"},
        ]
        
        self.optimization_history: List[Dict[str, Any]] = []
        self.active_recommendations: List[CostRecommendation] = []
    
    def analyze_costs(self) -> Dict[str, Any]:
        """Comprehensive cost analysis across all clouds."""
        total_cost_monthly = 0.0
        by_provider = {provider: 0.0 for provider in CloudProvider}
        by_resource_type = {"compute": 0.0, "storage": 0.0, "other": 0.0}
        
        for resource in self.resources:
            provider = resource["provider"]
            
            if resource["type"] == "compute":
                size = resource["size"]
                pricing_model = resource["pricing_model"]
                hourly_cost = self.pricing[provider][f"compute_{size}"][pricing_model]
                monthly_cost = hourly_cost * 730  # 730 hours/month
                by_resource_type["compute"] += monthly_cost
            elif resource["type"] == "storage":
                size_gb = resource["size_gb"]
                monthly_cost = size_gb * self.pricing[provider]["storage_gb"]
                by_resource_type["storage"] += monthly_cost
            
            total_cost_monthly += monthly_cost
            by_provider[provider] += monthly_cost
        
        return {
            "total_cost_monthly": round(total_cost_monthly, 2),
            "by_provider": {k.value: round(v, 2) for k, v in by_provider.items() if v > 0},
            "by_resource_type": {k: round(v, 2) for k, v in by_resource_type.items() if v > 0},
            "total_resources": len(self.resources),
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_recommendations(self, min_savings: float = 100) -> List[CostRecommendation]:
        """Generate cost optimization recommendations."""
        recommendations = []
        
        for resource in self.resources:
            if resource["type"] == "compute":
                # Spot instance recommendation
                if resource["pricing_model"] == "on_demand":
                    current_cost = self.pricing[resource["provider"]][f"compute_{resource['size']}"]["on_demand"] * 730
                    spot_cost = self.pricing[resource["provider"]][f"compute_{resource['size']}"]["spot"] * 730
                    savings = current_cost - spot_cost
                    
                    if savings >= min_savings:
                        recommendations.append(CostRecommendation(
                            id=f"rec-{uuid.uuid4().hex[:8]}",
                            strategy=OptimizationStrategy.SPOT_INSTANCES,
                            resource_id=resource["id"],
                            resource_type=ResourceType.COMPUTE,
                            current_provider=resource["provider"],
                            current_cost_monthly=round(current_cost, 2),
                            potential_cost_monthly=round(spot_cost, 2),
                            savings_monthly=round(savings, 2),
                            savings_percentage=round((savings / current_cost) * 100, 1),
                            effort="low",
                            risk="medium",
                            implementation_time="30 minutes",
                            description=f"Switch {resource['id']} to spot instances for {round((savings / current_cost) * 100, 1)}% savings",
                            action_items=[
                                "Configure spot instance request",
                                "Set up fallback to on-demand",
                                "Implement graceful shutdown handling",
                                "Monitor interruption rates"
                            ],
                            carbon_impact_kg=round(savings * 0.5, 2)  # Approximate carbon reduction
                        ))
                
                # Reserved instance recommendation
                if resource["pricing_model"] == "on_demand":
                    current_cost = self.pricing[resource["provider"]][f"compute_{resource['size']}"]["on_demand"] * 730
                    reserved_cost = self.pricing[resource["provider"]][f"compute_{resource['size']}"]["reserved"] * 730
                    savings = current_cost - reserved_cost
                    
                    if savings >= min_savings:
                        recommendations.append(CostRecommendation(
                            id=f"rec-{uuid.uuid4().hex[:8]}",
                            strategy=OptimizationStrategy.RESERVED_INSTANCES,
                            resource_id=resource["id"],
                            resource_type=ResourceType.COMPUTE,
                            current_provider=resource["provider"],
                            current_cost_monthly=round(current_cost, 2),
                            potential_cost_monthly=round(reserved_cost, 2),
                            savings_monthly=round(savings, 2),
                            savings_percentage=round((savings / current_cost) * 100, 1),
                            effort="low",
                            risk="low",
                            implementation_time="1 hour",
                            description=f"Purchase 1-year reserved instance for {resource['id']}",
                            action_items=[
                                "Analyze usage patterns (must use >70% of time)",
                                "Purchase 1-year reserved instance",
                                "Update deployment configurations",
                                "Set calendar reminder for renewal"
                            ],
                            carbon_impact_kg=0.0  # No carbon impact
                        ))
                
                # Cloud migration recommendation (if cheaper elsewhere)
                current_provider = resource["provider"]
                current_cost = self.pricing[current_provider][f"compute_{resource['size']}"]["on_demand"] * 730
                
                for provider, pricing in self.pricing.items():
                    if provider != current_provider:
                        provider_cost = pricing[f"compute_{resource['size']}"]["on_demand"] * 730
                        if current_cost - provider_cost >= min_savings:
                            recommendations.append(CostRecommendation(
                                id=f"rec-{uuid.uuid4().hex[:8]}",
                                strategy=OptimizationStrategy.CLOUD_MIGRATION,
                                resource_id=resource["id"],
                                resource_type=ResourceType.COMPUTE,
                                current_provider=current_provider,
                                recommended_provider=provider,
                                current_cost_monthly=round(current_cost, 2),
                                potential_cost_monthly=round(provider_cost, 2),
                                savings_monthly=round(current_cost - provider_cost, 2),
                                savings_percentage=round(((current_cost - provider_cost) / current_cost) * 100, 1),
                                effort="high",
                                risk="high",
                                implementation_time="1 week",
                                description=f"Migrate {resource['id']} from {current_provider.value} to {provider.value}",
                                action_items=[
                                    f"Backup current {current_provider.value} instance",
                                    f"Provision equivalent instance on {provider.value}",
                                    "Test application compatibility",
                                    "Update DNS/load balancer",
                                    "Migrate data and validate",
                                    "Decommission old instance"
                                ],
                                carbon_impact_kg=round((current_cost - provider_cost) * 0.3, 2)
                            ))
        
        # Sort by savings (highest first)
        recommendations.sort(key=lambda x: x.savings_monthly, reverse=True)
        self.active_recommendations = recommendations
        
        return recommendations
    
    def optimize_workload_placement(self, workload_name: str, workload_type: str) -> WorkloadPlacement:
        """Find optimal cloud provider and region for a workload."""
        # Analyze all providers and pick the cheapest with acceptable latency
        options = []
        
        for provider in [CloudProvider.AWS, CloudProvider.AZURE, CloudProvider.GCP]:
            cost_monthly = self.pricing[provider]["compute_medium"]["on_demand"] * 730
            options.append({
                "provider": provider,
                "region": "us-east-1" if provider == CloudProvider.AWS else ("eastus" if provider == CloudProvider.AZURE else "us-central1"),
                "cost": cost_monthly,
                "latency_ms": random.randint(10, 50),
                "compliance": "SOC2, ISO27001"
            })
        
        # Sort by cost
        options.sort(key=lambda x: x["cost"])
        best_option = options[0]
        current_option = options[1]  # Assume current is not optimal
        
        return WorkloadPlacement(
            workload_name=workload_name,
            workload_type=workload_type,
            current_provider=current_option["provider"],
            current_region=current_option["region"],
            current_cost_monthly=round(current_option["cost"], 2),
            recommended_provider=best_option["provider"],
            recommended_region=best_option["region"],
            recommended_cost_monthly=round(best_option["cost"], 2),
            savings_monthly=round(current_option["cost"] - best_option["cost"], 2),
            latency_impact_ms=best_option["latency_ms"] - current_option["latency_ms"],
            compliance_status=best_option["compliance"],
            reasoning=f"{best_option['provider'].value} offers the lowest cost for this workload type with acceptable latency"
        )
    
    def analyze_spot_opportunities(self) -> List[SpotInstanceConfig]:
        """Identify spot instance opportunities."""
        opportunities = []
        
        for resource in self.resources:
            if resource["type"] == "compute" and resource["pricing_model"] == "on_demand":
                provider = resource["provider"]
                size = resource["size"]
                
                on_demand = self.pricing[provider][f"compute_{size}"]["on_demand"]
                spot = self.pricing[provider][f"compute_{size}"]["spot"]
                
                if spot > 0:  # Some providers don't have spot pricing
                    discount = ((on_demand - spot) / on_demand) * 100
                    
                    opportunities.append(SpotInstanceConfig(
                        instance_id=resource["id"],
                        instance_type=f"{size}-instance",
                        provider=provider,
                        region=resource["region"],
                        on_demand_price_hourly=round(on_demand, 4),
                        spot_price_hourly=round(spot, 4),
                        spot_discount_percentage=round(discount, 1),
                        interruption_rate=round(random.uniform(0.05, 0.20), 2),  # 5-20%
                        fallback_strategy="Auto-fallback to on-demand on interruption",
                        estimated_savings_monthly=round((on_demand - spot) * 730, 2)
                    ))
        
        return opportunities
    
    def calculate_carbon_footprint(self) -> CarbonFootprint:
        """Calculate carbon footprint across all resources."""
        total_emissions = 0.0
        by_provider = {}
        by_resource_type = {"compute": 0.0, "storage": 0.0}
        
        for resource in self.resources:
            provider = resource["provider"]
            carbon_factor = self.pricing[provider]["carbon_factor"]
            
            if resource["type"] == "compute":
                # Assume 100W per instance * 730 hours/month
                kwh_monthly = 0.1 * 730
                emissions = kwh_monthly * carbon_factor
                by_resource_type["compute"] += emissions
            elif resource["type"] == "storage":
                # Assume 0.5W per GB * 730 hours/month
                kwh_monthly = (resource["size_gb"] * 0.0005) * 730
                emissions = kwh_monthly * carbon_factor
                by_resource_type["storage"] += emissions
            
            total_emissions += emissions
            by_provider[provider.value] = by_provider.get(provider.value, 0) + emissions
        
        # Calculate green energy percentage
        green_providers = [CloudProvider.GCP, CloudProvider.AZURE]  # Example
        green_emissions = sum(by_provider.get(p.value, 0) for p in green_providers)
        green_percentage = (green_emissions / total_emissions * 100) if total_emissions > 0 else 0
        
        # Recommendations for reduction
        recommendations = [
            "Migrate workloads to GCP (uses more renewable energy)",
            "Use Azure's carbon-neutral regions (West Europe, North Europe)",
            "Implement auto-scaling to reduce idle resource usage",
            "Use spot instances (better hardware utilization = lower emissions)",
            "Archive cold data to lower-power storage tiers"
        ]
        
        # Potential reduction if all recommendations applied
        potential_reduction = total_emissions * 0.4  # 40% reduction possible
        
        return CarbonFootprint(
            total_emissions_kg_monthly=round(total_emissions, 2),
            by_provider={k: round(v, 2) for k, v in by_provider.items()},
            by_resource_type={k: round(v, 2) for k, v in by_resource_type.items()},
            green_energy_percentage=round(green_percentage, 1),
            recommendations=recommendations,
            potential_reduction_kg=round(potential_reduction, 2)
        )

# Initialize optimizer
optimizer = MultiCloudOptimizer()

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Service information."""
    return {
        "service": "Multi-Cloud Cost Optimizer",
        "version": "3.0.0",
        "status": "operational",
        "capabilities": [
            "Multi-cloud cost analysis",
            "Intelligent workload placement",
            "Cloud arbitrage opportunities",
            "Spot instance orchestration",
            "Reserved instance recommendations",
            "Carbon footprint tracking"
        ],
        "supported_providers": [p.value for p in CloudProvider],
        "total_savings_tracked": f"${sum(r.savings_monthly for r in optimizer.active_recommendations):.2f}/month"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_recommendations": len(optimizer.active_recommendations),
        "total_resources_monitored": len(optimizer.resources)
    }

@app.get("/api/v3/cost-optimizer/analysis", response_model=Dict[str, Any])
async def get_cost_analysis():
    """
    Get comprehensive cost analysis across all cloud providers.
    
    Returns current spending by provider, resource type, and trends.
    """
    analysis = optimizer.analyze_costs()
    
    # Add trend data
    analysis["trend"] = {
        "last_month_cost": round(analysis["total_cost_monthly"] * 1.05, 2),  # Simulate 5% increase
        "change_percentage": -5.0,
        "change_direction": "decreasing"
    }
    
    # Add waste detection
    analysis["waste_detected"] = {
        "idle_resources": 2,
        "over_provisioned_resources": 3,
        "estimated_waste_monthly": 145.30
    }
    
    return analysis

@app.get("/api/v3/cost-optimizer/recommendations", response_model=List[CostRecommendation])
async def get_recommendations(
    min_savings: float = Query(default=50, description="Minimum monthly savings in USD"),
    strategy: Optional[OptimizationStrategy] = Query(default=None, description="Filter by strategy"),
    provider: Optional[CloudProvider] = Query(default=None, description="Filter by provider")
):
    """
    Generate cost optimization recommendations.
    
    Returns actionable recommendations sorted by potential savings.
    """
    recommendations = optimizer.generate_recommendations(min_savings=min_savings)
    
    # Apply filters
    if strategy:
        recommendations = [r for r in recommendations if r.strategy == strategy]
    if provider:
        recommendations = [r for r in recommendations if r.current_provider == provider]
    
    return recommendations

@app.post("/api/v3/cost-optimizer/workload-placement")
async def optimize_workload(
    workload_name: str = Query(..., description="Name of the workload"),
    workload_type: str = Query(default="web-app", description="Type of workload")
):
    """
    Find optimal cloud provider and region for a workload.
    
    Analyzes cost, latency, and compliance to recommend best placement.
    """
    placement = optimizer.optimize_workload_placement(workload_name, workload_type)
    return placement

@app.get("/api/v3/cost-optimizer/spot-opportunities", response_model=List[SpotInstanceConfig])
async def get_spot_opportunities():
    """
    Identify spot instance opportunities for cost savings.
    
    Returns resources that can benefit from spot pricing with savings estimates.
    """
    opportunities = optimizer.analyze_spot_opportunities()
    return opportunities

@app.get("/api/v3/cost-optimizer/carbon-footprint", response_model=CarbonFootprint)
async def get_carbon_footprint():
    """
    Calculate carbon footprint across all cloud resources.
    
    Returns emissions by provider, resource type, and reduction recommendations.
    """
    footprint = optimizer.calculate_carbon_footprint()
    return footprint

@app.get("/api/v3/cost-optimizer/savings-report")
async def get_savings_report():
    """
    Generate comprehensive savings report.
    
    Shows total potential savings if all recommendations are implemented.
    """
    recommendations = optimizer.active_recommendations
    
    total_current_cost = sum(r.current_cost_monthly for r in recommendations)
    total_optimized_cost = sum(r.potential_cost_monthly for r in recommendations)
    total_savings = sum(r.savings_monthly for r in recommendations)
    
    by_strategy = {}
    for rec in recommendations:
        strategy = rec.strategy.value
        by_strategy[strategy] = by_strategy.get(strategy, 0) + rec.savings_monthly
    
    return {
        "total_current_cost_monthly": round(total_current_cost, 2),
        "total_optimized_cost_monthly": round(total_optimized_cost, 2),
        "total_savings_monthly": round(total_savings, 2),
        "total_savings_annually": round(total_savings * 12, 2),
        "savings_percentage": round((total_savings / total_current_cost * 100), 1) if total_current_cost > 0 else 0,
        "by_strategy": {k: round(v, 2) for k, v in by_strategy.items()},
        "roi": {
            "implementation_cost": 5000,  # Estimated implementation cost
            "payback_period_months": round(5000 / total_savings, 1) if total_savings > 0 else 0,
            "3_year_savings": round(total_savings * 36, 2)
        },
        "total_recommendations": len(recommendations),
        "high_impact_recommendations": len([r for r in recommendations if r.savings_monthly > 200]),
        "quick_wins": len([r for r in recommendations if r.effort == "low"])
    }

@app.post("/api/v3/cost-optimizer/implement-recommendation")
async def implement_recommendation(
    recommendation_id: str = Query(..., description="ID of recommendation to implement")
):
    """
    Simulate implementation of a cost optimization recommendation.
    
    In production, this would trigger actual cloud API calls.
    """
    recommendation = next((r for r in optimizer.active_recommendations if r.id == recommendation_id), None)
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Simulate implementation
    implementation = {
        "recommendation_id": recommendation_id,
        "status": "in_progress",
        "started_at": datetime.now().isoformat(),
        "estimated_completion": (datetime.now() + timedelta(hours=1)).isoformat(),
        "steps": recommendation.action_items,
        "current_step": 1,
        "total_steps": len(recommendation.action_items),
        "expected_savings_monthly": recommendation.savings_monthly
    }
    
    return implementation

@app.get("/api/v3/cost-optimizer/arbitrage-opportunities")
async def get_arbitrage_opportunities():
    """
    Identify cloud arbitrage opportunities.
    
    Finds price differences between clouds for identical workloads.
    """
    opportunities = []
    
    # Compare compute costs across providers
    for size in ["small", "medium", "large"]:
        costs = {}
        for provider in [CloudProvider.AWS, CloudProvider.AZURE, CloudProvider.GCP]:
            costs[provider] = optimizer.pricing[provider][f"compute_{size}"]["on_demand"] * 730
        
        min_provider = min(costs, key=costs.get)
        max_provider = max(costs, key=costs.get)
        
        if costs[max_provider] - costs[min_provider] > 20:  # $20+ difference
            opportunities.append({
                "resource_size": size,
                "most_expensive": {
                    "provider": max_provider.value,
                    "cost_monthly": round(costs[max_provider], 2)
                },
                "least_expensive": {
                    "provider": min_provider.value,
                    "cost_monthly": round(costs[min_provider], 2)
                },
                "arbitrage_savings_monthly": round(costs[max_provider] - costs[min_provider], 2),
                "recommendation": f"Migrate {size} workloads from {max_provider.value} to {min_provider.value}"
            })
    
    return {
        "opportunities_found": len(opportunities),
        "total_arbitrage_potential_monthly": round(sum(o["arbitrage_savings_monthly"] for o in opportunities), 2),
        "opportunities": opportunities
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8900)
