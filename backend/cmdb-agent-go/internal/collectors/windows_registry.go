// +build windows

package collectors

import (
	"context"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"golang.org/x/sys/windows/registry"
)

type WindowsRegistryCollector struct {
	log *logger.Logger
}

func NewWindowsRegistryCollector(log *logger.Logger) *WindowsRegistryCollector {
	return &WindowsRegistryCollector{log: log}
}

func (c *WindowsRegistryCollector) Name() string {
	return "windows_registry"
}

func (c *WindowsRegistryCollector) RequiredPermissions() []string {
	return []string{"HKEY_LOCAL_MACHINE read"}
}

func (c *WindowsRegistryCollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows Registry data", "mode", mode)

	result := map[string]interface{}{
		"collector":   c.Name(),
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"mode":        mode,
		"system_info": c.collectSystemInfo(),
		"windows":     c.collectWindowsInfo(),
		"installed":   c.collectInstalledSoftware(),
		"policies":    c.collectPolicies(),
		"startup":     c.collectStartupPrograms(),
	}

	if mode == "detailed" {
		result["network"] = c.collectNetworkSettings()
		result["security"] = c.collectSecuritySettings()
		result["updates"] = c.collectUpdateSettings()
	}

	return result, nil
}

func (c *WindowsRegistryCollector) collectSystemInfo() map[string]interface{} {
	info := make(map[string]interface{})

	// Computer name
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Control\ComputerName\ComputerName`, "ComputerName"); err == nil {
		info["computer_name"] = val
	}

	// Product name
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "ProductName"); err == nil {
		info["product_name"] = val
	}

	// Current Version
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "CurrentVersion"); err == nil {
		info["current_version"] = val
	}

	// Build number
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "CurrentBuild"); err == nil {
		info["build_number"] = val
	}

	// Display version
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "DisplayVersion"); err == nil {
		info["display_version"] = val
	}

	// Install date
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "InstallDate"); err == nil {
		info["install_date"] = time.Unix(int64(val), 0).Format(time.RFC3339)
	}

	// Registered owner
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "RegisteredOwner"); err == nil {
		info["registered_owner"] = val
	}

	// Registered organization
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "RegisteredOrganization"); err == nil {
		info["registered_organization"] = val
	}

	return info
}

func (c *WindowsRegistryCollector) collectWindowsInfo() map[string]interface{} {
	info := make(map[string]interface{})

	// Product ID
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "ProductId"); err == nil {
		info["product_id"] = val
	}

	// License info
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "EditionID"); err == nil {
		info["edition_id"] = val
	}

	// Install type
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "InstallationType"); err == nil {
		info["installation_type"] = val
	}

	// System Root
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, "SystemRoot"); err == nil {
		info["system_root"] = val
	}

	return info
}

func (c *WindowsRegistryCollector) collectInstalledSoftware() []map[string]interface{} {
	software := []map[string]interface{}{}

	paths := []string{
		`SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`,
		`SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall`,
	}

	for _, path := range paths {
		k, err := registry.OpenKey(registry.LOCAL_MACHINE, path, registry.ENUMERATE_SUB_KEYS)
		if err != nil {
			continue
		}
		defer k.Close()

		subkeys, err := k.ReadSubKeyNames(-1)
		if err != nil {
			continue
		}

		for _, subkey := range subkeys {
			subk, err := registry.OpenKey(registry.LOCAL_MACHINE, path+`\`+subkey, registry.QUERY_VALUE)
			if err != nil {
				continue
			}

			app := make(map[string]interface{})
			app["registry_key"] = subkey

			if val, _, err := subk.GetStringValue("DisplayName"); err == nil && val != "" {
				app["name"] = val
			}
			if val, _, err := subk.GetStringValue("DisplayVersion"); err == nil {
				app["version"] = val
			}
			if val, _, err := subk.GetStringValue("Publisher"); err == nil {
				app["publisher"] = val
			}
			if val, _, err := subk.GetStringValue("InstallDate"); err == nil {
				app["install_date"] = val
			}
			if val, _, err := subk.GetStringValue("InstallLocation"); err == nil {
				app["install_location"] = val
			}

			subk.Close()

			if _, ok := app["name"]; ok {
				software = append(software, app)
			}
		}
	}

	return software
}

func (c *WindowsRegistryCollector) collectPolicies() map[string]interface{} {
	policies := make(map[string]interface{})

	// Windows Update policies
	updatePolicies := make(map[string]interface{})
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU`, "NoAutoUpdate"); err == nil {
		updatePolicies["no_auto_update"] = val != 0
	}
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU`, "AUOptions"); err == nil {
		updatePolicies["au_options"] = val
	}
	policies["windows_update"] = updatePolicies

	// Firewall policies
	firewallPolicies := make(map[string]interface{})
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\StandardProfile`, "EnableFirewall"); err == nil {
		firewallPolicies["standard_profile_enabled"] = val != 0
	}
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\DomainProfile`, "EnableFirewall"); err == nil {
		firewallPolicies["domain_profile_enabled"] = val != 0
	}
	policies["firewall"] = firewallPolicies

	return policies
}

func (c *WindowsRegistryCollector) collectStartupPrograms() []map[string]interface{} {
	startup := []map[string]interface{}{}

	paths := []struct {
		root registry.Key
		path string
		name string
	}{
		{registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows\CurrentVersion\Run`, "HKLM Run"},
		{registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce`, "HKLM RunOnce"},
		{registry.CURRENT_USER, `SOFTWARE\Microsoft\Windows\CurrentVersion\Run`, "HKCU Run"},
		{registry.CURRENT_USER, `SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce`, "HKCU RunOnce"},
	}

	for _, loc := range paths {
		k, err := registry.OpenKey(loc.root, loc.path, registry.QUERY_VALUE)
		if err != nil {
			continue
		}

		values, err := k.ReadValueNames(-1)
		if err != nil {
			k.Close()
			continue
		}

		for _, valueName := range values {
			val, _, err := k.GetStringValue(valueName)
			if err != nil {
				continue
			}

			startup = append(startup, map[string]interface{}{
				"name":     valueName,
				"command":  val,
				"location": loc.name,
			})
		}

		k.Close()
	}

	return startup
}

func (c *WindowsRegistryCollector) collectNetworkSettings() map[string]interface{} {
	network := make(map[string]interface{})

	// TCP/IP settings
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Services\Tcpip\Parameters`, "EnableICMPRedirect"); err == nil {
		network["enable_icmp_redirect"] = val != 0
	}

	return network
}

func (c *WindowsRegistryCollector) collectSecuritySettings() map[string]interface{} {
	security := make(map[string]interface{})

	// LSA settings
	if val, err := c.readRegDWord(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Control\Lsa`, "LimitBlankPasswordUse"); err == nil {
		security["limit_blank_password_use"] = val != 0
	}

	return security
}

func (c *WindowsRegistryCollector) collectUpdateSettings() map[string]interface{} {
	updates := make(map[string]interface{})

	// Last update check
	if val, err := c.readRegString(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\Results\Detect`, "LastSuccessTime"); err == nil {
		updates["last_check_time"] = val
	}

	return updates
}

// Helper functions
func (c *WindowsRegistryCollector) readRegString(root registry.Key, path, name string) (string, error) {
	k, err := registry.OpenKey(root, path, registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	val, _, err := k.GetStringValue(name)
	return val, err
}

func (c *WindowsRegistryCollector) readRegDWord(root registry.Key, path, name string) (uint32, error) {
	k, err := registry.OpenKey(root, path, registry.QUERY_VALUE)
	if err != nil {
		return 0, err
	}
	defer k.Close()

	val, _, err := k.GetIntegerValue(name)
	return uint32(val), err
}
