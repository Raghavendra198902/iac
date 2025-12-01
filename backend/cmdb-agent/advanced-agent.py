#!/usr/bin/env python3
"""
CMDB Advanced Agent - Enterprise Edition
Full-featured monitoring agent with advanced capabilities
"""

import json
import urllib.request
import urllib.error
import time
import socket
import platform
import sys
import os
import re
import subprocess
import hashlib
import threading
from datetime import datetime
from collections import deque

# Configuration
SERVER_URL = os.getenv("CMDB_SERVER_URL", "http://192.168.1.9:3000")
HEARTBEAT_INTERVAL = int(os.getenv("CMDB_HEARTBEAT_INTERVAL", "60"))  # seconds
AGENT_ID = os.getenv("CMDB_AGENT_ID", socket.gethostname().lower())
METRICS_HISTORY_SIZE = 100

class AdvancedAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.server_url = SERVER_URL
        self.heartbeat_interval = HEARTBEAT_INTERVAL
        self.version = "3.0.0"
        self.running = True
        self.consecutive_failures = 0
        self.max_failures = 5
        
        # Metrics history for trend analysis
        self.cpu_history = deque(maxlen=METRICS_HISTORY_SIZE)
        self.memory_history = deque(maxlen=METRICS_HISTORY_SIZE)
        self.disk_history = deque(maxlen=METRICS_HISTORY_SIZE)
        self.network_history = deque(maxlen=METRICS_HISTORY_SIZE)
        
        # Cache for less frequently changing data
        self.static_info_cache = None
        self.static_info_timestamp = 0
        self.static_info_ttl = 300  # 5 minutes
        
        # Hardware/Software inventory cache
        self.hardware_cache = None
        self.hardware_cache_timestamp = 0
        self.hardware_cache_ttl = 3600  # 1 hour
        
        self.software_cache = None
        self.software_cache_timestamp = 0
        self.software_cache_ttl = 1800  # 30 minutes
        
        print(f"[{self.get_timestamp()}] Advanced CMDB Agent v{self.version} initialized")
        print(f"[{self.get_timestamp()}] Agent ID: {self.agent_id}")
        print(f"[{self.get_timestamp()}] Server: {self.server_url}")
        print(f"[{self.get_timestamp()}] Heartbeat Interval: {self.heartbeat_interval}s")
    
    def get_timestamp(self):
        """Get formatted timestamp"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_uptime(self):
        """Get system uptime"""
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.readline().split()[0])
                days = int(uptime_seconds // 86400)
                hours = int((uptime_seconds % 86400) // 3600)
                minutes = int((uptime_seconds % 3600) // 60)
                return f"{days}d {hours}h {minutes}m"
        except:
            return "Unknown"
    
    def get_cpu_usage(self):
        """Get current CPU usage percentage"""
        try:
            # Read /proc/stat twice with small delay
            def get_cpu_times():
                with open('/proc/stat', 'r') as f:
                    line = f.readline()
                    times = [int(x) for x in line.split()[1:]]
                    return times
            
            times1 = get_cpu_times()
            time.sleep(0.1)
            times2 = get_cpu_times()
            
            # Calculate difference
            deltas = [t2 - t1 for t1, t2 in zip(times1, times2)]
            total_delta = sum(deltas)
            idle_delta = deltas[3]  # idle is 4th value
            
            if total_delta > 0:
                usage = 100.0 * (1.0 - idle_delta / total_delta)
                self.cpu_history.append(usage)
                return round(usage, 2)
        except:
            pass
        return 0.0
    
    def get_memory_usage(self):
        """Get detailed memory usage"""
        try:
            mem_info = {}
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    parts = line.split(':')
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = int(parts[1].strip().split()[0])
                        mem_info[key] = value
            
            total = mem_info.get('MemTotal', 0)
            available = mem_info.get('MemAvailable', mem_info.get('MemFree', 0))
            used = total - available
            used_percent = (used / total * 100) if total > 0 else 0
            
            self.memory_history.append(used_percent)
            
            return {
                "total": f"{round(total / 1024 / 1024, 2)} GB",
                "used": f"{round(used / 1024 / 1024, 2)} GB",
                "available": f"{round(available / 1024 / 1024, 2)} GB",
                "usedPercent": round(used_percent, 2)
            }
        except:
            return {"total": "Unknown", "used": "Unknown", "available": "Unknown", "usedPercent": 0}
    
    def get_disk_usage(self):
        """Get disk usage for all mounted filesystems"""
        try:
            result = subprocess.check_output(['df', '-h', '--output=source,fstype,size,used,avail,pcent,target'], 
                                            universal_newlines=True)
            lines = result.strip().split('\n')[1:]  # Skip header
            
            disks = []
            for line in lines:
                parts = line.split()
                if len(parts) >= 7 and not parts[0].startswith('tmpfs'):
                    disk = {
                        "device": parts[0],
                        "fstype": parts[1],
                        "size": parts[2],
                        "used": parts[3],
                        "available": parts[4],
                        "usedPercent": parts[5],
                        "mountPoint": ' '.join(parts[6:])
                    }
                    disks.append(disk)
                    
                    # Track root filesystem usage
                    if disk["mountPoint"] == "/":
                        try:
                            percent = float(disk["usedPercent"].rstrip('%'))
                            self.disk_history.append(percent)
                        except:
                            pass
            
            return disks
        except:
            return []
    
    def get_network_interfaces(self):
        """Get network interface information"""
        try:
            result = subprocess.check_output(['ip', '-br', 'addr'], universal_newlines=True)
            interfaces = []
            
            for line in result.strip().split('\n'):
                parts = line.split()
                if len(parts) >= 3 and parts[0] != 'lo':
                    interface = {
                        "name": parts[0],
                        "state": parts[1],
                        "addresses": parts[2:] if len(parts) > 2 else []
                    }
                    interfaces.append(interface)
            
            return interfaces
        except:
            return []
    
    def get_network_stats(self):
        """Get network traffic statistics"""
        try:
            with open('/proc/net/dev', 'r') as f:
                lines = f.readlines()[2:]  # Skip headers
            
            stats = {}
            total_rx = 0
            total_tx = 0
            
            for line in lines:
                parts = line.split(':')
                if len(parts) == 2:
                    interface = parts[0].strip()
                    if interface != 'lo':  # Skip loopback
                        values = parts[1].split()
                        rx_bytes = int(values[0])
                        tx_bytes = int(values[8])
                        total_rx += rx_bytes
                        total_tx += tx_bytes
            
            # Convert to human readable
            def bytes_to_human(bytes_val):
                for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                    if bytes_val < 1024.0:
                        return f"{bytes_val:.2f} {unit}"
                    bytes_val /= 1024.0
                return f"{bytes_val:.2f} PB"
            
            return {
                "totalReceived": bytes_to_human(total_rx),
                "totalTransmitted": bytes_to_human(total_tx)
            }
        except:
            return {"totalReceived": "Unknown", "totalTransmitted": "Unknown"}
    
    def get_running_processes(self):
        """Get count of running processes"""
        try:
            result = subprocess.check_output(['ps', 'aux'], universal_newlines=True)
            return len(result.strip().split('\n')) - 1  # Exclude header
        except:
            return 0
    
    def get_load_average(self):
        """Get system load average"""
        try:
            with open('/proc/loadavg', 'r') as f:
                loads = f.readline().split()[:3]
                return {
                    "1min": float(loads[0]),
                    "5min": float(loads[1]),
                    "15min": float(loads[2])
                }
        except:
            return {"1min": 0.0, "5min": 0.0, "15min": 0.0}
    
    def get_logged_in_users(self):
        """Get currently logged in users"""
        try:
            result = subprocess.check_output(['who'], universal_newlines=True)
            users = []
            for line in result.strip().split('\n'):
                if line:
                    parts = line.split()
                    if len(parts) >= 2:
                        users.append({
                            "username": parts[0],
                            "terminal": parts[1],
                            "loginTime": ' '.join(parts[2:4]) if len(parts) >= 4 else "Unknown"
                        })
            return users
        except:
            return []
    
    def get_installed_packages(self):
        """Get count of installed packages"""
        try:
            # Try dpkg (Debian/Ubuntu)
            result = subprocess.check_output(['dpkg', '-l'], stderr=subprocess.DEVNULL, universal_newlines=True)
            return len([line for line in result.split('\n') if line.startswith('ii')])
        except:
            try:
                # Try rpm (RHEL/CentOS)
                result = subprocess.check_output(['rpm', '-qa'], stderr=subprocess.DEVNULL, universal_newlines=True)
                return len(result.strip().split('\n'))
            except:
                return 0
    
    def get_security_updates(self):
        """Check for available security updates"""
        try:
            result = subprocess.check_output(['apt-get', '-s', 'upgrade'], 
                                           stderr=subprocess.DEVNULL, 
                                           universal_newlines=True)
            security_count = len([line for line in result.split('\n') 
                                if 'security' in line.lower()])
            return security_count
        except:
            return 0
    
    def get_hardware_inventory(self):
        """Get comprehensive hardware inventory (cached)"""
        current_time = time.time()
        
        if (self.hardware_cache is not None and 
            current_time - self.hardware_cache_timestamp < self.hardware_cache_ttl):
            return self.hardware_cache
        
        hardware = {}
        
        # CPU Details
        try:
            cpu_info = {}
            with open('/proc/cpuinfo', 'r') as f:
                lines = f.readlines()
                cpu_info['model'] = [line.split(':')[1].strip() for line in lines if 'model name' in line][0]
                cpu_info['cores'] = len([line for line in lines if 'processor' in line])
                cpu_info['vendor'] = [line.split(':')[1].strip() for line in lines if 'vendor_id' in line][0] if any('vendor_id' in line for line in lines) else "Unknown"
                
                # Get CPU frequency
                try:
                    cpu_info['frequency'] = [line.split(':')[1].strip() for line in lines if 'cpu MHz' in line][0] + " MHz"
                except:
                    cpu_info['frequency'] = "Unknown"
                    
                # Get cache size
                try:
                    cpu_info['cache'] = [line.split(':')[1].strip() for line in lines if 'cache size' in line][0]
                except:
                    cpu_info['cache'] = "Unknown"
            
            hardware['cpu'] = cpu_info
        except:
            hardware['cpu'] = {"model": "Unknown", "cores": 0, "vendor": "Unknown"}
        
        # Memory Details
        try:
            mem_info = {}
            with open('/proc/meminfo', 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if 'MemTotal' in line:
                        mem_info['total_kb'] = int(line.split()[1])
                        mem_info['total'] = f"{round(mem_info['total_kb'] / 1024 / 1024, 2)} GB"
                    elif 'SwapTotal' in line:
                        swap_kb = int(line.split()[1])
                        mem_info['swap'] = f"{round(swap_kb / 1024 / 1024, 2)} GB"
            
            # Get memory type and speed from dmidecode if available (skip if no sudo)
            try:
                result = subprocess.check_output(['sudo', '-n', 'dmidecode', '-t', 'memory'], 
                                                stderr=subprocess.DEVNULL, 
                                                universal_newlines=True,
                                                timeout=5)
                if 'Type:' in result:
                    types = [line.split(':')[1].strip() for line in result.split('\n') if line.strip().startswith('Type:') and 'Type Detail' not in line]
                    if types:
                        mem_info['type'] = types[0]
                if 'Speed:' in result:
                    speeds = [line.split(':')[1].strip() for line in result.split('\n') if line.strip().startswith('Speed:') and 'Unknown' not in line and 'Configured' not in line]
                    if speeds:
                        mem_info['speed'] = speeds[0]
            except:
                pass
                
            hardware['memory'] = mem_info
        except:
            hardware['memory'] = {"total": "Unknown"}
        
        # Disk/Storage Details
        try:
            disks = []
            # Get all block devices
            result = subprocess.check_output(['lsblk', '-d', '-o', 'NAME,SIZE,TYPE,MODEL', '-n'], 
                                            universal_newlines=True)
            for line in result.strip().split('\n'):
                parts = line.split()
                if len(parts) >= 3 and parts[2] == 'disk':
                    disk = {
                        "device": f"/dev/{parts[0]}",
                        "size": parts[1],
                        "model": ' '.join(parts[3:]) if len(parts) > 3 else "Unknown"
                    }
                    
                    # Get disk type (SSD/HDD)
                    try:
                        rotational = open(f"/sys/block/{parts[0]}/queue/rotational").read().strip()
                        disk['type'] = "HDD" if rotational == "1" else "SSD"
                    except:
                        disk['type'] = "Unknown"
                    
                    disks.append(disk)
            
            hardware['disks'] = disks
        except:
            hardware['disks'] = []
        
        # Network Hardware
        try:
            network_devices = []
            result = subprocess.check_output(['ip', 'link', 'show'], universal_newlines=True)
            
            for line in result.split('\n'):
                if ': ' in line and not line.strip().startswith('link/'):
                    parts = line.split(': ')
                    if len(parts) >= 2:
                        dev_name = parts[1].split(':')[0].split('@')[0]
                        if dev_name != 'lo':
                            device = {"name": dev_name}
                            
                            # Get MAC address
                            try:
                                mac_line = [l for l in result.split('\n') if 'link/ether' in l and dev_name in result[result.find(dev_name):result.find(dev_name)+200]][0]
                                device['mac'] = mac_line.split()[1]
                            except:
                                device['mac'] = "Unknown"
                            
                            # Get driver info
                            try:
                                driver = subprocess.check_output(['ethtool', '-i', dev_name], 
                                                                stderr=subprocess.DEVNULL,
                                                                universal_newlines=True)
                                for line in driver.split('\n'):
                                    if line.startswith('driver:'):
                                        device['driver'] = line.split(':')[1].strip()
                                    elif line.startswith('version:'):
                                        device['driver_version'] = line.split(':')[1].strip()
                            except:
                                pass
                            
                            network_devices.append(device)
            
            hardware['network'] = network_devices
        except:
            hardware['network'] = []
        
        # Graphics/GPU
        try:
            gpus = []
            result = subprocess.check_output(['lspci'], universal_newlines=True)
            for line in result.split('\n'):
                if 'VGA' in line or 'Display' in line or '3D' in line:
                    # Extract GPU info
                    parts = line.split(': ')
                    if len(parts) >= 2:
                        gpus.append(parts[1].strip())
            
            hardware['gpu'] = gpus
        except:
            hardware['gpu'] = []
        
        # USB Devices
        try:
            usb_devices = []
            result = subprocess.check_output(['lsusb'], universal_newlines=True)
            for line in result.strip().split('\n'):
                if 'Bus' in line:
                    # Extract device info
                    parts = line.split('ID ')
                    if len(parts) >= 2:
                        device_info = parts[1].split(' ', 1)
                        if len(device_info) >= 2:
                            usb_devices.append({
                                "id": device_info[0],
                                "name": device_info[1]
                            })
            
            hardware['usb_devices'] = usb_devices[:10]  # Limit to 10 devices
        except:
            hardware['usb_devices'] = []
        
        # Motherboard/BIOS Info (skip if no sudo)
        try:
            system_info = {}
            result = subprocess.check_output(['sudo', '-n', 'dmidecode', '-t', 'system'], 
                                            stderr=subprocess.DEVNULL,
                                            universal_newlines=True,
                                            timeout=5)
            for line in result.split('\n'):
                if 'Manufacturer:' in line:
                    system_info['manufacturer'] = line.split(':')[1].strip()
                elif 'Product Name:' in line:
                    system_info['model'] = line.split(':')[1].strip()
                elif 'Serial Number:' in line:
                    serial = line.split(':')[1].strip()
                    if serial and serial != "Not Specified":
                        system_info['serial'] = serial
            
            hardware['system'] = system_info
        except:
            hardware['system'] = {}
        
        self.hardware_cache = hardware
        self.hardware_cache_timestamp = current_time
        
        return hardware
    
    def get_software_inventory(self):
        """Get comprehensive software inventory (cached)"""
        current_time = time.time()
        
        if (self.software_cache is not None and 
            current_time - self.software_cache_timestamp < self.software_cache_ttl):
            return self.software_cache
        
        software = {}
        
        # Operating System Details
        try:
            os_info = {}
            with open('/etc/os-release', 'r') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        os_info[key.lower()] = value.strip('"')
            
            software['os'] = {
                "name": os_info.get('pretty_name', 'Unknown'),
                "version": os_info.get('version_id', 'Unknown'),
                "id": os_info.get('id', 'Unknown'),
                "codename": os_info.get('version_codename', 'Unknown')
            }
        except:
            software['os'] = {"name": platform.system(), "version": platform.release()}
        
        # Kernel
        software['kernel'] = {
            "version": platform.release(),
            "architecture": platform.machine()
        }
        
        # Installed Packages (summary)
        try:
            # Try dpkg
            result = subprocess.check_output(['dpkg', '-l'], 
                                            stderr=subprocess.DEVNULL, 
                                            universal_newlines=True)
            packages = [line for line in result.split('\n') if line.startswith('ii')]
            software['package_manager'] = 'dpkg'
            software['total_packages'] = len(packages)
            
            # Get recent packages (installed in last 30 days)
            try:
                recent = subprocess.check_output(['grep', 'install', '/var/log/dpkg.log'], 
                                                stderr=subprocess.DEVNULL,
                                                universal_newlines=True)
                software['recent_installs'] = len(recent.strip().split('\n'))
            except:
                software['recent_installs'] = 0
                
        except:
            try:
                # Try rpm
                result = subprocess.check_output(['rpm', '-qa'], 
                                                stderr=subprocess.DEVNULL,
                                                universal_newlines=True)
                software['package_manager'] = 'rpm'
                software['total_packages'] = len(result.strip().split('\n'))
            except:
                software['package_manager'] = 'unknown'
                software['total_packages'] = 0
        
        # Running Services
        try:
            result = subprocess.check_output(['systemctl', 'list-units', '--type=service', '--state=running', '--no-pager'], 
                                            universal_newlines=True)
            services = [line for line in result.split('\n') if '.service' in line and 'loaded active running' in line]
            software['running_services'] = len(services)
            
            # List key services
            key_services = []
            service_keywords = ['ssh', 'nginx', 'apache', 'mysql', 'postgresql', 'docker', 'redis']
            for service in services:
                service_name = service.split()[0].replace('.service', '')
                if any(keyword in service_name.lower() for keyword in service_keywords):
                    key_services.append(service_name)
            
            software['key_services'] = key_services[:10]
        except:
            software['running_services'] = 0
            software['key_services'] = []
        
        # Python Version
        try:
            software['python'] = {
                "version": platform.python_version(),
                "implementation": platform.python_implementation()
            }
        except:
            software['python'] = {"version": "Unknown"}
        
        # Docker (if installed)
        try:
            result = subprocess.check_output(['docker', '--version'], 
                                            stderr=subprocess.DEVNULL,
                                            universal_newlines=True)
            software['docker'] = result.strip()
            
            # Get running containers
            try:
                containers = subprocess.check_output(['docker', 'ps', '-q'], 
                                                    stderr=subprocess.DEVNULL,
                                                    universal_newlines=True)
                software['docker_containers'] = len(containers.strip().split('\n')) if containers.strip() else 0
            except:
                software['docker_containers'] = 0
        except:
            pass
        
        # Database servers
        databases = []
        db_services = ['mysql', 'postgresql', 'mongodb', 'redis', 'mariadb']
        for db in db_services:
            try:
                subprocess.check_output(['which', db], 
                                      stderr=subprocess.DEVNULL,
                                      universal_newlines=True)
                databases.append(db)
            except:
                pass
        
        if databases:
            software['databases'] = databases
        
        # Web servers
        web_servers = []
        for server in ['nginx', 'apache2', 'httpd']:
            try:
                subprocess.check_output(['which', server], 
                                      stderr=subprocess.DEVNULL,
                                      universal_newlines=True)
                web_servers.append(server)
            except:
                pass
        
        if web_servers:
            software['web_servers'] = web_servers
        
        # Firewall status (skip if no sudo)
        try:
            result = subprocess.check_output(['sudo', '-n', 'ufw', 'status'], 
                                            stderr=subprocess.DEVNULL,
                                            universal_newlines=True,
                                            timeout=5)
            software['firewall'] = 'active' if 'Status: active' in result else 'inactive'
        except:
            try:
                result = subprocess.check_output(['sudo', '-n', 'firewall-cmd', '--state'], 
                                                stderr=subprocess.DEVNULL,
                                                universal_newlines=True,
                                                timeout=5)
                software['firewall'] = result.strip()
            except:
                software['firewall'] = 'unknown'
        
        # Patch Status and Security Updates
        patch_status = self.get_patch_status()
        software['patch_status'] = patch_status
        
        self.software_cache = software
        self.software_cache_timestamp = current_time
        
        return software
    
    def get_patch_status(self):
        """Get comprehensive patch and security update status"""
        patch_info = {
            "last_update_check": time.strftime("%Y-%m-%d %H:%M:%S"),
            "updates_available": 0,
            "security_updates": 0,
            "critical_updates": 0,
            "update_details": [],
            "patch_level": "unknown",
            "reboot_required": False
        }
        
        try:
            # Check if system uses apt (Debian/Ubuntu)
            if os.path.exists('/usr/bin/apt-get'):
                patch_info['package_manager'] = 'apt'
                
                # Update package cache (simulation mode - doesn't actually update)
                try:
                    result = subprocess.check_output(
                        ['apt-get', '-s', 'upgrade'], 
                        stderr=subprocess.DEVNULL,
                        universal_newlines=True,
                        timeout=30
                    )
                    
                    # Count total updates
                    lines = result.split('\n')
                    for line in lines:
                        if 'newly installed' in line.lower() or 'upgraded' in line.lower():
                            # Extract numbers from lines like "123 upgraded, 5 newly installed"
                            import re
                            numbers = re.findall(r'(\d+)\s+upgraded', line)
                            if numbers:
                                patch_info['updates_available'] = int(numbers[0])
                    
                    # Count security updates
                    security_count = len([line for line in lines if 'security' in line.lower()])
                    patch_info['security_updates'] = security_count
                    
                    # Get specific security updates
                    security_packages = []
                    for line in lines:
                        if 'Inst' in line and 'security' in line.lower():
                            parts = line.split()
                            if len(parts) >= 2:
                                pkg_name = parts[1]
                                security_packages.append(pkg_name)
                    
                    patch_info['security_packages'] = security_packages[:20]  # Limit to 20
                    
                except subprocess.TimeoutExpired:
                    patch_info['status'] = 'timeout'
                except:
                    pass
                
                # Check for available dist-upgrade
                try:
                    result = subprocess.check_output(
                        ['apt-get', '-s', 'dist-upgrade'],
                        stderr=subprocess.DEVNULL,
                        universal_newlines=True,
                        timeout=30
                    )
                    
                    import re
                    numbers = re.findall(r'(\d+)\s+upgraded', result)
                    if numbers and int(numbers[0]) > patch_info['updates_available']:
                        patch_info['dist_upgrade_available'] = int(numbers[0])
                except:
                    pass
                
                # Check if reboot is required
                if os.path.exists('/var/run/reboot-required'):
                    patch_info['reboot_required'] = True
                    try:
                        with open('/var/run/reboot-required.pkgs', 'r') as f:
                            patch_info['reboot_packages'] = [line.strip() for line in f.readlines()[:10]]
                    except:
                        pass
                
                # Get last update time
                try:
                    stat_info = os.stat('/var/lib/apt/periodic/update-success-stamp')
                    last_update = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat_info.st_mtime))
                    patch_info['last_successful_update'] = last_update
                except:
                    pass
                
                # Determine patch level
                if patch_info['security_updates'] == 0 and patch_info['updates_available'] == 0:
                    patch_info['patch_level'] = 'up_to_date'
                elif patch_info['security_updates'] > 0:
                    patch_info['patch_level'] = 'security_updates_available'
                elif patch_info['updates_available'] > 10:
                    patch_info['patch_level'] = 'multiple_updates_available'
                else:
                    patch_info['patch_level'] = 'minor_updates_available'
            
            # Check if system uses yum/dnf (RHEL/CentOS/Fedora)
            elif os.path.exists('/usr/bin/yum') or os.path.exists('/usr/bin/dnf'):
                cmd = 'dnf' if os.path.exists('/usr/bin/dnf') else 'yum'
                patch_info['package_manager'] = cmd
                
                try:
                    result = subprocess.check_output(
                        [cmd, 'check-update'],
                        stderr=subprocess.DEVNULL,
                        universal_newlines=True,
                        timeout=30
                    )
                    
                    # Count available updates (each line is a package)
                    lines = [line for line in result.split('\n') if line.strip() and not line.startswith(' ')]
                    patch_info['updates_available'] = len(lines) - 1  # Subtract header
                    
                    # Check for security updates
                    result = subprocess.check_output(
                        [cmd, 'updateinfo', 'list', 'security'],
                        stderr=subprocess.DEVNULL,
                        universal_newlines=True,
                        timeout=30
                    )
                    security_updates = [line for line in result.split('\n') if line.strip()]
                    patch_info['security_updates'] = len(security_updates)
                    
                except subprocess.CalledProcessError as e:
                    # Exit code 100 means updates are available
                    if e.returncode == 100:
                        lines = [line for line in e.output.split('\n') if line.strip()]
                        patch_info['updates_available'] = max(0, len(lines) - 5)
                except:
                    pass
                
                # Check if reboot is required
                try:
                    result = subprocess.check_output(
                        ['needs-restarting', '-r'],
                        stderr=subprocess.DEVNULL,
                        universal_newlines=True
                    )
                    patch_info['reboot_required'] = 'reboot is required' in result.lower()
                except:
                    pass
        
        except Exception as e:
            patch_info['error'] = str(e)
        
        # Calculate critical updates (heuristic: security updates on critical packages)
        critical_packages = ['kernel', 'openssl', 'glibc', 'systemd', 'openssh', 'sudo', 'bash']
        if 'security_packages' in patch_info:
            critical_count = sum(1 for pkg in patch_info.get('security_packages', []) 
                               if any(crit in pkg.lower() for crit in critical_packages))
            patch_info['critical_updates'] = critical_count
        
        return patch_info
    
    def get_static_info(self):
        """Get static system information (cached)"""
        current_time = time.time()
        
        if (self.static_info_cache is not None and 
            current_time - self.static_info_timestamp < self.static_info_ttl):
            return self.static_info_cache
        
        # Get hostname
        hostname = socket.gethostname()
        
        # Get OS information
        try:
            with open('/etc/os-release', 'r') as f:
                os_release = dict(line.strip().split('=', 1) for line in f if '=' in line)
                os_name = os_release.get('PRETTY_NAME', '').strip('"')
                os_version = os_release.get('VERSION_ID', '').strip('"')
                os_id = os_release.get('ID', '').strip('"')
        except:
            os_name = f"{platform.system()} {platform.release()}"
            os_version = platform.release()
            os_id = platform.system().lower()
        
        # Get all IP addresses from all interfaces
        ip_addresses = []
        primary_ip = "Unknown"
        try:
            # Get primary IP (default route)
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            primary_ip = s.getsockname()[0]
            s.close()
        except:
            pass
        
        try:
            # Get all IP addresses from all interfaces
            result = subprocess.check_output(['ip', '-4', 'addr', 'show'], universal_newlines=True)
            for line in result.split('\n'):
                if 'inet ' in line and 'scope global' in line:
                    ip = line.strip().split()[1].split('/')[0]
                    if ip not in ip_addresses:
                        ip_addresses.append(ip)
            
            # If no IPs found, try alternative method
            if not ip_addresses:
                result = subprocess.check_output(['hostname', '-I'], universal_newlines=True)
                ip_addresses = [ip.strip() for ip in result.strip().split() if ip.strip()]
        except:
            pass
        
        # If we have primary IP but it's not in the list, add it
        if primary_ip != "Unknown" and primary_ip not in ip_addresses:
            ip_addresses.insert(0, primary_ip)
        
        # Fallback to primary IP if no IPs found
        if not ip_addresses:
            ip_addresses = [primary_ip] if primary_ip != "Unknown" else ["Unknown"]
        
        # Get MAC address of primary interface
        mac_address = "Unknown"
        mac_addresses = []
        try:
            result = subprocess.check_output(['ip', 'link', 'show'], universal_newlines=True)
            current_interface = None
            for line in result.split('\n'):
                if ': ' in line and not line.startswith(' '):
                    # Extract interface name
                    parts = line.split(': ')
                    if len(parts) >= 2:
                        current_interface = parts[1].split(':')[0].split('@')[0]
                elif 'link/ether' in line and current_interface and current_interface != 'lo':
                    mac = line.split()[1]
                    if mac_address == "Unknown":
                        mac_address = mac  # First MAC becomes primary
                    if mac not in mac_addresses:
                        mac_addresses.append(mac)
        except:
            pass
        
        # Get CPU info
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpu = [line for line in f.readlines() if 'model name' in line][0].split(':')[1].strip()
                cpu_count = len([line for line in open('/proc/cpuinfo').readlines() if 'processor' in line])
        except:
            cpu = platform.processor() or "Unknown CPU"
            cpu_count = os.cpu_count() or 1
        
        # Get kernel version
        kernel_version = platform.release()
        
        # Get architecture
        architecture = platform.machine()
        
        info = {
            "hostname": hostname,
            "os": os_name,
            "osVersion": os_version,
            "osId": os_id,
            "kernel": kernel_version,
            "architecture": architecture,
            "ipAddress": ip_addresses[0] if ip_addresses else "Unknown",  # Primary IP
            "ipAddresses": ip_addresses,  # All IP addresses
            "macAddress": mac_address,  # Primary MAC
            "macAddresses": mac_addresses if mac_addresses else [mac_address],  # All MAC addresses
            "cpu": cpu,
            "cpuCores": cpu_count,
            "domain": "WORKGROUP"
        }
        
        self.static_info_cache = info
        self.static_info_timestamp = current_time
        
        return info
    
    def get_metrics_trends(self):
        """Calculate metrics trends"""
        def calc_trend(history):
            if len(history) < 2:
                return "stable"
            recent = sum(list(history)[-10:]) / min(10, len(history))
            older = sum(list(history)[-30:-10]) / max(1, len(history) - 10)
            if recent > older * 1.1:
                return "increasing"
            elif recent < older * 0.9:
                return "decreasing"
            return "stable"
        
        return {
            "cpu": calc_trend(self.cpu_history),
            "memory": calc_trend(self.memory_history),
            "disk": calc_trend(self.disk_history)
        }
    
    def collect_system_data(self):
        """Collect all system data"""
        static_info = self.get_static_info()
        memory_usage = self.get_memory_usage()
        cpu_usage = self.get_cpu_usage()
        
        data = {
            # Identity
            "agentId": self.agent_id,
            "agentVersion": self.version,
            "timestamp": self.get_timestamp(),
            
            # Static info
            **static_info,
            
            # Dynamic metrics
            "uptime": self.get_uptime(),
            "cpuUsage": cpu_usage,
            "memory": memory_usage["total"],
            "memoryUsage": memory_usage,
            "diskUsage": self.get_disk_usage(),
            "loadAverage": self.get_load_average(),
            "runningProcesses": self.get_running_processes(),
            "installedPackages": self.get_installed_packages(),
            "securityUpdates": self.get_security_updates(),
            
            # Network
            "networkInterfaces": self.get_network_interfaces(),
            "networkStats": self.get_network_stats(),
            
            # Users
            "loggedInUsers": self.get_logged_in_users(),
            
            # Trends
            "metricsTrends": self.get_metrics_trends(),
            
            # Hardware & Software Inventory (v3.0.0)
            "hardwareInventory": self.get_hardware_inventory(),
            "softwareInventory": self.get_software_inventory(),
            
            # Status
            "status": "online"
        }
        
        return data
    
    def send_heartbeat(self):
        """Send heartbeat to CMDB server"""
        try:
            system_data = self.collect_system_data()
            
            # Prepare request
            json_data = json.dumps(system_data).encode('utf-8')
            req = urllib.request.Request(
                f"{self.server_url}/api/agents/heartbeat",
                data=json_data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            # Send request
            response = urllib.request.urlopen(req, timeout=10)
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('success'):
                self.consecutive_failures = 0
                print(f"[{self.get_timestamp()}] ✅ Heartbeat sent successfully")
                print(f"[{self.get_timestamp()}]    CPU: {system_data['cpuUsage']}% | "
                      f"Memory: {system_data['memoryUsage']['usedPercent']}% | "
                      f"Uptime: {system_data['uptime']}")
                return True
            else:
                print(f"[{self.get_timestamp()}] ⚠️  Heartbeat failed: {result.get('message', 'Unknown error')}")
                self.consecutive_failures += 1
                return False
                
        except urllib.error.URLError as e:
            self.consecutive_failures += 1
            print(f"[{self.get_timestamp()}] ❌ Connection error: {e.reason}")
            return False
        except Exception as e:
            self.consecutive_failures += 1
            print(f"[{self.get_timestamp()}] ❌ Error: {str(e)}")
            return False
    
    def check_health(self):
        """Check agent health"""
        if self.consecutive_failures >= self.max_failures:
            print(f"[{self.get_timestamp()}] ⚠️  WARNING: {self.consecutive_failures} consecutive failures")
            print(f"[{self.get_timestamp()}]    Attempting to reconnect...")
    
    def run(self):
        """Main agent loop"""
        print(f"[{self.get_timestamp()}] 🚀 Starting Advanced CMDB Agent")
        print(f"[{self.get_timestamp()}] Press Ctrl+C to stop\n")
        
        # Send initial heartbeat
        self.send_heartbeat()
        
        try:
            while self.running:
                time.sleep(self.heartbeat_interval)
                self.send_heartbeat()
                self.check_health()
                
        except KeyboardInterrupt:
            print(f"\n[{self.get_timestamp()}] 🛑 Shutdown signal received")
            self.running = False
        except Exception as e:
            print(f"\n[{self.get_timestamp()}] ❌ Fatal error: {str(e)}")
            self.running = False
        finally:
            print(f"[{self.get_timestamp()}] Agent stopped")

def main():
    """Entry point"""
    print("=" * 70)
    print("CMDB Advanced Agent - Enterprise Edition")
    print("=" * 70)
    print()
    
    agent = AdvancedAgent()
    agent.run()

if __name__ == "__main__":
    main()
