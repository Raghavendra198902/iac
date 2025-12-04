"""
Alembic database migration script initializer.
"""
from alembic import command
from alembic.config import Config
import os

def run_migrations():
    """Run database migrations."""
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    print("✅ Database migrations completed")

def create_migration(message: str):
    """Create a new migration."""
    alembic_cfg = Config("alembic.ini")
    command.revision(alembic_cfg, message=message, autogenerate=True)
    print(f"✅ Migration created: {message}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "upgrade":
            run_migrations()
        elif sys.argv[1] == "create" and len(sys.argv) > 2:
            create_migration(" ".join(sys.argv[2:]))
        else:
            print("Usage:")
            print("  python migrate.py upgrade")
            print("  python migrate.py create 'migration message'")
    else:
        run_migrations()
