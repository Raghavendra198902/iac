from .base_agent import BaseAgent
from ..models.agent_execution import AgentStatus

class SolutionArchitectAgent(BaseAgent):
    """
    Solution Architect Agent - Solution Design
    Responsibilities:
    - Design system architecture
    - Define component structure
    - Create architecture diagrams
    - Specify integration patterns
    """
    
    def __init__(self, project_id: str, ea_result: dict):
        super().__init__(project_id, "sa", "Solution Architect")
        self.ea_result = ea_result
    
    def execute(self) -> dict:
        """Execute Solution Architect tasks."""
        self.update_status(AgentStatus.PROCESSING, 0, "Starting solution design...")
        
        # Step 1: Design system architecture (25%)
        self.update_status(AgentStatus.PROCESSING, 25, "Designing system architecture...")
        system_arch = self._design_system_architecture()
        
        # Step 2: Define components (50%)
        self.update_status(AgentStatus.PROCESSING, 50, "Defining components...")
        components = self._define_components(system_arch)
        
        # Step 3: Create diagrams (75%)
        self.update_status(AgentStatus.PROCESSING, 75, "Creating architecture diagrams...")
        diagrams = self._create_architecture_diagrams(components)
        
        # Step 4: Specify integrations (100%)
        self.update_status(AgentStatus.PROCESSING, 100, "Specifying integrations...")
        integrations = self._specify_integrations(components)
        
        self.update_status(AgentStatus.COMPLETED, 100, "Solution design completed")
        
        return {
            "system_architecture": system_arch,
            "components": components,
            "diagrams": diagrams,
            "integrations": integrations
        }
    
    def _design_system_architecture(self) -> dict:
        """Design overall system architecture."""
        domain_model = self.ea_result.get("domain_model", {})
        
        prompt = f"""
        Based on this domain model:
        {domain_model}
        
        Design a cloud-native system architecture including:
        1. Architecture style (microservices, event-driven, etc.)
        2. System components
        3. Data architecture
        4. API strategy
        5. Communication patterns
        """
        
        architecture = self.call_gpt4(prompt, system_prompt="You are a Solution Architect expert in distributed systems and cloud architecture.")
        
        return {"architecture": architecture}
    
    def _define_components(self, system_arch: dict) -> dict:
        """Define detailed component specifications."""
        components = {
            "services": [
                "API Gateway",
                "Authentication Service",
                "Business Services",
                "Data Services"
            ],
            "databases": ["PostgreSQL", "Redis", "MongoDB"],
            "messaging": ["RabbitMQ", "Kafka"],
            "infrastructure": ["Kubernetes", "Docker", "Terraform"]
        }
        
        return components
    
    def _create_architecture_diagrams(self, components: dict) -> dict:
        """Create C4 model diagrams (mermaid format)."""
        return {
            "context_diagram": "System Context Diagram",
            "container_diagram": "Container Diagram",
            "component_diagram": "Component Diagram",
            "deployment_diagram": "Deployment Diagram"
        }
    
    def _specify_integrations(self, components: dict) -> dict:
        """Specify integration patterns and APIs."""
        return {
            "rest_apis": ["RESTful endpoints", "OpenAPI specs"],
            "events": ["Event sourcing", "CQRS patterns"],
            "messaging": ["Async messaging", "Message queues"]
        }
