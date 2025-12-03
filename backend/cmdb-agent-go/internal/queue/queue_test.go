package queue

import (
	"os"
	"testing"

	"github.com/iac/cmdb-agent/internal/logger"
)

func TestQueue(t *testing.T) {
	// Create temp directory
	tmpDir, err := os.MkdirTemp("", "queue-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	log := logger.New()
	q, err := New(tmpDir, log)
	if err != nil {
		t.Fatalf("Failed to create queue: %v", err)
	}
	defer q.Close()

	// Test push
	testData := map[string]interface{}{
		"test":  "data",
		"count": 42,
	}

	if err := q.Push(testData); err != nil {
		t.Fatalf("Push failed: %v", err)
	}

	// Test stats
	stats := q.Stats()
	if stats["pending"] != 1 {
		t.Errorf("Expected 1 pending item, got %d", stats["pending"])
	}

	// Test pop
	items, err := q.PopBatch(10)
	if err != nil {
		t.Fatalf("PopBatch failed: %v", err)
	}

	if len(items) != 1 {
		t.Errorf("Expected 1 item, got %d", len(items))
	}

	// Verify queue is empty
	stats = q.Stats()
	if stats["pending"] != 0 {
		t.Errorf("Expected 0 pending items, got %d", stats["pending"])
	}
}
