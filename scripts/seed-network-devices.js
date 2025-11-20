#!/usr/bin/env node
/**
 * Citadel CMDB - Create Demo Network Devices
 * Populates discovered network devices
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const networkDevices = [
  {
    deviceName: 'core-router-01',
    type: 'router',
    ipAddress: '10.0.0.1',
    macAddress: '00:1A:2B:3C:4D:5E',
    status: 'active',
    manufacturer: 'Cisco',
    model: 'ISR 4451',
    ports: 48,
    connectedDevices: 32,
    lastSeen: new Date('2025-11-17T15:30:00Z').toISOString(),
    metadata: {
      firmware: '17.6.3',
      uptime: '45 days',
      location: 'Data Center Rack A1'
    }
  },
  {
    deviceName: 'core-switch-01',
    type: 'switch',
    ipAddress: '10.0.0.2',
    macAddress: '00:1A:2B:3C:4D:5F',
    status: 'active',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300',
    ports: 48,
    connectedDevices: 45,
    lastSeen: new Date().toISOString(),
    metadata: {
      firmware: '17.9.1',
      uptime: '120 days',
      location: 'Data Center Rack A2'
    }
  },
  {
    deviceName: 'firewall-01',
    type: 'firewall',
    ipAddress: '10.0.0.3',
    macAddress: '00:1A:2B:3C:4D:60',
    status: 'active',
    manufacturer: 'Palo Alto Networks',
    model: 'PA-3220',
    ports: 8,
    connectedDevices: 8,
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    metadata: {
      firmware: '10.2.3',
      uptime: '90 days',
      location: 'Data Center Rack A1',
      throughput: '2.8 Gbps'
    }
  },
  {
    deviceName: 'access-switch-01',
    type: 'switch',
    ipAddress: '10.0.1.10',
    macAddress: '00:1A:2B:3C:4D:61',
    status: 'active',
    manufacturer: 'Cisco',
    model: 'Catalyst 2960X',
    ports: 24,
    connectedDevices: 18,
    lastSeen: new Date().toISOString(),
    metadata: {
      firmware: '15.2.7',
      uptime: '180 days',
      location: 'Floor 2 IDF'
    }
  },
  {
    deviceName: 'wifi-controller-01',
    type: 'wireless controller',
    ipAddress: '10.0.1.20',
    macAddress: '00:1A:2B:3C:4D:62',
    status: 'active',
    manufacturer: 'Cisco',
    model: 'WLC 5520',
    ports: 4,
    connectedDevices: 156, // wireless clients
    lastSeen: new Date().toISOString(),
    metadata: {
      firmware: '8.10.162.0',
      uptime: '60 days',
      location: 'Data Center Rack B1',
      accessPoints: 24
    }
  }
];

async function createNetworkDevices() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║      Citadel CMDB - Network Devices Seeder               ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  let created = 0;
  let failed = 0;

  for (const device of networkDevices) {
    try {
      await axios.post(`${API_BASE_URL}/api/network/devices`, device);
      console.log(`✅ Created: ${device.deviceName} (${device.type})`);
      console.log(`   IP: ${device.ipAddress} | Ports: ${device.ports} | Connected: ${device.connectedDevices}`);
      created++;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Already exists: ${device.deviceName}`);
      } else {
        console.log(`❌ Failed: ${device.deviceName} - ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║               🎉 Network Seeding Complete! 🎉             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${networkDevices.length}\n`);

  console.log('🌐 View in dashboard:');
  console.log('   CMDB Tab → Discovered Network Devices section\n');
}

createNetworkDevices().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
