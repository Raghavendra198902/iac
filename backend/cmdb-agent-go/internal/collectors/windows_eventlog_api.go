// +build windows

package collectors

import (
	"context"
	"fmt"
	"syscall"
	"time"
	"unsafe"

	"github.com/iac/cmdb-agent/internal/logger"
	"golang.org/x/sys/windows"
)

// Windows Event Log API
var (
	advapi32           = windows.NewLazySystemDLL("advapi32.dll")
	openEventLogW      = advapi32.NewProc("OpenEventLogW")
	closeEventLog      = advapi32.NewProc("CloseEventLog")
	readEventLogW      = advapi32.NewProc("ReadEventLogW")
	getNumberOfEventLogRecords = advapi32.NewProc("GetNumberOfEventLogRecords")
)

// Event Log constants
const (
	EVENTLOG_SEQUENTIAL_READ = 0x0001
	EVENTLOG_BACKWARDS_READ  = 0x0008
	EVENTLOG_FORWARDS_READ   = 0x0004
)

// Event types
const (
	EVENTLOG_ERROR_TYPE       = 0x0001
	EVENTLOG_WARNING_TYPE     = 0x0002
	EVENTLOG_INFORMATION_TYPE = 0x0004
	EVENTLOG_AUDIT_SUCCESS    = 0x0008
	EVENTLOG_AUDIT_FAILURE    = 0x0010
)

// EVENTLOGRECORD structure
type EVENTLOGRECORD struct {
	Length              uint32
	Reserved            uint32
	RecordNumber        uint32
	TimeGenerated       uint32
	TimeWritten         uint32
	EventID             uint32
	EventType           uint16
	NumStrings          uint16
	EventCategory       uint16
	ReservedFlags       uint16
	ClosingRecordNumber uint32
	StringOffset        uint32
	UserSidLength       uint32
	UserSidOffset       uint32
	DataLength          uint32
	DataOffset          uint32
}

type WindowsEventLogAPICollector struct {
	log *logger.Logger
}

func NewWindowsEventLogAPICollector(log *logger.Logger) *WindowsEventLogAPICollector {
	return &WindowsEventLogAPICollector{log: log}
}

func (c *WindowsEventLogAPICollector) Name() string {
	return "windows_eventlog_api"
}

func (c *WindowsEventLogAPICollector) RequiredPermissions() []string {
	return []string{"Event Log Readers"}
}

func (c *WindowsEventLogAPICollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Event Log data via API", "mode", mode)

	maxEvents := 100
	if mode == "detailed" {
		maxEvents = 500
	}

	result := map[string]interface{}{
		"collector":         c.Name(),
		"timestamp":         time.Now().UTC().Format(time.RFC3339),
		"mode":              mode,
		"system_events":     c.collectEvents("System", maxEvents, []uint16{EVENTLOG_ERROR_TYPE, EVENTLOG_WARNING_TYPE}),
		"application_events": c.collectEvents("Application", maxEvents, []uint16{EVENTLOG_ERROR_TYPE, EVENTLOG_WARNING_TYPE}),
		"security_events":   c.collectEvents("Security", maxEvents/2, []uint16{EVENTLOG_AUDIT_FAILURE}),
	}

	if mode == "detailed" {
		result["setup_events"] = c.collectEvents("Setup", maxEvents/2, []uint16{EVENTLOG_ERROR_TYPE})
		result["system_info_events"] = c.collectEvents("System", maxEvents/2, []uint16{EVENTLOG_INFORMATION_TYPE})
	}

	return result, nil
}

func (c *WindowsEventLogAPICollector) collectEvents(logName string, maxEvents int, eventTypes []uint16) map[string]interface{} {
	events := []map[string]interface{}{}
	
	// Open event log
	logNamePtr, err := windows.UTF16PtrFromString(logName)
	if err != nil {
		c.log.Error("Failed to convert log name", "log", logName, "error", err)
		return map[string]interface{}{
			"log_name": logName,
			"error":    err.Error(),
		}
	}

	handle, _, err := openEventLogW.Call(
		0, // local machine
		uintptr(unsafe.Pointer(logNamePtr)),
	)
	if handle == 0 {
		c.log.Error("Failed to open event log", "log", logName, "error", err)
		return map[string]interface{}{
			"log_name": logName,
			"error":    fmt.Sprintf("Failed to open: %v", err),
		}
	}
	defer closeEventLog.Call(handle)

	// Get total number of records
	var totalRecords uint32
	ret, _, _ := getNumberOfEventLogRecords.Call(
		handle,
		uintptr(unsafe.Pointer(&totalRecords)),
	)
	if ret == 0 {
		c.log.Warn("Failed to get event count", "log", logName)
	}

	// Read events
	buffer := make([]byte, 64*1024) // 64KB buffer
	var bytesRead, minBytesNeeded uint32
	eventCount := 0

	for eventCount < maxEvents {
		ret, _, _ := readEventLogW.Call(
			handle,
			EVENTLOG_SEQUENTIAL_READ|EVENTLOG_BACKWARDS_READ,
			0,
			uintptr(unsafe.Pointer(&buffer[0])),
			uintptr(len(buffer)),
			uintptr(unsafe.Pointer(&bytesRead)),
			uintptr(unsafe.Pointer(&minBytesNeeded)),
		)

		if ret == 0 {
			// No more events or error
			break
		}

		// Parse events from buffer
		offset := uint32(0)
		for offset < bytesRead {
			record := (*EVENTLOGRECORD)(unsafe.Pointer(&buffer[offset]))
			
			// Check if event type matches filter
			matchesFilter := len(eventTypes) == 0
			for _, evtType := range eventTypes {
				if record.EventType == evtType {
					matchesFilter = true
					break
				}
			}

			if matchesFilter {
				event := c.parseEventRecord(record, &buffer[offset])
				events = append(events, event)
				eventCount++

				if eventCount >= maxEvents {
					break
				}
			}

			offset += record.Length
		}
	}

	return map[string]interface{}{
		"log_name":      logName,
		"total_records": totalRecords,
		"collected":     len(events),
		"events":        events,
	}
}

func (c *WindowsEventLogAPICollector) parseEventRecord(record *EVENTLOGRECORD, buffer *byte) map[string]interface{} {
	eventType := c.getEventTypeString(record.EventType)
	
	// Convert timestamps
	timeGenerated := time.Unix(int64(record.TimeGenerated), 0)
	timeWritten := time.Unix(int64(record.TimeWritten), 0)

	event := map[string]interface{}{
		"record_number":   record.RecordNumber,
		"event_id":        record.EventID & 0xFFFF, // Lower 16 bits
		"event_type":      eventType,
		"event_type_code": record.EventType,
		"category":        record.EventCategory,
		"time_generated":  timeGenerated.Format(time.RFC3339),
		"time_written":    timeWritten.Format(time.RFC3339),
	}

	// Extract source name (computer name)
	// Source name is after the fixed structure
	sourceNameOffset := unsafe.Sizeof(EVENTLOGRECORD{})
	sourceNamePtr := (*uint16)(unsafe.Pointer(uintptr(unsafe.Pointer(buffer)) + sourceNameOffset))
	sourceName := c.readUTF16String(sourceNamePtr)
	if sourceName != "" {
		event["source"] = sourceName
	}

	return event
}

func (c *WindowsEventLogAPICollector) readUTF16String(ptr *uint16) string {
	if ptr == nil {
		return ""
	}

	// Read until null terminator
	var length int
	for p := ptr; *p != 0; p = (*uint16)(unsafe.Pointer(uintptr(unsafe.Pointer(p)) + 2)) {
		length++
		if length > 1024 { // Safety limit
			break
		}
	}

	if length == 0 {
		return ""
	}

	// Convert to Go string
	buf := make([]uint16, length)
	for i := 0; i < length; i++ {
		buf[i] = *(*uint16)(unsafe.Pointer(uintptr(unsafe.Pointer(ptr)) + uintptr(i*2)))
	}

	return syscall.UTF16ToString(buf)
}

func (c *WindowsEventLogAPICollector) getEventTypeString(eventType uint16) string {
	switch eventType {
	case EVENTLOG_ERROR_TYPE:
		return "Error"
	case EVENTLOG_WARNING_TYPE:
		return "Warning"
	case EVENTLOG_INFORMATION_TYPE:
		return "Information"
	case EVENTLOG_AUDIT_SUCCESS:
		return "Audit Success"
	case EVENTLOG_AUDIT_FAILURE:
		return "Audit Failure"
	default:
		return "Unknown"
	}
}
