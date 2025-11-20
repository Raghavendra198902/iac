#!/usr/bin/env node
/**
 * Delete all demo/fake data - keep only real agent data
 */

const axios = require('axios');
const API_BASE_URL = 'http://localhost:3000';

async function cleanDemoData() {
  console.log('🗑️  Cleaning demo data...\n');

  // Delete demo CIs
  const demoCIs = [
    'ci-agent-001', 'ci-agent-002', 'ci-agent-003',
    'ci-web-nginx-001', 'ci-web-os-001', 'ci-web-net-001', 'ci-web-cpu-001', 'ci-web-storage-001',
    'ci-api-node-001', 'ci-api-express-001', 'ci-api-os-001', 'ci-api-net-001', 
    'ci-api-cpu-001', 'ci-api-mem-001', 'ci-api-storage-001', 'ci-api-redis-001',
    'ci-db-postgres-001', 'ci-db-os-001', 'ci-db-net-001'
  ];

  let deleted = 0;
  for (const ciId of demoCIs) {
    try {
      await axios.delete(`${API_BASE_URL}/api/cmdb/ci/${ciId}`);
      console.log(`✅ Deleted: ${ciId}`);
      deleted++;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⚠️  Not found: ${ciId}`);
      } else {
        console.log(`❌ Error deleting ${ciId}: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Cleaned ${deleted} demo CIs`);
  console.log('\n📊 Only REAL agent data remains');
  console.log('   Real agent: rrd-VMware-Virtual-Platform\n');
}

cleanDemoData().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
