# CLI Reference

Complete command-line interface reference for IAC Dharma.

---

## Installation

```bash
# Install globally
npm install -g @raghavendra198902/iac-dharma

# Verify installation
iac-dharma --version
```

---

## Global Options

Available for all commands:

```bash
--version, -v     Show version number
--help, -h        Show help information
--verbose         Enable verbose logging
--quiet           Suppress output
--config <path>   Use custom config file
```

---

## Commands

### `iac-dharma init`

Initialize a new IAC Dharma project.

```bash
iac-dharma init [options]
```

**Options**:
- `--name <name>` - Project name (required)
- `--template <template>` - Use template (aws, azure, gcp, multi-cloud)
- `--no-git` - Skip git initialization
- `--skip-install` - Skip npm install

**Examples**:
```bash
# Basic initialization
iac-dharma init --name my-project

# With AWS template
iac-dharma init --name aws-infra --template aws

# Skip git and dependencies
iac-dharma init --name quick-start --no-git --skip-install
```

---

### `iac-dharma start`

Start all IAC Dharma services.

```bash
iac-dharma start [options]
```

**Options**:
- `--detach, -d` - Run in background (default: true)
- `--build` - Rebuild containers before starting
- `--scale <service=count>` - Scale specific service

**Examples**:
```bash
# Start all services
iac-dharma start

# Start with rebuild
iac-dharma start --build

# Start with scaling
iac-dharma start --scale api-gateway=3
```

---

### `iac-dharma stop`

Stop all running services.

```bash
iac-dharma stop [options]
```

**Options**:
- `--timeout <seconds>` - Shutdown timeout (default: 10)
- `--volumes` - Remove volumes

**Examples**:
```bash
# Stop all services
iac-dharma stop

# Stop with volume cleanup
iac-dharma stop --volumes
```

---

### `iac-dharma status`

Show status of all services.

```bash
iac-dharma status [options]
```

**Options**:
- `--format <format>` - Output format (table, json, yaml)
- `--watch` - Watch status in real-time

**Examples**:
```bash
# Show status table
iac-dharma status

# JSON output
iac-dharma status --format json

# Watch mode
iac-dharma status --watch
```

**Output**:
```
SERVICE                 STATUS    PORTS           UPTIME
api-gateway            running   3000            2h 15m
blueprint-service      running   3001            2h 15m
iac-generator          running   3002            2h 15m
postgres               running   5432            2h 15m
redis                  running   6379            2h 15m
```

---

### `iac-dharma logs`

View service logs.

```bash
iac-dharma logs [service] [options]
```

**Options**:
- `--follow, -f` - Follow log output
- `--tail <lines>` - Number of lines to show (default: 100)
- `--since <time>` - Show logs since timestamp
- `--timestamps` - Show timestamps

**Examples**:
```bash
# View all logs
iac-dharma logs

# Follow API Gateway logs
iac-dharma logs api-gateway --follow

# Last 50 lines with timestamps
iac-dharma logs blueprint-service --tail 50 --timestamps

# Logs from last hour
iac-dharma logs --since 1h
```

---

### `iac-dharma health`

Check health of all services.

```bash
iac-dharma health [options]
```

**Options**:
- `--service <name>` - Check specific service
- `--timeout <seconds>` - Health check timeout (default: 5)

**Examples**:
```bash
# Check all services
iac-dharma health

# Check specific service
iac-dharma health --service api-gateway
```

**Output**:
```
✓ api-gateway      healthy   200ms
✓ blueprint-service healthy  150ms
✓ postgres         healthy   50ms
✗ redis            unhealthy Connection refused
```

---

### `iac-dharma restart`

Restart services.

```bash
iac-dharma restart [service] [options]
```

**Options**:
- `--timeout <seconds>` - Restart timeout

**Examples**:
```bash
# Restart all services
iac-dharma restart

# Restart specific service
iac-dharma restart api-gateway
```

---

### `iac-dharma scale`

Scale services horizontally.

```bash
iac-dharma scale <service=count> [options]
```

**Examples**:
```bash
# Scale API Gateway to 3 instances
iac-dharma scale api-gateway=3

# Scale multiple services
iac-dharma scale api-gateway=3 blueprint-service=2
```

---

### `iac-dharma exec`

Execute command in service container.

```bash
iac-dharma exec <service> <command> [options]
```

**Options**:
- `--interactive, -i` - Keep STDIN open
- `--tty, -t` - Allocate pseudo-TTY

**Examples**:
```bash
# Open shell in container
iac-dharma exec api-gateway sh

# Run command
iac-dharma exec postgres psql -U postgres

# Interactive Node.js REPL
iac-dharma exec -it api-gateway node
```

---

### `iac-dharma backup`

Backup databases and configurations.

```bash
iac-dharma backup [options]
```

**Options**:
- `--output <path>` - Backup output directory
- `--compress` - Compress backup files

**Examples**:
```bash
# Create backup
iac-dharma backup

# Backup to specific location
iac-dharma backup --output /backups --compress
```

---

### `iac-dharma restore`

Restore from backup.

```bash
iac-dharma restore <backup-file> [options]
```

**Options**:
- `--force` - Skip confirmation

**Examples**:
```bash
# Restore from backup
iac-dharma restore backup-2025-11-21.tar.gz

# Force restore
iac-dharma restore backup.tar.gz --force
```

---

### `iac-dharma migrate`

Run database migrations.

```bash
iac-dharma migrate [direction] [options]
```

**Options**:
- `up` - Run pending migrations (default)
- `down` - Rollback last migration
- `--to <version>` - Migrate to specific version

**Examples**:
```bash
# Run pending migrations
iac-dharma migrate up

# Rollback last migration
iac-dharma migrate down

# Migrate to specific version
iac-dharma migrate --to 20250101000000
```

---

### `iac-dharma config`

Manage configuration.

```bash
iac-dharma config <command> [options]
```

**Subcommands**:
- `get <key>` - Get configuration value
- `set <key> <value>` - Set configuration value
- `list` - List all configurations
- `validate` - Validate configuration

**Examples**:
```bash
# Get configuration
iac-dharma config get database.host

# Set configuration
iac-dharma config set api.port 3001

# List all configs
iac-dharma config list

# Validate
iac-dharma config validate
```

---

### `iac-dharma docs`

Open documentation.

```bash
iac-dharma docs [topic]
```

**Examples**:
```bash
# Open general docs
iac-dharma docs

# Open specific topic
iac-dharma docs api
iac-dharma docs deployment
```

---

### `iac-dharma update`

Update IAC Dharma CLI.

```bash
iac-dharma update [options]
```

**Options**:
- `--check` - Check for updates without installing
- `--force` - Force update

**Examples**:
```bash
# Check for updates
iac-dharma update --check

# Update CLI
iac-dharma update
```

---

### `iac-dharma info`

Display system information.

```bash
iac-dharma info
```

**Output**:
```
IAC Dharma v1.0.0

Environment:
  Node.js: v20.10.0
  Docker: 24.0.7
  Docker Compose: 2.23.0

Services:
  Total: 18
  Running: 18
  Stopped: 0

Resources:
  CPU Usage: 15%
  Memory: 2.1GB / 8GB
  Disk: 15GB / 100GB
```

---

## Environment Variables

Can be set in `.env` file or passed to commands:

```bash
# Core settings
IAC_ENV=development
IAC_PORT=3000
IAC_HOST=localhost

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=iac_dharma
DB_USER=dharma_admin
DB_PASSWORD=your_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3030
JAEGER_PORT=16686
```

---

## Configuration File

`iac-dharma.config.js`:

```javascript
module.exports = {
  project: 'my-infrastructure',
  services: {
    apiGateway: {
      port: 3000,
      replicas: 1
    },
    database: {
      type: 'postgres',
      version: '15'
    }
  },
  monitoring: {
    enabled: true,
    prometheus: true,
    grafana: true,
    jaeger: true
  }
};
```

---

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid usage
- `3` - Service not found
- `4` - Configuration error
- `5` - Network error
- `130` - Interrupted (Ctrl+C)

---

## Tips & Tricks

### Quick Health Check
```bash
iac-dharma health && echo "All systems operational"
```

### Watch Logs for Errors
```bash
iac-dharma logs -f | grep -i error
```

### Auto-restart on Failure
```bash
while true; do
  iac-dharma health || iac-dharma restart
  sleep 60
done
```

### Export Metrics
```bash
curl http://localhost:9090/api/v1/query?query=up > metrics.json
```

---

Last Updated: November 21, 2025 | [Back to Home](Home)
