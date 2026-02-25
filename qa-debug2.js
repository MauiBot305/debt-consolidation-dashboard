const { chromium } = require('playwright');

const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL);
  await page.waitForSelector('input[placeholder*="email"]');
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);

  // Navigate to Manager Dashboard
  await page.evaluate(() => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'ManagerDashboard'")) { item.click(); return; }
    }
  });
  await sleep(1500);

  // Get page heading
  let h = await page.evaluate(() => document.querySelector('main h1, main h2')?.textContent);
  console.log('After nav to Manager:', h);

  // Now simulate what happens in button testing - click first non-header button
  await page.evaluate(() => {
    const main = document.querySelector('main');
    const header = main.querySelector('header');
    const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
    console.log('Found', btns.length, 'buttons');
    btns[0].click();
  });
  await sleep(1000);

  // Check current state
  h = await page.evaluate(() => window.location.hash + ' | ' + (document.querySelector('main h1, main h2')?.textContent || 'none'));
  console.log('After button click:', h);

  // Now try to navigate to Owner Dashboard
  const navResult = await page.evaluate(() => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    const found = [];
    for (const item of items) {
      found.push(item.getAttribute('onclick'));
    }
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'OwnerDashboard'")) { 
        item.click(); 
        return 'clicked OwnerDashboard, total nav items: ' + found.length; 
      }
    }
    return 'NOT FOUND. Nav items: ' + found.length + ' | ' + found.slice(0,3).join('; ');
  });
  console.log('Nav to Owner:', navResult);
  await sleep(1500);

  h = await page.evaluate(() => window.location.hash + ' | ' + (document.querySelector('main h1, main h2')?.textContent || 'none'));
  console.log('After Owner nav:', h);

  // Check how many buttons Owner has
  const ownerBtns = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return 'no main';
    const header = main.querySelector('header');
    const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
    return btns.length + ' buttons, first: ' + (btns[0]?.textContent?.trim()?.substring(0,30) || 'none');
  });
  console.log('Owner buttons:', ownerBtns);

  await browser.close();
})();
