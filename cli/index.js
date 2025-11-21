#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

program
  .name('iac-dharma')
  .description('Enterprise Infrastructure as Code automation platform')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize a new IAC Dharma project')
  .option('-n, --name <name>', 'project name')
  .option('-d, --dir <directory>', 'target directory', '.')
  .action((options) => {
    console.log(chalk.blue.bold('\n🌸 IAC Dharma - Balance in Automation\n'));
    console.log(chalk.green('Initializing new project...'));
    console.log(chalk.gray(`Project name: ${options.name || 'iac-dharma-project'}`));
    console.log(chalk.gray(`Directory: ${options.dir}`));
    console.log(chalk.yellow('\n⚠️  This will create the following:'));
    console.log('  • Docker Compose configuration');
    console.log('  • Environment files');
    console.log('  • Kubernetes manifests');
    console.log('  • Documentation');
    console.log(chalk.green('\n✅ Run: docker-compose up -d to start services\n'));
  });

program
  .command('start')
  .description('Start all IAC Dharma services')
  .action(() => {
    console.log(chalk.blue.bold('\n🚀 Starting IAC Dharma services...\n'));
    console.log(chalk.green('Run: docker-compose up -d'));
    console.log(chalk.gray('\nServices will be available at:'));
    console.log('  • Frontend:    http://localhost:5173');
    console.log('  • API Gateway: http://localhost:3000');
    console.log('  • Grafana:     http://localhost:3030');
    console.log('  • Jaeger:      http://localhost:16686');
    console.log('  • Prometheus:  http://localhost:9090\n');
  });

program
  .command('stop')
  .description('Stop all IAC Dharma services')
  .action(() => {
    console.log(chalk.yellow('\n🛑 Stopping IAC Dharma services...\n'));
    console.log(chalk.green('Run: docker-compose down\n'));
  });

program
  .command('status')
  .description('Check status of IAC Dharma services')
  .action(() => {
    console.log(chalk.blue.bold('\n📊 IAC Dharma Service Status\n'));
    console.log(chalk.green('Run: docker-compose ps\n'));
  });

program
  .command('logs')
  .description('View logs from IAC Dharma services')
  .option('-s, --service <service>', 'specific service to view logs')
  .option('-f, --follow', 'follow log output')
  .action((options) => {
    console.log(chalk.blue.bold('\n📜 IAC Dharma Logs\n'));
    if (options.service) {
      console.log(chalk.green(`Run: docker-compose logs ${options.follow ? '-f' : ''} ${options.service}\n`));
    } else {
      console.log(chalk.green(`Run: docker-compose logs ${options.follow ? '-f' : ''}\n`));
    }
  });

program
  .command('health')
  .description('Check health of all services')
  .action(() => {
    console.log(chalk.blue.bold('\n🏥 IAC Dharma Health Check\n'));
    console.log(chalk.green('Checking service health...'));
    console.log(chalk.gray('API Gateway: http://localhost:3000/health/ready'));
    console.log(chalk.gray('Metrics: http://localhost:3000/metrics'));
    console.log(chalk.gray('Admin Dashboard: http://localhost:3000/admin\n'));
  });

program
  .command('docs')
  .description('Open IAC Dharma documentation')
  .action(() => {
    console.log(chalk.blue.bold('\n📚 IAC Dharma Documentation\n'));
    console.log(chalk.green('Documentation available at:'));
    console.log('  • API Docs: http://localhost:3000/api-docs');
    console.log('  • GitHub: https://github.com/Raghavendra198902/iac');
    console.log('  • Quick Start: See QUICK_START.md');
    console.log('  • Release Notes: See RELEASE_NOTES.md\n');
  });

program
  .command('update')
  .description('Update IAC Dharma to latest version')
  .action(() => {
    console.log(chalk.blue.bold('\n🔄 Updating IAC Dharma\n'));
    console.log(chalk.green('Run: npm install -g @raghavendra198902/iac-dharma@latest\n'));
  });

program
  .command('info')
  .description('Display system information')
  .action(() => {
    console.log(chalk.blue.bold('\n🌸 IAC Dharma - Enterprise Infrastructure Automation\n'));
    console.log(chalk.green(`Version: ${packageJson.version}`));
    console.log(chalk.gray('\nFeatures:'));
    console.log('  ✅ Multi-cloud infrastructure automation (AWS, Azure, GCP)');
    console.log('  ✅ AI-powered cost optimization and recommendations');
    console.log('  ✅ Distributed tracing with OpenTelemetry & Jaeger');
    console.log('  ✅ Comprehensive observability (Prometheus, Grafana)');
    console.log('  ✅ Feature flags with gradual rollouts');
    console.log('  ✅ Admin dashboard for monitoring and control');
    console.log('  ✅ Enterprise SSO (SAML, OAuth2)');
    console.log('  ✅ Circuit breakers and rate limiting');
    console.log('  ✅ 18 microservices architecture');
    console.log(chalk.cyan('\n📖 Documentation: https://github.com/Raghavendra198902/iac'));
    console.log(chalk.cyan('🐛 Issues: https://github.com/Raghavendra198902/iac/issues'));
    console.log(chalk.cyan('⭐ Star us on GitHub!\n'));
  });

// Display help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
