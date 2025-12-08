// +build windows

package collectors

import (
	"context"
	"fmt"
	"time"

	"github.com/iac/cmdb-agent/internal/logger"
	"github.com/yusufpapurcu/wmi"
)

type WindowsWMICollector struct {
	log *logger.Logger
}

func NewWindowsWMICollector(log *logger.Logger) *WindowsWMICollector {
	return &WindowsWMICollector{log: log}
}

func (c *WindowsWMICollector) Name() string {
	return "windows_wmi"
}

func (c *WindowsWMICollector) RequiredPermissions() []string {
	return []string{"WMI query"}
}

func (c *WindowsWMICollector) Collect(ctx context.Context, mode string) (map[string]interface{}, error) {
	c.log.Debug("Collecting Windows WMI data", "mode", mode)

	result := map[string]interface{}{
		"collector":        c.Name(),
		"timestamp":        time.Now().UTC().Format(time.RFC3339),
		"mode":             mode,
		"operating_system": c.collectOperatingSystem(),
		"computer_system":  c.collectComputerSystem(),
		"bios":             c.collectBIOS(),
		"processors":       c.collectProcessors(),
		"logical_disks":    c.collectLogicalDisks(),
	}

	if mode == "detailed" {
		result["base_board"] = c.collectBaseBoard()
		result["network_adapters"] = c.collectNetworkAdapters()
		result["video_controllers"] = c.collectVideoControllers()
		result["system_enclosure"] = c.collectSystemEnclosure()
		result["time_zone"] = c.collectTimeZone()
		result["environment"] = c.collectEnvironment()
	}

	return result, nil
}

// Win32_OperatingSystem
type Win32OperatingSystem struct {
	Caption                 string
	Version                 string
	BuildNumber             string
	OSArchitecture          string
	ServicePackMajorVersion uint16
	ServicePackMinorVersion uint16
	InstallDate             time.Time
	LastBootUpTime          time.Time
	LocalDateTime           time.Time
	NumberOfUsers           uint32
	RegisteredUser          string
	Organization            string
	SerialNumber            string
	SystemDirectory         string
	WindowsDirectory        string
	FreePhysicalMemory      uint64
	TotalVisibleMemorySize  uint64
	FreeVirtualMemory       uint64
	TotalVirtualMemorySize  uint64
	NumberOfProcesses       uint32
	NumberOfLicensedUsers   uint32
}

func (c *WindowsWMICollector) collectOperatingSystem() map[string]interface{} {
	var dst []Win32OperatingSystem
	query := "SELECT * FROM Win32_OperatingSystem"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_OperatingSystem", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{"error": "No operating system information found"}
	}

	os := dst[0]
	return map[string]interface{}{
		"caption":                   os.Caption,
		"version":                   os.Version,
		"build_number":              os.BuildNumber,
		"architecture":              os.OSArchitecture,
		"service_pack_major":        os.ServicePackMajorVersion,
		"service_pack_minor":        os.ServicePackMinorVersion,
		"install_date":              os.InstallDate.Format(time.RFC3339),
		"last_boot_time":            os.LastBootUpTime.Format(time.RFC3339),
		"local_date_time":           os.LocalDateTime.Format(time.RFC3339),
		"uptime_hours":              time.Since(os.LastBootUpTime).Hours(),
		"number_of_users":           os.NumberOfUsers,
		"registered_user":           os.RegisteredUser,
		"organization":              os.Organization,
		"serial_number":             os.SerialNumber,
		"system_directory":          os.SystemDirectory,
		"windows_directory":         os.WindowsDirectory,
		"free_physical_memory_mb":   os.FreePhysicalMemory / 1024,
		"total_visible_memory_mb":   os.TotalVisibleMemorySize / 1024,
		"free_virtual_memory_mb":    os.FreeVirtualMemory / 1024,
		"total_virtual_memory_mb":   os.TotalVirtualMemorySize / 1024,
		"number_of_processes":       os.NumberOfProcesses,
		"number_of_licensed_users":  os.NumberOfLicensedUsers,
	}
}

// Win32_ComputerSystem
type Win32ComputerSystem struct {
	Name                    string
	Manufacturer            string
	Model                   string
	Domain                  string
	Workgroup               string
	DomainRole              uint16
	DNSHostName             string
	PartOfDomain            bool
	PrimaryOwnerName        string
	TotalPhysicalMemory     uint64
	NumberOfLogicalProcessors uint32
	NumberOfProcessors      uint32
	SystemType              string
	PCSystemType            uint16
	UserName                string
}

func (c *WindowsWMICollector) collectComputerSystem() map[string]interface{} {
	var dst []Win32ComputerSystem
	query := "SELECT * FROM Win32_ComputerSystem"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_ComputerSystem", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{"error": "No computer system information found"}
	}

	cs := dst[0]
	domainRole := map[uint16]string{
		0: "Standalone Workstation",
		1: "Member Workstation",
		2: "Standalone Server",
		3: "Member Server",
		4: "Backup Domain Controller",
		5: "Primary Domain Controller",
	}

	return map[string]interface{}{
		"name":                       cs.Name,
		"manufacturer":               cs.Manufacturer,
		"model":                      cs.Model,
		"domain":                     cs.Domain,
		"workgroup":                  cs.Workgroup,
		"domain_role":                domainRole[cs.DomainRole],
		"domain_role_code":           cs.DomainRole,
		"dns_hostname":               cs.DNSHostName,
		"part_of_domain":             cs.PartOfDomain,
		"primary_owner":              cs.PrimaryOwnerName,
		"total_physical_memory_mb":   cs.TotalPhysicalMemory / 1024 / 1024,
		"logical_processors":         cs.NumberOfLogicalProcessors,
		"physical_processors":        cs.NumberOfProcessors,
		"system_type":                cs.SystemType,
		"pc_system_type":             cs.PCSystemType,
		"current_user":               cs.UserName,
	}
}

// Win32_BIOS
type Win32BIOS struct {
	Manufacturer       string
	Name               string
	SerialNumber       string
	Version            string
	ReleaseDate        time.Time
	SMBIOSBIOSVersion  string
	SMBIOSMajorVersion uint16
	SMBIOSMinorVersion uint16
}

func (c *WindowsWMICollector) collectBIOS() map[string]interface{} {
	var dst []Win32BIOS
	query := "SELECT * FROM Win32_BIOS"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_BIOS", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{"error": "No BIOS information found"}
	}

	bios := dst[0]
	return map[string]interface{}{
		"manufacturer":        bios.Manufacturer,
		"name":                bios.Name,
		"serial_number":       bios.SerialNumber,
		"version":             bios.Version,
		"release_date":        bios.ReleaseDate.Format(time.RFC3339),
		"smbios_version":      bios.SMBIOSBIOSVersion,
		"smbios_major":        bios.SMBIOSMajorVersion,
		"smbios_minor":        bios.SMBIOSMinorVersion,
	}
}

// Win32_Processor
type Win32Processor struct {
	Name                  string
	Manufacturer          string
	Caption               string
	MaxClockSpeed         uint32
	CurrentClockSpeed     uint32
	NumberOfCores         uint32
	NumberOfLogicalProcessors uint32
	Architecture          uint16
	Family                uint16
	ProcessorId           string
	SocketDesignation     string
	L2CacheSize           uint32
	L3CacheSize           uint32
	LoadPercentage        uint16
}

func (c *WindowsWMICollector) collectProcessors() []map[string]interface{} {
	var dst []Win32Processor
	query := "SELECT * FROM Win32_Processor"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_Processor", "error", err)
		return []map[string]interface{}{{"error": err.Error()}}
	}

	processors := make([]map[string]interface{}, 0, len(dst))
	for _, proc := range dst {
		arch := map[uint16]string{
			0:  "x86",
			1:  "MIPS",
			2:  "Alpha",
			3:  "PowerPC",
			5:  "ARM",
			6:  "ia64",
			9:  "x64",
			12: "ARM64",
		}

		processors = append(processors, map[string]interface{}{
			"name":               proc.Name,
			"manufacturer":       proc.Manufacturer,
			"caption":            proc.Caption,
			"max_clock_speed":    proc.MaxClockSpeed,
			"current_clock_speed": proc.CurrentClockSpeed,
			"cores":              proc.NumberOfCores,
			"logical_processors": proc.NumberOfLogicalProcessors,
			"architecture":       arch[proc.Architecture],
			"architecture_code":  proc.Architecture,
			"family":             proc.Family,
			"processor_id":       proc.ProcessorId,
			"socket":             proc.SocketDesignation,
			"l2_cache_kb":        proc.L2CacheSize,
			"l3_cache_kb":        proc.L3CacheSize,
			"load_percentage":    proc.LoadPercentage,
		})
	}

	return processors
}

// Win32_LogicalDisk
type Win32LogicalDisk struct {
	DeviceID          string
	VolumeName        string
	FileSystem        string
	Size              uint64
	FreeSpace         uint64
	DriveType         uint32
	VolumeSerialNumber string
	Description       string
	Compressed        bool
}

func (c *WindowsWMICollector) collectLogicalDisks() []map[string]interface{} {
	var dst []Win32LogicalDisk
	query := "SELECT * FROM Win32_LogicalDisk"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_LogicalDisk", "error", err)
		return []map[string]interface{}{{"error": err.Error()}}
	}

	driveTypes := map[uint32]string{
		0: "Unknown",
		1: "No Root Directory",
		2: "Removable Disk",
		3: "Local Disk",
		4: "Network Drive",
		5: "Compact Disc",
		6: "RAM Disk",
	}

	disks := make([]map[string]interface{}, 0, len(dst))
	for _, disk := range dst {
		var usedPercent float64
		if disk.Size > 0 {
			usedPercent = float64(disk.Size-disk.FreeSpace) / float64(disk.Size) * 100
		}

		disks = append(disks, map[string]interface{}{
			"device_id":       disk.DeviceID,
			"volume_name":     disk.VolumeName,
			"file_system":     disk.FileSystem,
			"size_gb":         float64(disk.Size) / 1024 / 1024 / 1024,
			"free_space_gb":   float64(disk.FreeSpace) / 1024 / 1024 / 1024,
			"used_percent":    fmt.Sprintf("%.2f", usedPercent),
			"drive_type":      driveTypes[disk.DriveType],
			"drive_type_code": disk.DriveType,
			"serial_number":   disk.VolumeSerialNumber,
			"description":     disk.Description,
			"compressed":      disk.Compressed,
		})
	}

	return disks
}

// Win32_BaseBoard
type Win32BaseBoard struct {
	Manufacturer   string
	Product        string
	SerialNumber   string
	Version        string
	Model          string
}

func (c *WindowsWMICollector) collectBaseBoard() map[string]interface{} {
	var dst []Win32BaseBoard
	query := "SELECT * FROM Win32_BaseBoard"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_BaseBoard", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{}
	}

	bb := dst[0]
	return map[string]interface{}{
		"manufacturer":  bb.Manufacturer,
		"product":       bb.Product,
		"serial_number": bb.SerialNumber,
		"version":       bb.Version,
		"model":         bb.Model,
	}
}

// Win32_NetworkAdapter
type Win32NetworkAdapter struct {
	Name              string
	MACAddress        string
	Manufacturer      string
	NetConnectionID   string
	AdapterType       string
	Speed             uint64
	NetEnabled        bool
}

func (c *WindowsWMICollector) collectNetworkAdapters() []map[string]interface{} {
	var dst []Win32NetworkAdapter
	query := "SELECT * FROM Win32_NetworkAdapter WHERE NetConnectionID IS NOT NULL"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_NetworkAdapter", "error", err)
		return []map[string]interface{}{{"error": err.Error()}}
	}

	adapters := make([]map[string]interface{}, 0, len(dst))
	for _, adapter := range dst {
		adapters = append(adapters, map[string]interface{}{
			"name":           adapter.Name,
			"mac_address":    adapter.MACAddress,
			"manufacturer":   adapter.Manufacturer,
			"connection_id":  adapter.NetConnectionID,
			"adapter_type":   adapter.AdapterType,
			"speed_mbps":     adapter.Speed / 1000000,
			"enabled":        adapter.NetEnabled,
		})
	}

	return adapters
}

// Win32_VideoController
type Win32VideoController struct {
	Name              string
	AdapterRAM        uint32
	DriverVersion     string
	VideoProcessor    string
	CurrentHorizontalResolution uint32
	CurrentVerticalResolution   uint32
	CurrentRefreshRate          uint32
}

func (c *WindowsWMICollector) collectVideoControllers() []map[string]interface{} {
	var dst []Win32VideoController
	query := "SELECT * FROM Win32_VideoController"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_VideoController", "error", err)
		return []map[string]interface{}{{"error": err.Error()}}
	}

	controllers := make([]map[string]interface{}, 0, len(dst))
	for _, vc := range dst {
		controllers = append(controllers, map[string]interface{}{
			"name":            vc.Name,
			"adapter_ram_mb":  vc.AdapterRAM / 1024 / 1024,
			"driver_version":  vc.DriverVersion,
			"video_processor": vc.VideoProcessor,
			"resolution":      fmt.Sprintf("%dx%d", vc.CurrentHorizontalResolution, vc.CurrentVerticalResolution),
			"refresh_rate":    vc.CurrentRefreshRate,
		})
	}

	return controllers
}

// Win32_SystemEnclosure
type Win32SystemEnclosure struct {
	Manufacturer   string
	Model          string
	SerialNumber   string
	SMBIOSAssetTag string
	ChassisTypes   []uint16
}

func (c *WindowsWMICollector) collectSystemEnclosure() map[string]interface{} {
	var dst []Win32SystemEnclosure
	query := "SELECT * FROM Win32_SystemEnclosure"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_SystemEnclosure", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{}
	}

	enc := dst[0]
	chassisTypes := map[uint16]string{
		1:  "Other",
		2:  "Unknown",
		3:  "Desktop",
		4:  "Low Profile Desktop",
		5:  "Pizza Box",
		6:  "Mini Tower",
		7:  "Tower",
		8:  "Portable",
		9:  "Laptop",
		10: "Notebook",
		11: "Hand Held",
		12: "Docking Station",
		13: "All in One",
		14: "Sub Notebook",
		15: "Space-Saving",
		16: "Lunch Box",
		17: "Main System Chassis",
		18: "Expansion Chassis",
		19: "Sub Chassis",
		20: "Bus Expansion Chassis",
		21: "Peripheral Chassis",
		22: "Storage Chassis",
		23: "Rack Mount Chassis",
		24: "Sealed-Case PC",
	}

	types := make([]string, 0, len(enc.ChassisTypes))
	for _, ct := range enc.ChassisTypes {
		if name, ok := chassisTypes[ct]; ok {
			types = append(types, name)
		}
	}

	return map[string]interface{}{
		"manufacturer":  enc.Manufacturer,
		"model":         enc.Model,
		"serial_number": enc.SerialNumber,
		"asset_tag":     enc.SMBIOSAssetTag,
		"chassis_types": types,
	}
}

// Win32_TimeZone
type Win32TimeZone struct {
	Caption        string
	StandardName   string
	Bias           int32
	DaylightBias   int32
}

func (c *WindowsWMICollector) collectTimeZone() map[string]interface{} {
	var dst []Win32TimeZone
	query := "SELECT * FROM Win32_TimeZone"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_TimeZone", "error", err)
		return map[string]interface{}{"error": err.Error()}
	}

	if len(dst) == 0 {
		return map[string]interface{}{}
	}

	tz := dst[0]
	return map[string]interface{}{
		"caption":       tz.Caption,
		"standard_name": tz.StandardName,
		"bias_minutes":  tz.Bias,
		"daylight_bias": tz.DaylightBias,
	}
}

// Win32_Environment
type Win32Environment struct {
	Name         string
	VariableValue string
	UserName     string
	SystemVariable bool
}

func (c *WindowsWMICollector) collectEnvironment() []map[string]interface{} {
	var dst []Win32Environment
	query := "SELECT * FROM Win32_Environment WHERE SystemVariable = TRUE"
	
	if err := wmi.Query(query, &dst); err != nil {
		c.log.Error("Failed to query Win32_Environment", "error", err)
		return []map[string]interface{}{{"error": err.Error()}}
	}

	envVars := make([]map[string]interface{}, 0, len(dst))
	for _, env := range dst {
		envVars = append(envVars, map[string]interface{}{
			"name":  env.Name,
			"value": env.VariableValue,
		})
	}

	return envVars
}
