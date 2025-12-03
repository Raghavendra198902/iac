package collectors

import (
	"context"
	"testing"

	"github.com/iac/cmdb-agent/internal/logger"
)

func TestSystemCollector(t *testing.T) {
	log := logger.New()
	collector := NewSystemCollector(log)

	if collector.Name() != "system" {
		t.Errorf("Expected name 'system', got '%s'", collector.Name())
	}

	ctx := context.Background()
	data, err := collector.Collect(ctx, "full")
	if err != nil {
		t.Fatalf("Collect failed: %v", err)
	}

	if data["collector"] != "system" {
		t.Error("Expected collector field to be 'system'")
	}

	if _, ok := data["hostname"]; !ok {
		t.Error("Expected hostname field")
	}

	if _, ok := data["os"]; !ok {
		t.Error("Expected os field")
	}
}

func TestHardwareCollector(t *testing.T) {
	log := logger.New()
	collector := NewHardwareCollector(log)

	ctx := context.Background()
	data, err := collector.Collect(ctx, "full")
	if err != nil {
		t.Fatalf("Collect failed: %v", err)
	}

	if data["collector"] != "hardware" {
		t.Error("Expected collector field to be 'hardware'")
	}

	if _, ok := data["cpu"]; !ok {
		t.Error("Expected cpu field")
	}

	if _, ok := data["memory"]; !ok {
		t.Error("Expected memory field")
	}
}

func TestNetworkCollector(t *testing.T) {
	log := logger.New()
	collector := NewNetworkCollector(log)

	ctx := context.Background()
	data, err := collector.Collect(ctx, "full")
	if err != nil {
		t.Fatalf("Collect failed: %v", err)
	}

	if data["collector"] != "network" {
		t.Error("Expected collector field to be 'network'")
	}

	if _, ok := data["interfaces"]; !ok {
		t.Error("Expected interfaces field")
	}
}
