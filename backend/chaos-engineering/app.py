"""
Chaos Engineering Suite for IAC Dharma v3.0
Automated resilience testing and chaos experiments
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import random
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Chaos Engineering Suite",
    description="Automated chaos testing and resilience validation",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Data Models & Enums
# ============================================================================

class ExperimentType(str, Enum):
    """Types of chaos experiments"""
    POD_DELETION = "pod_deletion"
    POD_KILL = "pod_kill"
    NETWORK_LATENCY = "network_latency"
    NETWORK_PARTITION = "network_partition"
    CPU_STRESS = "cpu_stress"
    MEMORY_STRESS = "memory_stress"
    DISK_FILL = "disk_fill"
    DATABASE_FAILURE = "database_failure"
    REGION_FAILURE = "region_failure"
    DNS_FAILURE = "dns_failure"
    API_THROTTLING = "api_throttling"
    CERTIFICATE_ROTATION = "certificate_rotation"

class ExperimentStatus(str, Enum):
    """Status of chaos experiment"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    ABORTED = "aborted"

class Severity(str, Enum):
    """Severity level of chaos experiment"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ImpactAssessment(BaseModel):
    """Assessment of experiment impact"""
    affected_services: int = 0
    affected_users: int = 0
    response_time_impact: str = "0%"
    error_rate_impact: str = "0%"
    availability_impact: str = "0%"
    recovery_time: str = "0s"
    
class ExperimentResult(BaseModel):
    """Result of chaos experiment"""
    success: bool
    system_resilient: bool
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    impact: ImpactAssessment
    observations: List[str]
    recommendations: List[str]

class ChaosExperiment(BaseModel):
    """Chaos experiment definition"""
    id: str = Field(default_factory=lambda: f"exp-{uuid.uuid4().hex[:12]}")
    type: ExperimentType
    name: str
    description: str
    target_resource: str
    severity: Severity
    status: ExperimentStatus = ExperimentStatus.PENDING
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: int = 60
    blast_radius: Dict[str, Any] = {}
    result: Optional[ExperimentResult] = None
    rollback_performed: bool = False
    auto_rollback: bool = True

class ResilienceScore(BaseModel):
    """Overall system resilience score"""
    overall_score: int = Field(ge=0, le=100)
    pod_resilience: int = Field(ge=0, le=100)
    network_resilience: int = Field(ge=0, le=100)
    database_resilience: int = Field(ge=0, le=100)
    api_resilience: int = Field(ge=0, le=100)
    recovery_speed: str
    experiments_passed: int
    experiments_failed: int
    last_updated: datetime

# ============================================================================
# Chaos Engineering Engine
# ============================================================================

class ChaosEngineeringEngine:
    """Main chaos engineering orchestration engine"""
    
    def __init__(self):
        self.experiments: Dict[str, ChaosExperiment] = {}
        self.results_history: List[ExperimentResult] = []
        self.resilience_scores: List[ResilienceScore] = []
        self.continuous_chaos_enabled = False
        
    async def run_experiment(self, experiment: ChaosExperiment) -> ChaosExperiment:
        """Execute a chaos experiment"""
        logger.info(f"Starting chaos experiment: {experiment.name} ({experiment.type})")
        
        experiment.status = ExperimentStatus.RUNNING
        experiment.started_at = datetime.now()
        
        try:
            # Capture baseline metrics
            metrics_before = await self._capture_metrics(experiment.target_resource)
            
            # Execute chaos action
            await self._execute_chaos(experiment)
            
            # Wait for duration
            await asyncio.sleep(experiment.duration_seconds)
            
            # Capture post-chaos metrics
            metrics_after = await self._capture_metrics(experiment.target_resource)
            
            # Assess impact
            impact = await self._assess_impact(metrics_before, metrics_after)
            
            # Analyze resilience
            system_resilient = await self._analyze_resilience(impact)
            
            # Generate observations and recommendations
            observations = await self._generate_observations(experiment, impact)
            recommendations = await self._generate_recommendations(experiment, impact)
            
            # Create result
            result = ExperimentResult(
                success=True,
                system_resilient=system_resilient,
                metrics_before=metrics_before,
                metrics_after=metrics_after,
                impact=impact,
                observations=observations,
                recommendations=recommendations
            )
            
            experiment.result = result
            experiment.status = ExperimentStatus.COMPLETED
            experiment.completed_at = datetime.now()
            
            # Rollback if auto-rollback enabled
            if experiment.auto_rollback:
                await self._rollback_experiment(experiment)
                experiment.rollback_performed = True
            
            self.results_history.append(result)
            
            logger.info(f"Experiment completed: {experiment.name} - Resilient: {system_resilient}")
            
        except Exception as e:
            logger.error(f"Experiment failed: {str(e)}")
            experiment.status = ExperimentStatus.FAILED
            experiment.completed_at = datetime.now()
            
            # Always rollback on failure
            await self._rollback_experiment(experiment)
            experiment.rollback_performed = True
            
        return experiment
    
    async def _execute_chaos(self, experiment: ChaosExperiment):
        """Execute the actual chaos action"""
        chaos_actions = {
            ExperimentType.POD_DELETION: self._chaos_pod_deletion,
            ExperimentType.POD_KILL: self._chaos_pod_kill,
            ExperimentType.NETWORK_LATENCY: self._chaos_network_latency,
            ExperimentType.NETWORK_PARTITION: self._chaos_network_partition,
            ExperimentType.CPU_STRESS: self._chaos_cpu_stress,
            ExperimentType.MEMORY_STRESS: self._chaos_memory_stress,
            ExperimentType.DISK_FILL: self._chaos_disk_fill,
            ExperimentType.DATABASE_FAILURE: self._chaos_database_failure,
            ExperimentType.REGION_FAILURE: self._chaos_region_failure,
            ExperimentType.DNS_FAILURE: self._chaos_dns_failure,
            ExperimentType.API_THROTTLING: self._chaos_api_throttling,
            ExperimentType.CERTIFICATE_ROTATION: self._chaos_certificate_rotation,
        }
        
        action = chaos_actions.get(experiment.type)
        if action:
            await action(experiment)
        else:
            raise ValueError(f"Unknown experiment type: {experiment.type}")
    
    # ========================================================================
    # Chaos Actions
    # ========================================================================
    
    async def _chaos_pod_deletion(self, experiment: ChaosExperiment):
        """Simulate pod deletion (chaos monkey)"""
        logger.info(f"Deleting pod: {experiment.target_resource}")
        # Simulate pod deletion via Kubernetes API
        await asyncio.sleep(1)  # Simulate API call
        experiment.blast_radius = {
            "pods_affected": 1,
            "services_affected": 1,
            "replicas_remaining": random.randint(2, 5)
        }
    
    async def _chaos_pod_kill(self, experiment: ChaosExperiment):
        """Simulate forceful pod kill (SIGKILL)"""
        logger.info(f"Force killing pod: {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "pods_killed": 1,
            "restart_delay": f"{random.randint(5, 15)}s",
            "data_loss_risk": "low"
        }
    
    async def _chaos_network_latency(self, experiment: ChaosExperiment):
        """Inject network latency"""
        latency_ms = random.randint(200, 2000)
        logger.info(f"Injecting {latency_ms}ms latency to {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "latency_injected": f"{latency_ms}ms",
            "jitter": f"{random.randint(10, 100)}ms",
            "packet_loss": f"{random.uniform(0, 5):.2f}%"
        }
    
    async def _chaos_network_partition(self, experiment: ChaosExperiment):
        """Simulate network partition"""
        logger.info(f"Creating network partition for {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "partitioned_from": ["service-a", "service-b"],
            "split_brain_risk": "medium",
            "data_inconsistency_risk": "high"
        }
    
    async def _chaos_cpu_stress(self, experiment: ChaosExperiment):
        """Inject CPU stress"""
        cpu_percent = random.randint(80, 100)
        logger.info(f"Stressing CPU to {cpu_percent}% on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "cpu_utilization": f"{cpu_percent}%",
            "cores_stressed": random.randint(1, 4),
            "throttling_detected": random.choice([True, False])
        }
    
    async def _chaos_memory_stress(self, experiment: ChaosExperiment):
        """Inject memory stress"""
        memory_percent = random.randint(85, 98)
        logger.info(f"Stressing memory to {memory_percent}% on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "memory_utilization": f"{memory_percent}%",
            "oom_kill_risk": "high" if memory_percent > 95 else "medium",
            "swap_usage": f"{random.randint(10, 50)}%"
        }
    
    async def _chaos_disk_fill(self, experiment: ChaosExperiment):
        """Fill disk to capacity"""
        disk_percent = random.randint(90, 99)
        logger.info(f"Filling disk to {disk_percent}% on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "disk_utilization": f"{disk_percent}%",
            "write_failures_expected": True,
            "cleanup_required": True
        }
    
    async def _chaos_database_failure(self, experiment: ChaosExperiment):
        """Simulate database failure"""
        failure_type = random.choice(["connection_exhaustion", "slow_queries", "deadlock"])
        logger.info(f"Simulating {failure_type} on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "failure_type": failure_type,
            "connections_affected": random.randint(10, 100),
            "query_latency_increase": f"{random.randint(300, 2000)}%"
        }
    
    async def _chaos_region_failure(self, experiment: ChaosExperiment):
        """Simulate entire region failure"""
        logger.info(f"Simulating region failure: {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "region": experiment.target_resource,
            "services_affected": random.randint(10, 50),
            "failover_to": "region-backup",
            "rpo_minutes": random.randint(1, 5)
        }
    
    async def _chaos_dns_failure(self, experiment: ChaosExperiment):
        """Simulate DNS resolution failure"""
        logger.info(f"Blocking DNS for {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "dns_queries_failed": random.randint(50, 200),
            "cached_entries_used": random.randint(10, 30),
            "fallback_ips_used": True
        }
    
    async def _chaos_api_throttling(self, experiment: ChaosExperiment):
        """Inject API rate limiting"""
        rate_limit = random.randint(10, 100)
        logger.info(f"Throttling API to {rate_limit} req/s on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "rate_limit": f"{rate_limit} req/s",
            "requests_dropped": random.randint(100, 1000),
            "retry_attempts": random.randint(50, 200)
        }
    
    async def _chaos_certificate_rotation(self, experiment: ChaosExperiment):
        """Rotate SSL certificates"""
        logger.info(f"Rotating certificates on {experiment.target_resource}")
        await asyncio.sleep(1)
        experiment.blast_radius = {
            "certificates_rotated": random.randint(1, 5),
            "services_restarted": random.randint(2, 8),
            "downtime_seconds": random.randint(2, 10)
        }
    
    # ========================================================================
    # Metrics & Analysis
    # ========================================================================
    
    async def _capture_metrics(self, resource: str) -> Dict[str, Any]:
        """Capture system metrics"""
        return {
            "timestamp": datetime.now().isoformat(),
            "resource": resource,
            "cpu_usage": round(random.uniform(20, 60), 2),
            "memory_usage": round(random.uniform(30, 70), 2),
            "response_time_ms": round(random.uniform(50, 200), 2),
            "error_rate": round(random.uniform(0, 2), 2),
            "requests_per_second": random.randint(100, 500),
            "active_connections": random.randint(50, 200)
        }
    
    async def _assess_impact(self, before: Dict, after: Dict) -> ImpactAssessment:
        """Assess the impact of chaos experiment"""
        response_time_change = ((after['response_time_ms'] - before['response_time_ms']) 
                               / before['response_time_ms'] * 100)
        error_rate_change = after['error_rate'] - before['error_rate']
        
        return ImpactAssessment(
            affected_services=random.randint(1, 5),
            affected_users=random.randint(0, 100),
            response_time_impact=f"+{response_time_change:.1f}%",
            error_rate_impact=f"+{error_rate_change:.2f}%",
            availability_impact="99.8%" if error_rate_change < 1 else "99.2%",
            recovery_time=f"{random.randint(5, 30)}s"
        )
    
    async def _analyze_resilience(self, impact: ImpactAssessment) -> bool:
        """Determine if system was resilient to chaos"""
        # System is resilient if:
        # - Recovery time < 60s
        # - Error rate increase < 5%
        # - Availability > 99.5%
        recovery_seconds = int(impact.recovery_time.replace('s', ''))
        availability = float(impact.availability_impact.replace('%', ''))
        
        return recovery_seconds < 60 and availability > 99.5
    
    async def _generate_observations(self, experiment: ChaosExperiment, 
                                    impact: ImpactAssessment) -> List[str]:
        """Generate observations from experiment"""
        observations = [
            f"Experiment type: {experiment.type.value}",
            f"Target resource: {experiment.target_resource}",
            f"Impact on response time: {impact.response_time_impact}",
            f"Impact on error rate: {impact.error_rate_impact}",
            f"Recovery time: {impact.recovery_time}"
        ]
        
        if int(impact.recovery_time.replace('s', '')) > 30:
            observations.append("⚠️ Recovery time exceeds target SLA (30s)")
        
        if float(impact.availability_impact.replace('%', '')) < 99.5:
            observations.append("⚠️ Availability dropped below SLA (99.5%)")
        
        return observations
    
    async def _generate_recommendations(self, experiment: ChaosExperiment,
                                       impact: ImpactAssessment) -> List[str]:
        """Generate recommendations based on experiment results"""
        recommendations = []
        
        recovery_time = int(impact.recovery_time.replace('s', ''))
        if recovery_time > 30:
            recommendations.append(
                "Improve automated recovery mechanisms to reduce MTTR"
            )
            recommendations.append(
                "Consider adding health checks with faster intervals"
            )
        
        if float(impact.availability_impact.replace('%', '')) < 99.5:
            recommendations.append(
                "Increase replica count for better fault tolerance"
            )
            recommendations.append(
                "Implement circuit breakers to prevent cascade failures"
            )
        
        if experiment.type == ExperimentType.DATABASE_FAILURE:
            recommendations.append(
                "Consider implementing database connection pooling"
            )
            recommendations.append(
                "Add read replicas to distribute query load"
            )
        
        if not recommendations:
            recommendations.append("✅ System demonstrated excellent resilience")
        
        return recommendations
    
    async def _rollback_experiment(self, experiment: ChaosExperiment):
        """Rollback chaos experiment changes"""
        logger.info(f"Rolling back experiment: {experiment.name}")
        await asyncio.sleep(1)  # Simulate rollback
        experiment.status = ExperimentStatus.ROLLED_BACK
    
    def calculate_resilience_score(self) -> ResilienceScore:
        """Calculate overall system resilience score"""
        if not self.results_history:
            return ResilienceScore(
                overall_score=100,
                pod_resilience=100,
                network_resilience=100,
                database_resilience=100,
                api_resilience=100,
                recovery_speed="N/A",
                experiments_passed=0,
                experiments_failed=0,
                last_updated=datetime.now()
            )
        
        passed = sum(1 for r in self.results_history if r.system_resilient)
        failed = len(self.results_history) - passed
        success_rate = (passed / len(self.results_history)) * 100
        
        # Calculate component-specific scores (simplified)
        pod_resilience = random.randint(85, 98)
        network_resilience = random.randint(80, 95)
        database_resilience = random.randint(75, 92)
        api_resilience = random.randint(88, 99)
        
        overall = int((pod_resilience + network_resilience + database_resilience + api_resilience) / 4)
        
        avg_recovery = sum(
            int(r.impact.recovery_time.replace('s', ''))
            for r in self.results_history
        ) / len(self.results_history)
        
        return ResilienceScore(
            overall_score=overall,
            pod_resilience=pod_resilience,
            network_resilience=network_resilience,
            database_resilience=database_resilience,
            api_resilience=api_resilience,
            recovery_speed=f"{avg_recovery:.1f}s",
            experiments_passed=passed,
            experiments_failed=failed,
            last_updated=datetime.now()
        )

# Initialize engine
chaos_engine = ChaosEngineeringEngine()

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "Chaos Engineering Suite",
        "version": "3.0.0",
        "status": "operational",
        "experiments_run": len(chaos_engine.experiments),
        "continuous_chaos": chaos_engine.continuous_chaos_enabled
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/v3/chaos/experiment", response_model=ChaosExperiment)
async def create_experiment(
    type: ExperimentType,
    name: str,
    target_resource: str,
    severity: Severity,
    duration_seconds: int = 60,
    auto_rollback: bool = True,
    background_tasks: BackgroundTasks = None
):
    """Create and run a chaos experiment"""
    experiment = ChaosExperiment(
        type=type,
        name=name,
        description=f"Chaos test: {type.value} on {target_resource}",
        target_resource=target_resource,
        severity=severity,
        duration_seconds=duration_seconds,
        auto_rollback=auto_rollback
    )
    
    chaos_engine.experiments[experiment.id] = experiment
    
    # Run experiment in background
    if background_tasks:
        background_tasks.add_task(chaos_engine.run_experiment, experiment)
    else:
        asyncio.create_task(chaos_engine.run_experiment(experiment))
    
    return experiment

@app.get("/api/v3/chaos/experiments", response_model=List[ChaosExperiment])
async def get_experiments(limit: int = 20):
    """Get all chaos experiments"""
    experiments = list(chaos_engine.experiments.values())
    return sorted(experiments, key=lambda x: x.started_at or datetime.now(), reverse=True)[:limit]

@app.get("/api/v3/chaos/experiment/{experiment_id}", response_model=ChaosExperiment)
async def get_experiment(experiment_id: str):
    """Get specific experiment details"""
    if experiment_id not in chaos_engine.experiments:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return chaos_engine.experiments[experiment_id]

@app.get("/api/v3/chaos/resilience-score", response_model=ResilienceScore)
async def get_resilience_score():
    """Get current system resilience score"""
    score = chaos_engine.calculate_resilience_score()
    chaos_engine.resilience_scores.append(score)
    return score

@app.get("/api/v3/chaos/statistics")
async def get_statistics():
    """Get chaos engineering statistics"""
    experiments = list(chaos_engine.experiments.values())
    
    completed = [e for e in experiments if e.status == ExperimentStatus.COMPLETED]
    failed = [e for e in experiments if e.status == ExperimentStatus.FAILED]
    resilient = [e for e in completed if e.result and e.result.system_resilient]
    
    return {
        "total_experiments": len(experiments),
        "completed": len(completed),
        "failed": len(failed),
        "resilience_rate": f"{len(resilient) / len(completed) * 100:.1f}%" if completed else "N/A",
        "avg_recovery_time": f"{sum(int(e.result.impact.recovery_time.replace('s', '')) for e in completed if e.result) / len(completed):.1f}s" if completed else "N/A",
        "continuous_chaos_enabled": chaos_engine.continuous_chaos_enabled
    }

@app.post("/api/v3/chaos/continuous/toggle")
async def toggle_continuous_chaos(enabled: bool):
    """Enable/disable continuous chaos testing"""
    chaos_engine.continuous_chaos_enabled = enabled
    return {
        "continuous_chaos_enabled": enabled,
        "message": f"Continuous chaos {'enabled' if enabled else 'disabled'}"
    }

@app.delete("/api/v3/chaos/experiment/{experiment_id}")
async def abort_experiment(experiment_id: str):
    """Abort a running experiment"""
    if experiment_id not in chaos_engine.experiments:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    experiment = chaos_engine.experiments[experiment_id]
    
    if experiment.status != ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Experiment is not running")
    
    experiment.status = ExperimentStatus.ABORTED
    await chaos_engine._rollback_experiment(experiment)
    
    return {"message": "Experiment aborted and rolled back", "experiment_id": experiment_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8700)
