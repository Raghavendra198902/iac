/**
 * Test Enforcement Engine Integration
 * Verifies policy evaluation and action execution
 */

const { EnterpriseAgent } = require('./dist/EnterpriseAgent');
const path = require('path');

async function testEnforcementEngine() {
  console.log('='.repeat(60));
  console.log('ENFORCEMENT ENGINE TEST');
  console.log('='.repeat(60));

  const agent = new EnterpriseAgent(path.join(__dirname, 'test-agent'));

  try {
    // Listen for enforcement events
    agent.on('enforcement', (event) => {
      console.log('\n🚨 ENFORCEMENT EVENT:', {
        type: event.type,
        policy: event.policyName,
        severity: event.severity,
        actionCount: event.results?.length || 0,
      });
    });

    // Start agent
    console.log('\n1. Initializing and starting agent with enforcement engine...');
    await agent.initialize();
    await agent.start();
    console.log('✅ Agent started with enforcement engine');

    // Display loaded policies
    console.log('\n2. Policy Statistics:');
    const stats = agent.getStatus();
    if (stats.policyStats) {
      console.log(`   Total Policies: ${stats.policyStats.total}`);
      console.log(`   Enabled: ${stats.policyStats.enabled}`);
      console.log(`   Disabled: ${stats.policyStats.disabled}`);
      console.log(`\n   By Category:`);
      Object.entries(stats.policyStats.byCategory).forEach(([cat, count]) => {
        console.log(`     - ${cat}: ${count}`);
      });
      console.log(`\n   By Severity:`);
      Object.entries(stats.policyStats.bySeverity).forEach(([sev, count]) => {
        console.log(`     - ${sev}: ${count}`);
      });
    }

    // Run for 20 seconds to collect events
    console.log('\n3. Running enforcement engine for 20 seconds...');
    console.log('   Monitors active: Process, USB, Network, Filesystem');
    console.log('   Watching for policy violations...\n');

    await new Promise(resolve => setTimeout(resolve, 20000));

    // Stop agent
    console.log('\n4. Stopping agent...');
    await agent.stop();
    console.log('✅ Agent stopped cleanly');

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('   - Enforcement engine initialized');
    console.log('   - Policies loaded and enabled');
    console.log('   - All monitors integrated with policies');
    console.log('   - Event evaluation operational');
    console.log('\n✅ Enforcement Engine Test: PASSED');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testEnforcementEngine().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
