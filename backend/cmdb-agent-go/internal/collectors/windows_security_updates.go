// +build windows

package collectors

import (
	"context"
	"fmt"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/yusufpapurcu/wmi"
)

// Windows Update WMI classes
type Win32_QuickFixEngineering struct {
	HotFixID     string
	Description  string
	InstalledOn  string
	InstalledBy  string
	Caption      string
}

type Win32_ReliabilityRecords struct {
	SourceName   string
	Message      string
	TimeGenerated time.Time
	EventIdentifier uint32
}

type WindowsUpdateCollector struct {
	log *logger.Logger
}

func NewWindowsUpdateCollector(log *logger.Logger) *WindowsUpdateCollector {
	return &WindowsUpdateCollector{log: log}
}

func (c *WindowsUpdateCollector) Name() string {
	return "windows_update"
}

func (c *WindowsUpdateCollector) RequiredPermissions() []string {
	return []string{"Administrators", "Performance Monitor Users"}
}

func (c *WindowsUpdateCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Update data", "mode", mode)

	result := map[string]interface{}{
		"collector": c.Name(),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"mode":      mode,
	}

	// Collect installed updates (hotfixes)
	updates := c.collectInstalledUpdates()
	if updates != nil {
		result["installed_updates"] = updates
	}

	// Collect update history in detailed mode
	if mode == "detailed" {
		history := c.collectUpdateHistory()
		if history != nil {
			result["update_history"] = history
		}
	}

	return result, nil
}

func (c *WindowsUpdateCollector) collectInstalledUpdates() map[string]interface{} {
	var dst []Win32_QuickFixEngineering
	
	q := wmi.CreateQuery(&dst, "")
	err := wmi.Query(q, &dst)
	
	if err != nil {
		c.log.Error("Failed to query installed updates", "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query: %v", err),
		}
	}

	updates := make([]map[string]interface{}, 0, len(dst))
	
	// Track update types
	updateTypes := make(map[string]int)
	
	for _, update := range dst {
		updateData := map[string]interface{}{
			"hotfix_id":   update.HotFixID,
			"description": update.Description,
			"installed_on": update.InstalledOn,
			"installed_by": update.InstalledBy,
			"caption":     update.Caption,
		}
		
		updates = append(updates, updateData)
		
		// Count by type
		updateTypes[update.Description]++
	}

	// Find most recent update
	mostRecent := ""
	mostRecentDate := ""
	if len(dst) > 0 {
		// Updates are typically ordered by install date
		for i := len(dst) - 1; i >= 0; i-- {
			if dst[i].InstalledOn != "" {
				mostRecent = dst[i].HotFixID
				mostRecentDate = dst[i].InstalledOn
				break
			}
		}
	}

	return map[string]interface{}{
		"total_updates":        len(updates),
		"update_list":          updates,
		"updates_by_type":      updateTypes,
		"most_recent_update":   mostRecent,
		"most_recent_date":     mostRecentDate,
	}
}

func (c *WindowsUpdateCollector) collectUpdateHistory() map[string]interface{} {
	var dst []Win32_ReliabilityRecords
	
	// Query for Windows Update events in reliability records
	q := wmi.CreateQuery(&dst, "WHERE SourceName='Windows Update'")
	err := wmi.Query(q, &dst)
	
	if err != nil {
		c.log.Warn("Failed to query update history", "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query: %v", err),
			"note":  "Reliability records may not be available",
		}
	}

	history := make([]map[string]interface{}, 0, len(dst))
	
	for _, record := range dst {
		historyItem := map[string]interface{}{
			"source":         record.SourceName,
			"message":        record.Message,
			"time_generated": record.TimeGenerated.Format(time.RFC3339),
			"event_id":       record.EventIdentifier,
		}
		
		history = append(history, historyItem)
	}

	// Limit to most recent 50 events
	if len(history) > 50 {
		history = history[:50]
	}

	return map[string]interface{}{
		"total_events":  len(history),
		"recent_events": history,
	}
}
