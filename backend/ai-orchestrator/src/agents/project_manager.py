from .base_agent import BaseAgent
from ..models.agent_execution import AgentStatus

class ProjectManagerAgent(BaseAgent):
    """
    Project Manager Agent - Project Planning
    Responsibilities:
    - Create project plan
    - Define milestones and timeline
    - Resource allocation
    - Risk management
    """
    
    def __init__(self, project_id: str, ta_result: dict):
        super().__init__(project_id, "pm", "Project Manager")
        self.ta_result = ta_result
    
    def execute(self) -> dict:
        """Execute Project Manager tasks."""
        self.update_status(AgentStatus.PROCESSING, 0, "Starting project planning...")
        
        # Step 1: Create project plan (50%)
        self.update_status(AgentStatus.PROCESSING, 50, "Creating project plan...")
        project_plan = self._create_project_plan()
        
        # Step 2: Define timeline (100%)
        self.update_status(AgentStatus.PROCESSING, 100, "Defining timeline and milestones...")
        timeline = self._define_timeline()
        
        self.update_status(AgentStatus.COMPLETED, 100, "Project planning completed")
        
        return {
            "project_plan": project_plan,
            "timeline": timeline
        }
    
    def _create_project_plan(self) -> dict:
        """Create comprehensive project plan."""
        iac = self.ta_result.get("infrastructure", {})
        
        prompt = f"""
        Based on this technical implementation:
        {iac}
        
        Create a detailed project plan including:
        1. Work breakdown structure (WBS)
        2. Task dependencies
        3. Resource requirements
        4. Risk assessment
        5. Communication plan
        """
        
        plan = self.call_gpt4(prompt, system_prompt="You are a Senior Project Manager (PMP certified) with experience in software and infrastructure projects.")
        
        return {"plan": plan}
    
    def _define_timeline(self) -> dict:
        """Define project timeline with milestones."""
        return {
            "phases": [
                {"name": "Planning", "duration": "2 weeks"},
                {"name": "Development", "duration": "8 weeks"},
                {"name": "Testing", "duration": "2 weeks"},
                {"name": "Deployment", "duration": "1 week"}
            ],
            "milestones": [
                "Architecture approved",
                "MVP completed",
                "Testing passed",
                "Production deployed"
            ]
        }
