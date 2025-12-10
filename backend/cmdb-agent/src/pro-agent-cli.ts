#!/usr/bin/env node
/**
 * Pro Agent CLI - Command Line Interface for Pro-Level CMDB Agent
 */

import { ProAgent } from './ProAgent';
import logger from './utils/logger';
import path from 'path';
import fs from 'fs/promises';

interface CLIOptions {
  config?: string;
  daemon?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
}

class ProAgentCLI {
  private agent?: ProAgent;
  private options: CLIOptions;

  constructor(options: CLIOptions = {}) {
    this.options = options;
  }

  /**
   * Start the Pro Agent
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Pro-Level CMDB Agent...\n');

      // Determine install path
      const installPath = process.cwd();
      
      // Initialize agent
      this.agent = new ProAgent(installPath);

      // Setup event listeners
      this.setupEventListeners();

      // Initialize and start
      await this.agent.initialize();
      await this.agent.start();

      logger.info('✅ Pro Agent started successfully\n');
      this.displayStatus();

      // Handle graceful shutdown
      this.setupShutdownHandlers();

      // If not daemon mode, keep process alive
      if (!this.options.daemon) {
        logger.info('📊 Monitoring... (Press Ctrl+C to stop)\n');
        await this.keepAlive();
      }
    } catch (error: any) {
      logger.error('❌ Failed to start Pro Agent:', error.message);
      process.exit(1);
    }
  }

  /**
   * Stop the Pro Agent
   */
  async stop(): Promise<void> {
    if (this.agent) {
      logger.info('\n🛑 Stopping Pro Agent...');
      await this.agent.stop();
      logger.info('✅ Pro Agent stopped');
    }
  }

  /**
   * Display status
   */
  async status(): Promise<void> {
    try {
      const installPath = process.cwd();
      const agent = new ProAgent(installPath);
      await agent.initialize();
      
      const status = agent.getProStatus();
      
      logger.info('\n📊 Pro Agent Status\n');
      logger.info(`Version: ${status.version}`);
      logger.info('\n🔧 Features:');
      logger.info(`  AI Analytics: ${this.formatFeatureStatus(status.features.aiAnalytics)}`);
      logger.info(`  Advanced Monitoring: ${this.formatFeatureStatus(status.features.advancedMonitoring)}`);
      logger.info(`  Auto Remediation: ${this.formatFeatureStatus(status.features.autoRemediation)}`);
      logger.info(`  Security Scanning: ${this.formatFeatureStatus(status.features.securityScanning)}`);
      logger.info(`  Performance Profiling: ${this.formatFeatureStatus(status.features.performanceProfiling)}`);
      logger.info(`  Distributed Tracing: ${status.features.distributedTracing?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      logger.info(`  Capacity Planning: ${status.features.capacityPlanning?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      logger.info(`  Alert Manager: ${status.features.alerting?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      
      logger.info('\n📈 Statistics:');
      logger.info(`  Anomalies Tracked: ${status.statistics.anomaliesTracked}`);
      logger.info(`  Remediation Queue: ${status.statistics.remediationQueue}`);
      logger.info(`  Baseline Metrics: ${status.statistics.baselineMetrics}`);
      logger.info(`  Active Alerts: ${status.statistics.activeAlerts}`);
      logger.info(`  Active Traces: ${status.statistics.activeTraces}`);
      logger.info('');
    } catch (error: any) {
      logger.error('❌ Failed to get status:', error.message);
      process.exit(1);
    }
  }

  /**
   * Format feature status
   */
  private formatFeatureStatus(features: any): string {
    const enabled = Object.values(features).filter(v => v === true).length;
    const total = Object.keys(features).length;
    return `${enabled}/${total} enabled`;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.agent) return;

    // Anomaly detection
    this.agent.on('anomaly', (anomaly) => {
      logger.info(`⚠️  [ANOMALY] ${anomaly.metric}: ${anomaly.value} (expected: ${anomaly.expected.toFixed(2)}, severity: ${anomaly.severity})`);
    });

    // Predictive alerts
    this.agent.on('predictive_alert', (alert) => {
      logger.info(`🔮 [PREDICTION] ${alert.prediction} (confidence: ${alert.confidence.toFixed(1)}%)`);
      logger.info(`   → ${alert.recommendedAction}`);
    });

    // Performance insights
    this.agent.on('performance_insights', (data) => {
      data.insights.forEach((insight: any) => {
        logger.info(`💡 [INSIGHT] ${insight.component}: ${insight.issue}`);
        logger.info(`   → ${insight.optimization}`);
      });
    });

    // Security findings
    this.agent.on('security_findings', (data) => {
      logger.info(`🔒 [SECURITY] Found ${data.total} security issues`);
      data.findings.forEach((finding: any) => {
        if (finding.severity === 'critical' || finding.severity === 'high') {
          logger.info(`   [${finding.severity.toUpperCase()}] ${finding.description}`);
        }
      });
    });

    // Remediation completed
    this.agent.on('remediation_completed', (data) => {
      const status = data.result.success ? '✅' : '❌';
      logger.info(`${status} [REMEDIATION] ${data.action.type}: ${data.result.message || 'completed'}`);
    });

    // Container stats
    this.agent.on('container_stats', (data) => {
      if (this.options.verbose) {
        logger.info(`🐳 [CONTAINERS] ${data.total} containers running`);
      }
    });

    // Cloud metadata
    this.agent.on('cloud_metadata', (data) => {
      logger.info(`☁️  [CLOUD] Running on ${data.provider}`);
    });

    // AI Analytics
    this.agent.on('ai_analytics', (data) => {
      if (this.options.verbose) {
        logger.info(`🤖 [AI] Tracking ${data.anomalies} metrics`);
      }
    });

    // Capacity forecasts
    this.agent.on('capacity_forecast', (forecast: any) => {
      const urgency = forecast.urgency === 'critical' ? '🚨' : forecast.urgency === 'high' ? '⚠️' : 'ℹ️';
      logger.info(`${urgency} [CAPACITY] ${forecast.resource.toUpperCase()}: ${forecast.recommendation}`);
    });

    // Trace spans
    this.agent.on('trace_span', (span: any) => {
      if (this.options.verbose && span.duration > 100) {
        logger.info(`📊 [TRACE] ${span.name}: ${span.duration}ms`);
      }
    });

    // Alerts
    this.agent.on('alert', (alert: any) => {
      const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'error' ? '❌' : '⚠️';
      logger.info(`${emoji} [ALERT] ${alert.title}: ${alert.description}`);
    });

    // Optimization opportunities
    this.agent.on('optimization_opportunities', (optimizations: any[]) => {
      logger.info(`💰 [OPTIMIZATION] Found ${optimizations.length} cost-saving opportunities`);
      optimizations.forEach((opt: any) => {
        logger.info(`   → ${opt.recommendation} (Save $${opt.potentialSavings.toFixed(2)}/month)`);
      });
    });
  }

  /**
   * Display initial status
   */
  private displayStatus(): void {
    logger.info('🔧 Pro Agent Features:');
    logger.info('  ✅ AI-Powered Anomaly Detection');
    logger.info('  ✅ Predictive Maintenance');
    logger.info('  ✅ Auto-Remediation');
    logger.info('  ✅ Security Scanning');
    logger.info('  ✅ Performance Profiling');
    logger.info('  ✅ Container Monitoring');
    logger.info('  ✅ Cloud Environment Detection');
    logger.info('  ✅ Distributed Tracing');
    logger.info('  ✅ ML-Based Capacity Planning');
    logger.info('  ✅ Multi-Channel Alerting');
    logger.info('');
  }

  /**
   * Setup shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      logger.info(`\n\n📡 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      logger.error('❌ Uncaught exception:', error.message);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason });
      logger.error('❌ Unhandled rejection:', reason);
    });
  }

  /**
   * Keep process alive
   */
  private async keepAlive(): Promise<void> {
    return new Promise(() => {
      // Keep process running
    });
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { command: string; options: CLIOptions } {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  const options: CLIOptions = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--config':
      case '-c':
        options.config = args[++i];
        break;
      case '--daemon':
      case '-d':
        options.daemon = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return { command, options };
}

/**
 * Show help
 */
function showHelp(): void {
  logger.info(`
Pro-Level CMDB Agent CLI

Usage:
  pro-agent [command] [options]

Commands:
  start       Start the Pro Agent (default)
  stop        Stop the Pro Agent
  status      Show agent status
  help        Show this help message

Options:
  -c, --config <path>    Path to config file
  -d, --daemon           Run in daemon mode
  -v, --verbose          Enable verbose logging
  --dry-run              Dry run mode
  -h, --help             Show help

Examples:
  pro-agent start
  pro-agent start --verbose
  pro-agent status
  pro-agent start --daemon --config /etc/cmdb-agent/config.json

Features:
  🤖 AI-Powered Anomaly Detection
  🔮 Predictive Maintenance
  🔧 Auto-Remediation
  🔒 Security Scanning
  💡 Performance Profiling
  🐳 Container Monitoring
  ☁️  Cloud Environment Detection
`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const { command, options } = parseArgs();
  const cli = new ProAgentCLI(options);

  try {
    switch (command) {
      case 'start':
        await cli.start();
        break;
      case 'stop':
        await cli.stop();
        break;
      case 'status':
        await cli.status();
        break;
      case 'help':
        showHelp();
        break;
      default:
        logger.error(`Unknown command: ${command}`);
        logger.error('Run "pro-agent help" for usage information');
        process.exit(1);
    }
  } catch (error: any) {
    logger.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ProAgentCLI };
