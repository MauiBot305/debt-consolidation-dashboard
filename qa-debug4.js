const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';

async function nav(page, pageName) {
  const found = await page.evaluate((pn) => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'" + pn + "'")) { item.click(); return true; }
    }
    return false;
  }, pageName);
  await sleep(1500);
  return found;
}

async function getBtns(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { error: 'no main' };
    const header = main.querySelector('header');
    const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
    return { count: btns.length, h: main.querySelector('h1,h2')?.textContent?.trim() || 'none', hash: location.hash };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL);
  await page.waitForSelector('input[placeholder*="email"]');
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);

  // Simulate what testPage does for Manager Dashboard: navigate + click each button + re-navigate
  console.log('--- Simulating Manager Dashboard button test loop ---');
  
  for (let i = 0; i < 7; i++) {
    await nav(page, 'ManagerDashboard');
    const info = await getBtns(page);
    console.log(`  Nav #${i}: ${info.count} btns, h=${info.h}, hash=${info.hash}`);
    
    // Click button
    await page.evaluate((idx) => {
      const main = document.querySelector('main');
      const header = main.querySelector('header');
      const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
      if (idx < btns.length) btns[idx].click();
    }, i);
    await sleep(700);
    
    const after = await getBtns(page);
    console.log(`  After click #${i}: ${after.count} btns, h=${after.h}, hash=${after.hash}`);
  }

  console.log('\n--- Now trying to navigate to Owner Dashboard ---');
  const navResult = await nav(page, 'OwnerDashboard');
  console.log('Nav result:', navResult);
  const ownerInfo = await getBtns(page);
  console.log('Owner:', ownerInfo);

  // Try harder - check if sidebar exists
  const sidebarCheck = await page.evaluate(() => {
    const navItems = document.querySelectorAll('[onclick*="navigateTo"]');
    return { count: navItems.length, urls: page?.url?.() };
  });
  console.log('Sidebar items:', sidebarCheck.count);

  await browser.close();
})();
