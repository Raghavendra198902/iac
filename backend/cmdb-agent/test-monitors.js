const { EnterpriseAgent } = require('./dist/EnterpriseAgent');

async function test() {
  console.log('=== Testing Phase 2 Monitors ===\n');
  
  const agent = new EnterpriseAgent(process.cwd());
  
  await agent.initialize();
  await agent.start();
  
  console.log('\nAgent started with Phase 2 monitors!');
  console.log('Monitoring for 15 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  await agent.stop();
  console.log('\nAgent stopped successfully');
  process.exit(0);
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
