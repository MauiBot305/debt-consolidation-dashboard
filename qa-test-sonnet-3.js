#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DASHBOARD_URL = 'https://3a154e03.debt-consolidation-dashboard-8e1.pages.dev';
const REPORT_PATH = path.join(process.env.HOME, 'Projects/debt-consolidation-dashboard/qa-reports/sonnet-browser-3.md');

// Pages to test (4 passes each)
const PAGES_TO_TEST = [
  'Gamification',
  'Automation',
  'TeamManagement',
  'Settings',
  'ClientPortal',
  'DataImport'
];

// Test results
let report = '# QA Test Report - SONNET-BROWSER-3\n\n';
report += `**Date:** ${new Date().toISOString()}\n`;
report += `**Dashboard URL:** ${DASHBOARD_URL}\n\n`;
report += '---\n\n';

async function setupAuth(page) {
  console.log('Setting up authentication...');
  await page.evaluate(() => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: 'owner@demo.com',
      name: 'Owner',
      role: 'owner',
      password: 'demo'
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
}

async function getConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

async function testPage(page, pageName, passNumber) {
  console.log(`\n=== Testing ${pageName} - Pass ${passNumber}/4 ===`);
  
  const results = {
    pageName,
    passNumber,
    jsErrors: [],
    deadButtons: [],
    brokenUI: [],
    working: [],
    issues: []
  };

  try {
    // Navigate to page via sidebar
    console.log(`Navigating to ${pageName}...`);
    
    // Try to find and click the sidebar link
    const sidebarSelectors = [
      `text="${pageName}"`,
      `[href*="${pageName.toLowerCase()}"]`,
      `a:has-text("${pageName}")`,
      `button:has-text("${pageName}")`
    ];
    
    let navigated = false;
    for (const selector of sidebarSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForTimeout(1500);
          navigated = true;
          results.working.push(`Navigation via sidebar to ${pageName}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!navigated) {
      results.issues.push(`Could not find sidebar link for ${pageName}`);
      results.brokenUI.push(`Missing or hidden sidebar link for ${pageName}`);
    }

    // Check console errors
    console.log('Checking console errors...');
    const consoleLogs = [];
    const errorListener = (msg) => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    };
    page.on('console', errorListener);
    
    await page.waitForTimeout(1000);
    
    if (consoleLogs.length > 0) {
      results.jsErrors = consoleLogs;
    } else {
      results.working.push('No console errors detected');
    }

    // Test all visible buttons
    console.log('Testing buttons...');
    const buttons = await page.locator('button:visible').all();
    console.log(`Found ${buttons.length} visible buttons`);
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const button = buttons[i];
        const buttonText = await button.textContent().catch(() => '');
        const buttonName = buttonText.trim() || `Button ${i+1}`;
        
        // Check if button is interactive
        const isDisabled = await button.isDisabled();
        if (isDisabled) {
          results.working.push(`Button "${buttonName}" properly disabled`);
          continue;
        }

        // Click and check for any response
        const beforeUrl = page.url();
        await button.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        const afterUrl = page.url();
        
        // Check if something changed (URL, modal opened, etc)
        const modalVisible = await page.locator('[role="dialog"], .modal, [class*="modal"]').isVisible().catch(() => false);
        
        if (beforeUrl !== afterUrl || modalVisible) {
          results.working.push(`Button "${buttonName}" triggered action`);
          
          // If modal opened, close it
          if (modalVisible) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
          
          // If URL changed, go back
          if (beforeUrl !== afterUrl) {
            await page.goBack();
            await page.waitForTimeout(500);
          }
        } else {
          // Check if button has onclick or looks functional
          const hasOnClick = await button.evaluate(el => 
            el.onclick !== null || 
            el.getAttribute('onclick') !== null ||
            el.classList.contains('cursor-pointer')
          ).catch(() => false);
          
          if (!hasOnClick) {
            results.deadButtons.push(`Button "${buttonName}" - no visible action`);
          } else {
            results.working.push(`Button "${buttonName}" appears functional`);
          }
        }
      } catch (error) {
        console.log(`Error testing button ${i+1}: ${error.message}`);
      }
    }

    // Test dropdowns/selects
    console.log('Testing dropdowns...');
    const selects = await page.locator('select:visible').all();
    for (let i = 0; i < selects.length; i++) {
      try {
        const select = selects[i];
        const options = await select.locator('option').count();
        if (options > 1) {
          await select.selectOption({ index: 1 });
          results.working.push(`Dropdown ${i+1} functional (${options} options)`);
        }
      } catch (error) {
        results.issues.push(`Dropdown ${i+1} not functional: ${error.message}`);
      }
    }

    // Test inputs
    console.log('Testing inputs...');
    const inputs = await page.locator('input:visible[type="text"], input:visible[type="email"], input:visible[type="search"]').all();
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      try {
        const input = inputs[i];
        await input.fill('test');
        await input.clear();
        results.working.push(`Input ${i+1} functional`);
      } catch (error) {
        results.issues.push(`Input ${i+1} not functional: ${error.message}`);
      }
    }

    // Check for data rendering
    console.log('Checking data rendering...');
    const hasData = await page.evaluate(() => {
      const statCards = document.querySelectorAll('[class*="stat"], [class*="card"], [class*="metric"]');
      const tables = document.querySelectorAll('table tbody tr');
      const charts = document.querySelectorAll('[class*="chart"], canvas, svg');
      
      return {
        statCards: statCards.length,
        tableRows: tables.length,
        charts: charts.length
      };
    });
    
    if (hasData.statCards > 0) {
      results.working.push(`${hasData.statCards} stat cards rendered`);
    }
    if (hasData.tableRows > 0) {
      results.working.push(`${hasData.tableRows} table rows rendered`);
    }
    if (hasData.charts > 0) {
      results.working.push(`${hasData.charts} charts/visualizations rendered`);
    }
    
    if (hasData.statCards === 0 && hasData.tableRows === 0 && hasData.charts === 0) {
      results.issues.push('No data rendering detected (no stats, tables, or charts found)');
    }

    // Check visual layout
    console.log('Checking layout...');
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      
      for (const el of elements) {
        if (!el.offsetParent) continue; // Skip hidden elements
        
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check for overlapping issues
        if (rect.width > window.innerWidth + 50) {
          issues.push(`Element exceeds viewport width: ${el.tagName}.${el.className}`);
        }
        
        // Check for unreadable text (too small or no contrast)
        if (el.textContent && el.textContent.trim()) {
          const fontSize = parseFloat(style.fontSize);
          if (fontSize < 10) {
            issues.push(`Text too small (${fontSize}px): ${el.tagName}.${el.className}`);
          }
        }
      }
      
      return issues.slice(0, 5); // Limit to 5 issues
    });
    
    if (layoutIssues.length > 0) {
      results.brokenUI.push(...layoutIssues);
    } else {
      results.working.push('No major layout issues detected');
    }

  } catch (error) {
    results.issues.push(`Fatal error during test: ${error.message}`);
  }

  return results;
}

async function testCrossCuttingFeatures(browser, passNumber) {
  console.log(`\n=== Testing Cross-Cutting Features - Pass ${passNumber}/2 ===`);
  
  const results = {
    loginLogout: { working: [], issues: [] },
    sidebarNav: { working: [], issues: [] },
    roleAccess: { working: [], issues: [] },
    cmdK: { working: [], issues: [] },
    notifications: { working: [], issues: [] },
    breadcrumbs: { working: [], issues: [] },
    mobile: { working: [], issues: [] }
  };

  // Test Login/Logout Flow
  console.log('\nTesting login/logout flow...');
  const roles = ['agent', 'manager', 'owner'];
  
  for (const role of roles) {
    const page = await browser.newPage();
    try {
      await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
      await page.evaluate((r) => {
        localStorage.setItem('debt_current_user', JSON.stringify({
          email: `${r}@demo.com`,
          name: r.charAt(0).toUpperCase() + r.slice(1),
          role: r,
          password: 'demo'
        }));
      }, role);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      
      const currentUrl = page.url();
      results.loginLogout.working.push(`${role} login successful`);
      
      // Try to logout
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        '[data-logout]',
        'text="Logout"'
      ];
      
      for (const selector of logoutSelectors) {
        try {
          const logoutBtn = await page.locator(selector).first();
          if (await logoutBtn.isVisible({ timeout: 1000 })) {
            await logoutBtn.click();
            await page.waitForTimeout(1000);
            results.loginLogout.working.push(`${role} logout successful`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
    } catch (error) {
      results.loginLogout.issues.push(`${role} login/logout failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Test Sidebar Navigation
  console.log('\nTesting sidebar navigation...');
  const page = await browser.newPage();
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await setupAuth(page);
  
  const sidebarLinks = await page.locator('nav a, [role="navigation"] a, aside a').all();
  console.log(`Found ${sidebarLinks.length} sidebar links`);
  
  for (let i = 0; i < Math.min(sidebarLinks.length, 15); i++) {
    try {
      const link = sidebarLinks[i];
      const linkText = await link.textContent();
      const beforeUrl = page.url();
      
      await link.click({ timeout: 2000 });
      await page.waitForTimeout(1000);
      
      const afterUrl = page.url();
      if (beforeUrl !== afterUrl || await page.locator('main').isVisible()) {
        results.sidebarNav.working.push(`Link "${linkText.trim()}" works`);
      } else {
        results.sidebarNav.issues.push(`Link "${linkText.trim()}" didn't navigate`);
      }
    } catch (error) {
      console.log(`Sidebar link ${i} error: ${error.message}`);
    }
  }

  // Test Role-Based Access
  console.log('\nTesting role-based access...');
  
  // Test as agent (shouldn't see AI Agent page)
  const agentPage = await browser.newPage();
  await agentPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await agentPage.evaluate(() => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: 'agent@demo.com',
      name: 'Agent',
      role: 'agent',
      password: 'demo'
    }));
  });
  await agentPage.reload({ waitUntil: 'networkidle' });
  await agentPage.waitForTimeout(1500);
  
  const hasAIAgentAsAgent = await agentPage.locator('text="AI Agent"').isVisible().catch(() => false);
  if (!hasAIAgentAsAgent) {
    results.roleAccess.working.push('Agent correctly cannot see AI Agent page');
  } else {
    results.roleAccess.issues.push('Agent can see AI Agent page (should be restricted)');
  }
  await agentPage.close();
  
  // Test as manager (should see AI Agent page)
  const managerPage = await browser.newPage();
  await managerPage.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await managerPage.evaluate(() => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: 'manager@demo.com',
      name: 'Manager',
      role: 'manager',
      password: 'demo'
    }));
  });
  await managerPage.reload({ waitUntil: 'networkidle' });
  await managerPage.waitForTimeout(1500);
  
  const hasAIAgentAsManager = await managerPage.locator('text="AI Agent"').isVisible().catch(() => false);
  if (hasAIAgentAsManager) {
    results.roleAccess.working.push('Manager correctly can see AI Agent page');
  } else {
    results.roleAccess.issues.push('Manager cannot see AI Agent page (should have access)');
  }
  await managerPage.close();

  // Test Cmd+K search
  console.log('\nTesting Cmd+K search...');
  try {
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
    
    const searchVisible = await page.locator('[role="dialog"], [class*="search"], [class*="command"]').isVisible().catch(() => false);
    if (searchVisible) {
      results.cmdK.working.push('Cmd+K search opens');
      await page.keyboard.press('Escape');
    } else {
      results.cmdK.issues.push('Cmd+K search not found or not working');
    }
  } catch (error) {
    results.cmdK.issues.push(`Cmd+K error: ${error.message}`);
  }

  // Test Notification Bell
  console.log('\nTesting notification bell...');
  try {
    const bellSelectors = [
      '[data-notification]',
      '[class*="notification"]',
      'button:has([class*="bell"])',
      'svg[class*="bell"]'
    ];
    
    for (const selector of bellSelectors) {
      try {
        const bell = await page.locator(selector).first();
        if (await bell.isVisible({ timeout: 1000 })) {
          await bell.click();
          await page.waitForTimeout(500);
          results.notifications.working.push('Notification bell functional');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (results.notifications.working.length === 0) {
      results.notifications.issues.push('Notification bell not found');
    }
  } catch (error) {
    results.notifications.issues.push(`Notification error: ${error.message}`);
  }

  // Test Breadcrumb Updates
  console.log('\nTesting breadcrumbs...');
  try {
    const breadcrumb = await page.locator('[class*="breadcrumb"], nav[aria-label="breadcrumb"]').first();
    if (await breadcrumb.isVisible({ timeout: 2000 })) {
      const initialText = await breadcrumb.textContent();
      
      // Navigate to a different page
      const firstLink = await page.locator('nav a').first();
      await firstLink.click();
      await page.waitForTimeout(1000);
      
      const updatedText = await breadcrumb.textContent();
      if (initialText !== updatedText) {
        results.breadcrumbs.working.push('Breadcrumbs update on navigation');
      } else {
        results.breadcrumbs.issues.push('Breadcrumbs do not update');
      }
    } else {
      results.breadcrumbs.issues.push('Breadcrumbs not found');
    }
  } catch (error) {
    results.breadcrumbs.issues.push(`Breadcrumb error: ${error.message}`);
  }

  // Test Mobile Responsiveness
  console.log('\nTesting mobile responsiveness...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  try {
    const mobileIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      
      for (const el of elements) {
        if (!el.offsetParent) continue;
        const rect = el.getBoundingClientRect();
        
        if (rect.width > 375 + 20) { // Allow small overflow
          issues.push(`Element overflows mobile viewport: ${el.tagName}.${el.className}`);
        }
      }
      
      return issues.slice(0, 5);
    });
    
    if (mobileIssues.length > 0) {
      results.mobile.issues.push(...mobileIssues);
    } else {
      results.mobile.working.push('No major mobile layout issues');
    }
    
    // Check if menu is hamburger on mobile
    const hasHamburger = await page.locator('[class*="hamburger"], [class*="menu-toggle"], button:has(svg[class*="menu"])').isVisible().catch(() => false);
    if (hasHamburger) {
      results.mobile.working.push('Mobile hamburger menu present');
    } else {
      results.mobile.issues.push('No mobile hamburger menu found');
    }
  } catch (error) {
    results.mobile.issues.push(`Mobile test error: ${error.message}`);
  }

  await page.close();
  return results;
}

function formatResults(results) {
  let output = `## ${results.pageName} - Pass ${results.passNumber}/4\n\n`;
  
  output += `**JS Errors:** ${results.jsErrors.length > 0 ? '\n' + results.jsErrors.map(e => `- ${e}`).join('\n') : 'none'}\n\n`;
  output += `**Dead Buttons:** ${results.deadButtons.length > 0 ? '\n' + results.deadButtons.map(b => `- ${b}`).join('\n') : 'none'}\n\n`;
  output += `**Broken UI:** ${results.brokenUI.length > 0 ? '\n' + results.brokenUI.map(u => `- ${u}`).join('\n') : 'none'}\n\n`;
  output += `**Working:** \n${results.working.map(w => `- ${w}`).join('\n')}\n\n`;
  
  if (results.issues.length > 0) {
    output += `**Issues:** \n${results.issues.map(i => `- ${i}`).join('\n')}\n\n`;
  }
  
  output += '---\n\n';
  return output;
}

function formatCrossCuttingResults(results) {
  let output = '# Cross-Cutting Feature Tests\n\n';
  
  const sections = [
    { title: 'Login/Logout Flow', key: 'loginLogout' },
    { title: 'Sidebar Navigation', key: 'sidebarNav' },
    { title: 'Role-Based Access', key: 'roleAccess' },
    { title: 'Cmd+K Search', key: 'cmdK' },
    { title: 'Notification Bell', key: 'notifications' },
    { title: 'Breadcrumbs', key: 'breadcrumbs' },
    { title: 'Mobile Responsiveness', key: 'mobile' }
  ];
  
  for (const section of sections) {
    output += `## ${section.title}\n\n`;
    const data = results[section.key];
    
    if (data.working.length > 0) {
      output += `**Working:**\n${data.working.map(w => `- ${w}`).join('\n')}\n\n`;
    }
    
    if (data.issues.length > 0) {
      output += `**Issues:**\n${data.issues.map(i => `- ${i}`).join('\n')}\n\n`;
    }
    
    output += '---\n\n';
  }
  
  return output;
}

async function main() {
  console.log('Starting QA Tests...');
  console.log(`Dashboard: ${DASHBOARD_URL}`);
  console.log(`Report will be saved to: ${REPORT_PATH}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });

  try {
    // Test each page 4 times
    for (const pageName of PAGES_TO_TEST) {
      for (let pass = 1; pass <= 4; pass++) {
        const page = await browser.newPage();
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
        await setupAuth(page);
        
        const results = await testPage(page, pageName, pass);
        report += formatResults(results);
        
        await page.close();
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Test cross-cutting features 2 times
    for (let pass = 1; pass <= 2; pass++) {
      console.log(`\n=== Cross-Cutting Features Pass ${pass}/2 ===`);
      const crossResults = await testCrossCuttingFeatures(browser, pass);
      if (pass === 1) {
        report += formatCrossCuttingResults(crossResults);
      }
    }

    // Save report
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\n✅ Report saved to: ${REPORT_PATH}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    report += `\n\n## FATAL ERROR\n\n${error.message}\n${error.stack}\n`;
    fs.writeFileSync(REPORT_PATH, report);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
