from celery import shared_task
from ..agents.chief_architect import ChiefArchitectAgent
from ..agents.enterprise_architect import EnterpriseArchitectAgent
from ..agents.solution_architect import SolutionArchitectAgent
from ..agents.technical_architect import TechnicalArchitectAgent
from ..agents.project_manager import ProjectManagerAgent
from ..agents.security_engineer import SecurityEngineerAgent

@shared_task
def start_generation_workflow(project_id: str, mode: str):
    """
    Main orchestration workflow for AI architecture generation.
    Executes agents in sequence: Chief → EA → SA → TA → PM → SE
    """
    try:
        # Phase 1: Chief Architect - Strategic Planning
        chief = ChiefArchitectAgent(project_id)
        chief_result = chief.execute()
        
        # Phase 2: Enterprise Architect - Business Architecture
        ea = EnterpriseArchitectAgent(project_id, chief_result)
        ea_result = ea.execute()
        
        # Phase 3: Solution Architect - Solution Design
        sa = SolutionArchitectAgent(project_id, ea_result)
        sa_result = sa.execute()
        
        # Phase 4: Technical Architect - Technical Design & Code
        ta = TechnicalArchitectAgent(project_id, sa_result)
        ta_result = ta.execute()
        
        # Phase 5: Project Manager - Project Planning
        pm = ProjectManagerAgent(project_id, ta_result)
        pm_result = pm.execute()
        
        # Phase 6: Security Engineer - Security & Compliance
        se = SecurityEngineerAgent(project_id, pm_result)
        se_result = se.execute()
        
        return {
            "status": "completed",
            "project_id": project_id,
            "results": {
                "chief": chief_result,
                "ea": ea_result,
                "sa": sa_result,
                "ta": ta_result,
                "pm": pm_result,
                "se": se_result
            }
        }
        
    except Exception as e:
        # TODO: Update project status to failed
        raise e
