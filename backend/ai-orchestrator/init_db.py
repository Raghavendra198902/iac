"""Initialize database tables."""
from sqlalchemy import create_engine
from src.models.project import Base
from src.models.artifact import Artifact
from src.models.agent_execution import AgentExecution
from src.utils.config import settings

def init_db():
    """Create all database tables."""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

if __name__ == "__main__":
    init_db()
