package collectors

import (
	"context"
	"runtime"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
)

type SoftwareCollector struct {
	log *logger.Logger
}

func NewSoftwareCollector(log *logger.Logger) *SoftwareCollector {
	return &SoftwareCollector{log: log}
}

func (c *SoftwareCollector) Name() string {
	return "software"
}

func (c *SoftwareCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *SoftwareCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	packages := []map[string]interface{}{}

	// OS-specific package collection
	switch runtime.GOOS {
	case "linux":
		packages = c.collectLinuxPackages()
	case "windows":
		packages = c.collectWindowsPackages()
	case "darwin":
		packages = c.collectMacOSPackages()
	}

	data := map[string]interface{}{
		"collector":   "software",
		"packages":    packages,
		"count":       len(packages),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}

func (c *SoftwareCollector) collectLinuxPackages() []map[string]interface{} {
	// TODO: Implement dpkg/rpm package listing
	// This would use exec.Command to run dpkg -l or rpm -qa
	return []map[string]interface{}{
		{"name": "example-package", "version": "1.0.0", "source": "dpkg"},
	}
}

func (c *SoftwareCollector) collectWindowsPackages() []map[string]interface{} {
	// TODO: Implement Windows Registry and WMI queries
	// Query HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall
	return []map[string]interface{}{
		{"name": "example-app", "version": "1.0.0", "source": "registry"},
	}
}

func (c *SoftwareCollector) collectMacOSPackages() []map[string]interface{} {
	// TODO: Implement macOS application listing
	// Check /Applications and ~/Applications
	return []map[string]interface{}{
		{"name": "example.app", "version": "1.0.0", "source": "applications"},
	}
}
