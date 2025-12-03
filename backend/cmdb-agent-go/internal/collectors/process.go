package collectors

import (
	"context"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/shirou/gopsutil/v3/process"
)

type ProcessCollector struct {
	log *logger.Logger
}

func NewProcessCollector(log *logger.Logger) *ProcessCollector {
	return &ProcessCollector{log: log}
}

func (c *ProcessCollector) Name() string {
	return "process"
}

func (c *ProcessCollector) RequiredPermissions() []string {
	return []string{}
}

func (c *ProcessCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	processList := []map[string]interface{}{}
	for _, p := range processes {
		name, _ := p.Name()
		username, _ := p.Username()
		cmdline, _ := p.Cmdline()

		processList = append(processList, map[string]interface{}{
			"pid":      p.Pid,
			"name":     name,
			"username": username,
			"cmdline":  cmdline,
		})
	}

	data := map[string]interface{}{
		"collector":   "process",
		"processes":   processList,
		"count":       len(processList),
		"collected_at": time.Now().UTC().Format(time.RFC3339),
	}

	return data, nil
}
