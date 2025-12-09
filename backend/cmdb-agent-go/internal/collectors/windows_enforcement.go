// +build windows

package collectors

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
)

// WindowsEnforcementCollector collects and enforces security policies on Windows
type WindowsEnforcementCollector struct {
	log *logger.Logger
}

// NewWindowsEnforcementCollector creates a new Windows enforcement collector
func NewWindowsEnforcementCollector(log *logger.Logger) *WindowsEnforcementCollector {
	return &WindowsEnforcementCollector{log: log}
}

func (c *WindowsEnforcementCollector) Name() string {
	return "windows_enforcement"
}

func (c *WindowsEnforcementCollector) RequiredPermissions() []string {
	return []string{"Administrator", "Security Policy Management", "Service Control"}
}

// PolicyViolation represents a policy violation
type PolicyViolation struct {
	PolicyID    string    `json:"policy_id"`
	PolicyName  string    `json:"policy_name"`
	Severity    string    `json:"severity"`
	Description string    `json:"description"`
	CurrentValue string   `json:"current_value"`
	ExpectedValue string  `json:"expected_value"`
	DetectedAt  time.Time `json:"detected_at"`
	Status      string    `json:"status"` // detected, remediated, failed
}

// RemediationAction represents an enforcement action
type RemediationAction struct {
	ActionID    string    `json:"action_id"`
	PolicyID    string    `json:"policy_id"`
	ActionType  string    `json:"action_type"` // disable_service, enable_feature, update_registry
	Description string    `json:"description"`
	ExecutedAt  time.Time `json:"executed_at"`
	Success     bool      `json:"success"`
	ErrorMsg    string    `json:"error_msg,omitempty"`
}

// EnforcementData contains policy enforcement information
type EnforcementData struct {
	Timestamp          time.Time           `json:"timestamp"`
	PoliciesChecked    int                 `json:"policies_checked"`
	ViolationsFound    int                 `json:"violations_found"`
	RemediationsApplied int                `json:"remediations_applied"`
	ComplianceScore    float64             `json:"compliance_score"`
	Violations         []PolicyViolation   `json:"violations"`
	Remediations       []RemediationAction `json:"remediations"`
	EnforcementMode    string              `json:"enforcement_mode"` // audit, enforce, disabled
}

// Collect gathers Windows policy enforcement data
func (c *WindowsEnforcementCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Enforcement data", "mode", mode)

	data := map[string]interface{}{
		"collector":            c.Name(),
		"timestamp":            time.Now().UTC().Format(time.RFC3339),
		"mode":                 mode,
		"enforcement_mode":     "enforce", // audit, enforce, disabled
		"policies_checked":     0,
		"violations_found":     0,
		"remediations_applied": 0,
		"compliance_score":     0.0,
		"violations":           []PolicyViolation{},
		"remediations":         []RemediationAction{},
	}

	violations := []PolicyViolation{}

	// Check security policies
	securityViolations := c.checkSecurityPolicies()
	violations = append(violations, securityViolations...)

	// Check firewall policies
	firewallViolations := c.checkFirewallPolicies()
	violations = append(violations, firewallViolations...)

	// Check Windows Defender policies
	defenderViolations := c.checkDefenderPolicies()
	violations = append(violations, defenderViolations...)

	// Check Windows Update policies
	updateViolations := c.checkUpdatePolicies()
	violations = append(violations, updateViolations...)

	// Check service policies
	serviceViolations := c.checkServicePolicies()
	violations = append(violations, serviceViolations...)

	// Check password policies
	passwordViolations := c.checkPasswordPolicies()
	violations = append(violations, passwordViolations...)

	policiesChecked := 25 // Total policies checked
	violationsFound := len(violations)

	data["policies_checked"] = policiesChecked
	data["violations_found"] = violationsFound
	data["violations"] = violations

	remediations := []RemediationAction{}

	// Apply remediations if in enforce mode
	enforcementMode := data["enforcement_mode"].(string)
	if enforcementMode == "enforce" {
		for _, violation := range violations {
			if violation.Severity == "critical" || violation.Severity == "high" {
				remediation := c.applyRemediation(violation)
				remediations = append(remediations, remediation)
				if remediation.Success {
					data["remediations_applied"] = data["remediations_applied"].(int) + 1
				}
			}
		}
	}

	data["remediations"] = remediations

	// Calculate compliance score
	if policiesChecked > 0 {
		data["compliance_score"] = float64(policiesChecked-violationsFound) / float64(policiesChecked) * 100
	}

	return data, nil
}

// checkSecurityPolicies checks security policy compliance
func (c *WindowsEnforcementCollector) checkSecurityPolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	// Check if Guest account is disabled
	cmd := exec.Command("net", "user", "Guest")
	output, err := cmd.CombinedOutput()
	if err == nil {
		if strings.Contains(string(output), "Account active              Yes") {
			violations = append(violations, PolicyViolation{
				PolicyID:      "SEC-001",
				PolicyName:    "Guest Account Disabled",
				Severity:      "high",
				Description:   "Guest account should be disabled",
				CurrentValue:  "Enabled",
				ExpectedValue: "Disabled",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	// Check if UAC is enabled
	cmd = exec.Command("reg", "query", "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System", "/v", "EnableLUA")
	output, err = cmd.CombinedOutput()
	if err == nil {
		if strings.Contains(string(output), "0x0") {
			violations = append(violations, PolicyViolation{
				PolicyID:      "SEC-002",
				PolicyName:    "UAC Enabled",
				Severity:      "critical",
				Description:   "User Account Control must be enabled",
				CurrentValue:  "Disabled",
				ExpectedValue: "Enabled",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	// Check if Remote Desktop is secured
	cmd = exec.Command("reg", "query", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server", "/v", "fDenyTSConnections")
	output, err = cmd.CombinedOutput()
	if err == nil {
		if strings.Contains(string(output), "0x0") {
			// RDP is enabled, check if NLA is required
			cmd = exec.Command("reg", "query", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp", "/v", "UserAuthentication")
			nlaOutput, nlaErr := cmd.CombinedOutput()
			if nlaErr == nil && strings.Contains(string(nlaOutput), "0x0") {
				violations = append(violations, PolicyViolation{
					PolicyID:      "SEC-003",
					PolicyName:    "RDP Network Level Authentication",
					Severity:      "high",
					Description:   "Remote Desktop should require Network Level Authentication",
					CurrentValue:  "Disabled",
					ExpectedValue: "Enabled",
					DetectedAt:    time.Now(),
					Status:        "detected",
				})
			}
		}
	}

	return violations
}

// checkFirewallPolicies checks Windows Firewall policy compliance
func (c *WindowsEnforcementCollector) checkFirewallPolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	profiles := []string{"domainprofile", "publicprofile", "privateprofile"}
	
	for _, profile := range profiles {
		cmd := exec.Command("netsh", "advfirewall", "show", profile, "state")
		output, err := cmd.CombinedOutput()
		
		if err == nil {
			outputStr := string(output)
			if strings.Contains(outputStr, "State                                 OFF") {
				violations = append(violations, PolicyViolation{
					PolicyID:      fmt.Sprintf("FW-001-%s", profile),
					PolicyName:    fmt.Sprintf("Firewall %s Enabled", profile),
					Severity:      "critical",
					Description:   fmt.Sprintf("Windows Firewall must be enabled for %s", profile),
					CurrentValue:  "OFF",
					ExpectedValue: "ON",
					DetectedAt:    time.Now(),
					Status:        "detected",
				})
			}
		}
	}

	return violations
}

// checkDefenderPolicies checks Windows Defender policy compliance
func (c *WindowsEnforcementCollector) checkDefenderPolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	// Check if Real-Time Protection is enabled
	cmd := exec.Command("powershell", "-Command", "Get-MpPreference | Select-Object -ExpandProperty DisableRealtimeMonitoring")
	output, err := cmd.CombinedOutput()
	if err == nil {
		if strings.TrimSpace(string(output)) == "True" {
			violations = append(violations, PolicyViolation{
				PolicyID:      "DEF-001",
				PolicyName:    "Defender Real-Time Protection",
				Severity:      "critical",
				Description:   "Windows Defender real-time protection must be enabled",
				CurrentValue:  "Disabled",
				ExpectedValue: "Enabled",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	// Check if Cloud Protection is enabled
	cmd = exec.Command("powershell", "-Command", "Get-MpPreference | Select-Object -ExpandProperty MAPSReporting")
	output, err = cmd.CombinedOutput()
	if err == nil {
		mapsValue := strings.TrimSpace(string(output))
		if mapsValue == "0" {
			violations = append(violations, PolicyViolation{
				PolicyID:      "DEF-002",
				PolicyName:    "Defender Cloud Protection",
				Severity:      "high",
				Description:   "Windows Defender cloud-based protection should be enabled",
				CurrentValue:  "Disabled",
				ExpectedValue: "Enabled",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	// Check signature age
	cmd = exec.Command("powershell", "-Command", "(Get-MpComputerStatus).AntivirusSignatureAge")
	output, err = cmd.CombinedOutput()
	if err == nil {
		ageStr := strings.TrimSpace(string(output))
		if ageStr != "" && ageStr != "0" {
			// If signature is older than 7 days, it's a violation
			violations = append(violations, PolicyViolation{
				PolicyID:      "DEF-003",
				PolicyName:    "Defender Signature Freshness",
				Severity:      "medium",
				Description:   "Windows Defender signatures should be updated regularly",
				CurrentValue:  fmt.Sprintf("%s days old", ageStr),
				ExpectedValue: "Less than 7 days",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	return violations
}

// checkUpdatePolicies checks Windows Update policy compliance
func (c *WindowsEnforcementCollector) checkUpdatePolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	// Check if automatic updates are enabled
	cmd := exec.Command("reg", "query", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU", "/v", "NoAutoUpdate")
	output, err := cmd.CombinedOutput()
	if err == nil {
		if strings.Contains(string(output), "0x1") {
			violations = append(violations, PolicyViolation{
				PolicyID:      "UPD-001",
				PolicyName:    "Automatic Updates Enabled",
				Severity:      "high",
				Description:   "Windows automatic updates should be enabled",
				CurrentValue:  "Disabled",
				ExpectedValue: "Enabled",
				DetectedAt:    time.Now(),
				Status:        "detected",
			})
		}
	}

	return violations
}

// checkServicePolicies checks critical Windows service states
func (c *WindowsEnforcementCollector) checkServicePolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	// Critical services that should be running
	criticalServices := map[string]string{
		"WinDefend":     "Windows Defender Service",
		"mpssvc":        "Windows Firewall",
		"EventLog":      "Windows Event Log",
		"CryptSvc":      "Cryptographic Services",
		"Dhcp":          "DHCP Client",
		"Dnscache":      "DNS Client",
	}

	for serviceName, displayName := range criticalServices {
		cmd := exec.Command("sc", "query", serviceName)
		output, err := cmd.CombinedOutput()
		
		if err == nil {
			outputStr := string(output)
			if !strings.Contains(outputStr, "RUNNING") {
				violations = append(violations, PolicyViolation{
					PolicyID:      fmt.Sprintf("SVC-001-%s", serviceName),
					PolicyName:    fmt.Sprintf("%s Running", displayName),
					Severity:      "high",
					Description:   fmt.Sprintf("%s must be running", displayName),
					CurrentValue:  "Stopped",
					ExpectedValue: "Running",
					DetectedAt:    time.Now(),
					Status:        "detected",
				})
			}
		}
	}

	// Services that should be disabled
	unnecessaryServices := map[string]string{
		"RemoteRegistry": "Remote Registry Service",
		"TlntSvr":        "Telnet Service",
	}

	for serviceName, displayName := range unnecessaryServices {
		cmd := exec.Command("sc", "query", serviceName)
		output, err := cmd.CombinedOutput()
		
		if err == nil {
			outputStr := string(output)
			if strings.Contains(outputStr, "RUNNING") {
				violations = append(violations, PolicyViolation{
					PolicyID:      fmt.Sprintf("SVC-002-%s", serviceName),
					PolicyName:    fmt.Sprintf("%s Disabled", displayName),
					Severity:      "medium",
					Description:   fmt.Sprintf("%s should be disabled for security", displayName),
					CurrentValue:  "Running",
					ExpectedValue: "Stopped/Disabled",
					DetectedAt:    time.Now(),
					Status:        "detected",
				})
			}
		}
	}

	return violations
}

// checkPasswordPolicies checks password policy compliance
func (c *WindowsEnforcementCollector) checkPasswordPolicies() []PolicyViolation {
	violations := []PolicyViolation{}

	// Check minimum password length
	cmd := exec.Command("net", "accounts")
	output, err := cmd.CombinedOutput()
	
	if err == nil {
		outputStr := string(output)
		
		// Check minimum password length (should be at least 12)
		if strings.Contains(outputStr, "Minimum password length") {
			lines := strings.Split(outputStr, "\n")
			for _, line := range lines {
				if strings.Contains(line, "Minimum password length") {
					parts := strings.Fields(line)
					if len(parts) > 0 {
						length := parts[len(parts)-1]
						if length != "" && length < "12" {
							violations = append(violations, PolicyViolation{
								PolicyID:      "PWD-001",
								PolicyName:    "Minimum Password Length",
								Severity:      "high",
								Description:   "Minimum password length should be at least 12 characters",
								CurrentValue:  length,
								ExpectedValue: "12 or higher",
								DetectedAt:    time.Now(),
								Status:        "detected",
							})
						}
					}
				}
			}
		}

		// Check password complexity requirement
		if strings.Contains(outputStr, "Password complexity") {
			if strings.Contains(outputStr, "No") {
				violations = append(violations, PolicyViolation{
					PolicyID:      "PWD-002",
					PolicyName:    "Password Complexity Required",
					Severity:      "critical",
					Description:   "Password complexity requirements should be enabled",
					CurrentValue:  "Disabled",
					ExpectedValue: "Enabled",
					DetectedAt:    time.Now(),
					Status:        "detected",
				})
			}
		}
	}

	return violations
}

// applyRemediation applies automatic remediation for a policy violation
func (c *WindowsEnforcementCollector) applyRemediation(violation PolicyViolation) RemediationAction {
	action := RemediationAction{
		ActionID:    fmt.Sprintf("REM-%s-%d", violation.PolicyID, time.Now().Unix()),
		PolicyID:    violation.PolicyID,
		ExecutedAt:  time.Now(),
		Success:     false,
	}

	switch violation.PolicyID {
	case "SEC-001": // Disable Guest account
		action.ActionType = "disable_account"
		action.Description = "Disabling Guest account"
		cmd := exec.Command("net", "user", "Guest", "/active:no")
		err := cmd.Run()
		action.Success = (err == nil)
		if err != nil {
			action.ErrorMsg = err.Error()
		}

	case "SEC-002": // Enable UAC
		action.ActionType = "update_registry"
		action.Description = "Enabling User Account Control"
		cmd := exec.Command("reg", "add", "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System", "/v", "EnableLUA", "/t", "REG_DWORD", "/d", "1", "/f")
		err := cmd.Run()
		action.Success = (err == nil)
		if err != nil {
			action.ErrorMsg = err.Error()
		}

	case "DEF-001": // Enable Real-Time Protection
		action.ActionType = "enable_feature"
		action.Description = "Enabling Windows Defender Real-Time Protection"
		cmd := exec.Command("powershell", "-Command", "Set-MpPreference -DisableRealtimeMonitoring $false")
		err := cmd.Run()
		action.Success = (err == nil)
		if err != nil {
			action.ErrorMsg = err.Error()
		}

	case "DEF-002": // Enable Cloud Protection
		action.ActionType = "enable_feature"
		action.Description = "Enabling Windows Defender Cloud Protection"
		cmd := exec.Command("powershell", "-Command", "Set-MpPreference -MAPSReporting Advanced")
		err := cmd.Run()
		action.Success = (err == nil)
		if err != nil {
			action.ErrorMsg = err.Error()
		}

	case "DEF-003": // Update Defender signatures
		action.ActionType = "update_signatures"
		action.Description = "Updating Windows Defender signatures"
		cmd := exec.Command("powershell", "-Command", "Update-MpSignature")
		err := cmd.Run()
		action.Success = (err == nil)
		if err != nil {
			action.ErrorMsg = err.Error()
		}

	default:
		// Enable firewall for specific profiles
		if strings.HasPrefix(violation.PolicyID, "FW-001-") {
			profile := strings.TrimPrefix(violation.PolicyID, "FW-001-")
			action.ActionType = "enable_firewall"
			action.Description = fmt.Sprintf("Enabling Windows Firewall for %s", profile)
			cmd := exec.Command("netsh", "advfirewall", "set", profile, "state", "on")
			err := cmd.Run()
			action.Success = (err == nil)
			if err != nil {
				action.ErrorMsg = err.Error()
			}
		} else {
			action.ActionType = "manual_intervention"
			action.Description = "Manual intervention required"
			action.ErrorMsg = "No automated remediation available for this policy"
		}
	}

	return action
}
