/**
 * Permission Middleware Usage Examples
 * 
 * This file demonstrates how to use the permission system in route handlers
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission, requireAnyRole, canPerform } from '../middleware/permissions';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * Example 1: PM Approval Endpoints
 */

// PM can approve deployments
router.post(
  '/approvals/deployments/:id/approve',
  requirePermission('deployment', 'approve', 'project'),
  async (req, res) => {
    // Handler implementation
    res.json({ message: 'Deployment approved' });
  }
);

// PM can manage budgets
router.post(
  '/budget/projects/:id/allocate',
  requirePermission('budget', 'manage', 'project'),
  async (req, res) => {
    res.json({ message: 'Budget allocated' });
  }
);

/**
 * Example 2: SE Deployment Endpoints
 */

// SE can execute deployments
router.post(
  '/deployments/:id/execute',
  requirePermission('deployment', 'execute', 'project'),
  async (req, res) => {
    res.json({ message: 'Deployment executed' });
  }
);

// SE can create incidents
router.post(
  '/incidents',
  requirePermission('incident', 'create', 'project'),
  async (req, res) => {
    res.json({ message: 'Incident created' });
  }
);

/**
 * Example 3: EA Governance Endpoints
 */

// EA can create policies
router.post(
  '/policies',
  requirePermission('policy', 'create', 'tenant'),
  async (req, res) => {
    res.json({ message: 'Policy created' });
  }
);

// EA can approve patterns
router.post(
  '/patterns/:id/approve',
  requirePermission('pattern', 'approve', 'tenant'),
  async (req, res) => {
    res.json({ message: 'Pattern approved' });
  }
);

/**
 * Example 4: TA Infrastructure Endpoints
 */

// TA can create IaC
router.post(
  '/iac/generate',
  requirePermission('iac', 'create', 'project'),
  async (req, res) => {
    res.json({ message: 'IaC generated' });
  }
);

// TA can override guardrails
router.post(
  '/guardrails/:id/override',
  requirePermission('guardrail', 'override', 'project'),
  async (req, res) => {
    res.json({ message: 'Guardrail overridden' });
  }
);

/**
 * Example 5: SA Design Endpoints
 */

// SA can create blueprints
router.post(
  '/blueprints',
  requirePermission('blueprint', 'create', 'project'),
  async (req, res) => {
    res.json({ message: 'Blueprint created' });
  }
);

// SA can access AI recommendations
router.get(
  '/ai/recommendations',
  requirePermission('ai-recommendation', 'read', 'project'),
  async (req, res) => {
    res.json({ recommendations: [] });
  }
);

/**
 * Example 6: Role-based Access (Simplified)
 */

// Only architects can access
router.get(
  '/architecture/review',
  requireAnyRole('EA', 'SA', 'TA'),
  async (req, res) => {
    res.json({ message: 'Architecture review' });
  }
);

/**
 * Example 7: Programmatic Permission Check
 */

router.get('/deployments/:id', authMiddleware, async (req, res) => {
  // Check permission within handler
  if (canPerform(req, 'deployment', 'read', 'project')) {
    res.json({ deployment: { id: req.params.id } });
  } else {
    res.status(403).json({ error: 'Insufficient permissions' });
  }
});

/**
 * Example 8: Multiple Permission Check
 */

router.post('/deployments/:id/rollback', authMiddleware, async (req, res) => {
  // Check if user can execute OR if they're a PM who can approve
  const canExecute = canPerform(req, 'deployment', 'execute', 'project');
  const canApprove = canPerform(req, 'deployment', 'approve', 'project');

  if (canExecute || canApprove) {
    res.json({ message: 'Rollback initiated' });
  } else {
    res.status(403).json({ error: 'Cannot rollback deployment' });
  }
});

export default router;
