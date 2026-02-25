#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DASHBOARD_URL = 'https://3a154e03.debt-consolidation-dashboard-8e1.pages.dev';
const REPORT_PATH = path.join(process.env.HOME, 'Projects/debt-consolidation-dashboard/qa-reports/sonnet-browser-3.md');
const SCREENSHOT_DIR = path.join(process.env.HOME, 'Projects/debt-consolidation-dashboard/qa-reports/screenshots');

let reportContent = '# QA Test Report - SONNET-BROWSER-3\n\n';
reportContent += `**Date:** ${new Date().toISOString()}\n`;
reportContent += `**Dashboard URL:** ${DASHBOARD_URL}\n\n`;
reportContent += '---\n\n';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function saveReport() {
  const reportDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(REPORT_PATH, reportContent);
}

function addToReport(text) {
  reportContent += text;
  saveReport();
}

async function wait(seconds) {
  console.log(`⏳ ${seconds}s...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function setupAuth(page, role = 'owner') {
  console.log(`🔐 Auth: ${role}`);
  await page.evaluate((r) => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: `${r}@demo.com`,
      name: r.charAt(0).toUpperCase() + r.slice(1),
      role: r,
      password: 'demo'
    }));
  }, role);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(5); // Wait longer for page to fully render
}

async function capturePageStructure(page, roleName) {
  console.log(`📸 Capturing ${roleName} page structure...`);
  
  // Take screenshot
  const screenshotPath = path.join(SCREENSHOT_DIR, `${roleName}-sidebar.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`   Saved: ${screenshotPath}`);
  
  // Get ALL links on the page
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(link => ({
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
      classes: link.className,
      visible: link.offsetParent !== null
    })).filter(l => l.text.length > 0 && l.visible);
  });
  
  // Get ALL buttons
  const allButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(btn => ({
      text: btn.textContent.trim(),
      classes: btn.className,
      visible: btn.offsetParent !== null
    })).filter(b => b.text.length > 0 && b.visible);
  });
  
  return { allLinks, allButtons, screenshotPath };
}

async function testRoleBasedAccess(browser) {
  addToReport('# 🎭 Role-Based Access Testing\n\n');
  console.log('\n' + '='.repeat(60));
  console.log('🎯 TESTING ROLE-BASED ACCESS CONTROL');
  console.log('='.repeat(60));
  
  // Test AGENT role
  console.log('\n👤 AGENT ROLE');
  const agentPage = await browser.newPage();
  await agentPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(agentPage, 'agent');
  
  const agentStructure = await capturePageStructure(agentPage, 'agent');
  
  addToReport(`## Agent Role\n\n`);
  addToReport(`Screenshot: \`screenshots/agent-sidebar.png\`\n\n`);
  addToReport(`### Navigation Links (${agentStructure.allLinks.length} total)\n\n`);
  agentStructure.allLinks.forEach(link => {
    addToReport(`- **${link.text}** → \`${link.href}\`\n`);
  });
  addToReport('\n');
  
  // Check for AI Agent
  const hasAIAgent = agentStructure.allLinks.some(l => 
    l.text.toLowerCase().includes('ai agent') || 
    l.href.includes('ai-agent') ||
    l.href.includes('aiagent')
  );
  
  if (!hasAIAgent) {
    addToReport(`✅ **PASS:** Agent cannot see AI Agent page\n\n`);
    console.log('✅ Agent: AI Agent page correctly hidden');
  } else {
    addToReport(`❌ **FAIL:** Agent CAN see AI Agent page!\n\n`);
    console.log('❌ Agent: Can see AI Agent (BUG)');
  }
  
  await agentPage.close();
  await wait(3);
  
  // Test MANAGER role
  console.log('\n👤 MANAGER ROLE');
  const managerPage = await browser.newPage();
  await managerPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(managerPage, 'manager');
  
  const managerStructure = await capturePageStructure(managerPage, 'manager');
  
  addToReport(`## Manager Role\n\n`);
  addToReport(`Screenshot: \`screenshots/manager-sidebar.png\`\n\n`);
  addToReport(`### Navigation Links (${managerStructure.allLinks.length} total)\n\n`);
  managerStructure.allLinks.forEach(link => {
    addToReport(`- **${link.text}** → \`${link.href}\`\n`);
  });
  addToReport('\n');
  
  const managerHasAIAgent = managerStructure.allLinks.some(l => 
    l.text.toLowerCase().includes('ai agent') || 
    l.href.includes('ai-agent') ||
    l.href.includes('aiagent')
  );
  
  if (managerHasAIAgent) {
    addToReport(`✅ **PASS:** Manager can see AI Agent page\n\n`);
    console.log('✅ Manager: AI Agent page correctly visible');
  } else {
    addToReport(`❌ **FAIL:** Manager CANNOT see AI Agent page!\n\n`);
    console.log('❌ Manager: Cannot see AI Agent (BUG)');
  }
  
  await managerPage.close();
  await wait(3);
  
  // Test OWNER role
  console.log('\n👤 OWNER ROLE');
  const ownerPage = await browser.newPage();
  await ownerPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(ownerPage, 'owner');
  
  const ownerStructure = await capturePageStructure(ownerPage, 'owner');
  
  addToReport(`## Owner Role\n\n`);
  addToReport(`Screenshot: \`screenshots/owner-sidebar.png\`\n\n`);
  addToReport(`### Navigation Links (${ownerStructure.allLinks.length} total)\n\n`);
  ownerStructure.allLinks.forEach(link => {
    addToReport(`- **${link.text}** → \`${link.href}\`\n`);
  });
  addToReport('\n\n');
  
  await ownerPage.close();
  
  addToReport('---\n\n');
  
  // Return the structure so we know what pages actually exist
  return ownerStructure.allLinks.map(l => l.text);
}

async function testPageThoroughly(browser, pageName, passNumber) {
  addToReport(`# ${pageName} - Pass ${passNumber}/4\n\n`);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${pageName} - Pass ${passNumber}/4`);
  console.log('='.repeat(60));
  
  const page = await browser.newPage();
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`   ❌ Console: ${msg.text().substring(0, 80)}...`);
    }
  });
  
  try {
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
    await setupAuth(page, 'owner');
    
    // Find and click the page link
    console.log(`📍 Navigating to ${pageName}...`);
    const clicked = await page.evaluate((name) => {
      const links = Array.from(document.querySelectorAll('a, button'));
      for (const link of links) {
        if (link.textContent.trim() === name || 
            link.textContent.trim().includes(name)) {
          link.click();
          return true;
        }
      }
      return false;
    }, pageName);
    
    if (!clicked) {
      addToReport(`❌ Navigation failed: Could not find "${pageName}"\n\n---\n\n`);
      console.log(`❌ Could not find "${pageName}"`);
      await page.close();
      return;
    }
    
    await wait(5);
    
    // Take snapshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName.toLowerCase()}-pass${passNumber}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    addToReport(`Screenshot: \`screenshots/${path.basename(screenshotPath)}\`\n\n`);
    
    // Get page elements
    const buttons = await page.locator('button:visible').all();
    const inputs = await page.locator('input:visible').all();
    const selects = await page.locator('select:visible').all();
    
    addToReport(`## Elements Found\n\n`);
    addToReport(`- ${buttons.length} buttons\n`);
    addToReport(`- ${inputs.length} inputs\n`);
    addToReport(`- ${selects.length} dropdowns\n\n`);
    
    console.log(`   Found: ${buttons.length} buttons, ${inputs.length} inputs`);
    
    // Test buttons (limit to 5 per pass to save time)
    addToReport(`## Button Tests\n\n`);
    const buttonLimit = Math.min(buttons.length, 5);
    
    for (let i = 0; i < buttonLimit; i++) {
      const button = buttons[i];
      try {
        const text = await button.textContent().catch(() => '');
        const name = text.trim() || `Button ${i+1}`;
        
        console.log(`\n[${i+1}/${buttonLimit}] Testing: "${name}"`);
        addToReport(`### ${name}\n\n`);
        
        const isDisabled = await button.isDisabled().catch(() => false);
        if (isDisabled) {
          addToReport(`- Disabled (skipped)\n\n`);
          await wait(5);
          continue;
        }
        
        // Clear errors
        consoleErrors.length = 0;
        
        // Click
        const beforeUrl = page.url();
        await button.click({ timeout: 3000 }).catch(() => {});
        await wait(3);
        const afterUrl = page.url();
        
        const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        
        if (beforeUrl !== afterUrl) {
          addToReport(`- ✅ Navigated to: ${afterUrl}\n`);
          await page.goBack();
          await wait(2);
        } else if (modalVisible) {
          addToReport(`- ✅ Opened modal\n`);
          await page.keyboard.press('Escape');
          await wait(2);
        } else if (consoleErrors.length > 0) {
          addToReport(`- ❌ Console errors:\n`);
          consoleErrors.forEach(e => addToReport(`  - ${e}\n`));
        } else {
          addToReport(`- ⚠️  No visible effect\n`);
        }
        
        addToReport('\n');
        
        console.log(`   ⏳ Waiting 30s...`);
        await wait(30);
        
      } catch (error) {
        addToReport(`- ❌ Error: ${error.message}\n\n`);
      }
    }
    
    // Summary
    if (consoleErrors.length > 0) {
      addToReport(`## Console Errors (${consoleErrors.length} total)\n\n`);
      addToReport('```\n');
      consoleErrors.slice(0, 10).forEach(e => addToReport(`${e}\n`));
      addToReport('```\n\n');
    }
    
    addToReport('---\n\n');
    
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('SONNET-BROWSER-3: QA TESTING');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down all actions
  });

  try {
    // Step 1: Test role access and discover pages
    const availablePages = await testRoleBasedAccess(browser);
    
    console.log('\n📋 Available Pages:', availablePages.join(', '));
    
    // Step 2: Test each page (use actual page names from sidebar)
    const pagesToTest = availablePages.filter(p => 
      p.toLowerCase().includes('gamification') ||
      p.toLowerCase().includes('automation') ||
      p.toLowerCase().includes('team') ||
      p.toLowerCase().includes('setting') ||
      p.toLowerCase().includes('client') ||
      p.toLowerCase().includes('import')
    );
    
    console.log('📝 Testing pages:', pagesToTest.join(', '));
    
    for (const pageName of pagesToTest) {
      for (let pass = 1; pass <= 4; pass++) {
        await testPageThoroughly(browser, pageName, pass);
        
        if (pass === 4) {
          console.log(`\n⏸️  Completed ${pageName}`);
          await wait(10);
        }
      }
    }
    
    addToReport(`\n# ✅ Testing Complete\n\n${new Date().toISOString()}\n`);
    console.log('\n✅ ALL DONE\n');
    
  } catch (error) {
    console.error('❌ FATAL:', error);
    addToReport(`\n# ❌ FATAL ERROR\n\n${error.stack}\n`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
