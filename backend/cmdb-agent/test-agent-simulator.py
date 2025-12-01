#!/usr/bin/env python3
"""
CMDB Agent Simulator - Test heartbeat functionality
Simulates a Windows agent sending heartbeats to the server
"""

import json
import urllib.request
import time
import socket
import platform
import sys

SERVER_URL = "http://192.168.1.9:3001"
HEARTBEAT_INTERVAL = 10  # seconds (faster for testing)

def get_system_info():
    """Collect system information"""
    hostname = socket.gethostname()
    
    # Get proper OS name (Ubuntu instead of just Linux kernel)
    try:
        with open('/etc/os-release', 'r') as f:
            os_release = dict(line.strip().split('=', 1) for line in f if '=' in line)
            os_name = os_release.get('PRETTY_NAME', '').strip('"')
            if not os_name:
                os_name = os_release.get('NAME', '').strip('"')
            os_info = os_name or f"{platform.system()} {platform.release()}"
    except:
        os_info = f"{platform.system()} {platform.release()}"
    
    # Get IP address
    try:
        # Connect to external address to get the correct network interface IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
        s.close()
    except:
        ip_address = "Unknown"
    
    # Get MAC address
    try:
        import subprocess
        result = subprocess.check_output(['ip', 'link', 'show'], universal_newlines=True)
        # Find the first non-loopback MAC address
        for line in result.split('\n'):
            if 'link/ether' in line:
                mac_address = line.split()[1]
                break
        else:
            mac_address = "Unknown"
    except:
        mac_address = "Unknown"
    
    # Get memory info
    try:
        with open('/proc/meminfo', 'r') as f:
            mem_total = int([line for line in f.readlines() if 'MemTotal' in line][0].split()[1])
            memory = f"{round(mem_total / 1024 / 1024, 2)} GB"
    except:
        memory = "Unknown"
    
    # Get CPU info
    try:
        with open('/proc/cpuinfo', 'r') as f:
            cpu = [line for line in f.readlines() if 'model name' in line][0].split(':')[1].strip()
    except:
        cpu = platform.processor() or "Unknown CPU"
    
    return {
        "hostname": hostname,
        "os": os_info,
        "ipAddress": ip_address,
        "macAddress": mac_address,
        "memory": memory,
        "cpu": cpu,
        "domain": "WORKGROUP",
        "version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

def send_heartbeat():
    """Send heartbeat to CMDB server"""
    try:
        system_info = get_system_info()
        
        # Prepare request
        data = json.dumps(system_info).encode('utf-8')
        req = urllib.request.Request(
            f"{SERVER_URL}/api/agents/heartbeat",
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Send request
        response = urllib.request.urlopen(req, timeout=5)
        result = json.loads(response.read().decode('utf-8'))
        
        print(f"✅ [{time.strftime('%H:%M:%S')}] Heartbeat sent successfully")
        print(f"   Agent: {system_info['hostname']}")
        print(f"   Status: {result['agent']['status']}")
        return True
        
    except urllib.error.HTTPError as e:
        print(f"❌ [{time.strftime('%H:%M:%S')}] HTTP Error: {e.code} - {e.reason}")
        return False
    except urllib.error.URLError as e:
        print(f"❌ [{time.strftime('%H:%M:%S')}] Network Error: {e.reason}")
        return False
    except Exception as e:
        print(f"❌ [{time.strftime('%H:%M:%S')}] Error: {str(e)}")
        return False

def main():
    """Main loop"""
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                                                          ║")
    print("║        CMDB Agent Simulator - Testing Mode              ║")
    print("║                                                          ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    print(f"Server: {SERVER_URL}")
    print(f"Heartbeat Interval: {HEARTBEAT_INTERVAL} seconds")
    print(f"Hostname: {socket.gethostname()}")
    print()
    print("Press Ctrl+C to stop")
    print("─" * 60)
    print()
    
    # Send initial heartbeat
    send_heartbeat()
    print()
    
    # Main loop
    try:
        while True:
            time.sleep(HEARTBEAT_INTERVAL)
            send_heartbeat()
            print()
    except KeyboardInterrupt:
        print()
        print("─" * 60)
        print("Agent simulator stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main()
