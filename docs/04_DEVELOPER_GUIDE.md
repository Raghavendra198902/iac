# IAC Dharma v3.0 - Developer Guide

## 📋 Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Contributing](#contributing)
7. [Debugging & Profiling](#debugging--profiling)

---

## 🛠️ Development Environment Setup

### Prerequisites

```bash
# Required software
- Git 2.40+
- Node.js 20+ (LTS)
- Python 3.11+
- Docker 24.0+
- Docker Compose 2.20+

# Recommended IDE
- Visual Studio Code with extensions:
  - ESLint
  - Prettier
  - Python
  - Docker
  - GitLens
  - REST Client
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/iac-dharma.git
cd iac-dharma

# Checkout development branch
git checkout v3.0-development

# Install Node.js dependencies (API Gateway)
cd backend/api-gateway
npm install
cd ../..

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies for all services
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Copy environment configuration
cp .env.example .env.dev
# Edit .env.dev with development settings

# Start development environment
docker compose -f docker-compose.dev.yml up -d
```

### Development Environment Configuration

```bash
# .env.dev
ENVIRONMENT=development
LOG_LEVEL=debug

# Enable hot reload
HOT_RELOAD=true

# Disable authentication for testing (DEVELOPMENT ONLY!)
ZERO_TRUST_BYPASS_DEV=true

# Use local databases
POSTGRES_HOST=localhost
REDIS_HOST=localhost

# Development ports (different from production)
API_GATEWAY_PORT=4001
AIOPS_ENGINE_PORT=8101
# ... etc
```

---

## 📁 Project Structure

```
iac-dharma/
│
├── backend/                          # Backend services
│   ├── api-gateway/                  # API Gateway (Node.js/TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/          # Request handlers
│   │   │   ├── middleware/           # Express middleware
│   │   │   ├── routes/               # API routes
│   │   │   ├── services/             # Business logic
│   │   │   ├── models/               # Data models
│   │   │   ├── utils/                # Utility functions
│   │   │   └── server.ts             # Entry point
│   │   ├── tests/                    # Test files
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── aiops-engine/                 # AIOps ML Engine (Python)
│   │   ├── app.py                    # FastAPI application
│   │   ├── models/                   # ML models
│   │   │   ├── cost_predictor.py
│   │   │   ├── drift_detector.py
│   │   │   └── ...
│   │   ├── services/                 # Business logic
│   │   ├── utils/                    # Helper functions
│   │   ├── tests/                    # Test files
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── zero-trust-security/          # Zero Trust Service (Python)
│   │   ├── app.py
│   │   ├── trust_engine.py           # Trust calculation
│   │   ├── policy_engine.py          # Policy evaluation
│   │   ├── session_manager.py        # Session management
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── ai-orchestrator/              # AI Orchestrator (Python)
│   ├── self-healing-engine/          # Self-Healing (Python)
│   ├── cmdb-agent/                   # CMDB Agent (Python)
│   ├── chaos-engineering/            # Chaos Engineering (Python)
│   ├── observability-suite/          # Observability (Python)
│   └── cost-optimizer/               # Cost Optimizer (Python)
│
├── frontend/                         # Future: Web UI
│   └── (planned)
│
├── infrastructure/                   # Infrastructure configuration
│   ├── terraform/                    # Terraform modules
│   ├── kubernetes/                   # K8s manifests
│   └── ansible/                      # Ansible playbooks
│
├── docs/                             # Documentation
│   ├── 01_ARCHITECTURE_OVERVIEW.md
│   ├── 02_API_REFERENCE.md
│   ├── 03_DEPLOYMENT_OPERATIONS.md
│   └── 04_DEVELOPER_GUIDE.md (this file)
│
├── scripts/                          # Utility scripts
│   ├── backup.sh
│   ├── deploy.sh
│   ├── test-services.sh
│   └── train-ml-models.sh
│
├── tests/                            # Integration tests
│   ├── e2e/                          # End-to-end tests
│   ├── integration/                  # Integration tests
│   └── performance/                  # Load tests
│
├── docker-compose.v3.yml             # Production compose
├── docker-compose.dev.yml            # Development compose
├── .env.example                      # Environment template
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

### Service Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Development Flow                        │
└─────────────────────────────────────────────────────────────┘

Developer ──► Local IDE ──► Git Branch ──► CI/CD ──► Deployment
     │             │              │             │           │
     │             │              │             │           │
     ▼             ▼              ▼             ▼           ▼
  Code        Hot Reload     Pull Request    Tests     Production
  Edit        Auto Restart   Code Review     Build     Release
     │             │              │             │           │
     │             │              │             │           │
     └──► Debug ───┴──► Test ────┴──► Merge ──┴──► Tag ───┘
```

---

## 💻 Development Workflow

### Branch Strategy

```
main (production)
  │
  ├── v3.0-development (active dev)
  │     │
  │     ├── feature/zero-trust-security
  │     ├── feature/ai-orchestrator
  │     ├── bugfix/memory-leak
  │     └── enhancement/performance
  │
  └── v2.0-maintenance (bug fixes only)
```

### Feature Development Flow

```bash
# 1. Create feature branch
git checkout v3.0-development
git pull origin v3.0-development
git checkout -b feature/new-feature

# 2. Develop feature
# ... make changes ...

# 3. Run tests locally
npm test                    # Node.js services
pytest tests/              # Python services

# 4. Run integration tests
./run-integration-tests.sh

# 5. Commit changes
git add .
git commit -m "feat: add new feature

- Detailed description of changes
- Breaking changes (if any)
- Related issue: #123"

# 6. Push to remote
git push origin feature/new-feature

# 7. Create pull request
# - Add description
# - Link related issues
# - Request reviewers
# - Wait for CI checks

# 8. After approval, merge to v3.0-development
git checkout v3.0-development
git merge feature/new-feature
git push origin v3.0-development

# 9. Delete feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples**:
```bash
feat(zero-trust): add multi-factor authentication support

Implement MFA verification using TOTP and SMS methods.
Adds new endpoints for MFA enrollment and verification.

Closes #123

---

fix(api-gateway): resolve memory leak in request logging

The request logger was not properly releasing memory after
processing large payloads. Added proper cleanup in middleware.

Fixes #456

---

perf(aiops): optimize ML model inference time

- Implement model caching
- Add batch prediction support
- Reduce preprocessing overhead

Results in 40% faster predictions.

Related to #789
```

### Code Review Checklist

**For Authors**:
- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] Added/updated tests for new code
- [ ] Updated documentation
- [ ] No sensitive data in code
- [ ] Performance impact considered
- [ ] Security implications reviewed

**For Reviewers**:
- [ ] Code is readable and maintainable
- [ ] Logic is correct and efficient
- [ ] Error handling is appropriate
- [ ] Tests adequately cover changes
- [ ] Documentation is clear
- [ ] No security vulnerabilities
- [ ] Performance is acceptable

---

## 📐 Coding Standards

### TypeScript/Node.js Guidelines

```typescript
// ✅ Good: Clear naming, proper types, error handling
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZeroTrustService } from '../services/zero-trust';

interface VerifyAccessRequest {
  userId: string;
  resource: string;
  action: string;
  deviceId: string;
}

async function verifyAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requestData: VerifyAccessRequest = {
      userId: req.body.user_id,
      resource: req.body.resource,
      action: req.body.action,
      deviceId: req.body.device_id
    };

    // Validate input
    if (!requestData.userId || !requestData.resource) {
      res.status(400).json({
        error: 'Missing required fields: user_id, resource'
      });
      return;
    }

    // Call service
    const zeroTrust = new ZeroTrustService();
    const result = await zeroTrust.verifyAccess(requestData);

    // Log and respond
    logger.info('Access verification completed', {
      userId: requestData.userId,
      decision: result.decision
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('Access verification failed', { error });
    next(error); // Pass to error handler
  }
}

export { verifyAccess, VerifyAccessRequest };
```

**TypeScript Style Rules**:
- Use `interface` for data shapes, `type` for unions/intersections
- Always specify return types for functions
- Use `async/await` instead of promises `.then()`
- Prefer `const` over `let`, never use `var`
- Use arrow functions for callbacks
- Use template literals for string concatenation
- Use destructuring where appropriate

### Python Guidelines

```python
# ✅ Good: Type hints, docstrings, proper structure
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


@dataclass
class TrustScore:
    """Trust score calculation result.
    
    Attributes:
        overall_score: Combined trust score (0-100)
        trust_level: Categorical trust level
        breakdown: Individual component scores
    """
    overall_score: float
    trust_level: str
    breakdown: Dict[str, float]


class TrustEngine:
    """Calculates trust scores based on multiple factors."""
    
    TRUST_WEIGHTS = {
        'device': 0.35,
        'user': 0.40,
        'context': 0.25
    }
    
    TRUST_LEVELS = {
        'none': (0, 20),
        'low': (20, 40),
        'medium': (40, 60),
        'high': (60, 80),
        'full': (80, 100)
    }
    
    def __init__(self, db_connection):
        """Initialize trust engine.
        
        Args:
            db_connection: Database connection for storing scores
        """
        self.db = db_connection
        self._cache = {}
    
    def calculate_trust_score(
        self,
        device_score: float,
        user_score: float,
        context_score: float
    ) -> TrustScore:
        """Calculate overall trust score.
        
        Args:
            device_score: Device posture score (0-100)
            user_score: User behavior score (0-100)
            context_score: Context analysis score (0-100)
            
        Returns:
            TrustScore object with overall score and breakdown
            
        Raises:
            ValueError: If any score is out of range
            
        Example:
            >>> engine = TrustEngine(db)
            >>> score = engine.calculate_trust_score(95, 100, 75)
            >>> print(score.overall_score)
            91.25
        """
        # Validate inputs
        if not all(0 <= s <= 100 for s in [device_score, user_score, context_score]):
            raise ValueError("All scores must be between 0 and 100")
        
        # Calculate weighted score
        overall = (
            device_score * self.TRUST_WEIGHTS['device'] +
            user_score * self.TRUST_WEIGHTS['user'] +
            context_score * self.TRUST_WEIGHTS['context']
        )
        
        # Determine trust level
        trust_level = self._get_trust_level(overall)
        
        # Log calculation
        logger.info(
            f"Trust score calculated: {overall:.2f} ({trust_level})",
            extra={
                'device': device_score,
                'user': user_score,
                'context': context_score
            }
        )
        
        return TrustScore(
            overall_score=round(overall, 2),
            trust_level=trust_level,
            breakdown={
                'device_trust': device_score,
                'user_trust': user_score,
                'context_trust': context_score
            }
        )
    
    def _get_trust_level(self, score: float) -> str:
        """Map numeric score to trust level category."""
        for level, (min_score, max_score) in self.TRUST_LEVELS.items():
            if min_score <= score < max_score:
                return level
        return 'full'  # 80-100 range


# ❌ Bad: No types, poor naming, no documentation
def calc(d, u, c):
    s = d*0.35 + u*0.4 + c*0.25
    if s < 20:
        l = 'none'
    elif s < 40:
        l = 'low'
    # ... etc
    return s, l
```

**Python Style Rules**:
- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use type hints for all function parameters and returns
- Write docstrings for all classes and public methods (Google style)
- Use `dataclass` for simple data containers
- Use `@property` for computed attributes
- Use `with` statements for resource management
- Prefer list comprehensions over `map()`/`filter()`
- Use f-strings for string formatting

### Database Queries

```python
# ✅ Good: Parameterized queries, proper error handling
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict

async def get_user_by_id(
    conn,
    user_id: str
) -> Optional[Dict]:
    """Retrieve user by ID with parameterized query.
    
    Args:
        conn: Database connection
        user_id: User ID to look up
        
    Returns:
        User dict or None if not found
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Parameterized query prevents SQL injection
        query = """
            SELECT 
                user_id,
                username,
                email,
                roles,
                mfa_enabled,
                created_at
            FROM zero_trust.users
            WHERE user_id = %s
            AND deleted_at IS NULL
        """
        
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if result:
            logger.debug(f"User found: {user_id}")
            return dict(result)
        else:
            logger.warning(f"User not found: {user_id}")
            return None
            
    except Exception as e:
        logger.error(f"Database error: {e}", exc_info=True)
        raise
    finally:
        cursor.close()


# ❌ Bad: SQL injection vulnerability, no error handling
def get_user(conn, user_id):
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE user_id = '{user_id}'"  # DANGER!
    cursor.execute(query)
    return cursor.fetchone()
```

---

## 🧪 Testing Guidelines

### Test Structure

```python
# tests/test_trust_engine.py
import pytest
from unittest.mock import Mock, patch
from backend.zero_trust_security.trust_engine import TrustEngine, TrustScore


class TestTrustEngine:
    """Test suite for TrustEngine class."""
    
    @pytest.fixture
    def mock_db(self):
        """Fixture for mock database connection."""
        return Mock()
    
    @pytest.fixture
    def trust_engine(self, mock_db):
        """Fixture for TrustEngine instance."""
        return TrustEngine(mock_db)
    
    def test_calculate_trust_score_high_trust(self, trust_engine):
        """Test trust score calculation with high trust values."""
        # Arrange
        device_score = 95.0
        user_score = 100.0
        context_score = 75.0
        
        # Act
        result = trust_engine.calculate_trust_score(
            device_score,
            user_score,
            context_score
        )
        
        # Assert
        assert isinstance(result, TrustScore)
        assert result.overall_score == 91.25
        assert result.trust_level == 'full'
        assert result.breakdown['device_trust'] == device_score
        assert result.breakdown['user_trust'] == user_score
        assert result.breakdown['context_trust'] == context_score
    
    def test_calculate_trust_score_low_trust(self, trust_engine):
        """Test trust score calculation with low trust values."""
        result = trust_engine.calculate_trust_score(20.0, 30.0, 25.0)
        
        assert result.overall_score == 25.5
        assert result.trust_level == 'low'
    
    @pytest.mark.parametrize("device,user,context,expected_level", [
        (0, 0, 0, 'none'),
        (30, 35, 25, 'low'),
        (50, 55, 45, 'medium'),
        (70, 75, 65, 'high'),
        (90, 95, 85, 'full'),
    ])
    def test_trust_levels(self, trust_engine, device, user, context, expected_level):
        """Test trust level categorization with various inputs."""
        result = trust_engine.calculate_trust_score(device, user, context)
        assert result.trust_level == expected_level
    
    def test_calculate_trust_score_invalid_input(self, trust_engine):
        """Test that invalid scores raise ValueError."""
        with pytest.raises(ValueError, match="must be between 0 and 100"):
            trust_engine.calculate_trust_score(-10, 50, 50)
        
        with pytest.raises(ValueError):
            trust_engine.calculate_trust_score(50, 150, 50)
    
    @patch('backend.zero_trust_security.trust_engine.logger')
    def test_logging(self, mock_logger, trust_engine):
        """Test that calculations are properly logged."""
        trust_engine.calculate_trust_score(80, 90, 70)
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args
        assert 'Trust score calculated' in call_args[0][0]


class TestTrustEngineIntegration:
    """Integration tests with real database."""
    
    @pytest.mark.integration
    def test_calculate_and_store(self, db_connection):
        """Test calculating and storing trust score."""
        engine = TrustEngine(db_connection)
        
        score = engine.calculate_trust_score(95, 100, 75)
        engine.store_score('test_user', score)
        
        # Verify stored in database
        stored = engine.get_stored_score('test_user')
        assert stored.overall_score == score.overall_score
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_trust_engine.py

# Run specific test
pytest tests/test_trust_engine.py::TestTrustEngine::test_calculate_trust_score_high_trust

# Run with coverage
pytest --cov=backend --cov-report=html

# Run only unit tests (skip slow integration tests)
pytest -m "not integration"

# Run only integration tests
pytest -m integration

# Run with verbose output
pytest -v

# Run with print statements visible
pytest -s

# Run failed tests from last run
pytest --lf

# Parallel execution (faster)
pytest -n auto
```

### Integration Testing

```bash
# Start test environment
docker compose -f docker-compose.test.yml up -d

# Run integration tests
./run-integration-tests.sh

# Example integration test
# tests/integration/test_zero_trust_flow.py
import requests
import pytest

BASE_URL = "http://localhost:4000"

class TestZeroTrustFlow:
    """End-to-end tests for Zero Trust flow."""
    
    def test_authentication_and_verification(self):
        """Test complete authentication and access verification flow."""
        # 1. Authenticate user
        auth_response = requests.post(
            f"{BASE_URL}/api/zero-trust/authenticate",
            params={
                'username': 'test_user',
                'password': 'test_password',
                'device_id': 'test_device'
            }
        )
        
        assert auth_response.status_code == 200
        token = auth_response.json()['access_token']
        assert token is not None
        
        # 2. Verify access with token
        verify_response = requests.post(
            f"{BASE_URL}/api/zero-trust/verify",
            headers={'Authorization': f'Bearer {token}'},
            json={
                'user_id': 'test_user',
                'resource': 'database/production/customer_db',
                'action': 'read',
                'device_id': 'test_device',
                'device_posture': {
                    'compliance_score': 95,
                    'encrypted': True,
                    'firewall_enabled': True
                }
            }
        )
        
        assert verify_response.status_code == 200
        result = verify_response.json()
        assert result['decision'] == 'allow'
        assert result['trust_score']['overall_score'] > 60
```

---

## 🐛 Debugging & Profiling

### Debug Configuration

**VS Code launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Gateway",
      "program": "${workspaceFolder}/backend/api-gateway/src/server.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/backend/api-gateway/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Python: Zero Trust Service",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/zero-trust-security/app.py",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}",
        "LOG_LEVEL": "debug"
      }
    }
  ]
}
```

### Remote Debugging (Docker)

```bash
# Node.js service
docker compose -f docker-compose.dev.yml run \
  --service-ports \
  -e NODE_OPTIONS="--inspect=0.0.0.0:9229" \
  api-gateway

# Python service with debugpy
docker compose -f docker-compose.dev.yml run \
  --service-ports \
  -e DEBUGPY_ENABLED=true \
  zero-trust-security

# Attach debugger to localhost:9229 (Node) or localhost:5678 (Python)
```

### Performance Profiling

```python
# Python profiling
import cProfile
import pstats

def profile_function():
    profiler = cProfile.Profile()
    profiler.enable()
    
    # Your code here
    result = trust_engine.calculate_trust_score(95, 100, 75)
    
    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(20)  # Top 20 functions

# Memory profiling
from memory_profiler import profile

@profile
def memory_intensive_function():
    large_list = [i for i in range(1000000)]
    return sum(large_list)
```

### Logging Best Practices

```python
import logging
import json
from datetime import datetime

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

logger = logging.getLogger(__name__)

# Structured logging (JSON)
def log_structured(level, message, **kwargs):
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'level': level,
        'message': message,
        'service': 'zero-trust-security',
        **kwargs
    }
    logger.log(getattr(logging, level.upper()), json.dumps(log_entry))

# Usage
log_structured('info', 'Trust score calculated', 
    user_id='user_123',
    score=91.25,
    decision='allow'
)
```

---

## 🤝 Contributing

### Pull Request Process

1. **Fork the repository** (external contributors)
2. **Create feature branch** from `v3.0-development`
3. **Make changes** following coding standards
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Run all tests** locally
7. **Commit** with conventional commit messages
8. **Push** to your fork/branch
9. **Create pull request** with description
10. **Address review feedback**
11. **Await approval** and merge

### Code Review Guidelines

**What to Look For**:
- Correctness: Does it work as intended?
- Clarity: Is the code easy to understand?
- Efficiency: Is it performant?
- Security: Are there vulnerabilities?
- Testability: Can it be easily tested?
- Maintainability: Can it be easily modified?

**Review Comments**:
- Be constructive and specific
- Suggest improvements, don't just criticize
- Use "we" instead of "you" ("We could improve...")
- Approve when satisfied, request changes if needed

---

**Document Version**: 1.0  
**Last Updated**: December 8, 2025  
**Platform Version**: v3.0
