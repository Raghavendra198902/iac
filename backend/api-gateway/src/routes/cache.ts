import { Router, Request, Response } from 'express';
import { getCacheStats, cacheFlushAll } from '../utils/cache';
import { logger } from '../utils/logger';

const router = Router();

// GET cache statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getCacheStats();
    
    // Calculate hit rate
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) : '0.00';
    
    res.json({
      ...stats,
      hitRate: `${hitRate}%`,
      totalRequests: total,
    });
  } catch (error: any) {
    logger.error('Error getting cache stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// DELETE flush all cache
router.delete('/flush', async (req: Request, res: Response) => {
  try {
    const success = await cacheFlushAll();
    
    if (success) {
      logger.warn('Cache flushed by admin', { userId: (req as any).user?.id });
      res.json({ message: 'Cache flushed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to flush cache' });
    }
  } catch (error: any) {
    logger.error('Error flushing cache', { error: error.message });
    res.status(500).json({ error: 'Failed to flush cache' });
  }
});

// POST warmup specific cache keys
router.post('/warmup', async (req: Request, res: Response) => {
  try {
    const { keys } = req.body;
    
    if (!Array.isArray(keys)) {
      return res.status(400).json({ error: 'Keys must be an array' });
    }
    
    logger.info('Cache warmup requested', { keys, userId: (req as any).user?.id });
    
    // In a real implementation, you would trigger warmup tasks here
    res.json({ 
      message: 'Cache warmup initiated',
      keys: keys.length 
    });
  } catch (error: any) {
    logger.error('Error warming up cache', { error: error.message });
    res.status(500).json({ error: 'Failed to warmup cache' });
  }
});

export default router;
