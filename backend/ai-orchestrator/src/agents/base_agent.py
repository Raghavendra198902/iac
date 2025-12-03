from abc import ABC, abstractmethod
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.agent_execution import AgentExecution, AgentStatus
from ..utils.database import get_db
from openai import OpenAI
from anthropic import Anthropic
import os

class BaseAgent(ABC):
    """Base class for all AI agents."""
    
    def __init__(self, project_id: str, agent_id: str, agent_name: str):
        self.project_id = project_id
        self.agent_id = agent_id
        self.agent_name = agent_name
        
        # Initialize LLM clients
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        # Get execution record
        with get_db() as db:
            self.execution = db.query(AgentExecution).filter(
                AgentExecution.project_id == project_id,
                AgentExecution.agent_id == agent_id
            ).first()
    
    def update_status(self, status: AgentStatus, progress: float = None, message: str = None):
        """Update agent execution status in database."""
        with get_db() as db:
            execution = db.query(AgentExecution).filter(
                AgentExecution.project_id == self.project_id,
                AgentExecution.agent_id == self.agent_id
            ).first()
            
            if execution:
                execution.status = status
                if progress is not None:
                    execution.progress = progress
                if message is not None:
                    execution.message = message
                
                if status == AgentStatus.PROCESSING and not execution.started_at:
                    execution.started_at = datetime.utcnow()
                
                if status in [AgentStatus.COMPLETED, AgentStatus.FAILED]:
                    execution.completed_at = datetime.utcnow()
                    if execution.started_at:
                        delta = execution.completed_at - execution.started_at
                        execution.duration = int(delta.total_seconds())
                
                db.commit()
    
    @abstractmethod
    def execute(self) -> dict:
        """Execute the agent's main task. Must be implemented by subclasses."""
        pass
    
    def call_gpt4(self, prompt: str, system_prompt: str = None) -> str:
        """Call OpenAI GPT-4 Turbo."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )
        
        return response.choices[0].message.content
    
    def call_claude(self, prompt: str, system_prompt: str = None) -> str:
        """Call Anthropic Claude 3 Opus."""
        response = self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=4000,
            system=system_prompt if system_prompt else "",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
