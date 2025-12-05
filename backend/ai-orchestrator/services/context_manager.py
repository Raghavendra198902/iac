"""
Conversation Context Manager
Manages conversation sessions, history, and context
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import json

from models.schemas import ConversationContext, ConversationMessage, Intent

logger = logging.getLogger(__name__)


class ContextManager:
    """Manages conversation context and history"""
    
    def __init__(self, max_history: int = 50, session_timeout_minutes: int = 30):
        self.sessions: Dict[str, ConversationContext] = {}
        self.max_history = max_history
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
    
    def create_session(self, session_id: str, user_id: Optional[str] = None) -> ConversationContext:
        """Create a new conversation session"""
        context = ConversationContext(
            session_id=session_id,
            user_id=user_id,
            messages=[],
            metadata={}
        )
        self.sessions[session_id] = context
        logger.info(f"Created session: {session_id}")
        return context
    
    def get_session(self, session_id: str) -> Optional[ConversationContext]:
        """Get existing session or None"""
        session = self.sessions.get(session_id)
        
        if session:
            # Check if session has timed out
            if datetime.utcnow() - session.last_activity > self.session_timeout:
                logger.info(f"Session {session_id} timed out")
                self.delete_session(session_id)
                return None
            
            # Update last activity
            session.last_activity = datetime.utcnow()
        
        return session
    
    def get_or_create_session(self, session_id: str, user_id: Optional[str] = None) -> ConversationContext:
        """Get existing session or create new one"""
        session = self.get_session(session_id)
        if not session:
            session = self.create_session(session_id, user_id)
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted session: {session_id}")
            return True
        return False
    
    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: Optional[Intent] = None,
        metadata: Optional[Dict] = None
    ) -> bool:
        """Add message to conversation history"""
        session = self.get_session(session_id)
        if not session:
            logger.warning(f"Session not found: {session_id}")
            return False
        
        message = ConversationMessage(
            role=role,
            content=content,
            intent=intent,
            metadata=metadata or {}
        )
        
        session.messages.append(message)
        
        # Trim history if too long
        if len(session.messages) > self.max_history:
            session.messages = session.messages[-self.max_history:]
        
        session.last_activity = datetime.utcnow()
        return True
    
    def get_history(self, session_id: str, limit: Optional[int] = None) -> List[ConversationMessage]:
        """Get conversation history for session"""
        session = self.get_session(session_id)
        if not session:
            return []
        
        if limit:
            return session.messages[-limit:]
        return session.messages
    
    def get_context_summary(self, session_id: str) -> Dict:
        """Get summary of conversation context for LLM"""
        session = self.get_session(session_id)
        if not session:
            return {"error": "Session not found"}
        
        # Get last 5 messages for context
        recent_messages = session.messages[-5:] if session.messages else []
        
        # Extract key entities mentioned
        entities = {}
        for msg in recent_messages:
            if msg.intent and msg.intent.entities:
                for entity in msg.intent.entities:
                    if entity.type.value not in entities:
                        entities[entity.type.value] = []
                    entities[entity.type.value].append(entity.value)
        
        return {
            "session_id": session_id,
            "user_id": session.user_id,
            "message_count": len(session.messages),
            "recent_messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in recent_messages
            ],
            "entities": entities,
            "session_duration_minutes": (
                datetime.utcnow() - session.created_at
            ).total_seconds() / 60,
            "metadata": session.metadata
        }
    
    def update_metadata(self, session_id: str, key: str, value: any) -> bool:
        """Update session metadata"""
        session = self.get_session(session_id)
        if not session:
            return False
        
        session.metadata[key] = value
        return True
    
    def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions, return count of removed sessions"""
        expired = []
        current_time = datetime.utcnow()
        
        for session_id, session in self.sessions.items():
            if current_time - session.last_activity > self.session_timeout:
                expired.append(session_id)
        
        for session_id in expired:
            self.delete_session(session_id)
        
        if expired:
            logger.info(f"Cleaned up {len(expired)} expired sessions")
        
        return len(expired)
    
    def get_active_sessions(self) -> List[str]:
        """Get list of active session IDs"""
        return list(self.sessions.keys())
    
    def get_session_count(self) -> int:
        """Get count of active sessions"""
        return len(self.sessions)
    
    def export_session(self, session_id: str) -> Optional[str]:
        """Export session to JSON string"""
        session = self.get_session(session_id)
        if not session:
            return None
        
        return json.dumps({
            "session_id": session.session_id,
            "user_id": session.user_id,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "intent": msg.intent.dict() if msg.intent else None,
                    "metadata": msg.metadata
                }
                for msg in session.messages
            ],
            "metadata": session.metadata
        }, indent=2)
