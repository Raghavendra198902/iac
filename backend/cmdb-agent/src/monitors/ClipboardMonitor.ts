import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export interface ClipboardEvent {
  id: string;
  timestamp: string;
  hostname: string;
  username: string;
  contentLength: number;
  containsSensitive: boolean;
  sensitivePatterns: string[];
  hash: string;
  action: 'copy' | 'cut';
  severity: 'low' | 'medium' | 'high';
}

export class ClipboardMonitor {
  private lastClipboardHash: string = '';
  private sensitivePatterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b(?:\d{4}[-\s]?){3}\d{4}\b/, // Credit card
    /\b[A-F0-9]{32}\b/i, // MD5 hash / API keys
    /password[:\s=]+\S+/i, // Password patterns
    /api[_-]?key[:\s=]+\S+/i, // API key patterns
    /bearer\s+[A-Za-z0-9\-._~+/]+=*/i, // Bearer tokens
    /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i, // Private keys
  ];

  /**
   * Monitor clipboard for sensitive data (Windows only)
   */
  async monitorClipboard(): Promise<ClipboardEvent | null> {
    if (process.platform !== 'win32') {
      return null;
    }

    try {
      // PowerShell command to get clipboard content
      const { stdout } = await execAsync(
        'powershell.exe "Get-Clipboard -Raw"',
        { timeout: 2000 }
      );

      const clipboardContent = stdout.trim();
      if (!clipboardContent) {
        return null;
      }

      // Generate hash of clipboard content
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(clipboardContent).digest('hex');

      // Skip if clipboard hasn't changed
      if (hash === this.lastClipboardHash) {
        return null;
      }

      this.lastClipboardHash = hash;

      // Check for sensitive patterns
      const detectedPatterns: string[] = [];
      let containsSensitive = false;

      for (const pattern of this.sensitivePatterns) {
        if (pattern.test(clipboardContent)) {
          containsSensitive = true;
          detectedPatterns.push(pattern.toString());
        }
      }

      // Get username
      const { stdout: userOutput } = await execAsync('echo %USERNAME%', { timeout: 1000 });
      const username = userOutput.trim();

      // Determine severity
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (detectedPatterns.length >= 3) {
        severity = 'high';
      } else if (containsSensitive) {
        severity = 'medium';
      }

      const event: ClipboardEvent = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        hostname: require('os').hostname(),
        username,
        contentLength: clipboardContent.length,
        containsSensitive,
        sensitivePatterns: detectedPatterns,
        hash: hash.substring(0, 16), // Truncate for storage
        action: 'copy',
        severity,
      };

      if (containsSensitive) {
        logger.warn('Sensitive data detected in clipboard', {
          eventId: event.id,
          patterns: detectedPatterns.length,
          severity: event.severity,
        });
      }

      return event;
    } catch (error) {
      logger.error('Clipboard monitoring error', { error });
      return null;
    }
  }

  /**
   * Block clipboard operations (emergency response)
   */
  async blockClipboard(): Promise<boolean> {
    if (process.platform !== 'win32') {
      return false;
    }

    try {
      // Clear clipboard
      await execAsync('powershell.exe "Set-Clipboard -Value $null"', { timeout: 2000 });
      logger.info('Clipboard cleared for security');
      return true;
    } catch (error) {
      logger.error('Failed to block clipboard', { error });
      return false;
    }
  }

  /**
   * Get clipboard monitoring status
   */
  getStatus(): { enabled: boolean; lastHash: string; patternCount: number } {
    return {
      enabled: process.platform === 'win32',
      lastHash: this.lastClipboardHash.substring(0, 8),
      patternCount: this.sensitivePatterns.length,
    };
  }
}
