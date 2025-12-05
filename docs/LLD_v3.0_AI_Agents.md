# Low-Level Design: AI Agent Functions v3.0

## 1. Overview

**Purpose**: Intelligent agents for autonomous infrastructure management  
**Framework**: LangChain + GPT-4 + Custom Tools  
**Languages**: Python 3.11 + TypeScript

## 2. Agent Architecture

```
┌──────────────────────────────────────────────────────────┐
│               AI Agent System v3.0                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  Command   │  │ Planning   │  │  Execution       │ │
│  │  Parser    │→ │  Agent     │→ │  Agent           │ │
│  │  (GPT-4)   │  │ (Planner)  │  │  (Executor)      │ │
│  └────────────┘  └────────────┘  └──────────────────┘ │
│         ↓              ↓                   ↓            │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Tool Registry (20+ Tools)                 │ │
│  │  Infrastructure | Monitoring | Cost | Security   │ │
│  └───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 3. Core Agents

### 3.1 Command Interpreter Agent

Translates natural language to structured actions:

```python
# src/agents/command_interpreter.py

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any

class Action(BaseModel):
    """Structured action from natural language"""
    type: str = Field(description="Action type: create, update, delete, scale, etc.")
    resource: str = Field(description="Resource type: infrastructure, deployment, etc.")
    parameters: Dict[str, Any] = Field(description="Action parameters")
    description: str = Field(description="Human-readable action description")

class ActionPlan(BaseModel):
    """Complete action plan"""
    interpretation: str = Field(description="How the agent understood the command")
    actions: List[Action] = Field(description="List of actions to execute")
    confirmation_required: bool = Field(description="Whether user confirmation is needed")
    risk_level: str = Field(description="low, medium, high, critical")

class CommandInterpreterAgent:
    """Agent that interprets natural language commands"""
    
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            api_key=api_key
        )
        self.parser = PydanticOutputParser(pydantic_object=ActionPlan)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert infrastructure management assistant.
            
You interpret natural language commands and convert them to structured actions.

Available resource types:
- infrastructure: Cloud infrastructure (VMs, clusters, networks)
- deployment: Kubernetes deployments
- database: Database instances
- storage: Storage volumes and buckets
- monitoring: Alerts and dashboards
- security: Firewall rules, IAM policies

Available action types:
- create: Create new resources
- update: Modify existing resources
- delete: Remove resources
- scale: Scale up/down resources
- restart: Restart services
- backup: Create backups
- monitor: Set up monitoring

Risk Assessment:
- low: Read operations, monitoring setup
- medium: Create/update non-production resources
- high: Scale production resources, delete non-critical resources
- critical: Delete production resources, security changes

{format_instructions}
            """),
            ("user", "{command}")
        ])
    
    async def interpret(self, command: str) -> ActionPlan:
        """Interpret natural language command"""
        
        # Format prompt
        messages = self.prompt.format_messages(
            command=command,
            format_instructions=self.parser.get_format_instructions()
        )
        
        # Call LLM
        response = await self.llm.agenerate([messages])
        text = response.generations[0][0].text
        
        # Parse response
        action_plan = self.parser.parse(text)
        
        return action_plan

# Example Usage
async def main():
    agent = CommandInterpreterAgent(api_key="sk-...")
    
    command = """
    Create a production Kubernetes cluster on AWS in us-east-1 with:
    - 5 worker nodes (t3.large)
    - Autoscaling enabled (min: 3, max: 10)
    - Deploy my API service (image: myapp:v1.2.3)
    - Set up monitoring alerts for CPU > 80%
    """
    
    plan = await agent.interpret(command)
    
    print(f"Interpretation: {plan.interpretation}")
    print(f"Risk Level: {plan.risk_level}")
    print(f"Confirmation Required: {plan.confirmation_required}")
    print(f"\nActions:")
    for i, action in enumerate(plan.actions, 1):
        print(f"{i}. {action.type} {action.resource}")
        print(f"   {action.description}")
        print(f"   Parameters: {action.parameters}")
```

### 3.2 Planning Agent

Creates optimal execution plans:

```python
# src/agents/planning_agent.py

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from typing import List

class PlanningAgent:
    """Agent that creates execution plans"""
    
    def __init__(self, tools: List[Tool]):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert infrastructure planner.

Your job is to create optimal execution plans for infrastructure operations.

Consider:
1. Dependencies between actions
2. Parallelization opportunities
3. Rollback strategies
4. Cost optimization
5. Security best practices
6. Resource quotas and limits

Always:
- Check prerequisites before execution
- Plan for rollback if anything fails
- Estimate costs
- Validate against policies
- Consider dependencies
            """),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        self.agent = create_openai_functions_agent(
            llm=self.llm,
            tools=tools,
            prompt=self.prompt
        )
        
        self.executor = AgentExecutor(
            agent=self.agent,
            tools=tools,
            memory=self.memory,
            verbose=True,
            max_iterations=10
        )
    
    async def create_plan(self, actions: List[Action]) -> ExecutionPlan:
        """Create execution plan from actions"""
        
        # Convert actions to description
        actions_desc = "\n".join([
            f"{i+1}. {a.type} {a.resource}: {a.description}"
            for i, a in enumerate(actions)
        ])
        
        prompt = f"""
        Create an execution plan for these actions:
        
        {actions_desc}
        
        For each action:
        1. Check prerequisites
        2. Identify dependencies
        3. Estimate execution time and cost
        4. Plan rollback strategy
        5. Validate against policies
        
        Output a detailed execution plan.
        """
        
        result = await self.executor.ainvoke({"input": prompt})
        
        return self._parse_execution_plan(result["output"])
    
    def _parse_execution_plan(self, output: str) -> ExecutionPlan:
        """Parse LLM output into execution plan"""
        # Implementation to extract structured plan from LLM output
        pass
```

### 3.3 Execution Agent

Executes plans with monitoring and rollback:

```python
# src/agents/execution_agent.py

from typing import List, Callable, Dict, Any
import asyncio
from dataclasses import dataclass
from enum import Enum

class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

@dataclass
class ExecutionStep:
    id: str
    action: Action
    status: ExecutionStatus
    result: Any = None
    error: str = None
    started_at: datetime = None
    completed_at: datetime = None
    rollback_snapshot: Dict[str, Any] = None

class ExecutionAgent:
    """Agent that executes plans with monitoring and rollback"""
    
    def __init__(self, tools: Dict[str, Callable]):
        self.tools = tools
        self.execution_history: List[ExecutionStep] = []
        
    async def execute(
        self,
        plan: ExecutionPlan,
        callback: Callable[[ExecutionStep], None] = None
    ) -> List[ExecutionStep]:
        """Execute plan with monitoring"""
        
        steps = []
        
        try:
            # Execute actions in sequence or parallel based on dependencies
            for action in plan.actions:
                step = ExecutionStep(
                    id=f"step-{len(steps)}",
                    action=action,
                    status=ExecutionStatus.PENDING
                )
                steps.append(step)
                
                # Take snapshot for rollback
                step.rollback_snapshot = await self._take_snapshot(action)
                
                # Execute action
                step.status = ExecutionStatus.RUNNING
                step.started_at = datetime.now()
                
                if callback:
                    await callback(step)
                
                try:
                    # Get tool and execute
                    tool = self.tools.get(action.type)
                    if not tool:
                        raise ValueError(f"Tool not found: {action.type}")
                    
                    result = await tool(action.parameters)
                    
                    step.result = result
                    step.status = ExecutionStatus.COMPLETED
                    step.completed_at = datetime.now()
                    
                    if callback:
                        await callback(step)
                    
                except Exception as e:
                    step.status = ExecutionStatus.FAILED
                    step.error = str(e)
                    step.completed_at = datetime.now()
                    
                    if callback:
                        await callback(step)
                    
                    # Rollback all previous steps
                    await self._rollback(steps)
                    raise
            
            return steps
            
        finally:
            self.execution_history.extend(steps)
    
    async def _take_snapshot(self, action: Action) -> Dict[str, Any]:
        """Take snapshot of current state for rollback"""
        snapshot_tool = self.tools.get("take_snapshot")
        if snapshot_tool:
            return await snapshot_tool({
                "resource_type": action.resource,
                "resource_id": action.parameters.get("id")
            })
        return {}
    
    async def _rollback(self, steps: List[ExecutionStep]):
        """Rollback executed steps"""
        # Rollback in reverse order
        for step in reversed(steps):
            if step.status == ExecutionStatus.COMPLETED:
                try:
                    rollback_tool = self.tools.get("rollback")
                    if rollback_tool and step.rollback_snapshot:
                        await rollback_tool({
                            "action": step.action,
                            "snapshot": step.rollback_snapshot
                        })
                        step.status = ExecutionStatus.ROLLED_BACK
                except Exception as e:
                    logger.error(f"Rollback failed for step {step.id}: {e}")
```

## 4. Tool Registry

### 4.1 Infrastructure Tools

```python
# src/agents/tools/infrastructure.py

from langchain.tools import Tool
from typing import Dict, Any

async def create_infrastructure(params: Dict[str, Any]) -> Dict[str, Any]:
    """Create cloud infrastructure"""
    
    provider = params.get("provider")
    region = params.get("region")
    instance_type = params.get("instance_type")
    count = params.get("count", 1)
    
    # Call infrastructure API
    response = await infrastructure_api.create({
        "provider": provider,
        "region": region,
        "compute": {
            "instance_type": instance_type,
            "count": count
        }
    })
    
    return {
        "infrastructure_id": response["id"],
        "status": "creating",
        "estimated_time": "5 minutes",
        "estimated_cost": f"${response['estimated_monthly_cost']}/month"
    }

async def scale_deployment(params: Dict[str, Any]) -> Dict[str, Any]:
    """Scale Kubernetes deployment"""
    
    deployment_id = params.get("deployment_id")
    replicas = params.get("replicas")
    
    # Call Kubernetes API
    await k8s_api.scale_deployment(deployment_id, replicas)
    
    return {
        "deployment_id": deployment_id,
        "old_replicas": params.get("current_replicas"),
        "new_replicas": replicas,
        "status": "scaling"
    }

async def setup_monitoring(params: Dict[str, Any]) -> Dict[str, Any]:
    """Set up monitoring and alerts"""
    
    service = params.get("service")
    metric = params.get("metric")
    threshold = params.get("threshold")
    
    # Create alert rule
    alert = await monitoring_api.create_alert({
        "service": service,
        "metric": metric,
        "condition": f"> {threshold}",
        "notification_channels": ["slack", "email"]
    })
    
    return {
        "alert_id": alert["id"],
        "status": "active"
    }

# Define tools
infrastructure_tools = [
    Tool(
        name="create_infrastructure",
        func=create_infrastructure,
        description="Create cloud infrastructure (VMs, clusters, networks)"
    ),
    Tool(
        name="scale_deployment",
        func=scale_deployment,
        description="Scale Kubernetes deployments up or down"
    ),
    Tool(
        name="setup_monitoring",
        func=setup_monitoring,
        description="Set up monitoring alerts and dashboards"
    ),
]
```

### 4.2 Cost Optimization Tools

```python
# src/agents/tools/cost_optimization.py

async def analyze_costs(params: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze infrastructure costs"""
    
    timeframe = params.get("timeframe", "30d")
    
    # Fetch cost data
    costs = await cost_api.get_costs(timeframe)
    
    # Analyze with ML model
    analysis = await cost_analyzer.analyze(costs)
    
    return {
        "current_spend": analysis["total"],
        "breakdown": analysis["by_service"],
        "trend": analysis["trend"],
        "recommendations": analysis["recommendations"]
    }

async def optimize_resources(params: Dict[str, Any]) -> Dict[str, Any]:
    """Automatically optimize resources for cost"""
    
    resource_type = params.get("resource_type")
    
    # Get optimization recommendations
    recommendations = await optimizer.get_recommendations(resource_type)
    
    # Apply optimizations
    results = []
    for rec in recommendations:
        if rec["potential_savings"] > 100:  # Apply if saves > $100
            result = await optimizer.apply(rec)
            results.append(result)
    
    return {
        "optimizations_applied": len(results),
        "total_savings": sum(r["savings"] for r in results),
        "details": results
    }

cost_tools = [
    Tool(
        name="analyze_costs",
        func=analyze_costs,
        description="Analyze infrastructure costs and get optimization recommendations"
    ),
    Tool(
        name="optimize_resources",
        func=optimize_resources,
        description="Automatically optimize resources to reduce costs"
    ),
]
```

### 4.3 Security Tools

```python
# src/agents/tools/security.py

async def security_scan(params: Dict[str, Any]) -> Dict[str, Any]:
    """Run security scan on infrastructure"""
    
    resource_id = params.get("resource_id")
    scan_type = params.get("scan_type", "comprehensive")
    
    # Run security scan
    scan_result = await security_scanner.scan({
        "resource_id": resource_id,
        "scan_type": scan_type
    })
    
    return {
        "scan_id": scan_result["id"],
        "vulnerabilities": scan_result["vulnerabilities"],
        "severity_counts": scan_result["severity_counts"],
        "recommendations": scan_result["recommendations"]
    }

async def apply_security_policy(params: Dict[str, Any]) -> Dict[str, Any]:
    """Apply security policy to resources"""
    
    resource_id = params.get("resource_id")
    policy = params.get("policy")
    
    # Apply policy
    result = await security_api.apply_policy(resource_id, policy)
    
    return {
        "policy_id": result["id"],
        "status": "applied",
        "affected_resources": result["affected_resources"]
    }

security_tools = [
    Tool(
        name="security_scan",
        func=security_scan,
        description="Run security scans and vulnerability assessments"
    ),
    Tool(
        name="apply_security_policy",
        func=apply_security_policy,
        description="Apply security policies to infrastructure"
    ),
]
```

## 5. Multi-Agent Collaboration

### 5.1 Agent Orchestrator

```python
# src/agents/orchestrator.py

class AgentOrchestrator:
    """Orchestrates multiple agents for complex tasks"""
    
    def __init__(self):
        self.command_agent = CommandInterpreterAgent(api_key="...")
        self.planning_agent = PlanningAgent(tools=all_tools)
        self.execution_agent = ExecutionAgent(tools=tool_registry)
        self.monitoring_agent = MonitoringAgent()
    
    async def process_command(
        self,
        command: str,
        user_id: str,
        callback: Callable = None
    ) -> Dict[str, Any]:
        """Process natural language command end-to-end"""
        
        # Step 1: Interpret command
        action_plan = await self.command_agent.interpret(command)
        
        if callback:
            await callback({
                "stage": "interpretation",
                "data": action_plan.dict()
            })
        
        # Step 2: Check if confirmation needed
        if action_plan.confirmation_required:
            # Return for user confirmation
            return {
                "status": "awaiting_confirmation",
                "plan": action_plan.dict(),
                "confirmation_token": generate_token()
            }
        
        # Step 3: Create execution plan
        execution_plan = await self.planning_agent.create_plan(
            action_plan.actions
        )
        
        if callback:
            await callback({
                "stage": "planning",
                "data": execution_plan
            })
        
        # Step 4: Execute plan
        steps = await self.execution_agent.execute(
            execution_plan,
            callback=lambda step: callback({
                "stage": "execution",
                "data": step
            }) if callback else None
        )
        
        # Step 5: Monitor execution
        monitoring_task = asyncio.create_task(
            self.monitoring_agent.monitor(steps)
        )
        
        return {
            "status": "completed",
            "steps": [s.dict() for s in steps],
            "monitoring_task_id": monitoring_task.get_name()
        }
```

## 6. Learning & Improvement

### 6.1 Feedback Loop

```python
# src/agents/learning.py

class AgentLearningSystem:
    """System for agents to learn from feedback"""
    
    def __init__(self):
        self.feedback_db = FeedbackDatabase()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    async def record_execution(
        self,
        command: str,
        plan: ActionPlan,
        result: ExecutionResult
    ):
        """Record execution for learning"""
        
        await self.feedback_db.insert({
            "command": command,
            "plan": plan.dict(),
            "result": result.dict(),
            "success": result.success,
            "execution_time": result.execution_time,
            "timestamp": datetime.now()
        })
    
    async def get_similar_commands(
        self,
        command: str,
        limit: int = 5
    ) -> List[Dict]:
        """Get similar past commands for context"""
        
        # Encode command
        embedding = self.model.encode(command)
        
        # Search similar commands
        similar = await self.feedback_db.vector_search(
            embedding,
            limit=limit
        )
        
        return similar
    
    async def improve_plan(
        self,
        command: str,
        initial_plan: ActionPlan
    ) -> ActionPlan:
        """Improve plan based on past learnings"""
        
        # Get similar successful executions
        similar = await self.get_similar_commands(command)
        successful = [s for s in similar if s["success"]]
        
        if not successful:
            return initial_plan
        
        # Extract patterns from successful executions
        patterns = self._extract_patterns(successful)
        
        # Apply patterns to improve plan
        improved_plan = self._apply_patterns(initial_plan, patterns)
        
        return improved_plan
```

## 7. API Endpoints

### 7.1 Agent API

```python
# src/api/agent_api.py

from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/api/v3/ai/interpret")
async def interpret_command(request: CommandRequest):
    """Interpret natural language command"""
    agent = CommandInterpreterAgent(api_key=settings.OPENAI_API_KEY)
    plan = await agent.interpret(request.command)
    return plan.dict()

@app.post("/api/v3/ai/execute")
async def execute_plan(request: ExecutionRequest):
    """Execute action plan"""
    orchestrator = AgentOrchestrator()
    result = await orchestrator.process_command(
        request.command,
        request.user_id
    )
    return result

@app.websocket("/api/v3/ai/execute-stream")
async def execute_stream(websocket: WebSocket):
    """Execute with real-time updates"""
    await websocket.accept()
    
    try:
        # Receive command
        data = await websocket.receive_json()
        command = data["command"]
        
        orchestrator = AgentOrchestrator()
        
        # Execute with streaming updates
        async def callback(update):
            await websocket.send_json(update)
        
        result = await orchestrator.process_command(
            command,
            data["user_id"],
            callback=callback
        )
        
        await websocket.send_json({
            "type": "complete",
            "result": result
        })
        
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
    finally:
        await websocket.close()

@app.get("/api/v3/ai/suggestions")
async def get_suggestions(query: str):
    """Get AI suggestions for commands"""
    # Use GPT-4 to suggest commands
    suggestions = await generate_suggestions(query)
    return {"suggestions": suggestions}
```

## 8. Testing

### 8.1 Agent Tests

```python
# tests/agents/test_command_interpreter.py

import pytest
from src.agents.command_interpreter import CommandInterpreterAgent

@pytest.mark.asyncio
async def test_interpret_create_infrastructure():
    agent = CommandInterpreterAgent(api_key="test-key")
    
    command = "Create 3 AWS EC2 instances in us-east-1"
    plan = await agent.interpret(command)
    
    assert len(plan.actions) == 1
    assert plan.actions[0].type == "create"
    assert plan.actions[0].resource == "infrastructure"
    assert plan.actions[0].parameters["provider"] == "aws"
    assert plan.actions[0].parameters["count"] == 3

@pytest.mark.asyncio
async def test_risk_assessment():
    agent = CommandInterpreterAgent(api_key="test-key")
    
    # Low risk command
    plan1 = await agent.interpret("Show me all infrastructures")
    assert plan1.risk_level == "low"
    
    # Critical risk command
    plan2 = await agent.interpret("Delete all production databases")
    assert plan2.risk_level == "critical"
    assert plan2.confirmation_required == True
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
