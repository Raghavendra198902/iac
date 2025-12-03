from .base_agent import BaseAgent
from ..models.agent_execution import AgentStatus

class EnterpriseArchitectAgent(BaseAgent):
    """
    Enterprise Architect Agent - Business Architecture
    Responsibilities:
    - Define business capabilities
    - Map business processes
    - Design domain architecture
    - Create capability models
    """
    
    def __init__(self, project_id: str, chief_result: dict):
        super().__init__(project_id, "ea", "Enterprise Architect")
        self.chief_result = chief_result
    
    def execute(self) -> dict:
        """Execute Enterprise Architect tasks."""
        self.update_status(AgentStatus.PROCESSING, 0, "Starting business architecture...")
        
        # Step 1: Define business capabilities (33%)
        self.update_status(AgentStatus.PROCESSING, 33, "Defining business capabilities...")
        capabilities = self._define_business_capabilities()
        
        # Step 2: Map business processes (66%)
        self.update_status(AgentStatus.PROCESSING, 66, "Mapping business processes...")
        processes = self._map_business_processes(capabilities)
        
        # Step 3: Create domain model (100%)
        self.update_status(AgentStatus.PROCESSING, 100, "Creating domain model...")
        domain_model = self._create_domain_model(capabilities, processes)
        
        self.update_status(AgentStatus.COMPLETED, 100, "Business architecture completed")
        
        return {
            "capabilities": capabilities,
            "processes": processes,
            "domain_model": domain_model
        }
    
    def _define_business_capabilities(self) -> dict:
        """Define core business capabilities."""
        strategy = self.chief_result.get("strategy", {})
        
        prompt = f"""
        Based on this architecture strategy:
        {strategy}
        
        Define the core business capabilities needed, organized by:
        1. Customer-facing capabilities
        2. Internal operations capabilities
        3. Support capabilities
        
        For each capability, provide:
        - Name
        - Description
        - Business value
        - Priority (High/Medium/Low)
        """
        
        capabilities = self.call_gpt4(prompt, system_prompt="You are an Enterprise Architect expert in business capability modeling.")
        
        return {"capabilities": capabilities}
    
    def _map_business_processes(self, capabilities: dict) -> dict:
        """Map key business processes."""
        prompt = f"""
        Given these business capabilities:
        {capabilities}
        
        Map the key business processes including:
        1. Process flows
        2. Process owners
        3. Integration points
        4. Data flows
        """
        
        processes = self.call_claude(prompt)
        
        return {"processes": processes}
    
    def _create_domain_model(self, capabilities: dict, processes: dict) -> dict:
        """Create domain-driven design model."""
        return {
            "bounded_contexts": ["Core Domain", "Supporting Domains", "Generic Subdomains"],
            "aggregates": ["Entities", "Value Objects", "Domain Events"],
            "domain_services": ["Application Services", "Domain Services", "Infrastructure Services"]
        }
