"""
Unit tests for AI agents.
"""
import pytest
from unittest.mock import Mock, patch
from src.agents.base_agent import BaseAgent
from src.agents.chief_architect import ChiefArchitectAgent
from src.models.agent_execution import AgentStatus

class TestBaseAgent:
    """Tests for BaseAgent class."""
    
    def test_update_status(self):
        """Test updating agent status."""
        # Mock the database operations
        with patch('src.agents.base_agent.get_db'):
            agent = ChiefArchitectAgent("test-project-id")
            
            # Test status update (will use mocked DB)
            agent.update_status(AgentStatus.PROCESSING, 50, "Processing...")
            
            # Verify method doesn't crash
            assert True

class TestChiefArchitect:
    """Tests for Chief Architect agent."""
    
    @patch('src.agents.chief_architect.ChiefArchitectAgent.call_gpt4')
    @patch('src.agents.chief_architect.ChiefArchitectAgent.call_claude')
    @patch('src.agents.base_agent.get_db')
    def test_execute(self, mock_db, mock_claude, mock_gpt4):
        """Test Chief Architect execution."""
        # Mock LLM responses
        mock_gpt4.return_value = "Business analysis result"
        mock_claude.return_value = "Strategy definition"
        
        # Mock database query
        mock_project = Mock()
        mock_project.input_data = {
            "name": "Test Project",
            "description": "Test description",
            "business_goals": ["Goal 1", "Goal 2"],
            "industry": "Healthcare"
        }
        
        mock_db_session = Mock()
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_project
        mock_db.return_value.__enter__.return_value = mock_db_session
        
        # Execute agent
        agent = ChiefArchitectAgent("test-project-id")
        result = agent.execute()
        
        # Verify result structure
        assert "business_analysis" in result
        assert "strategy" in result
        assert "constraints" in result
        assert "roadmap" in result
        
        # Verify LLM was called
        assert mock_gpt4.called
        assert mock_claude.called

class TestAgentWorkflow:
    """Integration tests for agent workflow."""
    
    @patch('src.agents.base_agent.get_db')
    def test_agent_initialization(self, mock_db):
        """Test agent initialization with project ID."""
        mock_execution = Mock()
        mock_db_session = Mock()
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_execution
        mock_db.return_value.__enter__.return_value = mock_db_session
        
        agent = ChiefArchitectAgent("test-project-id")
        
        assert agent.project_id == "test-project-id"
        assert agent.agent_id == "chief"
        assert agent.agent_name == "Chief Architect"
