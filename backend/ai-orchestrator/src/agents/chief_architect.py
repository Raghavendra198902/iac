from .base_agent import BaseAgent
from ..models.agent_execution import AgentStatus
from ..models.project import Project
from ..utils.database import get_db

class ChiefArchitectAgent(BaseAgent):
    """
    Chief Architect Agent - Strategic Planning & Vision
    Responsibilities:
    - Understand business context and requirements
    - Define architecture strategy
    - Set technical direction
    - Identify constraints and risks
    """
    
    def __init__(self, project_id: str):
        super().__init__(project_id, "chief", "Chief Architect")
    
    def execute(self) -> dict:
        """Execute Chief Architect tasks."""
        self.update_status(AgentStatus.PROCESSING, 0, "Starting strategic analysis...")
        
        # Load project data
        with get_db() as db:
            project = db.query(Project).filter(Project.id == self.project_id).first()
            input_data = project.input_data
        
        # Step 1: Analyze business requirements (25%)
        self.update_status(AgentStatus.PROCESSING, 25, "Analyzing business requirements...")
        business_analysis = self._analyze_business_requirements(input_data)
        
        # Step 2: Define architecture strategy (50%)
        self.update_status(AgentStatus.PROCESSING, 50, "Defining architecture strategy...")
        strategy = self._define_architecture_strategy(business_analysis)
        
        # Step 3: Identify constraints and risks (75%)
        self.update_status(AgentStatus.PROCESSING, 75, "Identifying constraints and risks...")
        constraints = self._identify_constraints(input_data, strategy)
        
        # Step 4: Create strategic roadmap (100%)
        self.update_status(AgentStatus.PROCESSING, 100, "Creating strategic roadmap...")
        roadmap = self._create_strategic_roadmap(strategy, constraints)
        
        self.update_status(AgentStatus.COMPLETED, 100, "Strategic planning completed")
        
        return {
            "business_analysis": business_analysis,
            "strategy": strategy,
            "constraints": constraints,
            "roadmap": roadmap
        }
    
    def _analyze_business_requirements(self, input_data: dict) -> dict:
        """Analyze business requirements using AI."""
        prompt = f"""
        Analyze the following business requirements and provide strategic insights:
        
        Project: {input_data.get('name', 'Unnamed')}
        Description: {input_data.get('description', 'No description')}
        Business Goals: {input_data.get('business_goals', [])}
        Industry: {input_data.get('industry', 'General')}
        
        Provide:
        1. Key business drivers
        2. Success criteria
        3. Stakeholder needs
        4. Business value proposition
        """
        
        analysis = self.call_gpt4(prompt, system_prompt="You are a Chief Enterprise Architect with 20+ years of experience in digital transformation.")
        
        return {"analysis": analysis, "industry": input_data.get('industry')}
    
    def _define_architecture_strategy(self, business_analysis: dict) -> dict:
        """Define high-level architecture strategy."""
        prompt = f"""
        Based on this business analysis:
        {business_analysis['analysis']}
        
        Define a comprehensive architecture strategy including:
        1. Architecture principles
        2. Technology approach (cloud-native, microservices, etc.)
        3. Integration patterns
        4. Scalability strategy
        5. Security posture
        """
        
        strategy = self.call_claude(prompt, system_prompt="You are an expert Enterprise Architect specializing in cloud architecture and digital transformation.")
        
        return {"strategy": strategy}
    
    def _identify_constraints(self, input_data: dict, strategy: dict) -> dict:
        """Identify technical and business constraints."""
        constraints = {
            "budget": input_data.get('budget', 'Not specified'),
            "timeline": input_data.get('timeline', 'Not specified'),
            "compliance": input_data.get('compliance_frameworks', []),
            "technical": input_data.get('constraints', [])
        }
        
        return constraints
    
    def _create_strategic_roadmap(self, strategy: dict, constraints: dict) -> dict:
        """Create high-level strategic roadmap."""
        return {
            "phases": [
                "Phase 1: Foundation & Infrastructure",
                "Phase 2: Core Services Development",
                "Phase 3: Integration & Testing",
                "Phase 4: Production Deployment"
            ],
            "milestones": constraints.get('timeline', 'TBD')
        }
