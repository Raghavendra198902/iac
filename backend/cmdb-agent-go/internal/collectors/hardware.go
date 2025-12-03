package collectors

import (
	"context"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

type HardwareCollector struct {
	log *logger.Logger
}

func NewHardwareCollector(log *logger.Logger) *HardwareCollector {
	return &HardwareCollector{log: log}
}

func (c *HardwareCollector) Name() string {
	return "hardware"
}

func (c *HardwareCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *HardwareCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	// CPU
	cpuInfo, _ := cpu.Info()
	cpuCount, _ := cpu.Counts(true)
	
	var cpuModel string
	if len(cpuInfo) > 0 {
		cpuModel = cpuInfo[0].ModelName
	}

	// Memory
	memInfo, _ := mem.VirtualMemory()

	// Disks
	partitions, _ := disk.Partitions(false)
	diskList := []map[string]interface{}{}
	for _, p := range partitions {
		usage, _ := disk.Usage(p.Mountpoint)
		diskList = append(diskList, map[string]interface{}{
			"device":     p.Device,
			"mountpoint": p.Mountpoint,
			"fstype":     p.Fstype,
			"total_gb":   usage.Total / (1024 * 1024 * 1024),
			"used_gb":    usage.Used / (1024 * 1024 * 1024),
			"free_gb":    usage.Free / (1024 * 1024 * 1024),
			"percent":    usage.UsedPercent,
		})
	}

	data := map[string]interface{}{
		"collector": "hardware",
		"cpu": map[string]interface{}{
			"model":  cpuModel,
			"cores":  cpuCount,
		},
		"memory": map[string]interface{}{
			"total_mb": memInfo.Total / (1024 * 1024),
			"used_mb":  memInfo.Used / (1024 * 1024),
			"free_mb":  memInfo.Free / (1024 * 1024),
			"percent":  memInfo.UsedPercent,
		},
		"disks":        diskList,
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}
