# Testing Guide

## Backend Tests

### Setup
```bash
cd backend/ai-orchestrator
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run All Tests
```bash
pytest tests/ -v
```

### Run Specific Test Files
```bash
# API integration tests
pytest tests/test_api_integration.py -v

# Agent tests
pytest tests/test_agents.py -v

# Model tests
pytest tests/test_models.py -v
```

### Run with Coverage
```bash
pytest tests/ --cov=src --cov-report=html
```

### Test Categories

**1. API Integration Tests** (`test_api_integration.py`)
- Health check endpoint
- Project CRUD operations
- Generation workflow
- Artifacts management
- Input validation

**2. Agent Tests** (`test_agents.py`)
- Base agent functionality
- Chief Architect execution
- Agent initialization
- LLM integration mocking

**3. Model Tests** (`test_models.py`)
- Database model creation
- Enum values
- Relationships
- Data persistence

## Frontend Tests

### Setup
```bash
cd frontend
npm install
```

### Run Tests
```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Integration Testing

### Manual End-to-End Test

1. **Start infrastructure:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Start backend:**
   ```bash
   cd backend/ai-orchestrator
   source venv/bin/activate
   python init_db.py
   uvicorn src.main:app --reload --port 8000
   ```

3. **Start Celery worker:**
   ```bash
   celery -A src.celery_app worker --loglevel=info
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Test workflow:**
   - Navigate to http://localhost:5173/ai
   - Create a One-Click project
   - Start generation
   - Monitor real-time progress
   - Download artifacts

### API Testing with curl

**Health check:**
```bash
curl http://localhost:8000/health
```

**Create project:**
```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing",
    "mode": "oneclick",
    "input_data": {"industry": "healthcare"}
  }'
```

**List projects:**
```bash
curl http://localhost:8000/api/projects/
```

**Start generation:**
```bash
curl -X POST http://localhost:8000/api/generate/start \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "mode": "oneclick"
  }'
```

**Get status:**
```bash
curl http://localhost:8000/api/generate/status/your-project-id
```

## Test Coverage Goals

- API endpoints: >90%
- Agent logic: >80%
- Database models: >95%
- Frontend components: >70%

## Continuous Integration

Tests should be run automatically on:
- Pull request creation
- Commits to main branch
- Before deployment

Example GitHub Actions workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: |
          cd backend/ai-orchestrator
          pip install -r requirements.txt
          pytest tests/ -v
  
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run frontend tests
        run: |
          cd frontend
          npm install
          npm test
```
