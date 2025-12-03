package collectors

import (
	"context"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
)

type ServiceCollector struct {
	log *logger.Logger
}

func NewServiceCollector(log *logger.Logger) *ServiceCollector {
	return &ServiceCollector{log: log}
}

func (c *ServiceCollector) Name() string {
	return "service"
}

func (c *ServiceCollector) RequiredPermissions() []string {
	return []string{"root"}
}

func (c *ServiceCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	// TODO: Implement OS-specific service listing
	// Linux: systemctl list-units --type=service
	// Windows: Get-Service
	// macOS: launchctl list
	
	services := []map[string]interface{}{
		{"name": "example-service", "status": "running"},
	}

	data := map[string]interface{}{
		"collector":   "service",
		"services":    services,
		"count":       len(services),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}

type UserCollector struct {
	log *logger.Logger
}

func NewUserCollector(log *logger.Logger) *UserCollector {
	return &UserCollector{log: log}
}

func (c *UserCollector) Name() string {
	return "user"
}

func (c *UserCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *UserCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	// TODO: Implement user/group listing
	// Parse /etc/passwd on Linux
	// net user on Windows
	
	users := []map[string]interface{}{
		{"username": "example-user", "uid": 1000},
	}

	data := map[string]interface{}{
		"collector":   "user",
		"users":       users,
		"count":       len(users),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}

type CertificateCollector struct {
	log *logger.Logger
}

func NewCertificateCollector(log *logger.Logger) *CertificateCollector {
	return &CertificateCollector{log: log}
}

func (c *CertificateCollector) Name() string {
	return "certificate"
}

func (c *CertificateCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *CertificateCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	// TODO: Scan for certificates in common locations
	// /etc/ssl/certs on Linux
	// Cert:\LocalMachine\My on Windows
	// Keychain on macOS
	
	certs := []map[string]interface{}{
		{"subject": "example.com", "issuer": "CA", "expiry": "2025-12-31"},
	}

	data := map[string]interface{}{
		"collector":   "certificate",
		"certificates": certs,
		"count":        len(certs),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}
