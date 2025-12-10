#!/usr/bin/env node
/**
 * Service Installer CLI
 * Command-line utility to install/uninstall CMDB Agent as a system service
 */

import { ServiceFactory, AgentServiceConfig } from './services/ServiceFactory';
import logger from './utils/logger';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const command = process.argv[2];
let installPath = process.argv[3] || process.cwd();

// Sanitize install path to prevent path traversal
installPath = path.resolve(installPath);
if (!installPath.startsWith('/') && !installPath.match(/^[A-Za-z]:\\/)) {
  logger.error('ERROR: Install path must be an absolute path');
  process.exit(1);
}

const agentConfig: AgentServiceConfig = {
  serviceName: 'cmdb-agent',
  displayName: 'CMDB Enterprise Agent',
  description: 'Enterprise endpoint monitoring, enforcement, and telemetry agent',
  version: '1.0.0',
  installPath: installPath,
};

async function install() {
  try {
    logger.info('Installing CMDB Agent service...');
    logger.info(`Install path: ${installPath}`);
    logger.info(`Platform: ${ServiceFactory.getPlatformName()}`);

    // Check if elevated
    if (!ServiceFactory.isElevated()) {
      logger.error('ERROR: Administrator/root privileges required');
      logger.error('Please run with sudo (Linux) or as Administrator (Windows)');
      process.exit(1);
    }

    // Create install directory
    logger.info('Creating installation directory...');
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true, mode: 0o755 });
      logger.info(`✓ Created directory: ${installPath}`);
    } else {
      logger.info(`✓ Directory exists: ${installPath}`);
    }

    // Copy executable to install location
    const platform = os.platform();
    const sourceExe = platform === 'win32' 
      ? path.join(__dirname, '..', 'dist', 'cmdb-agent-win.exe')
      : path.join(__dirname, '..', 'dist', 'cmdb-agent-linux');
    
    const targetExe = platform === 'win32'
      ? path.join(installPath, 'cmdb-agent.exe')
      : path.join(installPath, 'cmdb-agent');

    logger.info('Copying executable...');
    if (fs.existsSync(sourceExe)) {
      fs.copyFileSync(sourceExe, targetExe);
      
      // Set executable permissions on Linux
      if (platform !== 'win32') {
        fs.chmodSync(targetExe, 0o755);
      }
      
      logger.info(`✓ Copied: ${path.basename(sourceExe)} -> ${targetExe}`);
    } else {
      logger.error(`ERROR: Source executable not found: ${sourceExe}`);
      logger.error('Please build the agent first: npm run build');
      process.exit(1);
    }

    // Create service manager
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    // Check if already installed
    const isInstalled = await serviceManager.isInstalled();
    if (isInstalled) {
      logger.info('Service is already installed');
      logger.info('Checking service status...');
      
      const status = await serviceManager.getStatus();
      logger.info(`Current status: ${status}`);

      if (status !== 'active' && status !== 'RUNNING') {
        logger.info('Starting service...');
        await serviceManager.start();
        logger.info('Service started successfully');
      }

      return;
    }

    // Install service
    logger.info('Installing service...');
    await serviceManager.install();

    // Enable auto-start
    logger.info('Enabling auto-start...');
    await serviceManager.enableAutoStart();

    // Verify executable exists at target location
    if (!fs.existsSync(targetExe)) {
      throw new Error(`Executable not found at target location: ${targetExe}`);
    }

    // Start service
    logger.info('Starting service...');
    await serviceManager.start();

    // Wait for service to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify service is running
    const finalStatus = await serviceManager.getStatus();
    const isRunning = await serviceManager.isRunning();

    logger.info('');
    logger.info('═══════════════════════════════════════════════════');
    logger.info('  ✓ CMDB Agent Service Installed Successfully!');
    logger.info('═══════════════════════════════════════════════════');
    logger.info('');
    logger.info('Service Details:');
    logger.info(`  Name:         ${agentConfig.serviceName}`);
    logger.info(`  Display Name: ${agentConfig.displayName}`);
    logger.info(`  Install Path: ${installPath}`);
    logger.info(`  Executable:   ${targetExe}`);
    logger.info(`  Status:       ${finalStatus}`);
    logger.info(`  Running:      ${isRunning ? 'Yes' : 'No'}`);
    logger.info(`  Auto-start:   Enabled`);
    logger.info('');
    logger.info('Service Management Commands:');
    if (platform === 'win32') {
      logger.info(`  Start:   sc start ${agentConfig.serviceName}`);
      logger.info(`  Stop:    sc stop ${agentConfig.serviceName}`);
      logger.info(`  Status:  sc query ${agentConfig.serviceName}`);
    } else {
      logger.info(`  Start:   sudo systemctl start ${agentConfig.serviceName}`);
      logger.info(`  Stop:    sudo systemctl stop ${agentConfig.serviceName}`);
      logger.info(`  Status:  sudo systemctl status ${agentConfig.serviceName}`);
      logger.info(`  Logs:    sudo journalctl -u ${agentConfig.serviceName} -f`);
    }

  } catch (error: any) {
    logger.error('Installation failed:', error.message);
    logger.error('Service installation failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

async function uninstall() {
  try {
    logger.info('Uninstalling CMDB Agent service...');

    // Check if elevated
    if (!ServiceFactory.isElevated()) {
      logger.error('ERROR: Administrator/root privileges required');
      logger.error('Please run with sudo (Linux) or as Administrator (Windows)');
      process.exit(1);
    }

    // Create service manager
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    // Check if installed
    const isInstalled = await serviceManager.isInstalled();
    if (!isInstalled) {
      logger.info('Service is not installed');
      return;
    }

    // Stop service
    logger.info('Stopping service...');
    try {
      await serviceManager.stop();
      logger.info('✓ Service stopped');
    } catch (error) {
      logger.info('Service was not running');
    }

    // Uninstall service
    logger.info('Removing service...');
    await serviceManager.uninstall();

    logger.info('✓ Service uninstalled successfully');
    logger.info('');
    logger.info('Note: Installation files remain at:', installPath);
    logger.info('To remove completely, manually delete the installation directory.');

  } catch (error: any) {
    logger.error('Uninstallation failed:', error.message);
    logger.error('Service uninstallation failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

async function status() {
  try {
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    const isInstalled = await serviceManager.isInstalled();
    if (!isInstalled) {
      logger.info('Service Status: Not Installed');
      return;
    }

    const status = await serviceManager.getStatus();
    const isRunning = await serviceManager.isRunning();

    logger.info('CMDB Agent Service Status:');
    logger.info(`  Installed: Yes`);
    logger.info(`  Status: ${status}`);
    logger.info(`  Running: ${isRunning ? 'Yes' : 'No'}`);

  } catch (error: any) {
    logger.error('Failed to get status:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  logger.info('CMDB Agent Service Installer');
  logger.info('');
  logger.info('Usage:');
  logger.info('  node service-installer.js <command> [install-path]');
  logger.info('');
  logger.info('Commands:');
  logger.info('  install     Install and start the service');
  logger.info('  uninstall   Stop and remove the service');
  logger.info('  status      Show service status');
  logger.info('  help        Show this help message');
  logger.info('');
  logger.info('Examples:');
  logger.info('  Windows (Administrator):');
  logger.info('    node service-installer.js install "C:\\Program Files\\CMDB Agent"');
  logger.info('');
  logger.info('  Linux (root):');
  logger.info('    sudo node service-installer.js install /opt/cmdb-agent');
  logger.info('');
  logger.info('Note: Administrator/root privileges are required for service operations');
}

// Main
async function main() {
  logger.info('');
  logger.info('═══════════════════════════════════════════════════');
  logger.info('  CMDB Enterprise Agent - Service Installer');
  logger.info('═══════════════════════════════════════════════════');
  logger.info('');

  switch (command) {
    case 'install':
      await install();
      break;
    case 'uninstall':
      await uninstall();
      break;
    case 'status':
      await status();
      break;
    case 'help':
      showHelp();
      break;
    default:
      logger.error(`Unknown command: ${command}`);
      logger.info('');
      showHelp();
      process.exit(1);
  }

  logger.info('');
}

main().catch((error) => {
  logger.error('Fatal error:', error.message);
  process.exit(1);
});
