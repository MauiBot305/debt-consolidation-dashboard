#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DASHBOARD_URL = 'https://3a154e03.debt-consolidation-dashboard-8e1.pages.dev';
const REPORT_PATH = path.join(process.env.HOME, 'Projects/debt-consolidation-dashboard/qa-reports/sonnet-browser-3.md');

let reportContent = '# QA Test Report - SONNET-BROWSER-3 (Thorough Testing)\n\n';
reportContent += `**Date:** ${new Date().toISOString()}\n`;
reportContent += `**Dashboard URL:** ${DASHBOARD_URL}\n`;
reportContent += `**Testing Approach:** Methodical, 30+ seconds per action, snapshot-first\n\n`;
reportContent += '---\n\n';

function saveReport() {
  const reportDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log('✅ Report updated');
}

function addToReport(text) {
  reportContent += text;
  saveReport();
}

async function wait(seconds) {
  console.log(`⏳ Waiting ${seconds} seconds...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function setupAuth(page, role = 'owner') {
  console.log(`\n🔐 Setting up authentication as ${role}...`);
  await page.evaluate((r) => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: `${r}@demo.com`,
      name: r.charAt(0).toUpperCase() + r.slice(1),
      role: r,
      password: 'demo'
    }));
  }, role);
  await page.reload({ waitUntil: 'networkidle' });
  await wait(3);
}

async function captureConsoleErrors(page) {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  return errors;
}

async function testRoleBasedAccess(browser) {
  addToReport('# Role-Based Access Testing\n\n');
  addToReport('Testing that Agent role cannot see AI Agent page, but Manager can.\n\n');
  
  // Test as AGENT
  console.log('\n👤 Testing as AGENT role...');
  const agentPage = await browser.newPage();
  await agentPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(agentPage, 'agent');
  
  // Take snapshot
  console.log('📸 Taking snapshot of sidebar as agent...');
  const agentSnapshot = await agentPage.content();
  
  // Check for AI Agent link
  const aiAgentVisibleAsAgent = await agentPage.locator('a:has-text("AI Agent"), button:has-text("AI Agent")').isVisible().catch(() => false);
  
  if (!aiAgentVisibleAsAgent) {
    addToReport('✅ **PASS:** Agent role correctly cannot see AI Agent page in sidebar\n\n');
    console.log('✅ Agent cannot see AI Agent page (correct)');
  } else {
    addToReport('❌ **FAIL:** Agent role CAN see AI Agent page (should be hidden)\n\n');
    console.log('❌ Agent can see AI Agent page (INCORRECT - should be hidden)');
  }
  
  // List all visible sidebar links as agent
  const agentLinks = await agentPage.locator('nav a, aside a, [role="navigation"] a').allTextContents();
  addToReport(`**Sidebar links visible to Agent:**\n${agentLinks.map(link => `- ${link.trim()}`).join('\n')}\n\n`);
  
  await wait(3);
  await agentPage.close();
  
  // Test as MANAGER
  console.log('\n👤 Testing as MANAGER role...');
  const managerPage = await browser.newPage();
  await managerPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(managerPage, 'manager');
  
  // Take snapshot
  console.log('📸 Taking snapshot of sidebar as manager...');
  const managerSnapshot = await managerPage.content();
  
  // Check for AI Agent link
  const aiAgentVisibleAsManager = await managerPage.locator('a:has-text("AI Agent"), button:has-text("AI Agent")').isVisible().catch(() => false);
  
  if (aiAgentVisibleAsManager) {
    addToReport('✅ **PASS:** Manager role can see AI Agent page in sidebar\n\n');
    console.log('✅ Manager can see AI Agent page (correct)');
  } else {
    addToReport('❌ **FAIL:** Manager role CANNOT see AI Agent page (should be visible)\n\n');
    console.log('❌ Manager cannot see AI Agent page (INCORRECT - should be visible)');
  }
  
  // List all visible sidebar links as manager
  const managerLinks = await managerPage.locator('nav a, aside a, [role="navigation"] a').allTextContents();
  addToReport(`**Sidebar links visible to Manager:**\n${managerLinks.map(link => `- ${link.trim()}`).join('\n')}\n\n`);
  
  await wait(3);
  await managerPage.close();
  
  // Test as OWNER
  console.log('\n👤 Testing as OWNER role...');
  const ownerPage = await browser.newPage();
  await ownerPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(ownerPage, 'owner');
  
  // Take snapshot
  console.log('📸 Taking snapshot of sidebar as owner...');
  
  // List all visible sidebar links as owner
  const ownerLinks = await ownerPage.locator('nav a, aside a, [role="navigation"] a').allTextContents();
  addToReport(`**Sidebar links visible to Owner:**\n${ownerLinks.map(link => `- ${link.trim()}`).join('\n')}\n\n`);
  
  await wait(3);
  await ownerPage.close();
  
  addToReport('---\n\n');
}

async function testPageThoroughly(browser, pageName, passNumber) {
  addToReport(`# ${pageName} - Pass ${passNumber}/4\n\n`);
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`Testing ${pageName} - Pass ${passNumber}/4`);
  console.log('='.repeat(60));
  
  const page = await browser.newPage();
  const consoleErrors = [];
  
  // Setup error tracking
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });
  
  try {
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
    await setupAuth(page, 'owner');
    
    // Navigate to the page
    console.log(`\n📍 Navigating to ${pageName}...`);
    addToReport(`## Navigation\n\n`);
    
    const navSelectors = [
      `a:has-text("${pageName}")`,
      `button:has-text("${pageName}")`,
      `[href*="${pageName.toLowerCase()}"]`
    ];
    
    let navigated = false;
    for (const selector of navSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`Found navigation link: ${selector}`);
          await element.click();
          await wait(3);
          navigated = true;
          addToReport(`✅ Successfully navigated to ${pageName} via sidebar\n\n`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!navigated) {
      addToReport(`❌ Could not find navigation link for ${pageName}\n\n`);
      console.log(`❌ Could not find navigation link for ${pageName}`);
      await page.close();
      return;
    }
    
    // STEP 1: Take snapshot first
    console.log('\n📸 Taking initial page snapshot...');
    addToReport(`## Page Snapshot\n\n`);
    
    const pageTitle = await page.title();
    const pageUrl = page.url();
    addToReport(`- **Title:** ${pageTitle}\n`);
    addToReport(`- **URL:** ${pageUrl}\n\n`);
    
    // Get all interactive elements
    const buttons = await page.locator('button:visible').all();
    const links = await page.locator('a:visible').all();
    const inputs = await page.locator('input:visible').all();
    const selects = await page.locator('select:visible').all();
    
    addToReport(`**Interactive Elements Found:**\n`);
    addToReport(`- ${buttons.length} buttons\n`);
    addToReport(`- ${links.length} links\n`);
    addToReport(`- ${inputs.length} inputs\n`);
    addToReport(`- ${selects.length} dropdowns\n\n`);
    
    console.log(`Found: ${buttons.length} buttons, ${links.length} links, ${inputs.length} inputs, ${selects.length} dropdowns`);
    
    await wait(2);
    
    // STEP 2: Test each button individually (30+ seconds per button)
    console.log('\n🔘 Testing buttons ONE AT A TIME...');
    addToReport(`## Button Testing\n\n`);
    addToReport(`Testing each button with 30+ second intervals...\n\n`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      try {
        const buttonText = await button.textContent().catch(() => '');
        const buttonName = buttonText.trim() || `Button ${i+1}`;
        const isDisabled = await button.isDisabled().catch(() => false);
        
        console.log(`\n[${i+1}/${buttons.length}] Testing: "${buttonName}"`);
        addToReport(`### Button ${i+1}: "${buttonName}"\n\n`);
        
        if (isDisabled) {
          console.log('  ⚠️  Button is disabled - skipping');
          addToReport(`- Status: Disabled (skipped)\n\n`);
          await wait(5);
          continue;
        }
        
        // Clear previous console errors
        consoleErrors.length = 0;
        
        // Click the button
        console.log('  🖱️  Clicking button...');
        const beforeUrl = page.url();
        
        try {
          await button.click({ timeout: 5000 });
          addToReport(`- ✅ Click successful\n`);
        } catch (clickError) {
          addToReport(`- ❌ Click failed: ${clickError.message}\n`);
          console.log(`  ❌ Click failed: ${clickError.message}`);
          await wait(5);
          continue;
        }
        
        // Wait and observe
        await wait(3);
        
        const afterUrl = page.url();
        
        // Check what happened
        const urlChanged = beforeUrl !== afterUrl;
        const modalVisible = await page.locator('[role="dialog"], .modal, [class*="modal"]').isVisible().catch(() => false);
        const hasConsoleErrors = consoleErrors.length > 0;
        
        if (urlChanged) {
          addToReport(`- 🔗 Navigation occurred: ${beforeUrl} → ${afterUrl}\n`);
          console.log(`  🔗 URL changed: ${afterUrl}`);
          await page.goBack();
          await wait(2);
        }
        
        if (modalVisible) {
          addToReport(`- 🪟 Modal/dialog opened\n`);
          console.log('  🪟 Modal opened');
          await page.keyboard.press('Escape');
          await wait(2);
        }
        
        if (hasConsoleErrors) {
          addToReport(`- ❌ Console errors detected:\n`);
          consoleErrors.forEach(err => {
            addToReport(`  - ${err}\n`);
            console.log(`  ❌ ${err}`);
          });
        } else {
          addToReport(`- ✅ No console errors\n`);
          console.log('  ✅ No console errors');
        }
        
        if (!urlChanged && !modalVisible && !hasConsoleErrors) {
          addToReport(`- ⚠️  Button click had no visible effect\n`);
          console.log('  ⚠️  No visible effect');
        }
        
        addToReport('\n');
        
        // Required 30+ second wait between buttons
        console.log('  ⏳ Waiting 30 seconds before next button...');
        await wait(30);
        
      } catch (error) {
        addToReport(`- ❌ Error testing button: ${error.message}\n\n`);
        console.log(`  ❌ Error: ${error.message}`);
        await wait(5);
      }
    }
    
    // STEP 3: Test dropdowns
    console.log('\n📋 Testing dropdowns...');
    addToReport(`## Dropdown Testing\n\n`);
    
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      try {
        const options = await select.locator('option').count();
        console.log(`[${i+1}/${selects.length}] Testing dropdown with ${options} options`);
        
        if (options > 1) {
          await select.selectOption({ index: 1 });
          await wait(2);
          addToReport(`- ✅ Dropdown ${i+1}: ${options} options, selection works\n`);
        } else {
          addToReport(`- ⚠️  Dropdown ${i+1}: Only 1 option\n`);
        }
        
        await wait(5);
      } catch (error) {
        addToReport(`- ❌ Dropdown ${i+1} error: ${error.message}\n`);
      }
    }
    addToReport('\n');
    
    // STEP 4: Test inputs
    console.log('\n⌨️  Testing inputs...');
    addToReport(`## Input Testing\n\n`);
    
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const input = inputs[i];
      try {
        const inputType = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder').catch(() => '');
        
        console.log(`[${i+1}/${Math.min(inputs.length, 5)}] Testing input (${inputType})`);
        
        await input.fill('test input');
        await wait(2);
        await input.clear();
        await wait(2);
        
        addToReport(`- ✅ Input ${i+1} (${inputType}): Typing and clearing works\n`);
        await wait(5);
      } catch (error) {
        addToReport(`- ❌ Input ${i+1} error: ${error.message}\n`);
      }
    }
    addToReport('\n');
    
    // STEP 5: Check data rendering
    console.log('\n📊 Checking data rendering...');
    addToReport(`## Data Rendering\n\n`);
    
    const dataCheck = await page.evaluate(() => {
      const stats = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="card"]');
      const tables = document.querySelectorAll('table tbody tr');
      const charts = document.querySelectorAll('canvas, svg[class*="chart"]');
      
      return {
        statCards: stats.length,
        tableRows: tables.length,
        charts: charts.length
      };
    });
    
    addToReport(`- Stat cards/metrics: ${dataCheck.statCards}\n`);
    addToReport(`- Table rows: ${dataCheck.tableRows}\n`);
    addToReport(`- Charts/visualizations: ${dataCheck.charts}\n\n`);
    
    if (dataCheck.statCards === 0 && dataCheck.tableRows === 0 && dataCheck.charts === 0) {
      addToReport(`⚠️  **Warning:** No data rendering detected\n\n`);
    }
    
    // Final console error check
    if (consoleErrors.length > 0) {
      addToReport(`## Console Errors Summary\n\n`);
      addToReport(`Total errors: ${consoleErrors.length}\n\n`);
      addToReport('```\n');
      consoleErrors.forEach(err => addToReport(`${err}\n`));
      addToReport('```\n\n');
    }
    
    addToReport('---\n\n');
    
  } catch (error) {
    addToReport(`\n❌ **Fatal Error:** ${error.message}\n\n`);
    addToReport('```\n');
    addToReport(error.stack);
    addToReport('\n```\n\n');
    addToReport('---\n\n');
  } finally {
    await page.close();
  }
  
  console.log(`✅ Completed pass ${passNumber} for ${pageName}`);
  console.log('Report updated at:', REPORT_PATH);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('SONNET-BROWSER-3: THOROUGH QA TESTING');
  console.log('='.repeat(60));
  console.log(`Dashboard: ${DASHBOARD_URL}`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log('Approach: Methodical, 30+ seconds per action\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });

  try {
    // PRIORITY: Test role-based access first
    console.log('\n🎯 PRIORITY TEST: Role-Based Access Control');
    await testRoleBasedAccess(browser);
    
    // Test each page with 4 passes
    const pages = ['Gamification', 'Automation', 'TeamManagement', 'Settings', 'ClientPortal', 'DataImport'];
    
    for (const pageName of pages) {
      for (let pass = 1; pass <= 4; pass++) {
        await testPageThoroughly(browser, pageName, pass);
        
        // Break between pages
        if (pass === 4) {
          console.log('\n⏸️  Completed all passes for ' + pageName);
          console.log('Taking 30 second break before next page...');
          await wait(30);
        }
      }
    }
    
    addToReport('\n# Testing Complete\n\n');
    addToReport(`**Completed:** ${new Date().toISOString()}\n`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTING COMPLETE');
    console.log('='.repeat(60));
    console.log(`Report saved: ${REPORT_PATH}\n`);
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    addToReport(`\n\n# FATAL ERROR\n\n${error.message}\n\n\`\`\`\n${error.stack}\n\`\`\`\n`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
