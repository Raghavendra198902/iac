/**
 * Citadel CMDB - Demo Data Seeder
 * Creates realistic test data for development and demonstration
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface Agent {
  id: string;
  name: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
  healthScore: number;
  lastSeen: Date;
  cpu: number;
  memory: number;
  disk: number;
}

interface ConfigurationItem {
  id: string;
  name: string;
  type: string;
  agentId: string;
  status: string;
  ipAddress?: string;
  manufacturer?: string;
  model?: string;
  osVersion?: string;
  cpuCores?: number;
  totalMemoryGB?: number;
  totalDiskGB?: number;
}

interface NetworkDevice {
  deviceName: string;
  type: string;
  ipAddress: string;
  macAddress: string;
  status: 'active' | 'inactive';
  ports: number;
  connectedDevices: number;
  lastSeen: Date;
}

// Demo Agents
const agents: Agent[] = [
  {
    id: 'agent-001',
    name: 'web-server-prod-01',
    hostname: 'web-prod-01.company.local',
    status: 'online',
    healthScore: 98,
    lastSeen: new Date('2025-11-20T15:02:38Z'),
    cpu: 45,
    memory: 62,
    disk: 38
  },
  {
    id: 'agent-002',
    name: 'api-server-prod-01',
    hostname: 'api-prod-01.company.local',
    status: 'online',
    healthScore: 95,
    lastSeen: new Date('2025-11-20T15:02:23Z'),
    cpu: 68,
    memory: 71,
    disk: 42
  },
  {
    id: 'agent-003',
    name: 'db-server-prod-01',
    hostname: 'db-prod-01.company.local',
    status: 'warning',
    healthScore: 78,
    lastSeen: new Date('2025-11-20T14:47:38Z'),
    cpu: 82,
    memory: 88,
    disk: 75
  }
];

// Configuration Items for each agent
const configurationItems: ConfigurationItem[] = [
  // Web Server CIs
  {
    id: 'ci-001-001',
    name: 'Nginx Web Server',
    type: 'Application',
    agentId: 'agent-001',
    status: 'running',
    manufacturer: 'Nginx Inc.',
    model: 'nginx/1.24.0'
  },
  {
    id: 'ci-001-002',
    name: 'Ubuntu Server',
    type: 'Operating System',
    agentId: 'agent-001',
    status: 'running',
    osVersion: '22.04.3 LTS'
  },
  {
    id: 'ci-001-003',
    name: 'Primary Network Interface',
    type: 'Network',
    agentId: 'agent-001',
    status: 'active',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'ci-001-004',
    name: 'Intel Xeon CPU',
    type: 'Hardware',
    agentId: 'agent-001',
    status: 'healthy',
    manufacturer: 'Intel',
    cpuCores: 8
  },
  {
    id: 'ci-001-005',
    name: 'System Storage',
    type: 'Storage',
    agentId: 'agent-001',
    status: 'healthy',
    totalDiskGB: 500
  },

  // API Server CIs
  {
    id: 'ci-002-001',
    name: 'Node.js Runtime',
    type: 'Application',
    agentId: 'agent-002',
    status: 'running',
    manufacturer: 'OpenJS Foundation',
    model: 'Node.js v20.10.0'
  },
  {
    id: 'ci-002-002',
    name: 'Express API Gateway',
    type: 'Application',
    agentId: 'agent-002',
    status: 'running',
    model: 'Express v4.18.2'
  },
  {
    id: 'ci-002-003',
    name: 'Ubuntu Server',
    type: 'Operating System',
    agentId: 'agent-002',
    status: 'running',
    osVersion: '22.04.3 LTS'
  },
  {
    id: 'ci-002-004',
    name: 'Primary Network Interface',
    type: 'Network',
    agentId: 'agent-002',
    status: 'active',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'ci-002-005',
    name: 'Intel Xeon CPU',
    type: 'Hardware',
    agentId: 'agent-002',
    status: 'healthy',
    manufacturer: 'Intel',
    cpuCores: 16
  },
  {
    id: 'ci-002-006',
    name: 'System Memory',
    type: 'Hardware',
    agentId: 'agent-002',
    status: 'healthy',
    totalMemoryGB: 32
  },
  {
    id: 'ci-002-007',
    name: 'System Storage',
    type: 'Storage',
    agentId: 'agent-002',
    status: 'healthy',
    totalDiskGB: 1000
  },
  {
    id: 'ci-002-008',
    name: 'Redis Cache',
    type: 'Database',
    agentId: 'agent-002',
    status: 'running',
    model: 'Redis v7.2.3'
  },

  // Database Server CIs
  {
    id: 'ci-003-001',
    name: 'PostgreSQL Database',
    type: 'Database',
    agentId: 'agent-003',
    status: 'running',
    manufacturer: 'PostgreSQL Global Development Group',
    model: 'PostgreSQL 15.4'
  },
  {
    id: 'ci-003-002',
    name: 'Ubuntu Server',
    type: 'Operating System',
    agentId: 'agent-003',
    status: 'running',
    osVersion: '22.04.3 LTS'
  },
  {
    id: 'ci-003-003',
    name: 'Primary Network Interface',
    type: 'Network',
    agentId: 'agent-003',
    status: 'active',
    ipAddress: '192.168.1.103'
  }
];

// Network Devices
const networkDevices: NetworkDevice[] = [
  {
    deviceName: 'core-router-01',
    type: 'router',
    ipAddress: '10.0.0.1',
    macAddress: '00:1A:2B:3C:4D:5E',
    status: 'active',
    ports: 48,
    connectedDevices: 32,
    lastSeen: new Date('2025-11-17T15:30:00Z')
  },
  {
    deviceName: 'core-switch-01',
    type: 'switch',
    ipAddress: '10.0.0.2',
    macAddress: '00:1A:2B:3C:4D:5F',
    status: 'active',
    ports: 48,
    connectedDevices: 45,
    lastSeen: new Date('2025-11-20T15:00:00Z')
  },
  {
    deviceName: 'firewall-01',
    type: 'firewall',
    ipAddress: '10.0.0.3',
    macAddress: '00:1A:2B:3C:4D:60',
    status: 'active',
    ports: 8,
    connectedDevices: 8,
    lastSeen: new Date('2025-11-20T14:55:00Z')
  }
];

// DLP Security Events for demo
const securityEvents = [
  {
    ciId: 'agent-001',
    eventType: 'clipboard',
    severity: 'medium',
    timestamp: new Date('2025-11-20T14:30:00Z'),
    eventId: `evt-clipboard-${Date.now()}-001`,
    details: {
      containsSensitive: true,
      sensitivePatterns: ['EMAIL'],
      contentLength: 85,
      hash: 'a3f5c8e9d1b2a6c7e4f8d9a3b5c8e1f4'
    }
  },
  {
    ciId: 'agent-002',
    eventType: 'usb-write',
    severity: 'high',
    timestamp: new Date('2025-11-20T13:45:00Z'),
    eventId: `evt-usb-${Date.now()}-001`,
    details: {
      deviceId: 'E:',
      volumeLabel: 'USB_DRIVE',
      fileSize: 52428800, // 50MB
      fileName: 'customer_database.xlsx'
    }
  },
  {
    ciId: 'agent-003',
    eventType: 'file-access',
    severity: 'low',
    timestamp: new Date('2025-11-20T15:00:00Z'),
    eventId: `evt-file-${Date.now()}-001`,
    details: {
      filePath: '/var/lib/postgresql/data/pg_hba.conf',
      accessType: 'read',
      processName: 'postgres',
      pid: 1234
    }
  },
  {
    ciId: 'agent-002',
    eventType: 'network-exfiltration',
    severity: 'high',
    timestamp: new Date('2025-11-20T12:15:00Z'),
    eventId: `evt-network-${Date.now()}-001`,
    details: {
      processName: 'node',
      pid: 5678,
      remoteAddress: '203.0.113.42',
      remotePort: 22,
      protocol: 'TCP',
      isAnomaly: true
    }
  },
  {
    ciId: 'agent-001',
    eventType: 'clipboard',
    severity: 'high',
    timestamp: new Date('2025-11-20T11:30:00Z'),
    eventId: `evt-clipboard-${Date.now()}-002`,
    details: {
      containsSensitive: true,
      sensitivePatterns: ['API_KEY', 'PASSWORD'],
      contentLength: 256,
      hash: 'b4a6d9f2c3e5a7b8c9d1e2f3a4b5c6d7'
    }
  },
  {
    ciId: 'agent-003',
    eventType: 'usb-write',
    severity: 'medium',
    timestamp: new Date('2025-11-20T10:00:00Z'),
    eventId: `evt-usb-${Date.now()}-002`,
    details: {
      deviceId: 'F:',
      volumeLabel: 'BACKUP_DRIVE',
      fileSize: 10485760, // 10MB
      fileName: 'config_backup.tar.gz'
    }
  }
];

// System metrics for each agent
const agentMetrics = [
  {
    agentId: 'agent-001',
    metrics: [
      { timestamp: new Date('2025-11-20T14:00:00Z'), cpu: 42, memory: 60, disk: 38 },
      { timestamp: new Date('2025-11-20T14:15:00Z'), cpu: 45, memory: 61, disk: 38 },
      { timestamp: new Date('2025-11-20T14:30:00Z'), cpu: 48, memory: 62, disk: 38 },
      { timestamp: new Date('2025-11-20T14:45:00Z'), cpu: 44, memory: 62, disk: 38 },
      { timestamp: new Date('2025-11-20T15:00:00Z'), cpu: 45, memory: 62, disk: 38 }
    ]
  },
  {
    agentId: 'agent-002',
    metrics: [
      { timestamp: new Date('2025-11-20T14:00:00Z'), cpu: 65, memory: 69, disk: 42 },
      { timestamp: new Date('2025-11-20T14:15:00Z'), cpu: 67, memory: 70, disk: 42 },
      { timestamp: new Date('2025-11-20T14:30:00Z'), cpu: 70, memory: 71, disk: 42 },
      { timestamp: new Date('2025-11-20T14:45:00Z'), cpu: 66, memory: 71, disk: 42 },
      { timestamp: new Date('2025-11-20T15:00:00Z'), cpu: 68, memory: 71, disk: 42 }
    ]
  },
  {
    agentId: 'agent-003',
    metrics: [
      { timestamp: new Date('2025-11-20T14:00:00Z'), cpu: 78, memory: 85, disk: 73 },
      { timestamp: new Date('2025-11-20T14:15:00Z'), cpu: 80, memory: 86, disk: 74 },
      { timestamp: new Date('2025-11-20T14:30:00Z'), cpu: 85, memory: 88, disk: 75 },
      { timestamp: new Date('2025-11-20T14:45:00Z'), cpu: 82, memory: 88, disk: 75 },
      { timestamp: new Date('2025-11-20T15:00:00Z'), cpu: 82, memory: 88, disk: 75 }
    ]
  }
];

async function seedData() {
  console.log('🌱 Starting demo data seeding...\n');

  try {
    // 1. Register Agents
    console.log('📡 Registering agents...');
    for (const agent of agents) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/agents/register`, {
          agentId: agent.id,
          hostname: agent.hostname,
          agentName: agent.name,
          agentVersion: '1.0.0',
          platform: 'linux',
          osVersion: 'Ubuntu 22.04',
          agentType: 'cmdb'
        });
        console.log(`  ✅ Registered: ${agent.name} (${agent.id})`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`  ⚠️  Already exists: ${agent.name}`);
        } else {
          console.log(`  ❌ Failed: ${agent.name} - ${error.message}`);
        }
      }
    }

    // 2. Create Configuration Items
    console.log('\n💾 Creating configuration items...');
    for (const ci of configurationItems) {
      try {
        await axios.post(`${API_BASE_URL}/api/cmdb/ci`, {
          ciId: ci.id,
          agentId: ci.agentId,
          ciType: ci.type,
          ciName: ci.name,
          status: ci.status,
          attributes: {
            manufacturer: ci.manufacturer,
            model: ci.model,
            osVersion: ci.osVersion,
            ipAddress: ci.ipAddress,
            cpuCores: ci.cpuCores,
            totalMemoryGB: ci.totalMemoryGB,
            totalDiskGB: ci.totalDiskGB
          }
        });
        console.log(`  ✅ Created CI: ${ci.name} (${ci.type})`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`  ⚠️  Already exists: ${ci.name}`);
        } else {
          console.log(`  ❌ Failed: ${ci.name} - ${error.message}`);
        }
      }
    }

    // 3. Add Network Devices
    console.log('\n🌐 Creating network devices...');
    for (const device of networkDevices) {
      try {
        await axios.post(`${API_BASE_URL}/api/network/devices`, {
          deviceName: device.deviceName,
          deviceType: device.type,
          ipAddress: device.ipAddress,
          macAddress: device.macAddress,
          status: device.status,
          ports: device.ports,
          connectedDevices: device.connectedDevices,
          lastSeen: device.lastSeen.toISOString()
        });
        console.log(`  ✅ Created: ${device.deviceName} (${device.type})`);
      } catch (error: any) {
        console.log(`  ❌ Failed: ${device.deviceName} - ${error.message}`);
      }
    }

    // 4. Send Security Events
    console.log('\n🔒 Creating security events...');
    for (const event of securityEvents) {
      try {
        await axios.post(`${API_BASE_URL}/api/security/events`, event);
        console.log(`  ✅ Created: ${event.eventType} (${event.severity}) - ${event.ciId}`);
      } catch (error: any) {
        console.log(`  ❌ Failed: ${event.eventType} - ${error.message}`);
      }
    }

    // 5. Send Agent Metrics
    console.log('\n📊 Sending agent metrics...');
    for (const agentMetric of agentMetrics) {
      for (const metric of agentMetric.metrics) {
        try {
          await axios.post(`${API_BASE_URL}/api/cmdb/ci/${agentMetric.agentId}/metrics`, {
            timestamp: metric.timestamp.toISOString(),
            cpu: metric.cpu,
            memory: metric.memory,
            disk: metric.disk
          });
        } catch (error: any) {
          // Silently fail for metrics (non-critical)
        }
      }
      console.log(`  ✅ Sent metrics for: ${agentMetric.agentId}`);
    }

    // 6. Update Agent Status
    console.log('\n🔄 Updating agent status...');
    for (const agent of agents) {
      try {
        await axios.post(`${API_BASE_URL}/api/agents/${agent.id}/heartbeat`, {
          status: agent.status,
          healthScore: agent.healthScore,
          systemMetrics: {
            cpuUsage: agent.cpu,
            memoryUsage: agent.memory,
            diskUsage: agent.disk
          }
        });
        console.log(`  ✅ Updated: ${agent.name} - ${agent.status} (${agent.healthScore}%)`);
      } catch (error: any) {
        console.log(`  ❌ Failed: ${agent.name} - ${error.message}`);
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                  🎉 Demo Data Seeded Successfully! 🎉    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('📋 Summary:');
    console.log(`   Agents: ${agents.length}`);
    console.log(`   Configuration Items: ${configurationItems.length}`);
    console.log(`   Network Devices: ${networkDevices.length}`);
    console.log(`   Security Events: ${securityEvents.length}`);
    console.log(`   Metrics Data Points: ${agentMetrics.reduce((sum, am) => sum + am.metrics.length, 0)}`);
    console.log('\n🌐 Access the dashboard at: http://localhost:5173');
    console.log('🔒 View security events at: http://localhost:5173/security/dlp\n');

  } catch (error: any) {
    console.error('\n❌ Error seeding data:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run seeder
seedData();
