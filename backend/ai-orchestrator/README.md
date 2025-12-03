# AI Orchestrator Service - Multi-Agent Architecture System

## Overview

The AI Orchestrator is the brain of the One-Click Enterprise AI System. It coordinates multiple specialized AI agents to automate EA, SA, TA, PM, and SE responsibilities with full compliance automation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Orchestrator Service                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Chief AI Architect Agent (Coordinator)      │   │
│  │  - LangGraph workflow engine                        │   │
│  │  - Request parsing & validation                     │   │
│  │  - Agent routing & coordination                     │   │
│  │  - Consistency validation                           │   │
│  └────┬──────────┬──────────┬──────────┬──────────┬────┘   │
│       │          │          │          │          │         │
│  ┌────▼────┐┌───▼────┐┌────▼────┐┌───▼────┐┌────▼────┐   │
│  │   EA    ││   SA   ││   TA    ││   PM   ││   SE    │   │
│  │  Agent  ││ Agent  ││ Agent   ││ Agent  ││ Agent   │   │
│  └─────────┘└────────┘└─────────┘└────────┘└─────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Compliance Automation Engine              │  │
│  │  - Multi-framework validator (15+ frameworks)        │  │
│  │  - Real-time compliance monitoring                   │  │
│  │  - Gap analysis & remediation                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Vector Database (Pinecone)              │  │
│  │  - 10K+ architecture patterns                        │  │
│  │  - 5K+ compliance rules                              │  │
│  │  - 50K+ code templates                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/ai-orchestrator/
├── src/
│   ├── agents/
│   │   ├── chief_architect_agent.py      # Orchestrator agent
│   │   ├── enterprise_architect_agent.py # EA agent
│   │   ├── solution_architect_agent.py   # SA agent
│   │   ├── technical_architect_agent.py  # TA agent
│   │   ├── project_manager_agent.py      # PM agent
│   │   └── security_engineer_agent.py    # SE agent
│   │
│   ├── compliance/
│   │   ├── validator.py                   # Compliance validator
│   │   ├── frameworks/                    # Framework definitions
│   │   │   ├── hipaa.py
│   │   │   ├── soc2.py
│   │   │   ├── pci_dss.py
│   │   │   ├── iso27001.py
│   │   │   └── gdpr.py
│   │   └── models/
│   │       └── compliance_predictor.py    # ML model
│   │
│   ├── generators/
│   │   ├── document_generator.py          # PDF/Word generation
│   │   ├── diagram_generator.py           # Mermaid/PlantUML
│   │   ├── iac_generator.py               # Terraform/CloudFormation
│   │   └── api_spec_generator.py          # OpenAPI specs
│   │
│   ├── knowledge_base/
│   │   ├── vector_store.py                # Pinecone integration
│   │   ├── embeddings.py                  # Text embeddings
│   │   └── retrieval.py                   # RAG pipeline
│   │
│   ├── workflows/
│   │   ├── orchestration.py               # LangGraph workflows
│   │   ├── validation.py                  # Output validation
│   │   └── monitoring.py                  # Progress tracking
│   │
│   ├── models/
│   │   ├── requests.py                    # Request models
│   │   ├── responses.py                   # Response models
│   │   └── artifacts.py                   # Generated artifacts
│   │
│   ├── api/
│   │   ├── routes.py                      # FastAPI routes
│   │   ├── websockets.py                  # Real-time updates
│   │   └── middleware.py                  # Auth, logging
│   │
│   └── main.py                            # Application entry point
│
├── ml_models/
│   ├── compliance_predictor/              # Compliance ML model
│   │   ├── train.py
│   │   ├── model.py
│   │   └── weights/
│   │
│   ├── capability_extractor/              # EA capability extraction
│   │   ├── train.py
│   │   └── model.py
│   │
│   └── tech_stack_predictor/              # SA technology recommender
│       ├── train.py
│       └── model.py
│
├── data/
│   ├── training/
│   │   ├── ea_documents/                  # 1,000+ EA docs
│   │   ├── sa_architectures/              # 10,000+ SA docs
│   │   ├── compliance_audits/             # 5,000+ audit reports
│   │   └── iac_templates/                 # 50,000+ IaC files
│   │
│   └── knowledge_base/
│       ├── architecture_patterns/
│       ├── compliance_frameworks/
│       └── code_templates/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Technology Stack

### Core AI/ML
- **LangChain 0.1.x**: Agent framework
- **LangGraph 0.0.x**: Workflow orchestration
- **OpenAI GPT-4 Turbo**: Primary LLM
- **Anthropic Claude 3**: Long-context tasks
- **PyTorch 2.0**: ML model training
- **Hugging Face Transformers**: Pre-trained models

### Vector Database
- **Pinecone**: Production vector DB
- **FAISS**: Local development fallback
- **Sentence-Transformers**: Embeddings

### Backend Services
- **FastAPI 0.110+**: REST API
- **Celery 5.3+**: Async task queue
- **RabbitMQ 3.12+**: Message broker
- **Redis 7+**: Cache & session store

### Databases
- **PostgreSQL 15**: Relational data
- **MongoDB 7**: Document store
- **Pinecone**: Vector database

### Infrastructure
- **Docker + Kubernetes**: Containerization
- **AWS SageMaker**: ML training
- **AWS Lambda**: Serverless functions
- **ArgoCD**: GitOps deployment

## API Endpoints

### One-Click Generation
```http
POST /api/v1/generate
Content-Type: application/json

{
  "business_goal": "Secure e-commerce platform for healthcare products",
  "compliance_requirements": ["HIPAA", "PCI-DSS", "SOC2"],
  "budget_range": {
    "min": 50000,
    "max": 100000
  },
  "timeline_months": 3,
  "scale": {
    "users_per_day": 100000,
    "concurrent_users": 5000
  },
  "deployment_preference": "cloud",
  "cloud_providers": ["aws", "azure"]
}

Response:
{
  "request_id": "req_abc123",
  "status": "processing",
  "estimated_time_seconds": 300,
  "websocket_url": "wss://api.iacdharma.com/ws/req_abc123"
}
```

### Get Generated Artifacts
```http
GET /api/v1/generate/{request_id}/artifacts

Response:
{
  "request_id": "req_abc123",
  "status": "completed",
  "generation_time_seconds": 342,
  "artifacts": {
    "enterprise_architecture": {
      "document_url": "https://...",
      "pages": 52,
      "domains": 7,
      "capabilities": 118
    },
    "solution_architecture": {
      "document_url": "https://...",
      "diagrams": [
        {
          "type": "system_context",
          "url": "https://...",
          "format": "mermaid"
        },
        {
          "type": "component",
          "url": "https://...",
          "format": "svg"
        }
      ],
      "tech_stack": {
        "backend": ["nodejs", "python"],
        "database": ["postgresql", "redis"],
        "messaging": ["kafka"],
        "cloud": ["aws"]
      }
    },
    "technical_architecture": {
      "iac_code": {
        "terraform_url": "https://...",
        "lines_of_code": 1245
      },
      "database_schemas": [
        {
          "name": "users",
          "tables": 12,
          "sql_url": "https://..."
        }
      ],
      "api_specs": {
        "openapi_url": "https://...",
        "endpoints": 45
      }
    },
    "project_management": {
      "document_url": "https://...",
      "tasks": 387,
      "sprints": 15,
      "team_size": 5,
      "duration_weeks": 12,
      "gantt_chart_url": "https://..."
    },
    "security_engineering": {
      "document_url": "https://...",
      "threats": 32,
      "controls": 156,
      "threat_model_url": "https://..."
    },
    "compliance_report": {
      "document_url": "https://...",
      "frameworks": {
        "HIPAA": {
          "compliance_score": 98,
          "gaps": 8,
          "auto_fix_available": true
        },
        "PCI-DSS": {
          "compliance_score": 100,
          "gaps": 0
        },
        "SOC2": {
          "compliance_score": 95,
          "gaps": 12,
          "remediation_plan_url": "https://..."
        }
      }
    }
  }
}
```

### WebSocket Progress Updates
```javascript
// Client-side code
const ws = new WebSocket('wss://api.iacdharma.com/ws/req_abc123');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(update);
};

// Server sends:
{
  "type": "agent_started",
  "agent": "enterprise_architect",
  "timestamp": "2025-12-04T10:30:00Z"
}

{
  "type": "agent_completed",
  "agent": "enterprise_architect",
  "duration_seconds": 120,
  "output": {
    "domains": 7,
    "capabilities": 118
  }
}

{
  "type": "compliance_validation",
  "status": "completed",
  "results": {
    "HIPAA": { "score": 98, "gaps": 8 },
    "PCI-DSS": { "score": 100, "gaps": 0 }
  }
}

{
  "type": "generation_completed",
  "total_time_seconds": 342,
  "artifacts_url": "/api/v1/generate/req_abc123/artifacts"
}
```

## Agent Implementation Examples

### Chief AI Architect Agent
```python
from langchain import LLMChain
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class AgentState(TypedDict):
    request: dict
    parsed_requirements: dict
    agent_tasks: dict
    agent_outputs: dict
    validation_results: dict
    final_artifacts: dict

class ChiefArchitectAgent:
    def __init__(self, llm, vector_store):
        self.llm = llm
        self.vector_store = vector_store
        self.graph = self._build_workflow()
    
    def _build_workflow(self):
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("parse_request", self.parse_request)
        workflow.add_node("route_agents", self.route_agents)
        workflow.add_node("validate_outputs", self.validate_outputs)
        workflow.add_node("generate_reports", self.generate_reports)
        
        # Add edges
        workflow.set_entry_point("parse_request")
        workflow.add_edge("parse_request", "route_agents")
        workflow.add_edge("route_agents", "validate_outputs")
        workflow.add_edge("validate_outputs", "generate_reports")
        workflow.add_edge("generate_reports", END)
        
        return workflow.compile()
    
    async def parse_request(self, state: AgentState):
        """Extract requirements from user request"""
        request = state["request"]
        
        # Use LLM to extract structured requirements
        prompt = f"""
        Analyze this architecture request and extract:
        1. Business goals and objectives
        2. Compliance requirements
        3. Technical constraints (budget, timeline, scale)
        4. Deployment preferences
        
        Request: {request['business_goal']}
        Compliance: {request['compliance_requirements']}
        Budget: ${request['budget_range']['min']}-${request['budget_range']['max']}
        Timeline: {request['timeline_months']} months
        Scale: {request['scale']['users_per_day']} users/day
        """
        
        response = await self.llm.apredict(prompt)
        
        # Retrieve similar projects from vector DB
        similar_projects = await self.vector_store.similarity_search(
            query=request['business_goal'],
            k=5
        )
        
        state["parsed_requirements"] = {
            "extracted": response,
            "similar_projects": similar_projects
        }
        
        return state
    
    async def route_agents(self, state: AgentState):
        """Route tasks to specialized agents"""
        from .enterprise_architect_agent import EnterpriseArchitectAgent
        from .solution_architect_agent import SolutionArchitectAgent
        from .technical_architect_agent import TechnicalArchitectAgent
        from .project_manager_agent import ProjectManagerAgent
        from .security_engineer_agent import SecurityEngineerAgent
        
        # Initialize agents
        agents = {
            'ea': EnterpriseArchitectAgent(self.llm, self.vector_store),
            'sa': SolutionArchitectAgent(self.llm, self.vector_store),
            'ta': TechnicalArchitectAgent(self.llm, self.vector_store),
            'pm': ProjectManagerAgent(self.llm, self.vector_store),
            'se': SecurityEngineerAgent(self.llm, self.vector_store)
        }
        
        # Execute agents in parallel where possible
        import asyncio
        
        # EA and PM can run in parallel
        ea_task = agents['ea'].generate(state["parsed_requirements"])
        pm_task = agents['pm'].generate(state["parsed_requirements"])
        
        ea_output, pm_output = await asyncio.gather(ea_task, pm_task)
        
        # SA depends on EA
        sa_output = await agents['sa'].generate(state["parsed_requirements"], ea_output)
        
        # TA depends on SA
        ta_output = await agents['ta'].generate(state["parsed_requirements"], sa_output)
        
        # SE depends on SA and TA
        se_output = await agents['se'].generate(
            state["parsed_requirements"], 
            sa_output, 
            ta_output
        )
        
        state["agent_outputs"] = {
            'ea': ea_output,
            'sa': sa_output,
            'ta': ta_output,
            'pm': pm_output,
            'se': se_output
        }
        
        return state
    
    async def validate_outputs(self, state: AgentState):
        """Validate consistency across all outputs"""
        from .compliance.validator import ComplianceValidator
        
        validator = ComplianceValidator()
        
        # Check compliance
        compliance_results = await validator.validate_all_frameworks(
            architecture=state["agent_outputs"]['sa'],
            technical_specs=state["agent_outputs"]['ta'],
            security_controls=state["agent_outputs"]['se'],
            frameworks=state["request"]['compliance_requirements']
        )
        
        # Check consistency
        consistency_checks = {
            'ea_sa_alignment': self._check_ea_sa_alignment(
                state["agent_outputs"]['ea'],
                state["agent_outputs"]['sa']
            ),
            'sa_ta_alignment': self._check_sa_ta_alignment(
                state["agent_outputs"]['sa'],
                state["agent_outputs"]['ta']
            ),
            'budget_feasibility': self._check_budget(
                state["agent_outputs"]['ta'],
                state["request"]['budget_range']
            )
        }
        
        state["validation_results"] = {
            'compliance': compliance_results,
            'consistency': consistency_checks
        }
        
        return state
    
    async def generate_reports(self, state: AgentState):
        """Generate final consolidated documents"""
        from .generators.document_generator import DocumentGenerator
        from .generators.diagram_generator import DiagramGenerator
        
        doc_gen = DocumentGenerator()
        diagram_gen = DiagramGenerator()
        
        # Generate all artifacts
        artifacts = {
            'enterprise_architecture': await doc_gen.generate_ea_document(
                state["agent_outputs"]['ea']
            ),
            'solution_architecture': {
                'document': await doc_gen.generate_sa_document(
                    state["agent_outputs"]['sa']
                ),
                'diagrams': await diagram_gen.generate_all_diagrams(
                    state["agent_outputs"]['sa']
                )
            },
            'technical_architecture': {
                'iac': state["agent_outputs"]['ta']['iac_code'],
                'schemas': state["agent_outputs"]['ta']['database_schemas'],
                'api_specs': state["agent_outputs"]['ta']['api_specifications']
            },
            'project_management': await doc_gen.generate_pm_document(
                state["agent_outputs"]['pm']
            ),
            'security_engineering': await doc_gen.generate_se_document(
                state["agent_outputs"]['se']
            ),
            'compliance_report': await doc_gen.generate_compliance_report(
                state["validation_results"]['compliance']
            )
        }
        
        state["final_artifacts"] = artifacts
        
        return state
    
    def _check_ea_sa_alignment(self, ea_output, sa_output):
        """Validate EA domains map to SA components"""
        # Implementation details...
        return {"aligned": True, "issues": []}
    
    def _check_sa_ta_alignment(self, sa_output, ta_output):
        """Validate SA design matches TA implementation"""
        # Implementation details...
        return {"aligned": True, "issues": []}
    
    def _check_budget(self, ta_output, budget_range):
        """Validate cost estimate within budget"""
        # Implementation details...
        return {"feasible": True, "estimated_cost": 78500}
```

### Enterprise Architect Agent
```python
from langchain import LLMChain, PromptTemplate
from typing import Dict, List

class EnterpriseArchitectAgent:
    def __init__(self, llm, vector_store):
        self.llm = llm
        self.vector_store = vector_store
        
        # Load capability extraction model
        from transformers import AutoModelForTokenClassification, AutoTokenizer
        self.capability_model = AutoModelForTokenClassification.from_pretrained(
            "models/capability_extractor"
        )
        self.capability_tokenizer = AutoTokenizer.from_pretrained(
            "models/capability_extractor"
        )
    
    async def generate(self, requirements: Dict) -> Dict:
        """Generate enterprise architecture document"""
        
        # Step 1: Extract business capabilities
        capabilities = await self._extract_capabilities(requirements)
        
        # Step 2: Map domains
        domains = await self._identify_domains(requirements, capabilities)
        
        # Step 3: Define architecture principles
        principles = await self._define_principles(requirements)
        
        # Step 4: Generate EA document
        ea_document = await self._generate_document(
            requirements, capabilities, domains, principles
        )
        
        return {
            'capabilities': capabilities,
            'domains': domains,
            'principles': principles,
            'document': ea_document
        }
    
    async def _extract_capabilities(self, requirements: Dict) -> List[Dict]:
        """Use ML model to extract business capabilities"""
        
        # Retrieve similar architectures
        similar = await self.vector_store.similarity_search(
            query=requirements['extracted'],
            k=10,
            filter={'type': 'enterprise_architecture'}
        )
        
        # Use LLM to generate capability map
        prompt = f"""
        Based on this project requirements, generate a comprehensive business capability map.
        
        Requirements: {requirements['extracted']}
        
        Similar projects for reference:
        {similar}
        
        Generate 50-200 capabilities organized into 7-15 domains.
        
        Format:
        Domain: Identity & Access Management
        - User Authentication
        - Single Sign-On (SSO)
        - Role-Based Access Control (RBAC)
        - Multi-Factor Authentication (MFA)
        ...
        """
        
        response = await self.llm.apredict(prompt)
        
        # Parse response into structured format
        capabilities = self._parse_capabilities(response)
        
        return capabilities
    
    async def _identify_domains(self, requirements: Dict, capabilities: List[Dict]) -> List[Dict]:
        """Identify enterprise domains"""
        
        prompt = f"""
        Based on these capabilities, identify 7-15 enterprise domains.
        
        Capabilities: {capabilities}
        
        Common domains include:
        - Identity & Access Management
        - Data & Information Management
        - Security & Compliance
        - Infrastructure & Operations
        - Integration & APIs
        - Analytics & Reporting
        - Business Logic & Workflows
        
        For each domain, provide:
        - Name
        - Description
        - Key capabilities (3-10 per domain)
        - Cross-domain dependencies
        """
        
        response = await self.llm.apredict(prompt)
        domains = self._parse_domains(response)
        
        return domains
    
    async def _define_principles(self, requirements: Dict) -> List[Dict]:
        """Define architecture principles"""
        
        prompt = f"""
        Define 20-30 architecture principles for this project.
        
        Requirements: {requirements['extracted']}
        
        For each principle, provide:
        - Name (e.g., "Security by Design")
        - Statement (e.g., "Security must be embedded in every layer")
        - Rationale (why this principle matters)
        - Implications (what this means for implementation)
        
        Categories:
        - Business Principles (5-7)
        - Data Principles (5-7)
        - Application Principles (5-7)
        - Technology Principles (5-7)
        """
        
        response = await self.llm.apredict(prompt)
        principles = self._parse_principles(response)
        
        return principles
    
    async def _generate_document(
        self, 
        requirements: Dict, 
        capabilities: List[Dict], 
        domains: List[Dict],
        principles: List[Dict]
    ) -> str:
        """Generate complete EA document"""
        
        # Use Claude 3 Opus for long-form document generation
        from anthropic import AsyncAnthropic
        
        claude = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        prompt = f"""
        Generate a comprehensive Enterprise Architecture document (40-60 pages).
        
        Project Requirements: {requirements['extracted']}
        
        Business Capabilities: {capabilities}
        
        Enterprise Domains: {domains}
        
        Architecture Principles: {principles}
        
        Document Structure:
        
        1. Executive Summary (2 pages)
        2. Introduction (3 pages)
           - Purpose and scope
           - Stakeholders
           - Document organization
        3. Business Context (5 pages)
           - Business goals and objectives
           - Current state challenges
           - Future state vision
        4. Enterprise Architecture Framework (5 pages)
           - Framework selection (TOGAF, Zachman, etc.)
           - Architecture domains
           - Governance model
        5. Business Capability Map (10 pages)
           - Level 1 capabilities
           - Level 2-3 decomposition
           - Maturity assessment
        6. Enterprise Domain Models (15 pages)
           - Domain descriptions
           - Key capabilities per domain
           - Domain interactions
        7. Architecture Principles (5 pages)
           - Business, Data, Application, Technology principles
        8. Enterprise Constraints (3 pages)
           - Budget, timeline, compliance
        9. Implementation Roadmap (5 pages)
           - Phased approach
           - Dependencies and sequencing
        10. Appendices (5 pages)
            - Glossary, references, diagrams
        
        Generate complete content with detailed explanations.
        Use professional enterprise architecture language.
        Include specific examples relevant to the project.
        """
        
        response = await claude.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=100000,  # Claude 3 Opus supports long outputs
            messages=[{"role": "user", "content": prompt}]
        )
        
        document = response.content[0].text
        
        return document
    
    def _parse_capabilities(self, text: str) -> List[Dict]:
        """Parse capabilities from LLM output"""
        # Implementation details...
        return []
    
    def _parse_domains(self, text: str) -> List[Dict]:
        """Parse domains from LLM output"""
        # Implementation details...
        return []
    
    def _parse_principles(self, text: str) -> List[Dict]:
        """Parse principles from LLM output"""
        # Implementation details...
        return []
```

## Compliance Automation

### Compliance Validator
```python
from typing import Dict, List
import numpy as np
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

class ComplianceValidator:
    def __init__(self):
        # Load compliance prediction model
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "models/compliance_predictor"
        )
        self.tokenizer = AutoTokenizer.from_pretrained(
            "models/compliance_predictor"
        )
        
        # Load framework definitions
        from .frameworks import HIPAA, SOC2, PCIDSS, ISO27001, GDPR
        self.frameworks = {
            'HIPAA': HIPAA(),
            'SOC2': SOC2(),
            'PCI-DSS': PCIDSS(),
            'ISO27001': ISO27001(),
            'GDPR': GDPR()
        }
    
    async def validate_all_frameworks(
        self,
        architecture: Dict,
        technical_specs: Dict,
        security_controls: Dict,
        frameworks: List[str]
    ) -> Dict:
        """Validate against multiple compliance frameworks"""
        
        results = {}
        
        for framework_name in frameworks:
            if framework_name not in self.frameworks:
                continue
            
            framework = self.frameworks[framework_name]
            
            # Validate each control in the framework
            control_results = await self._validate_framework(
                framework,
                architecture,
                technical_specs,
                security_controls
            )
            
            # Calculate compliance score
            score = self._calculate_score(control_results)
            
            # Identify gaps
            gaps = self._identify_gaps(control_results)
            
            # Generate remediation plan
            remediation = await self._generate_remediation(gaps, framework)
            
            results[framework_name] = {
                'score': score,
                'control_results': control_results,
                'gaps': gaps,
                'remediation': remediation
            }
        
        return results
    
    async def _validate_framework(
        self,
        framework,
        architecture: Dict,
        technical_specs: Dict,
        security_controls: Dict
    ) -> List[Dict]:
        """Validate all controls in a framework"""
        
        control_results = []
        
        for control in framework.get_all_controls():
            # Use ML model to predict compliance
            result = await self._validate_control(
                control,
                architecture,
                technical_specs,
                security_controls
            )
            
            control_results.append(result)
        
        return control_results
    
    async def _validate_control(
        self,
        control: Dict,
        architecture: Dict,
        technical_specs: Dict,
        security_controls: Dict
    ) -> Dict:
        """Validate a single control"""
        
        # Combine all relevant information
        context = f"""
        Control: {control['id']} - {control['description']}
        
        Architecture: {architecture}
        Technical Specs: {technical_specs}
        Security Controls: {security_controls}
        """
        
        # Tokenize
        inputs = self.tokenizer(
            context,
            return_tensors="pt",
            max_length=512,
            truncation=True
        )
        
        # Predict compliance
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)
            
            # Classes: [non-compliant, partially-compliant, compliant]
            compliant_prob = probs[0][2].item()
        
        # Determine status
        if compliant_prob > 0.85:
            status = 'compliant'
        elif compliant_prob > 0.60:
            status = 'partially_compliant'
        else:
            status = 'non_compliant'
        
        return {
            'control_id': control['id'],
            'control_description': control['description'],
            'status': status,
            'confidence': compliant_prob,
            'evidence': self._extract_evidence(
                architecture, technical_specs, security_controls, control
            ),
            'gaps': self._identify_control_gaps(
                status, control, architecture, technical_specs
            )
        }
    
    def _calculate_score(self, control_results: List[Dict]) -> int:
        """Calculate overall compliance score (0-100)"""
        
        total_controls = len(control_results)
        compliant_count = sum(
            1 for r in control_results if r['status'] == 'compliant'
        )
        partially_compliant_count = sum(
            1 for r in control_results if r['status'] == 'partially_compliant'
        )
        
        # Full credit for compliant, 50% credit for partially compliant
        score = (
            (compliant_count + 0.5 * partially_compliant_count) / total_controls * 100
        )
        
        return int(score)
    
    def _identify_gaps(self, control_results: List[Dict]) -> List[Dict]:
        """Identify compliance gaps"""
        
        gaps = []
        
        for result in control_results:
            if result['status'] != 'compliant':
                gaps.append({
                    'control_id': result['control_id'],
                    'description': result['control_description'],
                    'current_status': result['status'],
                    'gaps': result['gaps']
                })
        
        return gaps
    
    async def _generate_remediation(self, gaps: List[Dict], framework) -> List[Dict]:
        """Generate remediation plan for gaps"""
        
        remediation = []
        
        for gap in gaps:
            # Use LLM to generate remediation steps
            prompt = f"""
            Generate a remediation plan for this compliance gap.
            
            Framework: {framework.name}
            Control: {gap['control_id']} - {gap['description']}
            Current Status: {gap['current_status']}
            Gaps: {gap['gaps']}
            
            Provide:
            1. Remediation steps (3-7 specific actions)
            2. Estimated effort (hours/days)
            3. Priority (critical/high/medium/low)
            4. Auto-fix availability (yes/no with details)
            """
            
            # Implementation...
            
            remediation.append({
                'control_id': gap['control_id'],
                'steps': [],  # Remediation steps
                'effort_hours': 0,
                'priority': 'high',
                'auto_fix_available': False
            })
        
        return remediation
    
    def _extract_evidence(self, architecture, technical_specs, security_controls, control):
        """Extract evidence of compliance"""
        # Implementation...
        return []
    
    def _identify_control_gaps(self, status, control, architecture, technical_specs):
        """Identify specific gaps for a control"""
        # Implementation...
        return []
```

## Deployment

### Docker Compose
```yaml
version: '3.8'

services:
  ai-orchestrator:
    build: .
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - PINECONE_ENVIRONMENT=${PINECONE_ENVIRONMENT}
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:password@postgres:5432/iac_dharma
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - postgres
      - rabbitmq
    volumes:
      - ./ml_models:/app/ml_models
      - ./data:/app/data
  
  celery-worker:
    build: .
    command: celery -A src.main worker --loglevel=info --concurrency=4
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:password@postgres:5432/iac_dharma
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - redis
      - postgres
      - rabbitmq
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=iac_dharma
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest

volumes:
  postgres_data:
```

## Next Steps

1. **Setup Development Environment**
   ```bash
   cd backend/ai-orchestrator
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Download Training Data**
   ```bash
   # Download EA documents, SA architectures, compliance audits
   python scripts/download_training_data.py
   ```

3. **Train ML Models**
   ```bash
   # Train compliance predictor
   python ml_models/compliance_predictor/train.py
   
   # Train capability extractor
   python ml_models/capability_extractor/train.py
   ```

4. **Setup Vector Database**
   ```bash
   # Index knowledge base in Pinecone
   python scripts/index_knowledge_base.py
   ```

5. **Run Service**
   ```bash
   docker-compose up -d
   ```

6. **Test End-to-End**
   ```bash
   python tests/e2e/test_one_click_generation.py
   ```

---

**Last Updated**: December 4, 2025  
**Version**: 1.0.0  
**Status**: 🚀 Ready for Development
