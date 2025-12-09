// +build windows

package collectors

import (
	"context"
	"fmt"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/yusufpapurcu/wmi"
)

// Windows Defender WMI classes
type MSFT_MpComputerStatus struct {
	AMEngineVersion                 string
	AMProductVersion                string
	AMServiceEnabled                bool
	AMServiceVersion                string
	AntispywareEnabled              bool
	AntispywareSignatureAge         uint32
	AntispywareSignatureLastUpdated time.Time
	AntispywareSignatureVersion     string
	AntivirusEnabled                bool
	AntivirusSignatureAge           uint32
	AntivirusSignatureLastUpdated   time.Time
	AntivirusSignatureVersion       string
	BehaviorMonitorEnabled          bool
	ComputerID                      string
	ComputerState                   uint32
	DefenderSignaturesOutOfDate     bool
	FullScanAge                     uint32
	FullScanEndTime                 time.Time
	FullScanStartTime               time.Time
	IoavProtectionEnabled           bool
	IsTamperProtected               bool
	LastFullScanSource              uint32
	LastQuickScanSource             uint32
	NISEnabled                      bool
	NISEngineVersion                string
	NISSignatureAge                 uint32
	NISSignatureLastUpdated         time.Time
	NISSignatureVersion             string
	OnAccessProtectionEnabled       bool
	QuickScanAge                    uint32
	QuickScanEndTime                time.Time
	QuickScanStartTime              time.Time
	RealTimeProtectionEnabled       bool
	RealTimeScanDirection           uint32
	RebootRequired                  bool
}

type MSFT_MpThreat struct {
	ThreatID            uint64
	ThreatName          string
	SeverityID          uint32
	CategoryID          uint32
	InitialDetectionTime time.Time
	CurrentThreatExecutionStatus uint32
	IsActive            bool
}

type WindowsDefenderCollector struct {
	log *logger.Logger
}

func NewWindowsDefenderCollector(log *logger.Logger) *WindowsDefenderCollector {
	return &WindowsDefenderCollector{log: log}
}

func (c *WindowsDefenderCollector) Name() string {
	return "windows_defender"
}

func (c *WindowsDefenderCollector) RequiredPermissions() []string {
	return []string{"Administrators", "Performance Monitor Users"}
}

func (c *WindowsDefenderCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Defender data", "mode", mode)

	result := map[string]interface{}{
		"collector": c.Name(),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"mode":      mode,
	}

	// Collect Defender status
	status := c.collectDefenderStatus()
	if status != nil {
		result["defender_status"] = status
	}

	// Collect threat information in detailed mode
	if mode == "detailed" {
		threats := c.collectThreats()
		if threats != nil {
			result["threats"] = threats
		}
	}

	return result, nil
}

func (c *WindowsDefenderCollector) collectDefenderStatus() map[string]interface{} {
	var dst []MSFT_MpComputerStatus
	
	// Query root\Microsoft\Windows\Defender namespace
	q := wmi.CreateQuery(&dst, "")
	err := wmi.QueryNamespace(q, &dst, `root\Microsoft\Windows\Defender`)
	
	if err != nil {
		c.log.Error("Failed to query Defender status", "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query: %v", err),
			"note":  "Windows Defender may not be installed or WMI access denied",
		}
	}

	if len(dst) == 0 {
		return map[string]interface{}{
			"error": "No Defender status found",
			"note":  "Windows Defender may not be running",
		}
	}

	status := dst[0]
	
	return map[string]interface{}{
		"computer_id":                  status.ComputerID,
		"product_version":              status.AMProductVersion,
		"engine_version":               status.AMEngineVersion,
		"service_version":              status.AMServiceVersion,
		"service_enabled":              status.AMServiceEnabled,
		"antivirus_enabled":            status.AntivirusEnabled,
		"antivirus_signature_version":  status.AntivirusSignatureVersion,
		"antivirus_signature_age_days": status.AntivirusSignatureAge,
		"antivirus_signature_updated":  status.AntivirusSignatureLastUpdated.Format(time.RFC3339),
		"antispyware_enabled":          status.AntispywareEnabled,
		"antispyware_signature_version": status.AntispywareSignatureVersion,
		"antispyware_signature_age_days": status.AntispywareSignatureAge,
		"real_time_protection_enabled": status.RealTimeProtectionEnabled,
		"behavior_monitor_enabled":     status.BehaviorMonitorEnabled,
		"on_access_protection_enabled": status.OnAccessProtectionEnabled,
		"ioav_protection_enabled":      status.IoavProtectionEnabled,
		"nis_enabled":                  status.NISEnabled,
		"nis_engine_version":           status.NISEngineVersion,
		"nis_signature_version":        status.NISSignatureVersion,
		"signatures_out_of_date":       status.DefenderSignaturesOutOfDate,
		"tamper_protection_enabled":    status.IsTamperProtected,
		"reboot_required":              status.RebootRequired,
		"computer_state":               c.getComputerStateString(status.ComputerState),
		"last_full_scan_start":         status.FullScanStartTime.Format(time.RFC3339),
		"last_full_scan_end":           status.FullScanEndTime.Format(time.RFC3339),
		"full_scan_age_days":           status.FullScanAge,
		"last_quick_scan_start":        status.QuickScanStartTime.Format(time.RFC3339),
		"last_quick_scan_end":          status.QuickScanEndTime.Format(time.RFC3339),
		"quick_scan_age_days":          status.QuickScanAge,
	}
}

func (c *WindowsDefenderCollector) collectThreats() map[string]interface{} {
	var dst []MSFT_MpThreat
	
	q := wmi.CreateQuery(&dst, "")
	err := wmi.QueryNamespace(q, &dst, `root\Microsoft\Windows\Defender`)
	
	if err != nil {
		c.log.Warn("Failed to query Defender threats", "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query threats: %v", err),
		}
	}

	threats := make([]map[string]interface{}, 0, len(dst))
	activeCount := 0
	
	for _, threat := range dst {
		if threat.IsActive {
			activeCount++
		}
		
		threats = append(threats, map[string]interface{}{
			"threat_id":         threat.ThreatID,
			"threat_name":       threat.ThreatName,
			"severity":          c.getSeverityString(threat.SeverityID),
			"category":          c.getCategoryString(threat.CategoryID),
			"detection_time":    threat.InitialDetectionTime.Format(time.RFC3339),
			"execution_status":  c.getExecutionStatusString(threat.CurrentThreatExecutionStatus),
			"is_active":         threat.IsActive,
		})
	}

	return map[string]interface{}{
		"total_threats":  len(threats),
		"active_threats": activeCount,
		"threat_list":    threats,
	}
}

func (c *WindowsDefenderCollector) getComputerStateString(state uint32) string {
	switch state {
	case 0:
		return "Clean"
	case 1:
		return "Pending Full Scan"
	case 2:
		return "Pending Reboot"
	case 3:
		return "Pending Manual Steps"
	case 4:
		return "Pending Offline Scan"
	case 5:
		return "Pending Critical Failure"
	default:
		return fmt.Sprintf("Unknown (%d)", state)
	}
}

func (c *WindowsDefenderCollector) getSeverityString(severity uint32) string {
	switch severity {
	case 0:
		return "Unknown"
	case 1:
		return "Low"
	case 2:
		return "Medium"
	case 4:
		return "High"
	case 5:
		return "Severe"
	default:
		return fmt.Sprintf("Unknown (%d)", severity)
	}
}

func (c *WindowsDefenderCollector) getCategoryString(category uint32) string {
	switch category {
	case 0:
		return "Invalid"
	case 1:
		return "Adware"
	case 2:
		return "Spyware"
	case 3:
		return "Password Stealer"
	case 4:
		return "Trojan Downloader"
	case 5:
		return "Worm"
	case 6:
		return "Backdoor"
	case 7:
		return "Remote Access Trojan"
	case 8:
		return "Trojan"
	case 9:
		return "Email Flooder"
	case 10:
		return "Keylogger"
	case 11:
		return "Dialer"
	case 12:
		return "Monitoring Software"
	case 13:
		return "Browser Modifier"
	case 14:
		return "Cookie"
	case 15:
		return "Browser Plugin"
	case 16:
		return "AOL Exploit"
	case 17:
		return "Nuker"
	case 18:
		return "Security Disabler"
	case 19:
		return "Joke Program"
	case 20:
		return "Hostile ActiveX Control"
	case 21:
		return "Software Bundler"
	case 22:
		return "Stealth Modifier"
	case 23:
		return "Settings Modifier"
	case 24:
		return "Toolbar"
	case 25:
		return "Remote Control Software"
	case 26:
		return "Trojan FTP"
	case 27:
		return "Potential Unwanted Software"
	case 28:
		return "ICQ Exploit"
	case 29:
		return "Trojan Telnet"
	case 30:
		return "Exploit"
	case 31:
		return "File Sharing Program"
	case 32:
		return "Malware Creation Tool"
	case 33:
		return "Remote Control Software"
	case 34:
		return "Tool"
	case 36:
		return "Trojan Denial of Service"
	case 37:
		return "Trojan Dropper"
	case 38:
		return "Trojan Mass Mailer"
	case 39:
		return "Trojan Monitoring Software"
	case 40:
		return "Trojan Proxy Server"
	case 42:
		return "Virus"
	case 43:
		return "Known"
	case 44:
		return "Unknown"
	case 45:
		return "SPP"
	case 46:
		return "Behavior"
	default:
		return fmt.Sprintf("Unknown (%d)", category)
	}
}

func (c *WindowsDefenderCollector) getExecutionStatusString(status uint32) string {
	switch status {
	case 0:
		return "Unknown"
	case 1:
		return "Blocked"
	case 2:
		return "Allowed"
	case 3:
		return "Running"
	case 4:
		return "Not Running"
	default:
		return fmt.Sprintf("Unknown (%d)", status)
	}
}
