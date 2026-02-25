const { chromium } = require('playwright');

const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';

const PAGES = [
  { page: 'ManagerDashboard', name: 'Manager Dashboard' },
  { page: 'OwnerDashboard', name: 'Owner Dashboard' },
  { page: 'AIAgentManagement', name: 'AI Agent Management' },
  { page: 'AICoach', name: 'AI Coach' },
  { page: 'TeamManagement', name: 'Team Management' },
  { page: 'Analytics', name: 'Analytics' },
  { page: 'Compliance', name: 'Compliance' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL);
  await page.waitForSelector('input[placeholder*="email"]', { timeout: 10000 });
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged in');

  for (const pi of PAGES) {
    // Navigate
    await page.evaluate((pageName) => {
      const items = document.querySelectorAll('[onclick*="navigateTo"]');
      for (const item of items) {
        if (item.getAttribute('onclick').includes("'" + pageName + "'")) {
          item.click();
          return true;
        }
      }
      return false;
    }, pi.page);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const info = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return { error: 'no main' };
      const html = main.innerHTML.substring(0, 500);
      const btns = main.querySelectorAll('button').length;
      const inputs = main.querySelectorAll('input').length;
      const allBtns = document.querySelectorAll('button').length;
      const allInputs = document.querySelectorAll('input').length;
      const h1 = main.querySelector('h1,h2')?.textContent || 'none';
      return { h1, btns, inputs, allBtns, allInputs, htmlSnippet: html.substring(0, 200) };
    });
    
    console.log(`\n${pi.name}:`);
    console.log(`  h1: ${info.h1}`);
    console.log(`  main buttons: ${info.btns}, main inputs: ${info.inputs}`);
    console.log(`  all buttons: ${info.allBtns}, all inputs: ${info.allInputs}`);
    console.log(`  html: ${info.htmlSnippet?.substring(0, 150)}`);
  }

  await browser.close();
})();
