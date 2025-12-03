# CMDB Agent Development Guide

## Quick Start

The CMDB agent is now fully operational! Here's how to develop and test locally.

## Prerequisites

- Go 1.21+ (installed: 1.25.4)
- Make
- Linux, macOS, or Windows

## Building

```bash
# Build binaries
make build

# Build and test
make test

# Create packages
make deb   # Debian/Ubuntu
make rpm   # RHEL/CentOS
```

## Development Configuration

Use `config.dev.yaml` for local development:

```bash
# Start agent
./dist/cmdb-agent --config=config.dev.yaml

# Or in background
./dist/cmdb-agent --config=config.dev.yaml &
```

## Testing with CLI

```bash
# Check status
./dist/cmdb-agent-cli -socket=/tmp/cmdb-agent.sock status

# Trigger manual scan
./dist/cmdb-agent-cli -socket=/tmp/cmdb-agent.sock scan system full

# Flush queue
./dist/cmdb-agent-cli -socket=/tmp/cmdb-agent.sock flush

# Check logs
tail -f /tmp/agent.log
```

## Current Status

✅ **Working:**
- All 8 collectors implemented (system, hardware, network, process, software, service, user, certificate)
- BoltDB persistent queue
- HTTPS transport with OAuth2
- Enforcement engine
- Deployment manager
- UNIX socket API
- CLI tool
- All tests passing (8/8)

🔨 **In Progress:**
- OS-specific collector details (dpkg/rpm/registry queries)
- Backend API integration (currently uses mock endpoints)
- Enrollment flow
- Self-update mechanism

## Project Structure

```
backend/cmdb-agent-go/
├── cmd/
│   ├── cmdb-agent/         # Main daemon
│   └── cmdb-agent-cli/     # CLI tool
├── internal/
│   ├── agent/              # Core orchestration
│   ├── api/                # UNIX socket API
│   ├── collectors/         # Data collectors
│   ├── config/             # Configuration
│   ├── deployment/         # Deployment manager
│   ├── enforcement/        # Policy engine
│   ├── logger/             # Structured logging
│   ├── queue/              # BoltDB queue
│   └── transport/          # HTTPS client
├── config.dev.yaml         # Development config
├── config.example.yaml     # Production config
├── go.mod                  # Dependencies
└── Makefile               # Build targets
```

## Next Development Steps

### 1. Implement OS-Specific Collectors

**Linux (High Priority):**
```go
// In internal/collectors/software.go
func collectDpkgPackages() []Package {
    // Run: dpkg -l
}

func collectRpmPackages() []Package {
    // Run: rpm -qa --queryformat
}
```

**Windows:**
```go
func collectWindowsPackages() []Package {
    // Query: HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall
}
```

**macOS:**
```go
func collectBrewPackages() []Package {
    // Run: brew list --versions
}
```

### 2. Backend API Integration

Replace mock endpoints in `config.dev.yaml`:
```yaml
backend:
  base_url: "http://localhost:3000"  # Your CMDB API
  
auth:
  client_id: "your-client-id"
  client_secret: "your-client-secret"
  token_url: "http://localhost:3000/oauth/token"
```

### 3. Test Collector Execution

```bash
# Watch collector logs in real-time
./dist/cmdb-agent --config=config.dev.yaml 2>&1 | jq .

# After 30 seconds, you'll see system collector execute
# After 1 minute, hardware and network collectors execute
```

### 4. Inspect Queue Database

```bash
# Install BoltDB CLI tool
go install go.etcd.io/bbolt/cmd/bbolt@latest

# View queue
bbolt buckets /tmp/cmdb-agent-data/queue.db
bbolt get /tmp/cmdb-agent-data/queue.db queue <key>
```

## Testing Workflows

### Manual Testing
```bash
# 1. Start agent with debug logging
./dist/cmdb-agent --config=config.dev.yaml

# 2. In another terminal, trigger scans
./dist/cmdb-agent-cli scan system full
./dist/cmdb-agent-cli scan hardware full

# 3. Check queue status
ls -lh /tmp/cmdb-agent-data/
```

### Unit Testing
```bash
# Run all tests
make test

# Test specific package
go test ./internal/collectors -v
go test ./internal/queue -v
```

### Integration Testing (TODO)
```bash
# Start mock CMDB server
cd tests/mock-cmdb && go run main.go

# Configure agent to use mock
./dist/cmdb-agent --config=config.test.yaml
```

## Debugging

### Enable Debug Logging
Edit `config.dev.yaml`:
```yaml
logging:
  level: "DEBUG"  # Change from INFO
```

### Common Issues

**Agent won't start:**
```bash
# Check config syntax
./dist/cmdb-agent --config=config.dev.yaml --validate

# Check socket permissions
ls -l /tmp/cmdb-agent.sock
```

**Collectors not running:**
```bash
# Verify scheduler
grep "Scheduled collector" /tmp/agent.log

# Check cron expressions
# @every 30s = every 30 seconds
# @every 1m = every minute
```

**Queue filling up:**
```bash
# Check backend connectivity
curl -v http://cmdb.example.com/api/v1/ci

# Flush queue manually
./dist/cmdb-agent-cli flush
```

## Performance Testing

### Collector Performance
```bash
# Time individual collectors
time ./dist/cmdb-agent-cli scan system full
time ./dist/cmdb-agent-cli scan hardware full
```

### Memory Profiling
```go
// Add to cmd/cmdb-agent/main.go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

```bash
# Access profiles
go tool pprof http://localhost:6060/debug/pprof/heap
go tool pprof http://localhost:6060/debug/pprof/profile
```

## Contributing

### Code Style
- Follow Go conventions (gofmt, golint)
- Add unit tests for new features
- Update documentation

### Commit Messages
```
feat: add USB device collector
fix: handle nil pointer in hardware collector
docs: update deployment guide
test: add integration tests for queue
```

## Production Deployment

See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) for:
- Binary installation
- Service setup
- Certificate management
- Configuration best practices

## Support

- Documentation: `docs/AGENTS_OVERVIEW.md`
- Architecture: `docs/CMDB_AGENT_LLD.md`
- Implementation: `docs/CMDB_AGENT_IMPLEMENTATION.md`
