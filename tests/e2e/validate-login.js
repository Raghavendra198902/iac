// Quick test to validate login flow
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('1. Navigating to home page...');
  await page.goto('http://localhost:5173');
  
  console.log('2. Clearing storage...');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  console.log('3. Navigating to login page...');
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  
  console.log('4. Checking page title...');
  const title = await page.title();
  console.log(`   Title: ${title}`);
  
  console.log('5. Looking for email input...');
  const emailInput = await page.locator('input[name="email"]').count();
  console.log(`   Email inputs found: ${emailInput}`);
  
  if (emailInput > 0) {
    console.log('6. Filling form...');
    await page.fill('input[name="email"]', 'admin@iac.dharma');
    await page.fill('input[name="password"]', 'test123');
    
    console.log('7. Looking for submit button...');
    const submitBtn = await page.locator('button[type="submit"]').count();
    console.log(`   Submit buttons found: ${submitBtn}`);
    
    if (submitBtn > 0) {
      console.log('8. Submitting form...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      console.log('9. Checking current URL...');
      console.log(`   URL: ${page.url()}`);
      
      console.log('10. Looking for user indicator...');
      const userText = await page.locator('text=admin@iac.dharma').count();
      console.log(`   User email found: ${userText} times`);
    }
  }
  
  console.log('\n✅ Manual validation complete');
  await browser.close();
})();
