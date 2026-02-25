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

async function loginAs(page, role) {
  console.log(`🔐 Logging in as ${role}...`);
  
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await wait(2);
  
  // Fill in email
  const email = `${role}@demo.com`;
  await page.fill('input[type="email"], input[placeholder*="email" i]', email);
  await wait(1);
  
  // Fill in password
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'demo');
  await wait(1);
  
  // Click Sign In button
  await page.click('button:has-text("Sign In")');
  
  // Wait for dashboard to load
  await page.waitForLoadState('networkidle');
  await wait(5); // Extra time for client-side rendering
  
  console.log(`✅ Logged in as ${role}`);
}

async function capturePageStructure(page, roleName) {
  console.log(`📸 Capturing ${roleName} dashboard...`);
  
  // Take screenshot
  const screenshotPath = path.join(SCREENSHOT_DIR, `${roleName}-dashboard.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   Saved: ${screenshotPath}`);
  
  // Get ALL visible links
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(link => ({
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
      classes: link.className,
      visible: link.offsetParent !== null
    })).filter(l => l.text.length > 0 && l.visible);
  });
  
  // Get ALL visible buttons
  const allButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(btn => ({
      text: btn.textContent.trim(),
      classes: btn.className,
      visible: btn.offsetParent !== null
    })).filter(b => b.text.length > 0 && b.visible);
  });
  
  console.log(`   Found: ${allLinks.length} links, ${allButtons.length} buttons`);
  
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
  await loginAs(agentPage, 'agent');
  
  const agentStructure = await capturePageStructure(agentPage, 'agent');
  
  addToReport(`## Agent Role\n\n`);
  addToReport(`Screenshot: \`screenshots/agent-dashboard.png\`\n\n`);
  addToReport(`### Navigation Links (${agentStructure.allLinks.length} total)\n\n`);
  agentStructure.allLinks.slice(0, 20).forEach(link => {
    addToReport(`- **${link.text}** → \`${link.href}\`\n`);
  });
  addToReport('\n');
  
  // Check for AI Agent
  const hasAIAgent = agentStructure.allLinks.some(l => 
    l.text.toLowerCase().includes('ai agent') || 
    l.text.toLowerCase().includes('aiagent') ||
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
  await loginAs(managerPage, 'manager');
  
  const managerStructure = await capturePageStructure(managerPage, 'manager');
  
  addToReport(`## Manager Role\n\n`);
  addToReport(`Screenshot: \`screenshots/manager-dashboard.png\`\n\n`);
  addToReport(`### Navigation Links (${managerStructure.allLinks.length} total)\n\n`);
  managerStructure.allLinks.slice(0, 20).forEach(link => {
    addToReport(`- **${link.text}** → \`${link.href}\`\n`);
  });
  addToReport('\n');
  
  const managerHasAIAgent = managerStructure.allLinks.some(l => 
    l.text.toLowerCase().includes('ai agent') || 
    l.text.toLowerCase().includes('aiagent') ||
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
  await loginAs(ownerPage, 'owner');
  
  const ownerStructure = await capturePageStructure(ownerPage, 'owner');
  
  addToReport(`## Owner Role\n\n`);
  addToReport(`Screenshot: \`screenshots/owner-dashboard.png\`\n\n`);
  addToReport(`### Navigation Links (${ownerStructure.allLinks.length} total)\n\n`);
  ownerStructure.allLinks.slice(0, 20).forEach(link => {
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
    }
  });
  
  try {
    await loginAs(page, 'owner');
    
    // Find and click the page link
    console.log(`📍 Navigating to ${pageName}...`);
    const clicked = await page.evaluate((name) => {
      const links = Array.from(document.querySelectorAll('a, button'));
      for (const link of links) {
        const text = link.textContent.trim();
        if (text === name || text.includes(name)) {
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
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName.toLowerCase().replace(/\s+/g, '-')}-pass${passNumber}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    addToReport(`Screenshot: \`screenshots/${path.basename(screenshotPath)}\`\n\n`);
    
    // Get page elements
    const buttons = await page.locator('button:visible').all();
    const inputs = await page.locator('input:visible').all();
    
    addToReport(`## Elements Found\n\n`);
    addToReport(`- ${buttons.length} buttons\n`);
    addToReport(`- ${inputs.length} inputs\n\n`);
    
    console.log(`   Found: ${buttons.length} buttons, ${inputs.length} inputs`);
    
    // Test buttons (limit to 3 per pass)
    addToReport(`## Button Tests\n\n`);
    const buttonLimit = Math.min(buttons.length, 3);
    
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
          console.log('   Disabled - skipped');
          await wait(5);
          continue;
        }
        
        // Clear errors
        consoleErrors.length = 0;
        
        // Click
        console.log('   Clicking...');
        const beforeUrl = page.url();
        await button.click({ timeout: 3000 }).catch(e => console.log(`   Click error: ${e.message}`));
        await wait(3);
        const afterUrl = page.url();
        
        const modalVisible = await page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false);
        
        if (beforeUrl !== afterUrl) {
          addToReport(`- ✅ Navigated\n`);
          console.log('   ✅ Navigated');
          await page.goBack();
          await wait(2);
        } else if (modalVisible) {
          addToReport(`- ✅ Opened modal\n`);
          console.log('   ✅ Modal opened');
          await page.keyboard.press('Escape');
          await wait(2);
        } else if (consoleErrors.length > 0) {
          addToReport(`- ❌ Console errors\n`);
          console.log(`   ❌ ${consoleErrors.length} errors`);
        } else {
          addToReport(`- ⚠️  No visible effect\n`);
          console.log('   ⚠️  No effect');
        }
        
        addToReport('\n');
        
        console.log('   ⏳ 30s wait...');
        await wait(30);
        
      } catch (error) {
        addToReport(`- ❌ Error: ${error.message}\n\n`);
        console.log(`   ❌ Error: ${error.message}`);
      }
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
    slowMo: 500
  });

  try {
    // Step 1: Test role access and discover pages
    const availablePages = await testRoleBasedAccess(browser);
    
    console.log('\n📋 Available Pages:', availablePages.slice(0, 10).join(', '));
    
    // Step 2: Test specific pages
    const pagesToTest = ['Gamification', 'Automation', 'Team Management', 'Settings', 'Client Portal', 'Data Import'];
    
    for (const pageName of pagesToTest) {
      // Check if page exists in available pages
      const found = availablePages.some(p => p.toLowerCase().includes(pageName.toLowerCase()));
      if (!found) {
        console.log(`⚠️  Skipping "${pageName}" - not found in sidebar`);
        continue;
      }
      
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
