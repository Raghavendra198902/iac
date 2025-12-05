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

### 3.1 Enhanced Command Interpreter Agent

Advanced NLP agent with context awareness, intent classification, and multi-turn conversation:

```python
# src/agents/command_interpreter.py

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.memory import ConversationBufferWindowMemory
from langchain.embeddings import OpenAIEmbeddings
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
import re
from datetime import datetime
from enum import Enum

class IntentType(str, Enum):
    """Command intent classification"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    SCALE = "scale"
    MONITOR = "monitor"
    OPTIMIZE = "optimize"
    TROUBLESHOOT = "troubleshoot"
    QUERY = "query"

class ConfidenceLevel(str, Enum):
    """Interpretation confidence"""
    HIGH = "high"        # 90-100%
    MEDIUM = "medium"    # 70-89%
    LOW = "low"          # 50-69%
    UNCLEAR = "unclear"  # <50%

class Action(BaseModel):
    """Structured action from natural language"""
    type: str = Field(description="Action type: create, update, delete, scale, etc.")
    resource: str = Field(description="Resource type: infrastructure, deployment, etc.")
    parameters: Dict[str, Any] = Field(description="Action parameters")
    description: str = Field(description="Human-readable action description")
    estimated_duration: Optional[str] = Field(default=None, description="Estimated completion time")
    estimated_cost: Optional[float] = Field(default=None, description="Estimated cost in USD")
    dependencies: List[str] = Field(default_factory=list, description="Dependent action IDs")
    prerequisites: List[str] = Field(default_factory=list, description="Required conditions")
    rollback_strategy: Optional[str] = Field(default=None, description="How to rollback if fails")

class ActionPlan(BaseModel):
    """Complete action plan with enhanced metadata"""
    interpretation: str = Field(description="How the agent understood the command")
    intent: IntentType = Field(description="Primary intent of the command")
    confidence: ConfidenceLevel = Field(description="Confidence in interpretation")
    actions: List[Action] = Field(description="List of actions to execute")
    confirmation_required: bool = Field(description="Whether user confirmation is needed")
    risk_level: str = Field(description="low, medium, high, critical")
    total_estimated_cost: float = Field(default=0.0, description="Total estimated cost")
    total_estimated_duration: str = Field(default="unknown", description="Total duration")
    affected_resources: List[str] = Field(default_factory=list, description="Resources that will be affected")
    warnings: List[str] = Field(default_factory=list, description="Warnings or concerns")
    clarifying_questions: List[str] = Field(default_factory=list, description="Questions if unclear")
    suggested_alternatives: List[str] = Field(default_factory=list, description="Alternative approaches")
    
    @validator('actions')
    def validate_actions_not_empty(cls, v):
        if not v:
            raise ValueError("Action plan must contain at least one action")
        return v

class CommandInterpreterAgent:
    """Enhanced agent with context, learning, and clarification"""
    
    def __init__(self, api_key: str, user_context: Optional[Dict] = None):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo",
            temperature=0.1,
            api_key=api_key
        )
        
        # Memory for context tracking
        self.memory = ConversationBufferWindowMemory(
            k=10,  # Remember last 10 interactions
            return_messages=True,
            memory_key="chat_history"
        )
        
        # Embeddings for semantic search
        self.embeddings = OpenAIEmbeddings(api_key=api_key)
        
        # User context (permissions, preferences, history)
        self.user_context = user_context or {}
        
        self.parser = PydanticOutputParser(pydantic_object=ActionPlan)
        
        self.system_prompt = """You are an expert AI infrastructure management assistant with deep knowledge of:
- Cloud providers (AWS, GCP, Azure, DigitalOcean)
- Kubernetes and container orchestration
- Infrastructure as Code (Terraform, CloudFormation, Pulumi)
- CI/CD pipelines and DevOps best practices
- Cost optimization strategies
- Security and compliance (SOC2, HIPAA, PCI-DSS)
- Monitoring and observability (Prometheus, Grafana, ELK)

## Your Capabilities:

1. **Intent Recognition**: Accurately identify what the user wants to accomplish
2. **Context Awareness**: Use conversation history and user context
3. **Intelligent Clarification**: Ask specific questions when command is ambiguous
4. **Risk Assessment**: Evaluate potential impact and risks
5. **Cost Estimation**: Provide cost estimates before execution
6. **Alternative Suggestions**: Propose better or cheaper alternatives
7. **Dependency Analysis**: Identify dependencies between actions
8. **Rollback Planning**: Always plan for failure scenarios

## Resource Types:
- infrastructure: VMs, clusters, networks, VPCs
- deployment: Kubernetes deployments, services, pods
- database: RDS, Aurora, MongoDB, PostgreSQL
- storage: S3, EBS, persistent volumes
- monitoring: CloudWatch, Prometheus, alerts
- security: IAM, security groups, policies
- networking: Load balancers, VPNs, DNS

## Action Types:
- create: Provision new resources
- read/query: Retrieve information
- update: Modify existing resources
- delete: Remove resources
- scale: Adjust capacity (horizontal/vertical)
- restart: Restart services
- backup: Create backups
- monitor: Set up monitoring/alerts
- optimize: Improve performance/cost

## Risk Assessment Guidelines:
- **low**: Read operations, monitoring, non-critical dev resources
- **medium**: Create/update dev/staging, scale non-production
- **high**: Scale production, update production configs, delete non-critical prod
- **critical**: Delete production databases, security changes, VPC modifications

## Confidence Levels:
- **high** (90-100%): Clear, unambiguous command with all details
- **medium** (70-89%): Mostly clear, minor assumptions needed
- **low** (50-69%): Significant assumptions required
- **unclear** (<50%): Need clarification from user

## User Context:
{user_context}

## Instructions:
1. Parse the command carefully
2. Identify the primary intent
3. Check if you have all required information
4. If unclear, add specific clarifying_questions
5. Assess risk level accurately
6. Estimate costs when possible
7. Suggest alternatives if there's a better way
8. Plan rollback strategy for risky operations
9. Check user permissions against action requirements

{format_instructions}"""
    
    async def interpret(
        self, 
        command: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ActionPlan:
        """Interpret natural language command with enhanced context"""
        
        # Merge additional context
        full_context = {**self.user_context, **(context or {})}
        
        # Add conversation history to context
        chat_history = self.memory.load_memory_variables({})
        
        # Format prompt with context
        messages = [
            ("system", self.system_prompt.format(
                user_context=self._format_user_context(full_context),
                format_instructions=self.parser.get_format_instructions()
            )),
        ]
        
        # Add chat history if exists
        if chat_history.get("chat_history"):
            messages.extend([
                ("system", "Previous conversation context:"),
                *[(msg.type, msg.content) for msg in chat_history["chat_history"][-6:]]
            ])
        
        # Add current command
        messages.append(("user", self._enhance_command(command, full_context)))
        
        # Call LLM
        prompt = ChatPromptTemplate.from_messages(messages)
        response = await self.llm.agenerate([prompt.format_messages()])
        text = response.generations[0][0].text
        
        # Parse response
        try:
            action_plan = self.parser.parse(text)
        except Exception as e:
            # Fallback: ask for clarification
            return ActionPlan(
                interpretation=f"Failed to parse command: {str(e)}",
                intent=IntentType.QUERY,
                confidence=ConfidenceLevel.UNCLEAR,
                actions=[],
                confirmation_required=True,
                risk_level="unknown",
                clarifying_questions=[
                    "Could you please rephrase your request?",
                    "What specific resource or action did you want to perform?",
                    "Which environment (dev/staging/production)?"
                ]
            )
        
        # Enhance action plan with calculated fields
        action_plan = self._enhance_action_plan(action_plan, full_context)
        
        # Save to memory
        self.memory.save_context(
            {"input": command},
            {"output": action_plan.interpretation}
        )
        
        return action_plan
    
    def _enhance_command(self, command: str, context: Dict) -> str:
        """Enhance command with implicit context"""
        enhancements = []
        
        # Add timestamp
        enhancements.append(f"Current time: {datetime.now().isoformat()}")
        
        # Add implicit environment if mentioned
        if context.get("default_environment"):
            enhancements.append(f"Default environment: {context['default_environment']}")
        
        # Add user's recent activity context
        if context.get("recent_resources"):
            enhancements.append(f"Recently worked with: {', '.join(context['recent_resources'][:3])}")
        
        enhanced = command
        if enhancements:
            enhanced = f"{command}\n\nContext: {'; '.join(enhancements)}"
        
        return enhanced
    
    def _format_user_context(self, context: Dict) -> str:
        """Format user context for prompt"""
        lines = []
        
        if context.get("role"):
            lines.append(f"User role: {context['role']}")
        
        if context.get("permissions"):
            lines.append(f"Permissions: {', '.join(context['permissions'])}")
        
        if context.get("budget_limit"):
            lines.append(f"Budget limit: ${context['budget_limit']}/month")
        
        if context.get("preferred_provider"):
            lines.append(f"Preferred cloud provider: {context['preferred_provider']}")
        
        if context.get("compliance_requirements"):
            lines.append(f"Compliance: {', '.join(context['compliance_requirements'])}")
        
        return "\n".join(lines) if lines else "No specific context available"
    
    def _enhance_action_plan(self, plan: ActionPlan, context: Dict) -> ActionPlan:
        """Enhance action plan with calculated fields"""
        
        # Calculate total cost
        total_cost = sum(a.estimated_cost or 0 for a in plan.actions)
        plan.total_estimated_cost = total_cost
        
        # Check budget limits
        if context.get("budget_limit") and total_cost > context["budget_limit"]:
            plan.warnings.append(
                f"Estimated cost ${total_cost:.2f} exceeds budget limit ${context['budget_limit']}"
            )
            plan.risk_level = "high"
        
        # Calculate total duration
        durations = [a.estimated_duration for a in plan.actions if a.estimated_duration]
        if durations:
            plan.total_estimated_duration = self._sum_durations(durations)
        
        # Collect affected resources
        plan.affected_resources = list(set(
            a.parameters.get("resource_id", a.resource) 
            for a in plan.actions
        ))
        
        # Check permissions
        if context.get("permissions"):
            for action in plan.actions:
                required_perm = f"{action.type}_{action.resource}"
                if required_perm not in context["permissions"]:
                    plan.warnings.append(
                        f"Action '{action.type} {action.resource}' may require additional permissions"
                    )
                    plan.confirmation_required = True
        
        return plan
    
    def _sum_durations(self, durations: List[str]) -> str:
        """Sum duration strings (e.g., '5m', '2h')"""
        total_minutes = 0
        
        for duration in durations:
            match = re.match(r'(\d+)([mh])', duration)
            if match:
                value, unit = int(match.group(1)), match.group(2)
                if unit == 'h':
                    total_minutes += value * 60
                else:
                    total_minutes += value
        
        if total_minutes < 60:
            return f"{total_minutes}m"
        else:
            hours = total_minutes // 60
            minutes = total_minutes % 60
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
    
    async def clarify(self, user_response: str) -> ActionPlan:
        """Handle clarification responses"""
        return await self.interpret(
            f"Based on previous discussion: {user_response}",
            context={"is_clarification": True}
        )
    
    async def suggest_similar_commands(self, command: str, limit: int = 5) -> List[str]:
        """Suggest similar commands based on history"""
        # This would query a vector database of past commands
        # For now, return common patterns
        suggestions = [
            f"Create {command} in production with autoscaling",
            f"Scale {command} to handle more traffic",
            f"Set up monitoring for {command}",
            f"Optimize {command} for cost",
            f"Backup {command} daily",
        ]
        return suggestions[:limit]

# Example Usage with Enhanced Features
async def example_usage():
    # Initialize with user context
    agent = CommandInterpreterAgent(
        api_key="sk-...",
        user_context={
            "role": "DevOps Engineer",
            "permissions": ["create_infrastructure", "update_deployment", "scale_deployment"],
            "budget_limit": 5000,
            "preferred_provider": "aws",
            "default_environment": "staging",
            "compliance_requirements": ["SOC2", "HIPAA"],
            "recent_resources": ["api-service", "database-cluster", "redis-cache"]
        }
    )
    
    # Example 1: Clear command
    command1 = """
    Create a production Kubernetes cluster on AWS in us-east-1 with:
    - 5 worker nodes (t3.large)
    - Autoscaling enabled (min: 3, max: 10)
    - Deploy my API service (image: myapp:v1.2.3)
    - Set up monitoring alerts for CPU > 80%
    """
    
    plan1 = await agent.interpret(command1)
    print(f"Intent: {plan1.intent}")
    print(f"Confidence: {plan1.confidence}")
    print(f"Risk: {plan1.risk_level}")
    print(f"Total Cost: ${plan1.total_estimated_cost}")
    print(f"Duration: {plan1.total_estimated_duration}")
    
    if plan1.warnings:
        print(f"Warnings: {plan1.warnings}")
    
    if plan1.clarifying_questions:
        print(f"Questions: {plan1.clarifying_questions}")
    
    # Example 2: Ambiguous command requiring clarification
    command2 = "Scale up the API"
    
    plan2 = await agent.interpret(command2)
    if plan2.clarifying_questions:
        print("Agent needs clarification:")
        for q in plan2.clarifying_questions:
            print(f"  - {q}")
        
        # User responds
        clarification = await agent.clarify("I meant the production API service to 10 replicas")
        print(f"Clarified plan: {clarification.interpretation}")
    
    # Example 3: Suggest similar commands
    suggestions = await agent.suggest_similar_commands("deploy")
    print(f"Similar commands: {suggestions}")
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

## 6. Advanced Agent Features

### 6.1 Conversation Manager

```python
# src/agents/conversation_manager.py

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import uuid

@dataclass
class ConversationTurn:
    """Single conversation turn"""
    id: str
    user_id: str
    timestamp: datetime
    user_message: str
    agent_response: ActionPlan
    execution_result: Optional[Dict] = None
    user_feedback: Optional[str] = None
    sentiment: Optional[str] = None  # positive, negative, neutral

class ConversationManager:
    """Manages multi-turn conversations with context"""
    
    def __init__(self, agent: CommandInterpreterAgent):
        self.agent = agent
        self.conversations: Dict[str, List[ConversationTurn]] = {}
        
    async def process_message(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None
    ) -> tuple[ActionPlan, str]:
        """Process message with conversation context"""
        
        # Get or create session
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        
        # Get conversation history
        history = self.conversations[session_id]
        
        # Build context from history
        context = self._build_context_from_history(history)
        context["user_id"] = user_id
        
        # Interpret with context
        plan = await self.agent.interpret(message, context=context)
        
        # Save turn
        turn = ConversationTurn(
            id=str(uuid.uuid4()),
            user_id=user_id,
            timestamp=datetime.now(),
            user_message=message,
            agent_response=plan
        )
        history.append(turn)
        
        return plan, session_id
    
    def _build_context_from_history(self, history: List[ConversationTurn]) -> Dict:
        """Extract context from conversation history"""
        context = {
            "recent_resources": [],
            "recent_actions": [],
            "mentioned_environments": set(),
            "mentioned_providers": set(),
        }
        
        # Analyze recent turns
        for turn in history[-5:]:  # Last 5 turns
            plan = turn.agent_response
            
            # Extract mentioned resources
            context["recent_resources"].extend(plan.affected_resources)
            
            # Extract actions
            for action in plan.actions:
                context["recent_actions"].append(action.type)
                
                # Extract environment mentions
                env = action.parameters.get("environment")
                if env:
                    context["mentioned_environments"].add(env)
                
                # Extract provider mentions
                provider = action.parameters.get("provider")
                if provider:
                    context["mentioned_providers"].add(provider)
        
        # Deduplicate and limit
        context["recent_resources"] = list(set(context["recent_resources"]))[:5]
        context["recent_actions"] = list(set(context["recent_actions"]))[:5]
        context["mentioned_environments"] = list(context["mentioned_environments"])
        context["mentioned_providers"] = list(context["mentioned_providers"])
        
        return context
    
    async def handle_follow_up(
        self,
        user_id: str,
        session_id: str,
        follow_up: str
    ) -> ActionPlan:
        """Handle follow-up questions or modifications"""
        
        if session_id not in self.conversations:
            raise ValueError("Session not found")
        
        history = self.conversations[session_id]
        last_turn = history[-1] if history else None
        
        # Build context with last action
        context = {
            "is_follow_up": True,
            "last_action": last_turn.agent_response if last_turn else None
        }
        
        return await self.agent.interpret(follow_up, context=context)
    
    def record_feedback(
        self,
        session_id: str,
        turn_id: str,
        feedback: str,
        sentiment: str
    ):
        """Record user feedback for learning"""
        if session_id in self.conversations:
            for turn in self.conversations[session_id]:
                if turn.id == turn_id:
                    turn.user_feedback = feedback
                    turn.sentiment = sentiment
                    break
    
    def get_conversation_summary(self, session_id: str) -> Dict:
        """Get conversation summary"""
        if session_id not in self.conversations:
            return {"error": "Session not found"}
        
        history = self.conversations[session_id]
        
        return {
            "session_id": session_id,
            "total_turns": len(history),
            "start_time": history[0].timestamp if history else None,
            "last_activity": history[-1].timestamp if history else None,
            "actions_executed": sum(
                len(turn.agent_response.actions) 
                for turn in history
            ),
            "user_satisfaction": self._calculate_satisfaction(history)
        }
    
    def _calculate_satisfaction(self, history: List[ConversationTurn]) -> float:
        """Calculate user satisfaction score"""
        sentiments = [turn.sentiment for turn in history if turn.sentiment]
        if not sentiments:
            return 0.0
        
        positive = sentiments.count("positive")
        total = len(sentiments)
        return (positive / total) * 100 if total > 0 else 0.0
```

### 6.2 Pattern Learning System

```python
# src/agents/pattern_learning.py

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Tuple
import pickle

class PatternLearningSystem:
    """Learn from successful command patterns"""
    
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.successful_patterns: List[Dict] = []
        self.failure_patterns: List[Dict] = []
        
    def record_execution(
        self,
        command: str,
        plan: ActionPlan,
        result: Dict,
        success: bool,
        execution_time: float,
        cost: float
    ):
        """Record execution outcome"""
        
        # Encode command
        embedding = self.model.encode(command)
        
        pattern = {
            "command": command,
            "embedding": embedding,
            "plan": plan.dict(),
            "result": result,
            "success": success,
            "execution_time": execution_time,
            "cost": cost,
            "timestamp": datetime.now().isoformat(),
            "intent": plan.intent.value,
            "risk_level": plan.risk_level,
        }
        
        if success:
            self.successful_patterns.append(pattern)
        else:
            self.failure_patterns.append(pattern)
    
    def find_similar_successful_patterns(
        self,
        command: str,
        limit: int = 5,
        min_similarity: float = 0.7
    ) -> List[Dict]:
        """Find similar successful command patterns"""
        
        if not self.successful_patterns:
            return []
        
        # Encode query command
        query_embedding = self.model.encode(command)
        
        # Calculate similarities
        similarities = []
        for pattern in self.successful_patterns:
            similarity = self._cosine_similarity(
                query_embedding,
                pattern["embedding"]
            )
            if similarity >= min_similarity:
                similarities.append((pattern, similarity))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [
            {
                **pattern,
                "similarity": similarity
            }
            for pattern, similarity in similarities[:limit]
        ]
    
    def get_optimization_suggestions(
        self,
        command: str,
        current_plan: ActionPlan
    ) -> List[str]:
        """Get optimization suggestions based on patterns"""
        
        similar = self.find_similar_successful_patterns(command)
        suggestions = []
        
        for pattern in similar:
            past_cost = pattern["cost"]
            past_time = pattern["execution_time"]
            
            # Cost optimization
            if current_plan.total_estimated_cost > past_cost * 1.2:
                suggestions.append(
                    f"Similar command was executed for ${past_cost:.2f} "
                    f"(20% cheaper). Consider optimizing resource sizes."
                )
            
            # Time optimization
            if past_time < 300:  # Less than 5 minutes
                suggestions.append(
                    f"Similar command completed in {past_time/60:.1f} minutes. "
                    f"Expected quick execution."
                )
            
            # Alternative approaches
            past_actions = pattern["plan"]["actions"]
            if len(past_actions) < len(current_plan.actions):
                suggestions.append(
                    f"Similar task was completed with fewer steps ({len(past_actions)} vs {len(current_plan.actions)}). "
                    f"Review if all actions are necessary."
                )
        
        return suggestions[:3]  # Top 3 suggestions
    
    def detect_potential_failures(
        self,
        command: str,
        plan: ActionPlan
    ) -> List[str]:
        """Detect potential failures based on past failures"""
        
        if not self.failure_patterns:
            return []
        
        query_embedding = self.model.encode(command)
        warnings = []
        
        for failure in self.failure_patterns:
            similarity = self._cosine_similarity(
                query_embedding,
                failure["embedding"]
            )
            
            if similarity >= 0.8:  # High similarity to past failure
                error_msg = failure["result"].get("error", "Unknown error")
                warnings.append(
                    f"Warning: Similar command failed previously with: {error_msg}. "
                    f"Recommend extra validation."
                )
        
        return warnings
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def save_patterns(self, filepath: str):
        """Save learned patterns"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                "successful": self.successful_patterns,
                "failures": self.failure_patterns
            }, f)
    
    def load_patterns(self, filepath: str):
        """Load learned patterns"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.successful_patterns = data["successful"]
            self.failure_patterns = data["failures"]
```

### 6.3 Multi-Language Support

```python
# src/agents/multi_language.py

from deep_translator import GoogleTranslator
from langdetect import detect

class MultiLanguageAgent:
    """Support for multiple languages"""
    
    SUPPORTED_LANGUAGES = {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "zh": "Chinese",
        "ja": "Japanese",
        "hi": "Hindi",
        "pt": "Portuguese",
        "ru": "Russian",
        "ar": "Arabic"
    }
    
    def __init__(self, agent: CommandInterpreterAgent):
        self.agent = agent
        self.translator = GoogleTranslator()
    
    async def interpret_any_language(
        self,
        command: str,
        target_language: Optional[str] = None
    ) -> Tuple[ActionPlan, str]:
        """Interpret command in any language"""
        
        # Detect language
        detected_lang = detect(command)
        
        # Translate to English if needed
        if detected_lang != "en":
            translated = self.translator.translate(
                text=command,
                source=detected_lang,
                target="en"
            )
            print(f"Translated from {detected_lang}: {command} -> {translated}")
        else:
            translated = command
        
        # Interpret in English
        plan = await self.agent.interpret(translated)
        
        # Translate response back if needed
        response_lang = target_language or detected_lang
        if response_lang != "en":
            plan.interpretation = self.translator.translate(
                text=plan.interpretation,
                source="en",
                target=response_lang
            )
            
            # Translate action descriptions
            for action in plan.actions:
                action.description = self.translator.translate(
                    text=action.description,
                    source="en",
                    target=response_lang
                )
        
        return plan, detected_lang
    
    def get_localized_examples(self, language: str) -> List[str]:
        """Get example commands in user's language"""
        
        examples_en = [
            "Create 3 AWS EC2 instances in us-east-1",
            "Scale production API to 10 replicas",
            "Set up monitoring for CPU usage > 80%",
            "Create database backup",
            "Show me cost analysis for this month"
        ]
        
        if language == "en":
            return examples_en
        
        return [
            self.translator.translate(ex, source="en", target=language)
            for ex in examples_en
        ]
```

## 7. Learning & Improvement

### 7.1 Integrated Learning System

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
