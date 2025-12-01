using System;
using System.IO;
using System.Net.Http;
using System.ServiceProcess;
using System.Text;
using System.Timers;
using System.Management;
using Newtonsoft.Json;

namespace CMDBAgent
{
    public partial class CMDBAgentService : ServiceBase
    {
        private Timer heartbeatTimer;
        private readonly HttpClient httpClient;
        private readonly string serverUrl;
        private readonly string version = "1.0.0";
        private readonly int heartbeatInterval = 60000; // 60 seconds

        public CMDBAgentService()
        {
            InitializeComponent();
            
            // Service configuration
            ServiceName = "CMDBAgent";
            CanStop = true;
            CanPauseAndContinue = false;
            AutoLog = true;

            // Load configuration
            string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");
            if (File.Exists(configPath))
            {
                var config = JsonConvert.DeserializeObject<dynamic>(File.ReadAllText(configPath));
                serverUrl = config.serverUrl ?? "http://192.168.1.9:3001";
            }
            else
            {
                serverUrl = "http://192.168.1.9:3001";
            }

            httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        private void InitializeComponent()
        {
            this.ServiceName = "CMDBAgent";
        }

        protected override void OnStart(string[] args)
        {
            LogMessage("CMDB Agent Service starting...");
            
            try
            {
                // Initialize timer for heartbeat
                heartbeatTimer = new Timer(heartbeatInterval);
                heartbeatTimer.Elapsed += OnHeartbeatTimer;
                heartbeatTimer.AutoReset = true;
                heartbeatTimer.Start();

                // Send initial heartbeat
                SendHeartbeat();

                LogMessage($"CMDB Agent Service started successfully. Server: {serverUrl}");
            }
            catch (Exception ex)
            {
                LogMessage($"Error starting service: {ex.Message}");
                throw;
            }
        }

        protected override void OnStop()
        {
            LogMessage("CMDB Agent Service stopping...");
            
            if (heartbeatTimer != null)
            {
                heartbeatTimer.Stop();
                heartbeatTimer.Dispose();
            }

            httpClient?.Dispose();

            LogMessage("CMDB Agent Service stopped.");
        }

        private void OnHeartbeatTimer(object sender, ElapsedEventArgs e)
        {
            SendHeartbeat();
        }

        private async void SendHeartbeat()
        {
            try
            {
                var systemInfo = GetSystemInfo();
                var json = JsonConvert.SerializeObject(systemInfo);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{serverUrl}/api/agents/heartbeat", content);
                
                if (response.IsSuccessStatusCode)
                {
                    LogMessage($"Heartbeat sent successfully at {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                }
                else
                {
                    LogMessage($"Heartbeat failed with status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error sending heartbeat: {ex.Message}");
            }
        }

        private object GetSystemInfo()
        {
            string hostname = Environment.MachineName;
            string os = GetOSVersion();
            string memory = GetTotalMemory();
            string cpu = GetCPUInfo();
            string ipAddress = GetIPAddress();
            string macAddress = GetMacAddress();
            string domain = GetDomain();
            var ipAddresses = GetAllIPAddresses();
            var macAddresses = GetAllMacAddresses();

            return new
            {
                hostname = hostname,
                os = os,
                memory = memory,
                cpu = cpu,
                ipAddress = ipAddress,
                ipAddresses = ipAddresses,
                macAddress = macAddress,
                macAddresses = macAddresses,
                domain = domain,
                version = version,
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };
        }

        private string GetIPAddress()
        {
            try
            {
                // Get the primary active network adapter's IP address
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT IPAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"))
                {
                    foreach (var adapter in searcher.Get())
                    {
                        var addresses = adapter["IPAddress"] as string[];
                        if (addresses != null && addresses.Length > 0)
                        {
                            // Return the first IPv4 address (skip IPv6)
                            foreach (var addr in addresses)
                            {
                                if (!addr.Contains(":") && !addr.StartsWith("169.254"))
                                {
                                    return addr;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error getting IP address: {ex.Message}");
            }
            return "Unknown";
        }

        private List<string> GetAllIPAddresses()
        {
            var ipList = new List<string>();
            try
            {
                // Get all IP addresses from all active network adapters
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT IPAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"))
                {
                    foreach (var adapter in searcher.Get())
                    {
                        var addresses = adapter["IPAddress"] as string[];
                        if (addresses != null && addresses.Length > 0)
                        {
                            foreach (var addr in addresses)
                            {
                                // Only include IPv4 addresses, skip IPv6 and link-local
                                if (!addr.Contains(":") && !addr.StartsWith("169.254") && !ipList.Contains(addr))
                                {
                                    ipList.Add(addr);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error getting all IP addresses: {ex.Message}");
            }
            return ipList;
        }

        private string GetMacAddress()
        {
            try
            {
                // Get MAC address of the primary active network adapter
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT MACAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"))
                {
                    foreach (var adapter in searcher.Get())
                    {
                        var mac = adapter["MACAddress"]?.ToString();
                        if (!string.IsNullOrEmpty(mac))
                        {
                            return mac;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error getting MAC address: {ex.Message}");
            }
            return "Unknown";
        }

        private List<string> GetAllMacAddresses()
        {
            var macList = new List<string>();
            try
            {
                // Get all MAC addresses from all active network adapters
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT MACAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"))
                {
                    foreach (var adapter in searcher.Get())
                    {
                        var mac = adapter["MACAddress"]?.ToString();
                        if (!string.IsNullOrEmpty(mac) && !macList.Contains(mac))
                        {
                            macList.Add(mac);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error getting all MAC addresses: {ex.Message}");
            }
            return macList;
        }

        private string GetDomain()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT Domain, PartOfDomain FROM Win32_ComputerSystem"))
                {
                    foreach (var system in searcher.Get())
                    {
                        bool partOfDomain = Convert.ToBoolean(system["PartOfDomain"]);
                        string domain = system["Domain"]?.ToString();
                        
                        if (partOfDomain && !string.IsNullOrEmpty(domain))
                        {
                            return domain;
                        }
                        else
                        {
                            return "WORKGROUP";
                        }
                    }
                }
            }
            catch
            {
                return "WORKGROUP";
            }
            return "WORKGROUP";
        }

        private string GetOSVersion()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT Caption FROM Win32_OperatingSystem"))
                {
                    foreach (var os in searcher.Get())
                    {
                        return os["Caption"].ToString();
                    }
                }
            }
            catch
            {
                return $"Windows {Environment.OSVersion.Version}";
            }
            return "Windows";
        }

        private string GetTotalMemory()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem"))
                {
                    foreach (var system in searcher.Get())
                    {
                        long memory = Convert.ToInt64(system["TotalPhysicalMemory"]);
                        double memoryGB = Math.Round(memory / 1073741824.0, 2);
                        return $"{memoryGB} GB";
                    }
                }
            }
            catch
            {
                return "Unknown";
            }
            return "Unknown";
        }

        private string GetCPUInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT Name FROM Win32_Processor"))
                {
                    foreach (var cpu in searcher.Get())
                    {
                        return cpu["Name"].ToString().Trim();
                    }
                }
            }
            catch
            {
                return "Unknown CPU";
            }
            return "Unknown CPU";
        }

        private void LogMessage(string message)
        {
            try
            {
                string logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");
                Directory.CreateDirectory(logPath);
                
                string logFile = Path.Combine(logPath, $"cmdb-agent-{DateTime.Now:yyyy-MM-dd}.log");
                string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}{Environment.NewLine}";
                
                File.AppendAllText(logFile, logEntry);
            }
            catch
            {
                // Fail silently if logging fails
            }
        }

        // Entry point for the service
        static void Main()
        {
            ServiceBase.Run(new CMDBAgentService());
        }
    }
}
