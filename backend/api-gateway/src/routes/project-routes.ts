import { Router, Request, Response } from 'express';
import { ProjectRepository } from '../repositories/project-repository';
import { Pool } from 'pg';
// import { cacheMiddleware, invalidateCache } from '../../../shared/cache.middleware';

// Stub functions for cache middleware (TODO: implement proper caching)
const cacheMiddleware = (opts: any) => (req: any, res: any, next: any) => next();
const invalidateCache = async (key: string) => {};

export function createProjectRoutes(pool: Pool): Router {
  const router = Router();
  const projectRepo = new ProjectRepository(pool);

  // Get all projects (cached for 3 minutes)
  router.get('/projects', cacheMiddleware({ ttl: 180 }), async (req: Request, res: Response) => {
    try {
      const projects = await projectRepo.getAllProjects();
      res.json(projects);
    } catch (error) {
      logger.error('Error fetching projects:', { error });
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get project by ID (cached for 3 minutes)
  router.get('/projects/:id', cacheMiddleware({ ttl: 180, key: (req) => `projects:${req.params.id}` }), async (req: Request, res: Response) => {
    try {
      const project = await projectRepo.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      logger.error('Error fetching project:', { error });
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Get project stats (cached for 1 minute)
  router.get('/projects/stats/summary', cacheMiddleware({ ttl: 60 }), async (req: Request, res: Response) => {
    try {
      const stats = await projectRepo.getProjectStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching project stats:', { error });
      res.status(500).json({ error: 'Failed to fetch project stats' });
    }
  });

  // Create new project
  router.post('/projects', async (req: Request, res: Response) => {
    try {
      const { name, description, targetDate, createdBy } = req.body;

      if (!name || !description || !targetDate) {
        return res.status(400).json({ error: 'Missing required fields: name, description, targetDate' });
      }

      // Generate project ID
      const projectCount = await pool.query('SELECT COUNT(*) FROM workflow_projects');
      const nextId = `PRJ-${String(parseInt(projectCount.rows[0].count) + 1).padStart(3, '0')}`;

      const newProject = {
        id: nextId,
        name,
        description,
        createdDate: new Date().toISOString().split('T')[0],
        targetDate,
        status: 'active' as const,
        progress: 0,
        createdBy: createdBy || 'system',
      };

      const project = await projectRepo.createProject(newProject);
      // Invalidate cache after creating
      await invalidateCache('cache:*/projects*');
      res.status(201).json(project);
    } catch (error) {
      logger.error('Error creating project:', { error });
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update project progress
  router.patch('/projects/:id/progress', async (req: Request, res: Response) => {
    try {
      const { progress } = req.body;

      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ error: 'Invalid progress value. Must be between 0 and 100' });
      }

      await projectRepo.updateProjectProgress(req.params.id, progress);
      // Invalidate cache after updating
      await invalidateCache('cache:*/projects*');
      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating project progress:', { error });
      res.status(500).json({ error: 'Failed to update project progress' });
    }
  });

  // Update project status
  router.patch('/projects/:id/status', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      if (!['active', 'completed', 'on-hold'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be: active, completed, or on-hold' });
      }

      await projectRepo.updateProjectStatus(req.params.id, status);
      // Invalidate cache after updating
      await invalidateCache('cache:*/projects*');
      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating project status:', { error });
      res.status(500).json({ error: 'Failed to update project status' });
    }
  });

  // Update workflow step
  router.patch('/projects/:projectId/steps/:stepId', async (req: Request, res: Response) => {
    try {
      const { projectId, stepId } = req.params;
      const { status, assignee, completedDate, notes } = req.body;

      const updates: any = {};
      if (status) updates.status = status;
      if (assignee) updates.assignee = assignee;
      if (completedDate) updates.completedDate = completedDate;
      if (notes !== undefined) updates.notes = notes;

      await projectRepo.updateWorkflowStep(projectId, stepId, updates);

      // Recalculate project progress
      const project = await projectRepo.getProjectById(projectId);
      if (project) {
        const completedSteps = project.workflowSteps.filter(s => s.status === 'completed').length;
        const totalSteps = project.workflowSteps.length;
        const newProgress = Math.round((completedSteps / totalSteps) * 100);
        await projectRepo.updateProjectProgress(projectId, newProgress);
      }

      // Invalidate cache after updating
      await invalidateCache('cache:*/projects*');
      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating workflow step:', { error });
      res.status(500).json({ error: 'Failed to update workflow step' });
    }
  });

  return router;
}
