package agent

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/iac/cmdb-agent/internal/api"
	"github.com/iac/cmdb-agent/internal/collectors"
	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/deployment"
	"github.com/iac/cmdb-agent/internal/enforcement"
	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/iac/cmdb-agent/internal/queue"
	"github.com/iac/cmdb-agent/internal/scheduler"
	"github.com/iac/cmdb-agent/internal/transport"
	"github.com/robfig/cron/v3"
)

type Agent struct {
	config      *config.Config
	log         *logger.Logger
	queue       *queue.Queue
	transport   *transport.Transport
	scheduler   *cron.Cron
	collectors  *collectors.Manager
	enforcement *enforcement.Engine
	deployment  *deployment.Manager
	api         *api.Server
	hostname    string
}

func New(cfg *config.Config, log *logger.Logger) (*Agent, error) {
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	// Get hostname
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}
	if cfg.Agent.Hostname != "" {
		hostname = cfg.Agent.Hostname
	}

	// Initialize queue
	q, err := queue.New(cfg.Agent.DataDir, log)
	if err != nil {
		return nil, fmt.Errorf("failed to create queue: %w", err)
	}

	// Initialize transport
	tr, err := transport.New(cfg, log)
	if err != nil {
		return nil, fmt.Errorf("failed to create transport: %w", err)
	}

	// Initialize collectors
	cm := collectors.NewManager(log, cfg)

	// Initialize enforcement engine
	ee := enforcement.NewEngine(log, cfg)

	// Initialize deployment manager
	dm := deployment.NewManager(log, cfg)

	// Initialize scheduler
	sched := cron.New(cron.WithSeconds())

	// Initialize API server
	apiServer := api.NewServer(cfg, log)

	agent := &Agent{
		config:      cfg,
		log:         log,
		queue:       q,
		transport:   tr,
		scheduler:   sched,
		collectors:  cm,
		enforcement: ee,
		deployment:  dm,
		api:         apiServer,
		hostname:    hostname,
	}

	return agent, nil
}

func (a *Agent) Start(ctx context.Context) error {
	a.log.Info("Starting CMDB Agent", "hostname", a.hostname)

	// Start queue processor
	go a.processQueue(ctx)

	// Schedule collectors
	if err := a.scheduleCollectors(); err != nil {
		return fmt.Errorf("failed to schedule collectors: %w", err)
	}

	// Start scheduler
	a.scheduler.Start()

	// Start enforcement engine
	go a.enforcement.Start(ctx)

	// Start deployment manager
	go a.deployment.Start(ctx)

	// Start API server
	go func() {
		if err := a.api.Start(ctx); err != nil {
			a.log.Error("API server error", "error", err)
		}
	}()

	// Send initial heartbeat
	a.sendHeartbeat()

	// Start heartbeat ticker
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			a.sendHeartbeat()
		}
	}
}

func (a *Agent) Stop() error {
	a.log.Info("Stopping CMDB Agent")

	// Stop scheduler
	ctx := a.scheduler.Stop()
	<-ctx.Done()

	// Stop enforcement
	a.enforcement.Stop()

	// Stop deployment
	a.deployment.Stop()

	// Stop API
	a.api.Stop()

	// Close queue
	if err := a.queue.Close(); err != nil {
		a.log.Error("Error closing queue", "error", err)
	}

	return nil
}

func (a *Agent) scheduleCollectors() error {
	for _, collectorCfg := range a.config.Agent.Collectors {
		if !collectorCfg.Enabled {
			continue
		}

		collector := a.collectors.Get(collectorCfg.Name)
		if collector == nil {
			a.log.Warn("Unknown collector", "name", collectorCfg.Name)
			continue
		}

		schedule := collectorCfg.Schedule
		if schedule == "" {
			schedule = "@hourly"
		}

		_, err := a.scheduler.AddFunc(schedule, func() {
			a.runCollector(collectorCfg.Name, collectorCfg.Mode)
		})

		if err != nil {
			return fmt.Errorf("failed to schedule collector %s: %w", collectorCfg.Name, err)
		}

		a.log.Info("Scheduled collector", "name", collectorCfg.Name, "schedule", schedule)
	}

	return nil
}

func (a *Agent) runCollector(name, mode string) {
	a.log.Debug("Running collector", "name", name, "mode", mode)

	collector := a.collectors.Get(name)
	if collector == nil {
		a.log.Warn("Collector not found", "name", name)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	result, err := collector.Collect(ctx, mode)
	if err != nil {
		a.log.Error("Collector failed", "name", name, "error", err)
		return
	}

	// Queue result
	if err := a.queue.Push(result); err != nil {
		a.log.Error("Failed to queue result", "error", err)
	}
}

func (a *Agent) processQueue(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			a.flushQueue()
		}
	}
}

func (a *Agent) flushQueue() {
	items, err := a.queue.PopBatch(a.config.Transport.BatchMaxItems)
	if err != nil {
		a.log.Error("Failed to pop queue", "error", err)
		return
	}

	if len(items) == 0 {
		return
	}

	a.log.Debug("Flushing queue", "items", len(items))

	if err := a.transport.SendBatch(items); err != nil {
		a.log.Error("Failed to send batch", "error", err)
		// Re-queue items
		for _, item := range items {
			_ = a.queue.Push(item)
		}
	}
}

func (a *Agent) sendHeartbeat() {
	stats := a.queue.Stats()
	telemetry := map[string]interface{}{
		"hostname":          a.hostname,
		"agent_version":     a.config.Agent.Version,
		"timestamp":         time.Now().UTC().Format(time.RFC3339),
		"uptime_seconds":    time.Since(time.Now()).Seconds(), // TODO: track actual uptime
		"queue_depth":       stats["pending"],
		"failed_items":      stats["failed"],
		"collectors_active": len(a.config.Agent.Collectors),
	}

	if err := a.transport.SendTelemetry(telemetry); err != nil {
		a.log.Error("Failed to send heartbeat", "error", err)
	}
}
