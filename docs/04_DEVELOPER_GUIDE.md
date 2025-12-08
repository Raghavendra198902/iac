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

## 🚀 Advanced Development Topics

### 1. Microservices Communication Patterns

#### Service-to-Service HTTP Communication

```typescript
// backend/api-gateway/src/services/http-client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import CircuitBreaker from 'opossum';

class ServiceClient {
  private client: AxiosInstance;
  private breaker: CircuitBreaker;
  
  constructor(
    private serviceName: string,
    private baseURL: string,
    private timeout: number = 5000
  ) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Circuit breaker configuration
    this.breaker = new CircuitBreaker(this.makeRequest.bind(this), {
      timeout: this.timeout,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      volumeThreshold: 10,
    });
    
    // Add interceptors
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add trace ID for distributed tracing
        const traceId = getTraceId();
        config.headers['X-Trace-ID'] = traceId;
        
        // Add authentication token
        const token = getAuthToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log request
        logger.debug(`${config.method?.toUpperCase()} ${config.url}`, {
          service: this.serviceName,
          traceId,
        });
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        logger.debug(`Response ${response.status}`, {
          service: this.serviceName,
          duration: response.config.metadata?.duration,
        });
        return response;
      },
      async (error) => {
        // Retry logic
        const config = error.config;
        if (!config || !config.retry) {
          return Promise.reject(error);
        }
        
        config.retryCount = config.retryCount || 0;
        if (config.retryCount >= config.retry) {
          return Promise.reject(error);
        }
        
        config.retryCount++;
        
        // Exponential backoff
        const delay = Math.pow(2, config.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.client(config);
      }
    );
  }
  
  private async makeRequest(config: AxiosRequestConfig) {
    const startTime = Date.now();
    try {
      const response = await this.client(config);
      const duration = Date.now() - startTime;
      
      // Emit metrics
      metrics.recordLatency(this.serviceName, duration);
      metrics.incrementCounter(`${this.serviceName}.success`);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      metrics.recordLatency(this.serviceName, duration);
      metrics.incrementCounter(`${this.serviceName}.error`);
      
      throw error;
    }
  }
  
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.breaker.fire({ ...config, method: 'GET', url: path });
  }
  
  async post<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.breaker.fire({ ...config, method: 'POST', url: path, data });
  }
}

// Usage
const orchestratorClient = new ServiceClient(
  'ai-orchestrator',
  'http://ai-orchestrator:8000',
  10000
);

const result = await orchestratorClient.post('/api/deploy', {
  template: 'web-server',
  parameters: { count: 3 },
});
```

#### Event-Driven Communication with Kafka

```typescript
// backend/shared/kafka-producer.ts
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

export class KafkaEventProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;
  
  constructor(brokers: string[]) {
    this.kafka = new Kafka({
      clientId: 'iac-dharma',
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
    
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
    });
  }
  
  async connect(): Promise<void> {
    await this.producer.connect();
    this.isConnected = true;
    logger.info('Kafka producer connected');
  }
  
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.isConnected = false;
  }
  
  async publishEvent<T>(
    topic: string,
    event: DomainEvent<T>,
    key?: string
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Producer not connected');
    }
    
    const message: ProducerRecord = {
      topic,
      messages: [{
        key: key || event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.eventType,
          'event-id': event.eventId,
          'timestamp': event.timestamp.toISOString(),
        },
      }],
    };
    
    try {
      await this.producer.send(message);
      
      logger.info('Event published', {
        topic,
        eventType: event.eventType,
        eventId: event.eventId,
      });
      
      metrics.incrementCounter('kafka.events.published', { topic });
    } catch (error) {
      logger.error('Failed to publish event', { error, event });
      throw error;
    }
  }
  
  async publishBatch<T>(
    topic: string,
    events: DomainEvent<T>[]
  ): Promise<void> {
    const messages = events.map(event => ({
      key: event.aggregateId,
      value: JSON.stringify(event),
      headers: {
        'event-type': event.eventType,
        'event-id': event.eventId,
      },
    }));
    
    await this.producer.send({ topic, messages });
  }
}

// Domain event interface
interface DomainEvent<T> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  data: T;
  metadata?: Record<string, any>;
}

// Usage
const producer = new KafkaEventProducer(['kafka:9092']);
await producer.connect();

await producer.publishEvent('infrastructure-events', {
  eventId: uuid(),
  eventType: 'InfrastructureDeployed',
  aggregateId: 'infra-123',
  aggregateType: 'Infrastructure',
  timestamp: new Date(),
  data: {
    infrastructureId: 'infra-123',
    provider: 'aws',
    region: 'us-east-1',
    resourceCount: 5,
  },
});
```

### 2. Advanced Testing Patterns

#### Contract Testing with Pact

```typescript
// backend/api-gateway/tests/contract/ai-orchestrator.pact.spec.ts
import { Pact } from '@pact-foundation/pact';
import { like, eachLike } from '@pact-foundation/pact/dsl/matchers';

describe('API Gateway -> AI Orchestrator Contract', () => {
  const provider = new Pact({
    consumer: 'api-gateway',
    provider: 'ai-orchestrator',
    port: 8989,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
  });
  
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());
  
  describe('POST /api/deploy', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user is authenticated',
        uponReceiving: 'a request to deploy infrastructure',
        withRequest: {
          method: 'POST',
          path: '/api/deploy',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': like('Bearer token'),
          },
          body: {
            template: 'web-server',
            parameters: {
              count: 3,
              instance_type: 't3.medium',
            },
          },
        },
        willRespondWith: {
          status: 202,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            jobId: like('job-123'),
            status: 'queued',
            estimatedDuration: like(300),
          },
        },
      });
    });
    
    it('returns job ID', async () => {
      const client = new OrchestratorClient('http://localhost:8989');
      const response = await client.deploy({
        template: 'web-server',
        parameters: { count: 3, instance_type: 't3.medium' },
      });
      
      expect(response.jobId).toBeDefined();
      expect(response.status).toBe('queued');
    });
  });
});
```

#### Performance Testing with k6

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 200 },  // Steady spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:4000';

export function setup() {
  // Login to get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    username: 'testuser',
    password: 'testpass',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  return { token: loginRes.json('access_token') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // Test infrastructure listing
  let res = http.get(`${BASE_URL}/api/infrastructure`, { headers });
  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!checkRes);
  
  sleep(1);
  
  // Test deployment request
  res = http.post(`${BASE_URL}/api/infrastructure/deploy`, JSON.stringify({
    template: 'web-server',
    parameters: { count: 1 },
  }), { headers });
  
  check(res, {
    'deployment accepted': (r) => r.status === 202,
  });
  
  sleep(1);
}

export function teardown(data) {
  // Cleanup
}
```

**Run Performance Test**:
```bash
k6 run --vus 100 --duration 10m tests/performance/load-test.js
```

#### Chaos Testing

```python
# tests/chaos/network_chaos.py
import time
import subprocess
from chaos_toolkit import experiment

@experiment
def simulate_network_partition():
    """Simulate network partition between services"""
    
    # Block traffic to AI Orchestrator
    subprocess.run([
        'docker', 'exec', 'api-gateway',
        'iptables', '-A', 'OUTPUT', '-d', 'ai-orchestrator', '-j', 'DROP'
    ])
    
    print("Network partition introduced")
    
    # Wait and observe system behavior
    time.sleep(60)
    
    # Restore network
    subprocess.run([
        'docker', 'exec', 'api-gateway',
        'iptables', '-D', 'OUTPUT', '-d', 'ai-orchestrator', '-j', 'DROP'
    ])
    
    print("Network restored")

@experiment
def simulate_high_latency():
    """Add 500ms latency to database connections"""
    
    subprocess.run([
        'docker', 'exec', 'postgres',
        'tc', 'qdisc', 'add', 'dev', 'eth0', 'root', 'netem', 'delay', '500ms'
    ])
    
    time.sleep(120)
    
    # Remove latency
    subprocess.run([
        'docker', 'exec', 'postgres',
        'tc', 'qdisc', 'del', 'dev', 'eth0', 'root'
    ])

# Chaos experiment definition
chaos_experiment = {
    "title": "System resilience under network failures",
    "description": "Test system behavior during network partitions",
    "method": [
        {
            "type": "action",
            "name": "introduce-network-partition",
            "provider": {
                "type": "python",
                "module": "network_chaos",
                "func": "simulate_network_partition"
            }
        }
    ],
    "steady-state-hypothesis": {
        "title": "API Gateway is healthy",
        "probes": [
            {
                "type": "probe",
                "name": "api-gateway-health",
                "tolerance": {
                    "type": "http",
                    "status": 200
                },
                "provider": {
                    "type": "http",
                    "url": "http://localhost:4000/health"
                }
            }
        ]
    }
}
```

### 3. Database Migration Patterns

#### Version-Safe Migrations

```python
# backend/shared/migrations/migration_base.py
from abc import ABC, abstractmethod
from typing import List, Dict
import time

class Migration(ABC):
    """Base class for database migrations"""
    
    def __init__(self, connection):
        self.connection = connection
        self.batch_size = 1000
        self.delay_between_batches = 0.1  # seconds
    
    @abstractmethod
    def up(self):
        """Apply migration"""
        pass
    
    @abstractmethod
    def down(self):
        """Rollback migration"""
        pass
    
    def backfill_in_batches(
        self,
        query: str,
        log_progress: bool = True
    ) -> int:
        """Backfill data in small batches to avoid locking"""
        total_updated = 0
        
        while True:
            result = self.connection.execute(
                query,
                {'batch_size': self.batch_size}
            )
            
            rows_updated = result.rowcount
            total_updated += rows_updated
            
            if log_progress and rows_updated > 0:
                print(f"Backfilled {total_updated} rows...")
            
            if rows_updated == 0:
                break
            
            # Delay to reduce load
            time.sleep(self.delay_between_batches)
        
        return total_updated
    
    def create_index_concurrently(
        self,
        table: str,
        columns: List[str],
        index_name: str
    ):
        """Create index without blocking writes"""
        cols = ', '.join(columns)
        self.connection.execute(f"""
            CREATE INDEX CONCURRENTLY {index_name}
            ON {table} ({cols})
        """)

# Example migration
class AddUsernameColumn(Migration):
    """Add username column to users table"""
    
    def up(self):
        # Step 1: Add column (nullable initially)
        self.connection.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS username VARCHAR(50)
        """)
        
        # Step 2: Create index concurrently
        self.create_index_concurrently(
            'users',
            ['username'],
            'idx_users_username'
        )
        
        # Step 3: Backfill data
        updated = self.backfill_in_batches("""
            UPDATE users
            SET username = user_name
            WHERE username IS NULL
            LIMIT %(batch_size)s
        """)
        
        print(f"Backfilled {updated} users")
        
        # Step 4: Add NOT NULL constraint (after backfill)
        # This should be done in a separate migration
        # after verifying backfill completed
    
    def down(self):
        self.connection.execute("""
            DROP INDEX IF EXISTS idx_users_username
        """)
        self.connection.execute("""
            ALTER TABLE users
            DROP COLUMN IF EXISTS username
        """)
```

### 4. Debugging Production Issues

#### Structured Logging

```typescript
// backend/shared/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: { node: 'http://elasticsearch:9200' },
  index: 'logs',
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    esTransport,
  ],
});

// Usage with structured data
logger.info('Processing deployment', {
  userId: 'user-123',
  deploymentId: 'deploy-456',
  template: 'web-server',
  parameters: { count: 3 },
  duration: 250,
  traceId: 'trace-789',
});

// Error logging with context
logger.error('Deployment failed', {
  error: err.message,
  stack: err.stack,
  userId: 'user-123',
  deploymentId: 'deploy-456',
  traceId: 'trace-789',
});
```

#### Remote Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to API Gateway",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/backend/api-gateway",
      "remoteRoot": "/app",
      "protocol": "inspector",
      "restart": true
    },
    {
      "type": "python",
      "request": "attach",
      "name": "Docker: Attach to AI Orchestrator",
      "connect": {
        "host": "localhost",
        "port": 5678
      },
      "pathMappings": [
        {
          "localRoot": "${workspaceFolder}/backend/ai-orchestrator",
          "remoteRoot": "/app"
        }
      ]
    }
  ]
}
```

**Enable debugging in Docker**:
```yaml
# docker-compose.override.yml
services:
  api-gateway:
    command: npm run debug
    ports:
      - "9229:9229"
    environment:
      - NODE_OPTIONS=--inspect=0.0.0.0:9229
  
  ai-orchestrator:
    command: python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn main:app
    ports:
      - "5678:5678"
```

---

**Document Version**: 2.0 (Advanced Edition)  
**Last Updated**: December 8, 2025  
**Platform Version**: v3.0
