const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function login(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('input[placeholder*="email"]');
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);
}

async function nav(page, pageName) {
  await page.evaluate((pn) => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'" + pn + "'")) { item.click(); return; }
    }
  }, pageName);
  await sleep(1500);
}

async function getPageButtons(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { error: 'no main' };
    const header = main.querySelector('header');
    const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
    return {
      count: btns.length,
      heading: (main.querySelector('h1,h2')?.textContent || 'none').trim(),
      hash: window.location.hash,
      firstBtn: btns[0]?.textContent?.trim()?.substring(0, 30) || 'none',
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await login(page);

  // Test: catalog each page WITHOUT button clicking
  const PAGES = ['ManagerDashboard', 'OwnerDashboard', 'AIAgentManagement', 'AICoach', 'TeamManagement', 'Analytics', 'Compliance'];
  
  for (const pn of PAGES) {
    await nav(page, pn);
    const info = await getPageButtons(page);
    console.log(`${pn}: ${info.count} btns, h=${info.heading}, hash=${info.hash}, first=${info.firstBtn}`);
  }

  console.log('\n--- Now test with button clicking on Manager ---');
  
  // Navigate to Manager and click a button
  await nav(page, 'ManagerDashboard');
  let info = await getPageButtons(page);
  console.log(`Manager before click: ${info.count} btns`);
  
  // Click button 0
  await page.evaluate(() => {
    const main = document.querySelector('main');
    const header = main.querySelector('header');
    const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
    btns[0].click();
  });
  await sleep(700);
  info = await getPageButtons(page);
  console.log(`After click btn0: ${info.count} btns, h=${info.heading}, hash=${info.hash}`);
  
  // Now navigate to Owner
  await nav(page, 'OwnerDashboard');
  info = await getPageButtons(page);
  console.log(`Owner after Manager btn click: ${info.count} btns, h=${info.heading}, hash=${info.hash}`);

  await browser.close();
})();
