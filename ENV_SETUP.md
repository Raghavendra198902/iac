# Environment Configuration

## Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Backend (.env)
```bash
# Application
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production

# AI API Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-west1-gcp

# Databases
DATABASE_URL=postgresql://iacuser:iacpassword@localhost:5432/iacdb
MONGODB_URL=mongodb://iacuser:iacpassword@localhost:27017
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://iacuser:iacpassword@localhost:5672

# File Storage
ARTIFACTS_DIR=/tmp/iac-artifacts
```

## Setup Instructions

1. **Copy environment files:**
   ```bash
   # Backend
   cp backend/ai-orchestrator/.env.example backend/ai-orchestrator/.env
   
   # Frontend (create new file)
   cat > frontend/.env << 'EOF'
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   EOF
   ```

2. **Update with your credentials:**
   - Add your OpenAI API key
   - Add your Anthropic API key
   - Add your Pinecone API key and environment
   - Generate a secure SECRET_KEY: `openssl rand -hex 32`

3. **Start infrastructure:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Initialize database:**
   ```bash
   cd backend/ai-orchestrator
   python init_db.py
   ```
