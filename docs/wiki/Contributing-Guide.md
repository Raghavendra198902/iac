# Contributing Guide

Thank you for considering contributing to IAC Dharma! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

###Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior**:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at raghavendra198902@gmail.com. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before contributing, make sure you have:
- **Git** installed and configured
- **Node.js 18+** (20 LTS recommended)
- **Docker & Docker Compose**
- **GitHub account** with SSH keys configured
- Read the **[Development Setup](Development-Setup)** guide

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click "Fork" button at https://github.com/Raghavendra198902/iac

# 2. Clone your fork
git clone git@github.com:YOUR_USERNAME/iac.git
cd iac

# 3. Add upstream remote
git remote add upstream git@github.com:Raghavendra198902/iac.git

# 4. Verify remotes
git remote -v
# origin    git@github.com:YOUR_USERNAME/iac.git (fetch)
# origin    git@github.com:YOUR_USERNAME/iac.git (push)
# upstream  git@github.com:Raghavendra198902/iac.git (fetch)
# upstream  git@github.com:Raghavendra198902/iac.git (push)
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your master branch
git checkout master
git merge upstream/master

# Push to your fork
git push origin master
```

---

## Development Process

### 1. Find an Issue

- Browse [open issues](https://github.com/Raghavendra198902/iac/issues)
- Look for issues labeled `good-first-issue` or `help-wanted`
- Comment on the issue to claim it
- Wait for maintainer approval before starting work

### 2. Create a Branch

```bash
# Update master
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description

# Branch naming conventions:
# feature/  - New features
# fix/      - Bug fixes
# docs/     - Documentation changes
# refactor/ - Code refactoring
# test/     - Adding or updating tests
# chore/    - Maintenance tasks
```

### 3. Make Changes

```bash
# Make your changes
code backend/api-gateway/src/routes/blueprints.ts

# Test locally
npm test
npm run lint

# Commit frequently with clear messages
git add .
git commit -m "feat: add blueprint validation endpoint"
```

### 4. Push Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Link related issues
5. Request review
6. Address review comments
7. Wait for approval and merge

---

## Pull Request Process

### PR Requirements

Before submitting a PR, ensure:

✅ **Code Quality**:
- [ ] Code follows project style guide
- [ ] All linters pass (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code is properly formatted (`npm run format`)

✅ **Testing**:
- [ ] All existing tests pass (`npm test`)
- [ ] New features have unit tests
- [ ] Integration tests added if applicable
- [ ] Test coverage remains above 75%

✅ **Documentation**:
- [ ] Code is well-commented
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Wiki pages updated if needed

✅ **Git Hygiene**:
- [ ] Commits follow conventional commit format
- [ ] Commit history is clean (squash if needed)
- [ ] Branch is up-to-date with master
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issues
Fixes #123
Closes #456

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

**Test Configuration**:
- OS: Ubuntu 22.04
- Node: 20.10.0
- Docker: 24.0.7

## Screenshots (if applicable)
![Before](link-to-before-image)
![After](link-to-after-image)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
   - Linting
   - Type checking
   - Unit tests
   - Integration tests
   - Build verification

2. **Code Review**: Maintainers review your code
   - At least 1 approval required
   - Address all comments
   - Make requested changes

3. **Final Approval**: Maintainer approves and merges
   - Squash and merge (preferred)
   - Regular merge (for complex features)

---

## Coding Standards

### TypeScript/JavaScript

#### Code Style

```typescript
// ✅ Good
export class BlueprintService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache
  ) {}

  async createBlueprint(data: CreateBlueprintDto): Promise<Blueprint> {
    // Validate input
    this.validateBlueprintData(data);

    // Create blueprint
    const blueprint = await this.db.blueprints.create({
      name: data.name,
      provider: data.provider,
      resources: data.resources,
      createdAt: new Date()
    });

    // Cache result
    await this.cache.set(`blueprint:${blueprint.id}`, blueprint, 3600);

    return blueprint;
  }

  private validateBlueprintData(data: CreateBlueprintDto): void {
    if (!data.name || data.name.length < 3) {
      throw new ValidationError('Blueprint name must be at least 3 characters');
    }
  }
}

// ❌ Bad
class blueprintService {
  db: any;
  cache: any;

  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }

  async create(data) {
    var blueprint = await this.db.blueprints.create(data);
    return blueprint;
  }
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class BlueprintService {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IBlueprintRepository {}
interface BlueprintRepository {} // Also acceptable

// Functions/Methods: camelCase
function createBlueprint() {}
async function fetchBlueprintById() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// Variables: camelCase
const blueprintName = 'Production VPC';
let retryCount = 0;

// Files: kebab-case
// blueprint-service.ts
// create-blueprint.dto.ts
// blueprint.controller.ts
```

#### Imports

```typescript
// Group and order imports
// 1. Node.js built-ins
import { readFile } from 'fs/promises';
import path from 'path';

// 2. External dependencies
import express from 'express';
import { validate } from 'class-validator';

// 3. Internal modules
import { BlueprintService } from './services/blueprint.service';
import { logger } from './utils/logger';
import type { Blueprint } from './types';
```

### Error Handling

```typescript
// ✅ Good: Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Usage
async function getBlueprint(id: string): Promise<Blueprint> {
  const blueprint = await db.blueprints.findById(id);
  
  if (!blueprint) {
    throw new NotFoundError('Blueprint', id);
  }
  
  return blueprint;
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, field: err.field });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Async/Await

```typescript
// ✅ Good: Use async/await
async function deployBlueprint(id: string): Promise<DeploymentResult> {
  try {
    const blueprint = await blueprintService.getById(id);
    const validation = await guardrailsEngine.validate(blueprint);
    
    if (!validation.passed) {
      throw new ValidationError('Blueprint failed validation');
    }
    
    const deployment = await orchestrator.deploy(blueprint);
    return deployment;
  } catch (error) {
    logger.error('Deployment failed:', error);
    throw error;
  }
}

// ❌ Bad: Promise chains
function deployBlueprint(id) {
  return blueprintService.getById(id)
    .then(blueprint => guardrailsEngine.validate(blueprint))
    .then(validation => {
      if (!validation.passed) {
        throw new Error('Validation failed');
      }
      return orchestrator.deploy(blueprint);
    })
    .catch(error => {
      logger.error(error);
      throw error;
    });
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// blueprint.service.test.ts
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { BlueprintService } from './blueprint.service';

describe('BlueprintService', () => {
  let service: BlueprintService;
  let mockDb: any;
  let mockCache: any;

  beforeEach(() => {
    mockDb = {
      blueprints: {
        create: jest.fn(),
        findById: jest.fn(),
      }
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    service = new BlueprintService(mockDb, mockCache);
  });

  describe('createBlueprint', () => {
    test('should create blueprint successfully', async () => {
      const input = {
        name: 'Test Blueprint',
        provider: 'aws',
        resources: []
      };
      
      const expected = {
        id: '123',
        ...input,
        createdAt: expect.any(Date)
      };
      
      mockDb.blueprints.create.mockResolvedValue(expected);
      
      const result = await service.createBlueprint(input);
      
      expect(result).toEqual(expected);
      expect(mockDb.blueprints.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(mockCache.set).toHaveBeenCalled();
    });

    test('should throw ValidationError for invalid name', async () => {
      const input = {
        name: 'ab', // Too short
        provider: 'aws',
        resources: []
      };
      
      await expect(service.createBlueprint(input))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Integration Tests

```typescript
// blueprint.integration.test.ts
import { setupTestDatabase, teardownTestDatabase } from './test-utils';
import { BlueprintService } from './blueprint.service';
import { Database } from './database';

describe('BlueprintService Integration', () => {
  let db: Database;
  let service: BlueprintService;

  beforeAll(async () => {
    db = await setupTestDatabase();
    service = new BlueprintService(db);
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  test('should persist blueprint to database', async () => {
    const blueprint = await service.createBlueprint({
      name: 'Integration Test',
      provider: 'aws',
      resources: []
    });

    const retrieved = await service.getById(blueprint.id);
    expect(retrieved).toEqual(blueprint);
  });
});
```

### Test Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Minimum coverage requirements:
# - Statements: 75%
# - Branches: 75%
# - Functions: 75%
# - Lines: 75%

# View coverage report
open coverage/lcov-report/index.html
```

---

## Documentation

### Code Comments

```typescript
/**
 * Creates a new blueprint with validation and caching.
 * 
 * @param data - Blueprint creation data
 * @returns Promise resolving to created blueprint
 * @throws {ValidationError} If blueprint data is invalid
 * @throws {ConflictError} If blueprint name already exists
 * 
 * @example
 * ```typescript
 * const blueprint = await service.createBlueprint({
 *   name: 'Production VPC',
 *   provider: 'aws',
 *   resources: [{ type: 'aws_vpc', properties: {...} }]
 * });
 * ```
 */
async createBlueprint(data: CreateBlueprintDto): Promise<Blueprint> {
  // Implementation
}
```

### API Documentation

Update API documentation when adding/changing endpoints:

```yaml
# In docs/api/openapi.yaml
paths:
  /api/blueprints:
    post:
      summary: Create new blueprint
      description: Creates a new infrastructure blueprint with validation
      tags:
        - Blueprints
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBlueprintDto'
      responses:
        '201':
          description: Blueprint created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Blueprint'
        '400':
          description: Invalid input
        '409':
          description: Blueprint name already exists
```

### Wiki Pages

Update wiki pages for significant changes:
- [Architecture Overview](Architecture-Overview) - System design changes
- [API Reference](API-Reference) - New endpoints
- [Development Setup](Development-Setup) - Setup changes
- [Troubleshooting](Troubleshooting) - New issues/solutions

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Q&A and general discussion
- **Pull Requests**: Code contributions
- **Email**: raghavendra198902@gmail.com

### Getting Help

- Read the [Documentation](Home)
- Search [existing issues](https://github.com/Raghavendra198902/iac/issues)
- Ask in [Discussions](https://github.com/Raghavendra198902/iac/discussions)
- Contact maintainers

### Recognition

Contributors are recognized in:
- **[CHANGELOG.md](https://github.com/Raghavendra198902/iac/blob/master/CHANGELOG.md)** - All contributions listed
- **GitHub Contributors** - Automatic recognition
- **Release Notes** - Major contributions highlighted

---

## Types of Contributions

### 🐛 Bug Reports

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Start services
2. Send request to /api/blueprints
3. See error

**Expected Behavior**
Blueprint should be created

**Actual Behavior**
500 error returned

**Environment**
- OS: Ubuntu 22.04
- Node: 20.10.0
- Docker: 24.0.7

**Logs**
```
Error stack trace
```
```

### 💡 Feature Requests

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Screenshots, mockups, etc.
```

### 📝 Documentation

- Fix typos
- Clarify confusing sections
- Add examples
- Update outdated information
- Create new guides

### 🧪 Testing

- Add missing tests
- Improve test coverage
- Fix flaky tests
- Add performance tests

### 🎨 UI/UX

- Design improvements
- Accessibility enhancements
- Mobile responsiveness
- User experience improvements

---

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backwards-compatible)
- **PATCH** version: Bug fixes (backwards-compatible)

### Changelog

Update [CHANGELOG.md](https://github.com/Raghavendra198902/iac/blob/master/CHANGELOG.md) following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.1.0] - 2026-01-15

### Added
- New multi-cloud synchronization feature (#234)
- Support for Oracle Cloud Infrastructure (#245)

### Changed
- Improved blueprint validation performance (#256)

### Fixed
- Memory leak in IAC generator (#267)
- CORS issues in API Gateway (#278)

### Deprecated
- Legacy blueprint format (will be removed in v2.0.0)
```

---

## Questions?

- **Documentation**: Read the [full documentation](Home)
- **Issues**: [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions)
- **Email**: raghavendra198902@gmail.com

---

## Thank You! 🙏

Your contributions make IAC Dharma better for everyone. We appreciate your time and effort!

---

**Related Pages**:
- [Development Setup](Development-Setup)
- [Testing Guide](Testing-Guide)
- [Architecture Overview](Architecture-Overview)
- [API Reference](API-Reference)

---

Last Updated: November 21, 2025 | [Back to Home](Home)
