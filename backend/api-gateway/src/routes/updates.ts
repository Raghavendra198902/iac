/**
 * Update Management API
 * 
 * Manages agent updates for all platforms
 * Allows pushing updates from web interface
 */

import express, { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import multer from 'multer';
import * as crypto from 'crypto';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/updates');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.msi', '.pkg', '.deb', '.rpm', '.apk', '.ipa', '.exe', '.dmg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
    }
  },
});

// In-memory update registry (use database in production)
interface UpdatePackage {
  id: string;
  version: string;
  platform: string;
  architecture: string;
  releaseDate: string;
  downloadUrl: string;
  checksum: string;
  checksumAlgorithm: string;
  fileSize: number;
  fileName: string;
  releaseNotes: string;
  mandatory: boolean;
  active: boolean;
}

const updateRegistry: Map<string, UpdatePackage> = new Map();

/**
 * GET /api/updates/check
 * Check for available updates
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const { version, platform, architecture } = req.query;

    if (!version || !platform || !architecture) {
      return res.status(400).json({
        error: 'Missing required parameters: version, platform, architecture',
      });
    }

    // Find latest update for platform/architecture
    const latestUpdate = findLatestUpdate(platform as string, architecture as string);

    if (!latestUpdate) {
      return res.json({
        updateAvailable: false,
        currentVersion: version,
        message: 'No updates available',
      });
    }

    // Compare versions
    const updateAvailable = isNewerVersion(latestUpdate.version, version as string);

    res.json({
      updateAvailable,
      currentVersion: version,
      latestVersion: latestUpdate.version,
      updateInfo: updateAvailable ? {
        version: latestUpdate.version,
        releaseDate: latestUpdate.releaseDate,
        downloadUrl: latestUpdate.downloadUrl,
        checksum: latestUpdate.checksum,
        checksumAlgorithm: latestUpdate.checksumAlgorithm,
        releaseNotes: latestUpdate.releaseNotes,
        mandatory: latestUpdate.mandatory,
        platform: latestUpdate.platform,
        architecture: latestUpdate.architecture,
        fileSize: latestUpdate.fileSize,
      } : undefined,
    });
  } catch (error: any) {
    logger.error('Update check error:', { error });
    res.status(500).json({ error: 'Failed to check for updates' });
  }
});

/**
 * POST /api/updates/upload
 * Upload new update package (Admin only)
 */
router.post('/upload', upload.single('package'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      version,
      platform,
      architecture,
      releaseNotes,
      mandatory,
    } = req.body;

    if (!version || !platform || !architecture) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        error: 'Missing required fields: version, platform, architecture',
      });
    }

    // Calculate checksum
    const fileBuffer = await fs.readFile(req.file.path);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const checksum = hash.digest('hex');

    // Create update package entry
    const updateId = `${platform}-${architecture}-${version}`;
    const updatePackage: UpdatePackage = {
      id: updateId,
      version,
      platform,
      architecture,
      releaseDate: new Date().toISOString(),
      downloadUrl: `/api/updates/download/${updateId}`,
      checksum,
      checksumAlgorithm: 'sha256',
      fileSize: req.file.size,
      fileName: req.file.filename,
      releaseNotes: releaseNotes || '',
      mandatory: mandatory === 'true',
      active: true,
    };

    // Store in registry
    updateRegistry.set(updateId, updatePackage);

    // Save to database (implement as needed)
    // await saveUpdateToDatabase(updatePackage);

    res.json({
      success: true,
      message: 'Update package uploaded successfully',
      updateId,
      version,
      platform,
      architecture,
      fileSize: req.file.size,
      checksum,
    });
  } catch (error: any) {
    logger.error('Update upload error:', { error });
    res.status(500).json({ error: 'Failed to upload update package' });
  }
});

/**
 * GET /api/updates/download/:id
 * Download update package
 */
router.get('/download/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatePackage = updateRegistry.get(id);

    if (!updatePackage) {
      return res.status(404).json({ error: 'Update package not found' });
    }

    const filePath = path.join(__dirname, '../../uploads/updates', updatePackage.fileName);

    // Check file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Update file not found' });
    }

    // Set headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${updatePackage.fileName}"`);
    res.setHeader('Content-Length', updatePackage.fileSize);
    res.setHeader('X-Checksum', updatePackage.checksum);
    res.setHeader('X-Checksum-Algorithm', updatePackage.checksumAlgorithm);

    // Stream file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    logger.error('Download error:', { error });
    res.status(500).json({ error: 'Failed to download update' });
  }
});

/**
 * GET /api/updates/list
 * List all available updates (Admin only)
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { platform, architecture } = req.query;

    let updates = Array.from(updateRegistry.values());

    // Filter by platform if provided
    if (platform) {
      updates = updates.filter(u => u.platform === platform);
    }

    // Filter by architecture if provided
    if (architecture) {
      updates = updates.filter(u => u.architecture === architecture);
    }

    // Sort by version (newest first)
    updates.sort((a, b) => {
      return isNewerVersion(b.version, a.version) ? 1 : -1;
    });

    res.json({
      total: updates.length,
      updates: updates.map(u => ({
        id: u.id,
        version: u.version,
        platform: u.platform,
        architecture: u.architecture,
        releaseDate: u.releaseDate,
        fileSize: u.fileSize,
        mandatory: u.mandatory,
        active: u.active,
        releaseNotes: u.releaseNotes,
      })),
    });
  } catch (error: any) {
    logger.error('List updates error:', { error });
    res.status(500).json({ error: 'Failed to list updates' });
  }
});

/**
 * POST /api/updates/push
 * Push update to specific agents or all agents
 */
router.post('/push', async (req: Request, res: Response) => {
  try {
    const { updateId, targetAgents, targetPlatform, targetArchitecture, force } = req.body;

    const updatePackage = updateRegistry.get(updateId);
    if (!updatePackage) {
      return res.status(404).json({ error: 'Update package not found' });
    }

    // In production, this would:
    // 1. Query agents from database matching criteria
    // 2. Send update notification via WebSocket/SSE
    // 3. Track update status per agent

    const pushResult = {
      updateId,
      version: updatePackage.version,
      platform: updatePackage.platform,
      architecture: updatePackage.architecture,
      targetAgents: targetAgents || 'all',
      forced: force || false,
      pushedAt: new Date().toISOString(),
      status: 'queued',
    };

    res.json({
      success: true,
      message: 'Update push initiated',
      ...pushResult,
    });
  } catch (error: any) {
    logger.error('Push update error:', { error });
    res.status(500).json({ error: 'Failed to push update' });
  }
});

/**
 * DELETE /api/updates/:id
 * Delete update package (Admin only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatePackage = updateRegistry.get(id);

    if (!updatePackage) {
      return res.status(404).json({ error: 'Update package not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../../uploads/updates', updatePackage.fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Failed to delete file:', { error });
    }

    // Remove from registry
    updateRegistry.delete(id);

    res.json({
      success: true,
      message: 'Update package deleted',
      id,
    });
  } catch (error: any) {
    logger.error('Delete update error:', { error });
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// Helper functions

function findLatestUpdate(platform: string, architecture: string): UpdatePackage | undefined {
  const updates = Array.from(updateRegistry.values())
    .filter(u => u.platform === platform && u.architecture === architecture && u.active)
    .sort((a, b) => isNewerVersion(b.version, a.version) ? 1 : -1);

  return updates[0];
}

function isNewerVersion(newVer: string, oldVer: string): boolean {
  const newParts = newVer.split('.').map(Number);
  const oldParts = oldVer.split('.').map(Number);

  for (let i = 0; i < Math.max(newParts.length, oldParts.length); i++) {
    const newPart = newParts[i] || 0;
    const oldPart = oldParts[i] || 0;

    if (newPart > oldPart) return true;
    if (newPart < oldPart) return false;
  }

  return false;
}

export default router;
