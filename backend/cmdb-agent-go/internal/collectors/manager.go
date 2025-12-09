package collectors

import (
	"context"
	"runtime"

	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/logger"
)

type Collector interface {
	Name() string
	Collect(ctx context.Context, mode string) (map[string]interface{}, error)
	RequiredPermissions() []string
}

type Manager struct {
	collectors map[string]Collector
	log        *logger.Logger
}

func NewManager(log *logger.Logger, cfg *config.Config) *Manager {
	m := &Manager{
		collectors: make(map[string]Collector),
		log:        log,
	}

	// Register built-in collectors
	m.Register(NewSystemCollector(log))
	m.Register(NewHardwareCollector(log))
	m.Register(NewSoftwareCollector(log))
	m.Register(NewNetworkCollector(log))
	m.Register(NewProcessCollector(log))
	m.Register(NewServiceCollector(log))
	m.Register(NewUserCollector(log))
	m.Register(NewCertificateCollector(log))

	// Register Windows-specific collectors
	if runtime.GOOS == "windows" {
		m.Register(NewWindowsRegistryCollector(log))
		m.Register(NewWindowsEventLogCollector(log))
		m.Register(NewWindowsEventLogAPICollector(log))
		m.Register(NewWindowsPerformanceCollector(log))
		m.Register(NewWindowsWMICollector(log))
		m.Register(NewWindowsPDHCollector(log))
		m.Register(NewWindowsDefenderCollector(log))
		m.Register(NewWindowsFirewallCollector(log))
		m.Register(NewWindowsUpdateCollector(log))
		log.Info("Registered Windows-specific collectors", "count", 9)
	}

	return m
}

func (m *Manager) Register(c Collector) {
	m.collectors[c.Name()] = c
	m.log.Debug("Registered collector", "name", c.Name())
}

func (m *Manager) Get(name string) Collector {
	return m.collectors[name]
}

func (m *Manager) List() []string {
	names := make([]string, 0, len(m.collectors))
	for name := range m.collectors {
		names = append(names, name)
	}
	return names
}
