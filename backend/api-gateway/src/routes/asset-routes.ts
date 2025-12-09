import { Router, Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';
import { Pool } from 'pg';

export function createAssetRoutes(pool: Pool): Router {
  const router = Router();
  const assetRepo = new AssetRepository(pool);

  // Get all assets for a project
  router.get('/projects/:projectId/assets', async (req: Request, res: Response) => {
    try {
      const assets = await assetRepo.getProjectAssets(req.params.projectId);
      res.json(assets);
    } catch (error) {
      logger.error('Error fetching project assets:', { error });
      res.status(500).json({ error: 'Failed to fetch project assets' });
    }
  });

  // Get asset summary for all projects or specific project
  router.get('/assets/summary', async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const summary = await assetRepo.getProjectAssetSummary(projectId);
      res.json(summary);
    } catch (error) {
      logger.error('Error fetching asset summary:', { error });
      res.status(500).json({ error: 'Failed to fetch asset summary' });
    }
  });

  // Get assets for a specific workflow step
  router.get('/projects/:projectId/steps/:stepId/assets', async (req: Request, res: Response) => {
    try {
      const { projectId, stepId } = req.params;
      const assets = await assetRepo.getStepAssets(projectId, stepId);
      res.json(assets);
    } catch (error) {
      logger.error('Error fetching step assets:', { error });
      res.status(500).json({ error: 'Failed to fetch step assets' });
    }
  });

  // Link a new asset to a project
  router.post('/projects/:projectId/assets', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const assetData = { ...req.body, projectId };

      if (!assetData.assetType || !assetData.assetId || !assetData.assetName) {
        return res.status(400).json({ 
          error: 'Missing required fields: assetType, assetId, assetName' 
        });
      }

      const asset = await assetRepo.linkAssetToProject(assetData);
      res.status(201).json(asset);
    } catch (error) {
      logger.error('Error linking asset:', { error });
      res.status(500).json({ error: 'Failed to link asset to project' });
    }
  });

  // Update asset status
  router.patch('/assets/:assetId/status', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.assetId);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      await assetRepo.updateAssetStatus(assetId, status);
      res.json({ success: true, message: 'Asset status updated' });
    } catch (error) {
      logger.error('Error updating asset status:', { error });
      res.status(500).json({ error: 'Failed to update asset status' });
    }
  });

  // Delete asset link
  router.delete('/assets/:assetId', async (req: Request, res: Response) => {
    try {
      const assetId = parseInt(req.params.assetId);
      await assetRepo.deleteAsset(assetId);
      res.json({ success: true, message: 'Asset link deleted' });
    } catch (error) {
      logger.error('Error deleting asset:', { error });
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  });

  return router;
}
