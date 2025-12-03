package collectors

import (
	"context"
	"os"
	"runtime"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/shirou/gopsutil/v3/host"
)

type SystemCollector struct {
	log *logger.Logger
}

func NewSystemCollector(log *logger.Logger) *SystemCollector {
	return &SystemCollector{log: log}
}

func (c *SystemCollector) Name() string {
	return "system"
}

func (c *SystemCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *SystemCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	hostname, _ := os.Hostname()
	
	info, err := host.Info()
	if err != nil {
		return nil, err
	}

	bootTime := time.Unix(int64(info.BootTime), 0)
	uptime := time.Since(bootTime)

	data := map[string]interface{}{
		"collector":   "system",
		"hostname":    hostname,
		"os":          runtime.GOOS,
		"arch":        runtime.GOARCH,
		"platform":    info.Platform,
		"platform_version": info.PlatformVersion,
		"kernel_version": info.KernelVersion,
		"kernel_arch": info.KernelArch,
		"uptime_seconds": uptime.Seconds(),
		"boot_time":   bootTime.Format(time.RFC3339),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}
