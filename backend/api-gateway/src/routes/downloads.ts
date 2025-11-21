import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

const router = Router();

// Rate limiting for download endpoints - 50 downloads per hour per IP
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many download requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Path to agent source code (adjust for Docker container)
const AGENT_SOURCE_PATH = process.env.AGENT_SOURCE_PATH || 
                         path.resolve(__dirname, '../../../cmdb-agent');

// Path to agent distribution files
const AGENT_DIST_PATH = process.env.AGENT_DIST_PATH || 
                       path.join(AGENT_SOURCE_PATH, 'dist');

/**
 * @route   GET /api/downloads/cmdb-agent-win.exe
 * @desc    Download standalone CMDB Agent executable for Windows
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-win.exe', downloadLimiter, (req: Request, res: Response) => {
  try {
    const exePath = path.join(AGENT_DIST_PATH, 'cmdb-agent-win.exe');

    if (!fs.existsSync(exePath)) {
      return res.status(404).json({ error: 'Windows executable not found. Please build it first.' });
    }

    logger.info('Sending Windows executable');
    res.download(exePath, 'cmdb-agent-win.exe');
  } catch (error) {
    logger.error('Error sending Windows executable:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * @route   GET /api/downloads/cmdb-agent-linux
 * @desc    Download standalone CMDB Agent executable for Linux
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-linux', downloadLimiter, (req: Request, res: Response) => {
  try {
    const exePath = path.join(AGENT_DIST_PATH, 'cmdb-agent-linux');

    if (!fs.existsSync(exePath)) {
      return res.status(404).json({ error: 'Linux executable not found. Please build it first.' });
    }

    logger.info('Sending Linux executable');
    res.download(exePath, 'cmdb-agent-linux');
  } catch (error) {
    logger.error('Error sending Linux executable:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * @route   GET /api/downloads/cmdb-agent-installer.zip
 * @desc    Download Windows installer package (IExpress ready)
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-installer.zip', downloadLimiter, (req: Request, res: Response) => {
  try {
    const installerPath = path.join(AGENT_DIST_PATH, 'cmdb-agent-installer-package-1.0.0.zip');

    if (!fs.existsSync(installerPath)) {
      return res.status(404).json({ error: 'Installer package not found. Please build it first.' });
    }

    logger.info('Sending Windows installer package');
    res.download(installerPath, 'cmdb-agent-installer.zip');
  } catch (error) {
    logger.error('Error sending installer package:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * @route   GET /api/downloads/cmdb-agent-setup.run
 * @desc    Download Linux self-extracting installer
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-setup.run', downloadLimiter, (req: Request, res: Response) => {
  try {
    const runPath = path.join(AGENT_DIST_PATH, 'cmdb-agent-setup-1.0.0.run');

    if (!fs.existsSync(runPath)) {
      return res.status(404).json({ error: 'Linux installer not found. Please build it first.' });
    }

    logger.info('Sending Linux self-extracting installer');
    res.download(runPath, 'cmdb-agent-setup.run');
  } catch (error) {
    logger.error('Error sending Linux installer:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * @route   GET /api/downloads/cmdb-agent-linux.tar.gz
 * @desc    Download CMDB Agent for Linux
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-linux.tar.gz', downloadLimiter, async (req: Request, res: Response) => {
  try {
    logger.info('Generating Linux agent package');

    // Set headers for download
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="cmdb-agent-linux.tar.gz"');

    // Create tar.gz archive
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 }
    });

    archive.on('error', (err) => {
      logger.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(res);

    // Add agent files
    archive.directory(AGENT_SOURCE_PATH, 'cmdb-agent');

    await archive.finalize();
    
    logger.info('Linux agent package sent successfully');
  } catch (error) {
    logger.error('Error generating Linux package:', error);
    res.status(500).json({ error: 'Failed to generate package' });
  }
});

/**
 * @route   GET /api/downloads/cmdb-agent-windows.zip
 * @desc    Download CMDB Agent for Windows
 * @access  Public (Rate Limited)
 */
router.get('/cmdb-agent-windows.zip', downloadLimiter, async (req: Request, res: Response) => {
  try {
    logger.info('Generating Windows agent package');

    // Set headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cmdb-agent-windows.zip"');

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      logger.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(res);

    // Add agent files
    archive.directory(AGENT_SOURCE_PATH, 'cmdb-agent');

    await archive.finalize();
    
    logger.info('Windows agent package sent successfully');
  } catch (error) {
    logger.error('Error generating Windows package:', error);
    res.status(500).json({ error: 'Failed to generate package' });
  }
});

/**
 * @route   GET /api/downloads/docker-compose.yml
 * @desc    Download docker-compose.yml for CMDB Agent
 * @access  Public (Rate Limited)
 */
router.get('/docker-compose.yml', downloadLimiter, (req: Request, res: Response) => {
  try {
    const dockerComposePath = path.join(AGENT_SOURCE_PATH, 'docker-compose.yml');

    if (!fs.existsSync(dockerComposePath)) {
      return res.status(404).json({ error: 'docker-compose.yml not found' });
    }

    logger.info('Sending docker-compose.yml');
    res.download(dockerComposePath, 'cmdb-agent-docker-compose.yml');
  } catch (error) {
    logger.error('Error sending docker-compose.yml:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * @route   GET /api/downloads/agent-manual.pdf
 * @desc    Download CMDB Agent user manual (README as HTML)
 * @access  Public
 */
router.get('/agent-manual.pdf', downloadLimiter, (req: Request, res: Response) => {
  try {
    const readmePath = path.join(AGENT_SOURCE_PATH, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return res.status(404).json({ error: 'Agent manual not found' });
    }

    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Convert markdown to simple HTML for display
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CMDB Agent User Manual</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; margin-top: 30px; }
    h3 { color: #7f8c8d; margin-top: 20px; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      color: #ecf0f1;
    }
    ul, ol { margin-left: 20px; }
    li { margin-bottom: 8px; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      margin: -20px -20px 30px -20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: white; border: none; margin: 0;">CMDB Agent User Manual</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Infrastructure Auto-Discovery & Monitoring Agent</p>
  </div>
  <pre>${readmeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #7f8c8d; text-align: center;">
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'inline; filename="agent-manual.html"');
    res.send(htmlContent);
    
    logger.info('Agent manual served');
  } catch (error) {
    logger.error('Error serving agent manual:', error);
    res.status(500).json({ error: 'Failed to retrieve agent manual' });
  }
});

/**
 * @route   GET /api/downloads/agent-info
 * @desc    Get CMDB Agent package information
 * @access  Public
 */
router.get('/agent-info', (req: Request, res: Response) => {
  try {
    const packageJsonPath = path.join(AGENT_SOURCE_PATH, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check which distribution files exist
      const downloads: any = {
        source: {
          linux: '/api/downloads/cmdb-agent-linux.tar.gz',
          windows: '/api/downloads/cmdb-agent-windows.zip',
          docker: '/api/downloads/docker-compose.yml',
        },
      };

      // Check for standalone executables
      const winExe = path.join(AGENT_DIST_PATH, 'cmdb-agent-win.exe');
      const linuxExe = path.join(AGENT_DIST_PATH, 'cmdb-agent-linux');
      
      if (fs.existsSync(winExe) || fs.existsSync(linuxExe)) {
        downloads.standalone = {};
        if (fs.existsSync(winExe)) {
          const winChecksum = path.join(AGENT_DIST_PATH, 'cmdb-agent-win.exe.sha256');
          let sha256 = '';
          if (fs.existsSync(winChecksum)) {
            sha256 = fs.readFileSync(winChecksum, 'utf8').split(' ')[0].trim();
          }
          downloads.standalone.windows = {
            url: '/api/downloads/cmdb-agent-win.exe',
            size: `${(fs.statSync(winExe).size / 1024 / 1024).toFixed(1)} MB`,
            description: 'Standalone Windows executable (no Node.js required)',
            sha256,
          };
        }
        if (fs.existsSync(linuxExe)) {
          const linuxChecksum = path.join(AGENT_DIST_PATH, 'cmdb-agent-linux.sha256');
          let sha256 = '';
          if (fs.existsSync(linuxChecksum)) {
            sha256 = fs.readFileSync(linuxChecksum, 'utf8').split(' ')[0].trim();
          }
          downloads.standalone.linux = {
            url: '/api/downloads/cmdb-agent-linux',
            size: `${(fs.statSync(linuxExe).size / 1024 / 1024).toFixed(1)} MB`,
            description: 'Standalone Linux executable (no Node.js required)',
            sha256,
          };
        }
      }

      // Check for installer packages
      const installerZip = path.join(AGENT_DIST_PATH, 'cmdb-agent-installer-package-1.0.0.zip');
      const setupRun = path.join(AGENT_DIST_PATH, 'cmdb-agent-setup-1.0.0.run');
      
      if (fs.existsSync(installerZip) || fs.existsSync(setupRun)) {
        downloads.installers = {};
        if (fs.existsSync(installerZip)) {
          downloads.installers.windows = {
            url: '/api/downloads/cmdb-agent-installer.zip',
            size: `${(fs.statSync(installerZip).size / 1024 / 1024).toFixed(1)} MB`,
            description: 'Professional Windows installer package (IExpress ready)',
            instructions: 'Extract and run: iexpress /N installer.sed',
          };
        }
        if (fs.existsSync(setupRun)) {
          downloads.installers.linux = {
            url: '/api/downloads/cmdb-agent-setup.run',
            size: `${(fs.statSync(setupRun).size / 1024 / 1024).toFixed(1)} MB`,
            description: 'Self-extracting Linux installer',
            instructions: 'Run: chmod +x cmdb-agent-setup.run && ./cmdb-agent-setup.run',
          };
        }
      }

      res.json({
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        platforms: ['linux', 'windows', 'docker'],
        downloads,
        requirements: {
          standalone: 'No requirements - executables include Node.js runtime',
          source: packageJson.engines?.node || '>=18.0.0',
          docker: '>=20.10.0 (for Docker deployment)',
        },
        recommended: {
          windows: downloads.installers?.windows ? 
            'Use installer package for best experience' : 
            'Use standalone executable or source code',
          linux: downloads.installers?.linux ? 
            'Use self-extracting installer for easy setup' : 
            'Use standalone executable or source code',
        },
      });
    } else {
      res.status(404).json({ error: 'Agent package information not found' });
    }
  } catch (error) {
    logger.error('Error getting agent info:', error);
    res.status(500).json({ error: 'Failed to get agent information' });
  }
});

export default router;
