// +build windows

package collectors

import (
	"context"
	"fmt"
	"time"
	"unsafe"

	"github.com/iac/cmdb-agent/internal/logger"
	"golang.org/x/sys/windows"
)

// PDH (Performance Data Helper) API structures and functions
var (
	pdh                     = windows.NewLazySystemDLL("pdh.dll")
	pdhOpenQuery            = pdh.NewProc("PdhOpenQueryW")
	pdhAddCounterW          = pdh.NewProc("PdhAddCounterW")
	pdhCollectQueryData     = pdh.NewProc("PdhCollectQueryData")
	pdhGetFormattedCounterValue = pdh.NewProc("PdhGetFormattedCounterValue")
	pdhCloseQuery           = pdh.NewProc("PdhCloseQuery")
)

// PDH constants
const (
	PDH_FMT_DOUBLE = 0x00000200
	PDH_FMT_LONG   = 0x00000100
)

// PDH_FMT_COUNTERVALUE structure
type PDH_FMT_COUNTERVALUE struct {
	CStatus     uint32
	DoubleValue float64
}

type WindowsPDHCollector struct {
	log *logger.Logger
}

func NewWindowsPDHCollector(log *logger.Logger) *WindowsPDHCollector {
	return &WindowsPDHCollector{log: log}
}

func (c *WindowsPDHCollector) Name() string {
	return "windows_pdh"
}

func (c *WindowsPDHCollector) RequiredPermissions() []string {
	return []string{"Performance Monitor Users"}
}

func (c *WindowsPDHCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows PDH performance data", "mode", mode)

	result := map[string]interface{}{
		"collector":  c.Name(),
		"timestamp":  time.Now().UTC().Format(time.RFC3339),
		"mode":       mode,
		"processor":  c.collectProcessorCounters(),
		"disk":       c.collectDiskCounters(),
		"network":    c.collectNetworkCounters(),
		"memory":     c.collectMemoryCountersDetailed(),
	}

	if mode == "detailed" {
		result["processes"] = c.collectProcessCounters()
		result["system"] = c.collectSystemCounters()
	}

	return result, nil
}

// Helper function to query a single counter
func (c *WindowsPDHCollector) queryCounter(counterPath string) (float64, error) {
	var query uintptr
	var counter uintptr

	// Open query
	ret, _, _ := pdhOpenQuery.Call(0, 0, uintptr(unsafe.Pointer(&query)))
	if ret != 0 {
		return 0, fmt.Errorf("PdhOpenQuery failed: 0x%x", ret)
	}
	defer pdhCloseQuery.Call(query)

	// Add counter
	counterPathPtr, _ := windows.UTF16PtrFromString(counterPath)
	ret, _, _ = pdhAddCounterW.Call(
		query,
		uintptr(unsafe.Pointer(counterPathPtr)),
		0,
		uintptr(unsafe.Pointer(&counter)),
	)
	if ret != 0 {
		return 0, fmt.Errorf("PdhAddCounterW failed: 0x%x", ret)
	}

	// Collect data (need to collect twice for rate counters)
	pdhCollectQueryData.Call(query)
	time.Sleep(100 * time.Millisecond)
	ret, _, _ = pdhCollectQueryData.Call(query)
	if ret != 0 {
		return 0, fmt.Errorf("PdhCollectQueryData failed: 0x%x", ret)
	}

	// Get formatted value
	var value PDH_FMT_COUNTERVALUE
	ret, _, _ = pdhGetFormattedCounterValue.Call(
		counter,
		PDH_FMT_DOUBLE,
		uintptr(0),
		uintptr(unsafe.Pointer(&value)),
	)
	if ret != 0 {
		return 0, fmt.Errorf("PdhGetFormattedCounterValue failed: 0x%x", ret)
	}

	return value.DoubleValue, nil
}

// Query multiple counters efficiently
func (c *WindowsPDHCollector) queryCounters(counterPaths map[string]string) map[string]float64 {
	results := make(map[string]float64)
	var query uintptr

	// Open query
	ret, _, _ := pdhOpenQuery.Call(0, 0, uintptr(unsafe.Pointer(&query)))
	if ret != 0 {
		c.log.Error("PdhOpenQuery failed", "error", fmt.Sprintf("0x%x", ret))
		return results
	}
	defer pdhCloseQuery.Call(query)

	// Add all counters
	counters := make(map[string]uintptr)
	for name, path := range counterPaths {
		var counter uintptr
		pathPtr, _ := windows.UTF16PtrFromString(path)
		ret, _, _ = pdhAddCounterW.Call(
			query,
			uintptr(unsafe.Pointer(pathPtr)),
			0,
			uintptr(unsafe.Pointer(&counter)),
		)
		if ret == 0 {
			counters[name] = counter
		}
	}

	// Collect data twice
	pdhCollectQueryData.Call(query)
	time.Sleep(100 * time.Millisecond)
	ret, _, _ = pdhCollectQueryData.Call(query)
	if ret != 0 {
		c.log.Error("PdhCollectQueryData failed", "error", fmt.Sprintf("0x%x", ret))
		return results
	}

	// Get all values
	for name, counter := range counters {
		var value PDH_FMT_COUNTERVALUE
		ret, _, _ = pdhGetFormattedCounterValue.Call(
			counter,
			PDH_FMT_DOUBLE,
			uintptr(0),
			uintptr(unsafe.Pointer(&value)),
		)
		if ret == 0 {
			results[name] = value.DoubleValue
		}
	}

	return results
}

func (c *WindowsPDHCollector) collectProcessorCounters() map[string]interface{} {
	counters := map[string]string{
		"processor_time":       `\Processor(_Total)\% Processor Time`,
		"user_time":            `\Processor(_Total)\% User Time`,
		"privileged_time":      `\Processor(_Total)\% Privileged Time`,
		"interrupt_time":       `\Processor(_Total)\% Interrupt Time`,
		"idle_time":            `\Processor(_Total)\% Idle Time`,
		"interrupts_per_sec":   `\Processor(_Total)\Interrupts/sec`,
		"processor_queue_len":  `\System\Processor Queue Length`,
		"context_switches_sec": `\System\Context Switches/sec`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"total_usage_percent":      fmt.Sprintf("%.2f", values["processor_time"]),
		"user_time_percent":        fmt.Sprintf("%.2f", values["user_time"]),
		"privileged_time_percent":  fmt.Sprintf("%.2f", values["privileged_time"]),
		"interrupt_time_percent":   fmt.Sprintf("%.2f", values["interrupt_time"]),
		"idle_time_percent":        fmt.Sprintf("%.2f", values["idle_time"]),
		"interrupts_per_second":    int64(values["interrupts_per_sec"]),
		"processor_queue_length":   int64(values["processor_queue_len"]),
		"context_switches_per_sec": int64(values["context_switches_sec"]),
	}
}

func (c *WindowsPDHCollector) collectDiskCounters() map[string]interface{} {
	counters := map[string]string{
		"read_bytes_sec":   `\PhysicalDisk(_Total)\Disk Read Bytes/sec`,
		"write_bytes_sec":  `\PhysicalDisk(_Total)\Disk Write Bytes/sec`,
		"reads_sec":        `\PhysicalDisk(_Total)\Disk Reads/sec`,
		"writes_sec":       `\PhysicalDisk(_Total)\Disk Writes/sec`,
		"queue_length":     `\PhysicalDisk(_Total)\Current Disk Queue Length`,
		"disk_time_percent": `\PhysicalDisk(_Total)\% Disk Time`,
		"idle_time_percent": `\PhysicalDisk(_Total)\% Idle Time`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"read_bytes_per_sec":     int64(values["read_bytes_sec"]),
		"write_bytes_per_sec":    int64(values["write_bytes_sec"]),
		"reads_per_sec":          fmt.Sprintf("%.2f", values["reads_sec"]),
		"writes_per_sec":         fmt.Sprintf("%.2f", values["writes_sec"]),
		"queue_length":           fmt.Sprintf("%.2f", values["queue_length"]),
		"disk_time_percent":      fmt.Sprintf("%.2f", values["disk_time_percent"]),
		"idle_time_percent":      fmt.Sprintf("%.2f", values["idle_time_percent"]),
		"total_bytes_per_sec":    int64(values["read_bytes_sec"] + values["write_bytes_sec"]),
	}
}

func (c *WindowsPDHCollector) collectNetworkCounters() map[string]interface{} {
	counters := map[string]string{
		"bytes_total_sec":   `\Network Interface(*)\Bytes Total/sec`,
		"bytes_received_sec": `\Network Interface(*)\Bytes Received/sec`,
		"bytes_sent_sec":    `\Network Interface(*)\Bytes Sent/sec`,
		"packets_sec":       `\Network Interface(*)\Packets/sec`,
		"output_queue_len":  `\Network Interface(*)\Output Queue Length`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"bytes_total_per_sec":    int64(values["bytes_total_sec"]),
		"bytes_received_per_sec": int64(values["bytes_received_sec"]),
		"bytes_sent_per_sec":     int64(values["bytes_sent_sec"]),
		"packets_per_sec":        fmt.Sprintf("%.2f", values["packets_sec"]),
		"output_queue_length":    fmt.Sprintf("%.2f", values["output_queue_len"]),
	}
}

func (c *WindowsPDHCollector) collectMemoryCountersDetailed() map[string]interface{} {
	counters := map[string]string{
		"available_mb":      `\Memory\Available MBytes`,
		"committed_bytes":   `\Memory\Committed Bytes`,
		"commit_limit":      `\Memory\Commit Limit`,
		"pages_per_sec":     `\Memory\Pages/sec`,
		"page_faults_sec":   `\Memory\Page Faults/sec`,
		"cache_bytes":       `\Memory\Cache Bytes`,
		"pool_paged_bytes":  `\Memory\Pool Paged Bytes`,
		"pool_nonpaged_bytes": `\Memory\Pool Nonpaged Bytes`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"available_mb":           int64(values["available_mb"]),
		"committed_bytes":        int64(values["committed_bytes"]),
		"committed_mb":           int64(values["committed_bytes"] / 1024 / 1024),
		"commit_limit_bytes":     int64(values["commit_limit"]),
		"commit_limit_mb":        int64(values["commit_limit"] / 1024 / 1024),
		"pages_per_sec":          fmt.Sprintf("%.2f", values["pages_per_sec"]),
		"page_faults_per_sec":    fmt.Sprintf("%.2f", values["page_faults_sec"]),
		"cache_mb":               int64(values["cache_bytes"] / 1024 / 1024),
		"pool_paged_mb":          int64(values["pool_paged_bytes"] / 1024 / 1024),
		"pool_nonpaged_mb":       int64(values["pool_nonpaged_bytes"] / 1024 / 1024),
	}
}

func (c *WindowsPDHCollector) collectProcessCounters() map[string]interface{} {
	counters := map[string]string{
		"process_count":       `\System\Processes`,
		"thread_count":        `\System\Threads`,
		"handle_count":        `\Process(_Total)\Handle Count`,
		"working_set":         `\Process(_Total)\Working Set`,
		"private_bytes":       `\Process(_Total)\Private Bytes`,
		"virtual_bytes":       `\Process(_Total)\Virtual Bytes`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"total_processes":    int64(values["process_count"]),
		"total_threads":      int64(values["thread_count"]),
		"total_handles":      int64(values["handle_count"]),
		"working_set_mb":     int64(values["working_set"] / 1024 / 1024),
		"private_bytes_mb":   int64(values["private_bytes"] / 1024 / 1024),
		"virtual_bytes_mb":   int64(values["virtual_bytes"] / 1024 / 1024),
	}
}

func (c *WindowsPDHCollector) collectSystemCounters() map[string]interface{} {
	counters := map[string]string{
		"system_calls_sec":    `\System\System Calls/sec`,
		"file_read_ops_sec":   `\System\File Read Operations/sec`,
		"file_write_ops_sec":  `\System\File Write Operations/sec`,
		"file_control_ops_sec": `\System\File Control Operations/sec`,
	}

	values := c.queryCounters(counters)

	return map[string]interface{}{
		"system_calls_per_sec":       int64(values["system_calls_sec"]),
		"file_read_ops_per_sec":      fmt.Sprintf("%.2f", values["file_read_ops_sec"]),
		"file_write_ops_per_sec":     fmt.Sprintf("%.2f", values["file_write_ops_sec"]),
		"file_control_ops_per_sec":   fmt.Sprintf("%.2f", values["file_control_ops_sec"]),
	}
}
