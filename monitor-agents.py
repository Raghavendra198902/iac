#!/usr/bin/env python3
"""
CMDB Agent Monitor
Watch for new agents connecting to the CMDB system
"""

import urllib.request
import json
import time
import os
from datetime import datetime

def clear_screen():
    os.system('clear' if os.name != 'nt' else 'cls')

def get_agents():
    try:
        req = urllib.request.Request('http://192.168.1.9:3001/api/agents')
        response = urllib.request.urlopen(req, timeout=5)
        data = json.loads(response.read().decode('utf-8'))
        return data.get('agents', [])
    except Exception as e:
        return None

def display_agents(agents):
    clear_screen()
    print("═" * 80)
    print("📊 CMDB AGENT MONITOR - Real-time Status")
    print("═" * 80)
    print(f"🕐 Last Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📡 Connected Agents: {len(agents) if agents else 0}")
    print("═" * 80)
    print()
    
    if not agents:
        print("⚠️  No agents connected")
        print("   Waiting for agents to register...")
        return
    
    for i, agent in enumerate(agents, 1):
        name = agent.get('agentName', 'Unknown')
        ip = agent.get('ipAddress', 'Unknown')
        os_name = agent.get('platform', 'Unknown')
        cpu = agent.get('cpu', 'Unknown')
        memory = agent.get('memory', 'Unknown')
        mac = agent.get('macAddress', 'Unknown')
        status = agent.get('status', 'unknown')
        
        # Status indicator
        if status == 'online':
            indicator = '🟢'
            status_text = 'ONLINE'
        else:
            indicator = '🔴'
            status_text = 'OFFLINE'
        
        print(f"{indicator} Agent {i}: {name}")
        print(f"   ├─ IP Address: {ip}")
        print(f"   ├─ MAC Address: {mac}")
        print(f"   ├─ Operating System: {os_name}")
        print(f"   ├─ CPU: {cpu[:60]}{'...' if len(cpu) > 60 else ''}")
        print(f"   ├─ Memory: {memory}")
        print(f"   └─ Status: {status_text}")
        print()
    
    print("═" * 80)
    print("💡 Tips:")
    print("   • Windows agent should appear within 1-2 minutes after installation")
    print("   • Press Ctrl+C to stop monitoring")
    print("   • Dashboard: http://192.168.1.9:5173/cmdb")
    print("═" * 80)

def main():
    print("Starting CMDB Agent Monitor...")
    print("Monitoring for new agent connections...")
    print()
    
    known_agents = set()
    
    try:
        while True:
            agents = get_agents()
            
            if agents is not None:
                # Check for new agents
                current_agents = {agent.get('agentName') for agent in agents}
                new_agents = current_agents - known_agents
                
                if new_agents:
                    # Alert for new agents
                    for new_agent in new_agents:
                        print(f"\n🎉 NEW AGENT CONNECTED: {new_agent}\n")
                        time.sleep(1)
                
                known_agents = current_agents
                display_agents(agents)
            else:
                clear_screen()
                print("❌ Error: Cannot connect to backend API")
                print("   Make sure backend is running at http://192.168.1.9:3001")
            
            time.sleep(5)  # Update every 5 seconds
            
    except KeyboardInterrupt:
        print("\n\n✅ Monitoring stopped")
        print("   Final agent count: {}".format(len(known_agents)))
        print()

if __name__ == '__main__':
    main()
