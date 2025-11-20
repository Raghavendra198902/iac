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
  console.error('ERROR: Install path must be an absolute path');
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
    console.log('Installing CMDB Agent service...');
    console.log(`Install path: ${installPath}`);
    console.log(`Platform: ${ServiceFactory.getPlatformName()}`);

    // Check if elevated
    if (!ServiceFactory.isElevated()) {
      console.error('ERROR: Administrator/root privileges required');
      console.error('Please run with sudo (Linux) or as Administrator (Windows)');
      process.exit(1);
    }

    // Create install directory
    console.log('Creating installation directory...');
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true, mode: 0o755 });
      console.log(`✓ Created directory: ${installPath}`);
    } else {
      console.log(`✓ Directory exists: ${installPath}`);
    }

    // Copy executable to install location
    const platform = os.platform();
    const sourceExe = platform === 'win32' 
      ? path.join(__dirname, '..', 'dist', 'cmdb-agent-win.exe')
      : path.join(__dirname, '..', 'dist', 'cmdb-agent-linux');
    
    const targetExe = platform === 'win32'
      ? path.join(installPath, 'cmdb-agent.exe')
      : path.join(installPath, 'cmdb-agent');

    console.log('Copying executable...');
    if (fs.existsSync(sourceExe)) {
      fs.copyFileSync(sourceExe, targetExe);
      
      // Set executable permissions on Linux
      if (platform !== 'win32') {
        fs.chmodSync(targetExe, 0o755);
      }
      
      console.log(`✓ Copied: ${path.basename(sourceExe)} -> ${targetExe}`);
    } else {
      console.error(`ERROR: Source executable not found: ${sourceExe}`);
      console.error('Please build the agent first: npm run build');
      process.exit(1);
    }

    // Create service manager
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    // Check if already installed
    const isInstalled = await serviceManager.isInstalled();
    if (isInstalled) {
      console.log('Service is already installed');
      console.log('Checking service status...');
      
      const status = await serviceManager.getStatus();
      console.log(`Current status: ${status}`);

      if (status !== 'active' && status !== 'RUNNING') {
        console.log('Starting service...');
        await serviceManager.start();
        console.log('Service started successfully');
      }

      return;
    }

    // Install service
    console.log('Installing service...');
    await serviceManager.install();

    // Enable auto-start
    console.log('Enabling auto-start...');
    await serviceManager.enableAutoStart();

    // Verify executable exists at target location
    if (!fs.existsSync(targetExe)) {
      throw new Error(`Executable not found at target location: ${targetExe}`);
    }

    // Start service
    console.log('Starting service...');
    await serviceManager.start();

    // Wait for service to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify service is running
    const finalStatus = await serviceManager.getStatus();
    const isRunning = await serviceManager.isRunning();

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  ✓ CMDB Agent Service Installed Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('Service Details:');
    console.log(`  Name:         ${agentConfig.serviceName}`);
    console.log(`  Display Name: ${agentConfig.displayName}`);
    console.log(`  Install Path: ${installPath}`);
    console.log(`  Executable:   ${targetExe}`);
    console.log(`  Status:       ${finalStatus}`);
    console.log(`  Running:      ${isRunning ? 'Yes' : 'No'}`);
    console.log(`  Auto-start:   Enabled`);
    console.log('');
    console.log('Service Management Commands:');
    if (platform === 'win32') {
      console.log(`  Start:   sc start ${agentConfig.serviceName}`);
      console.log(`  Stop:    sc stop ${agentConfig.serviceName}`);
      console.log(`  Status:  sc query ${agentConfig.serviceName}`);
    } else {
      console.log(`  Start:   sudo systemctl start ${agentConfig.serviceName}`);
      console.log(`  Stop:    sudo systemctl stop ${agentConfig.serviceName}`);
      console.log(`  Status:  sudo systemctl status ${agentConfig.serviceName}`);
      console.log(`  Logs:    sudo journalctl -u ${agentConfig.serviceName} -f`);
    }

  } catch (error: any) {
    console.error('Installation failed:', error.message);
    logger.error('Service installation failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

async function uninstall() {
  try {
    console.log('Uninstalling CMDB Agent service...');

    // Check if elevated
    if (!ServiceFactory.isElevated()) {
      console.error('ERROR: Administrator/root privileges required');
      console.error('Please run with sudo (Linux) or as Administrator (Windows)');
      process.exit(1);
    }

    // Create service manager
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    // Check if installed
    const isInstalled = await serviceManager.isInstalled();
    if (!isInstalled) {
      console.log('Service is not installed');
      return;
    }

    // Stop service
    console.log('Stopping service...');
    try {
      await serviceManager.stop();
      console.log('✓ Service stopped');
    } catch (error) {
      console.log('Service was not running');
    }

    // Uninstall service
    console.log('Removing service...');
    await serviceManager.uninstall();

    console.log('✓ Service uninstalled successfully');
    console.log('');
    console.log('Note: Installation files remain at:', installPath);
    console.log('To remove completely, manually delete the installation directory.');

  } catch (error: any) {
    console.error('Uninstallation failed:', error.message);
    logger.error('Service uninstallation failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

async function status() {
  try {
    const serviceManager = ServiceFactory.createServiceManager(agentConfig);

    const isInstalled = await serviceManager.isInstalled();
    if (!isInstalled) {
      console.log('Service Status: Not Installed');
      return;
    }

    const status = await serviceManager.getStatus();
    const isRunning = await serviceManager.isRunning();

    console.log('CMDB Agent Service Status:');
    console.log(`  Installed: Yes`);
    console.log(`  Status: ${status}`);
    console.log(`  Running: ${isRunning ? 'Yes' : 'No'}`);

  } catch (error: any) {
    console.error('Failed to get status:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log('CMDB Agent Service Installer');
  console.log('');
  console.log('Usage:');
  console.log('  node service-installer.js <command> [install-path]');
  console.log('');
  console.log('Commands:');
  console.log('  install     Install and start the service');
  console.log('  uninstall   Stop and remove the service');
  console.log('  status      Show service status');
  console.log('  help        Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  Windows (Administrator):');
  console.log('    node service-installer.js install "C:\\Program Files\\CMDB Agent"');
  console.log('');
  console.log('  Linux (root):');
  console.log('    sudo node service-installer.js install /opt/cmdb-agent');
  console.log('');
  console.log('Note: Administrator/root privileges are required for service operations');
}

// Main
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  CMDB Enterprise Agent - Service Installer');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

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
      console.error(`Unknown command: ${command}`);
      console.log('');
      showHelp();
      process.exit(1);
  }

  console.log('');
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
