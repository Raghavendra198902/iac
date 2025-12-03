package queue

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"sync"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	bolt "go.etcd.io/bbolt"
)

const (
	pendingBucket = "pending"
	failedBucket  = "failed"
)

type Queue struct {
	db  *bolt.DB
	log *logger.Logger
	mu  sync.RWMutex
}

type QueueItem struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
	Retries   int                    `json:"retries"`
	MaxRetries int                   `json:"max_retries"`
}

func New(dataDir string, log *logger.Logger) (*Queue, error) {
	dbPath := filepath.Join(dataDir, "queue.db")
	
	db, err := bolt.Open(dbPath, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, fmt.Errorf("failed to open queue database: %w", err)
	}

	// Create buckets
	err = db.Update(func(tx *bolt.Tx) error {
		if _, err := tx.CreateBucketIfNotExists([]byte(pendingBucket)); err != nil {
			return err
		}
		if _, err := tx.CreateBucketIfNotExists([]byte(failedBucket)); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create buckets: %w", err)
	}

	return &Queue{
		db:  db,
		log: log,
	}, nil
}

func (q *Queue) Push(data interface{}) error {
	q.mu.Lock()
	defer q.mu.Unlock()

	item := &QueueItem{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Type:      "ci_data",
		Data:      data.(map[string]interface{}),
		Timestamp: time.Now().UTC(),
		Retries:   0,
		MaxRetries: 5,
	}

	encoded, err := json.Marshal(item)
	if err != nil {
		return fmt.Errorf("failed to encode item: %w", err)
	}

	return q.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(pendingBucket))
		return b.Put([]byte(item.ID), encoded)
	})
}

func (q *Queue) PopBatch(maxItems int) ([]interface{}, error) {
	q.mu.Lock()
	defer q.mu.Unlock()

	var items []interface{}

	err := q.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(pendingBucket))
		c := b.Cursor()

		count := 0
		for k, v := c.First(); k != nil && count < maxItems; k, v = c.Next() {
			var item QueueItem
			if err := json.Unmarshal(v, &item); err != nil {
				q.log.Error("Failed to decode queue item", "error", err)
				continue
			}

			items = append(items, item.Data)
			
			// Delete from pending
			if err := b.Delete(k); err != nil {
				return err
			}

			count++
		}

		return nil
	})

	return items, err
}

func (q *Queue) Stats() map[string]int {
	q.mu.RLock()
	defer q.mu.RUnlock()

	stats := map[string]int{
		"pending": 0,
		"failed":  0,
	}

	_ = q.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(pendingBucket))
		stats["pending"] = b.Stats().KeyN

		b = tx.Bucket([]byte(failedBucket))
		stats["failed"] = b.Stats().KeyN

		return nil
	})

	return stats
}

func (q *Queue) Close() error {
	return q.db.Close()
}
