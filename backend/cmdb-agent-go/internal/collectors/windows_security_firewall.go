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

type WindowsFirewallCollector struct {
	log *logger.Logger
}

func NewWindowsFirewallCollector(log *logger.Logger) *WindowsFirewallCollector {
	return &WindowsFirewallCollector{log: log}
}

func (c *WindowsFirewallCollector) Name() string {
	return "windows_firewall"
}

func (c *WindowsFirewallCollector) RequiredPermissions() []string {
	return []string{"Administrators"}
}

func (c *WindowsFirewallCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Firewall data", "mode", mode)

	result := map[string]interface{}{
		"collector": c.Name(),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"mode":      mode,
	}

	// Collect firewall status
	profiles := c.collectFirewallProfiles()
	if profiles != nil {
		result["profiles"] = profiles
	}

	// Collect rule statistics
	ruleStats := c.collectRuleStats()
	if ruleStats != nil {
		result["rule_statistics"] = ruleStats
	}

	// Collect detailed rules in detailed mode
	if mode == "detailed" {
		rules := c.collectFirewallRules()
		if rules != nil {
			result["rules"] = rules
		}
	}

	return result, nil
}

func (c *WindowsFirewallCollector) collectFirewallProfiles() map[string]interface{} {
	profiles := make(map[string]interface{})

	// Query each profile (Domain, Private, Public)
	profileNames := []string{"domain", "private", "public"}
	
	for _, profile := range profileNames {
		profileData := c.queryFirewallProfile(profile)
		if profileData != nil {
			profiles[profile] = profileData
		}
	}

	return profiles
}

func (c *WindowsFirewallCollector) queryFirewallProfile(profile string) map[string]interface{} {
	cmd := exec.Command("netsh", "advfirewall", "show", profile, "state")
	output, err := cmd.Output()
	
	if err != nil {
		c.log.Warn("Failed to query firewall profile", "profile", profile, "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query: %v", err),
		}
	}

	lines := strings.Split(string(output), "\n")
	data := make(map[string]string)
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.Contains(line, ":") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				value := strings.TrimSpace(parts[1])
				data[key] = value
			}
		}
	}

	state := "unknown"
	if val, ok := data["State"]; ok {
		state = strings.ToLower(val)
	}

	return map[string]interface{}{
		"state":        state,
		"enabled":      state == "on",
		"raw_data":     data,
	}
}

func (c *WindowsFirewallCollector) collectRuleStats() map[string]interface{} {
	cmd := exec.Command("netsh", "advfirewall", "firewall", "show", "rule", "name=all")
	output, err := cmd.Output()
	
	if err != nil {
		c.log.Warn("Failed to query firewall rules", "error", err)
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to query rules: %v", err),
		}
	}

	lines := strings.Split(string(output), "\n")
	
	totalRules := 0
	enabledRules := 0
	disabledRules := 0
	inboundRules := 0
	outboundRules := 0
	
	currentEnabled := false
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		if strings.HasPrefix(line, "Rule Name:") {
			totalRules++
			currentEnabled = false
		} else if strings.HasPrefix(line, "Enabled:") {
			if strings.Contains(strings.ToLower(line), "yes") {
				enabledRules++
				currentEnabled = true
			} else {
				disabledRules++
			}
		} else if strings.HasPrefix(line, "Direction:") && currentEnabled {
			if strings.Contains(strings.ToLower(line), "in") {
				inboundRules++
			} else if strings.Contains(strings.ToLower(line), "out") {
				outboundRules++
			}
		}
	}

	return map[string]interface{}{
		"total_rules":    totalRules,
		"enabled_rules":  enabledRules,
		"disabled_rules": disabledRules,
		"inbound_rules":  inboundRules,
		"outbound_rules": outboundRules,
	}
}

func (c *WindowsFirewallCollector) collectFirewallRules() []map[string]interface{} {
	cmd := exec.Command("netsh", "advfirewall", "firewall", "show", "rule", "name=all", "verbose")
	output, err := cmd.Output()
	
	if err != nil {
		c.log.Warn("Failed to query detailed firewall rules", "error", err)
		return nil
	}

	lines := strings.Split(string(output), "\n")
	rules := []map[string]interface{}{}
	currentRule := make(map[string]string)
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		if line == "" || strings.HasPrefix(line, "---") {
			if len(currentRule) > 0 {
				rule := c.parseFirewallRule(currentRule)
				if rule != nil {
					rules = append(rules, rule)
				}
				currentRule = make(map[string]string)
			}
			continue
		}
		
		if strings.Contains(line, ":") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				value := strings.TrimSpace(parts[1])
				currentRule[key] = value
			}
		}
	}
	
	// Add last rule
	if len(currentRule) > 0 {
		rule := c.parseFirewallRule(currentRule)
		if rule != nil {
			rules = append(rules, rule)
		}
	}

	// Limit to first 100 rules to avoid too much data
	if len(rules) > 100 {
		rules = rules[:100]
	}

	return rules
}

func (c *WindowsFirewallCollector) parseFirewallRule(data map[string]string) map[string]interface{} {
	if len(data) == 0 {
		return nil
	}

	rule := make(map[string]interface{})
	
	// Required fields
	if name, ok := data["Rule Name"]; ok {
		rule["name"] = name
	} else {
		return nil
	}

	// Optional fields
	if enabled, ok := data["Enabled"]; ok {
		rule["enabled"] = strings.ToLower(enabled) == "yes"
	}
	
	if direction, ok := data["Direction"]; ok {
		rule["direction"] = strings.ToLower(direction)
	}
	
	if profile, ok := data["Profiles"]; ok {
		rule["profiles"] = profile
	}
	
	if action, ok := data["Action"]; ok {
		rule["action"] = strings.ToLower(action)
	}
	
	if protocol, ok := data["Protocol"]; ok {
		rule["protocol"] = protocol
	}
	
	if localIP, ok := data["LocalIP"]; ok {
		rule["local_ip"] = localIP
	}
	
	if remoteIP, ok := data["RemoteIP"]; ok {
		rule["remote_ip"] = remoteIP
	}
	
	if localPort, ok := data["LocalPort"]; ok {
		rule["local_port"] = localPort
	}
	
	if remotePort, ok := data["RemotePort"]; ok {
		rule["remote_port"] = remotePort
	}
	
	if program, ok := data["Program"]; ok {
		rule["program"] = program
	}
	
	if service, ok := data["Service"]; ok {
		rule["service"] = service
	}

	return rule
}
