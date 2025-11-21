#!/usr/bin/env node
/**
 * Citadel CMDB - Create Demo Configuration Items
 * Populates the CMDB with realistic CI data that shows up in the dashboard
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Demo Configuration Items for the CMDB
const configurationItems = [
  // Agent 1: web-server-prod-01
  {
    id: 'ci-agent-001',
    name: 'web-server-prod-01',
    hostname: 'web-server-prod-01.company.local',
    type: 'agent',
    status: 'online',
    healthScore: 98,
    ciCount: 5,
    metadata: {
      lastSeen: new Date().toISOString(),
      healthScore: 98,
      ciCount: '5',
      platform: 'linux',
      osVersion: 'Ubuntu 22.04 LTS'
    },
    metrics: {
      cpu: { usage: 45 },
      memory: { usagePercent: 62 },
      disk: { usagePercent: 38 },
      network: { usagePercent: 25 }
    }
  },
  {
    id: 'ci-web-nginx-001',
    name: 'Nginx Web Server',
    type: 'application',
    status: 'running',
    environment: 'production',
    attributes: {
      version: '1.24.0',
      port: 80,
      ssl: true
    }
  },
  {
    id: 'ci-web-os-001',
    name: 'Ubuntu Server',
    type: 'server',
    status: 'active',
    attributes: {
      osVersion: 'Ubuntu 22.04.3 LTS',
      kernel: '5.15.0-91-generic',
      architecture: 'x86_64'
    }
  },
  {
    id: 'ci-web-net-001',
    name: 'Primary Network Interface',
    type: 'network',
    status: 'active',
    attributes: {
      ipAddress: '192.168.1.101',
      macAddress: '00:1A:2B:3C:4D:5E',
      interface: 'eth0'
    }
  },
  {
    id: 'ci-web-cpu-001',
    name: 'Intel Xeon CPU',
    type: 'server',
    status: 'healthy',
    attributes: {
      manufacturer: 'Intel',
      model: 'Xeon E5-2680 v4',
      cores: 8,
      threads: 16
    }
  },
  {
    id: 'ci-web-storage-001',
    name: 'System Storage',
    type: 'storage',
    status: 'healthy',
    attributes: {
      totalGB: 500,
      usedGB: 190,
      filesystem: 'ext4'
    }
  },

  // Agent 2: api-server-prod-01
  {
    id: 'ci-agent-002',
    name: 'api-server-prod-01',
    hostname: 'api-server-prod-01.company.local',
    type: 'agent',
    status: 'online',
    healthScore: 95,
    ciCount: 8,
    metadata: {
      lastSeen: new Date(Date.now() - 15000).toISOString(),
      healthScore: 95,
      ciCount: '8',
      platform: 'linux',
      osVersion: 'Ubuntu 22.04 LTS'
    },
    metrics: {
      cpu: { usage: 68 },
      memory: { usagePercent: 71 },
      disk: { usagePercent: 42 },
      network: { usagePercent: 34 }
    }
  },
  {
    id: 'ci-api-node-001',
    name: 'Node.js Runtime',
    type: 'application',
    status: 'running',
    environment: 'production',
    attributes: {
      version: 'v20.10.0',
      npm: '10.2.3'
    }
  },
  {
    id: 'ci-api-express-001',
    name: 'Express API Gateway',
    type: 'application',
    status: 'running',
    attributes: {
      version: '4.18.2',
      port: 3000
    }
  },
  {
    id: 'ci-api-os-001',
    name: 'Ubuntu Server',
    type: 'server',
    status: 'active',
    attributes: {
      osVersion: 'Ubuntu 22.04.3 LTS'
    }
  },
  {
    id: 'ci-api-net-001',
    name: 'Primary Network Interface',
    type: 'network',
    status: 'active',
    attributes: {
      ipAddress: '192.168.1.102',
      macAddress: '00:1A:2B:3C:4D:5F'
    }
  },
  {
    id: 'ci-api-cpu-001',
    name: 'Intel Xeon CPU',
    type: 'server',
    status: 'healthy',
    attributes: {
      manufacturer: 'Intel',
      cores: 16
    }
  },
  {
    id: 'ci-api-mem-001',
    name: 'System Memory',
    type: 'server',
    status: 'healthy',
    attributes: {
      totalGB: 32,
      type: 'DDR4'
    }
  },
  {
    id: 'ci-api-storage-001',
    name: 'System Storage',
    type: 'storage',
    status: 'healthy',
    attributes: {
      totalGB: 1000,
      usedGB: 420
    }
  },
  {
    id: 'ci-api-redis-001',
    name: 'Redis Cache',
    type: 'database',
    status: 'running',
    attributes: {
      version: 'v7.2.3',
      port: 6379
    }
  },

  // Agent 3: db-server-prod-01
  {
    id: 'ci-agent-003',
    name: 'db-server-prod-01',
    hostname: 'db-server-prod-01.company.local',
    type: 'agent',
    status: 'warning',
    healthScore: 78,
    ciCount: 3,
    metadata: {
      lastSeen: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      healthScore: 78,
      ciCount: '3',
      platform: 'linux',
      osVersion: 'Ubuntu 22.04 LTS'
    },
    metrics: {
      cpu: { usage: 82 },
      memory: { usagePercent: 88 },
      disk: { usagePercent: 75 },
      network: { usagePercent: 15 }
    }
  },
  {
    id: 'ci-db-postgres-001',
    name: 'PostgreSQL Database',
    type: 'database',
    status: 'running',
    environment: 'production',
    attributes: {
      version: '15.4',
      port: 5432,
      connections: 87,
      maxConnections: 100
    }
  },
  {
    id: 'ci-db-os-001',
    name: 'Ubuntu Server',
    type: 'server',
    status: 'active',
    attributes: {
      osVersion: 'Ubuntu 22.04.3 LTS'
    }
  },
  {
    id: 'ci-db-net-001',
    name: 'Primary Network Interface',
    type: 'network',
    status: 'active',
    attributes: {
      ipAddress: '192.168.1.103',
      macAddress: '00:1A:2B:3C:4D:60'
    }
  }
];

async function createCIs() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       Citadel CMDB - Configuration Items Seeder          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const ci of configurationItems) {
    try {
      // Try to create CI
      const response = await axios.post(`${API_BASE_URL}/api/cmdb/ci`, ci, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ Created: ${ci.name} (${ci.type})`);
      created++;
    } catch (error) {
      if (error.response?.status === 409) {
        // CI exists, try to update it
        try {
          await axios.put(`${API_BASE_URL}/api/cmdb/ci/${ci.id}`, ci, {
            headers: { 'Content-Type': 'application/json' }
          });
          console.log(`🔄 Updated: ${ci.name} (${ci.type})`);
          updated++;
        } catch (updateError) {
          console.log(`⚠️  Exists (no update): ${ci.name}`);
          updated++;
        }
      } else {
        console.log(`❌ Failed: ${ci.name} - ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                  🎉 Seeding Complete! 🎉                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${configurationItems.length}\n`);

  console.log('🌐 Access the CMDB dashboard at:');
  console.log('   http://localhost:5173/cmdb');
  console.log('   http://192.168.1.10:5173/cmdb\n');

  console.log('📡 Expected Agents in Dashboard:');
  console.log('   • web-server-prod-01 (online, 98% health, 5 CIs)');
  console.log('   • api-server-prod-01 (online, 95% health, 8 CIs)');
  console.log('   • db-server-prod-01 (warning, 78% health, 3 CIs)\n');
}

// Run the seeder
createCIs().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
