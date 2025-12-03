package collectors

import (
	"context"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/shirou/gopsutil/v3/net"
)

type NetworkCollector struct {
	log *logger.Logger
}

func NewNetworkCollector(log *logger.Logger) *NetworkCollector {
	return &NetworkCollector{log: log}
}

func (c *NetworkCollector) Name() string {
	return "network"
}

func (c *NetworkCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *NetworkCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	interfaceList := []map[string]interface{}{}
	for _, iface := range interfaces {
		addrs := []string{}
		for _, addr := range iface.Addrs {
			addrs = append(addrs, addr.Addr)
		}

		interfaceList = append(interfaceList, map[string]interface{}{
			"name":       iface.Name,
			"mac":        iface.HardwareAddr,
			"mtu":        iface.MTU,
			"flags":      iface.Flags,
			"addresses":  addrs,
		})
	}

	data := map[string]interface{}{
		"collector":   "network",
		"interfaces":  interfaceList,
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}
