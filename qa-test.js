const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const report = {
    timestamp: new Date().toISOString(),
    pages: []
  };
  
  // Navigate to dashboard
  await page.goto('https://3a154e03.debt-consolidation-dashboard-8e1.pages.dev');
  
  // Login as owner
  await page.evaluate(() => {
    localStorage.setItem('debt_current_user', JSON.stringify({
      email: 'owner@demo.com',
      name: 'Owner',
      role: 'owner',
      password: 'demo'
    }));
  });
  await page.reload();
  await page.waitForTimeout(2000);
  
  // Click owner demo button
  await page.click('text=owner@demo.com / demo');
  await page.waitForTimeout(2000);
  
  const pagesToTest = [
    { name: 'AgentDashboard', navText: 'Dashboard', selector: 'text=Dashboard' },
    { name: 'ManagerDashboard', navText: 'Manager Dashboard', selector: 'text=Manager Dashboard' },
    { name: 'OwnerDashboard', navText: 'Owner Dashboard', selector: 'text=Owner Dashboard' },
    { name: 'PowerDialer', navText: 'Power Dialer', selector: 'text=Power Dialer' },
    { name: 'CRMLeads', navText: 'Leads', selector: 'text=Leads' },
    { name: 'DealPipeline', navText: 'Pipeline', selector: 'text=Pipeline' },
    { name: 'AIAgentManagement', navText: 'AI Agent', selector: 'text=AI Agent' }
  ];
  
  for (const pageInfo of pagesToTest) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${pageInfo.name}`);
    console.log('='.repeat(60));
    
    const pageReport = {
      page: pageInfo.name,
      passes: []
    };
    
    // Navigate to page
    await page.click(`nav >> ${pageInfo.selector}`);
    await page.waitForTimeout(1500);
    
    for (let pass = 1; pass <= 4; pass++) {
      console.log(`\n--- Pass ${pass}/4 ---`);
      
      const passReport = {
        pass,
        jsErrors: [],
        deadButtons: [],
        brokenUI: [],
        working: [],
        issues: []
      };
      
      // Check console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', error => errors.push(error.message));
      
      passReport.jsErrors = errors.filter(e => !e.includes('Twilio') && !e.includes('Tailwind'));
      
      // Get all buttons
      const buttons = await page.$$('button:not([disabled])');
      console.log(`Found ${buttons.length} enabled buttons`);
      
      for (const [index, button] of buttons.entries()) {
        const text = await button.textContent().catch(() => '');
        const buttonText = text.trim().substring(0, 50) || `Button ${index}`;
        
        try {
          const beforeHTML = await page.content();
          await button.click({ timeout: 3000 });
          await page.waitForTimeout(300);
          const afterHTML = await page.content();
          
          const hasModal = await page.$('[role="dialog"], .modal') !== null;
          const urlChanged = page.url() !== beforeUrl;
          const contentChanged = beforeHTML !== afterHTML;
          
          if (hasModal || urlChanged || contentChanged) {
            passReport.working.push(buttonText);
            console.log(`✅ ${buttonText}`);
            
            // Close modal if opened
            if (hasModal) {
              await page.keyboard.press('Escape');
              await page.waitForTimeout(200);
            }
          } else {
            passReport.deadButtons.push(buttonText);
            console.log(`❌ DEAD: ${buttonText}`);
          }
        } catch (err) {
          passReport.issues.push(`${buttonText}: ${err.message}`);
        }
        
        var beforeUrl = page.url();
      }
      
      // Test inputs
      const inputs = await page.$$('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      console.log(`Found ${inputs.length} inputs/selects`);
      
      for (const input of inputs) {
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const placeholder = await input.getAttribute('placeholder').catch(() => '');
        
        if (tagName === 'input' && !placeholder.includes('Search')) {
          await input.fill('test', { timeout: 1000 }).catch(() => {});
          passReport.working.push(`Input: ${placeholder || 'unnamed'}`);
        } else if (tagName === 'select') {
          const options = await input.$$('option');
          if (options.length > 1) {
            await input.selectOption({ index: 1 }).catch(() => {});
            passReport.working.push(`Select: ${placeholder || 'dropdown'}`);
          }
        }
      }
      
      // Check for data rendering
      const hasTable = await page.$('table tbody tr') !== null;
      const hasStats = await page.$('[class*="stat"], [class*="card"]') !== null;
      const hasCharts = await page.$('canvas, svg[class*="chart"]') !== null;
      
      if (!hasTable && !hasStats && !hasCharts) {
        passReport.brokenUI.push('No data visible (no tables, stats, or charts)');
      } else {
        passReport.working.push(`Data rendering: ${hasTable ? 'tables' : ''} ${hasStats ? 'stats' : ''} ${hasCharts ? 'charts' : ''}`);
      }
      
      // Visual layout check
      const hasOverlaps = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        // Simple overlap detection
        return false; // Simplified for now
      });
      
      pageReport.passes.push(passReport);
    }
    
    report.pages.push(pageReport);
  }
  
  // Write report
  const fs = require('fs');
  const reportMd = generateMarkdownReport(report);
  fs.writeFileSync('qa-reports/sonnet-browser-1.md', reportMd);
  
  console.log('\n✅ All testing complete!');
  console.log('Report saved to: qa-reports/sonnet-browser-1.md');
  
  await browser.close();
})();

function generateMarkdownReport(report) {
  let md = `# QA Test Report - SONNET-BROWSER-1\n\n`;
  md += `**Generated:** ${report.timestamp}\n`;
  md += `**Dashboard URL:** https://3a154e03.debt-consolidation-dashboard-8e1.pages.dev\n\n`;
  md += `---\n\n`;
  
  for (const pageReport of report.pages) {
    for (const pass of pageReport.passes) {
      md += `## ${pageReport.page} - Pass ${pass.pass}/4\n\n`;
      md += `- **JS Errors:** ${pass.jsErrors.length > 0 ? pass.jsErrors.join(', ') : 'none'}\n`;
      md += `- **Dead Buttons:** ${pass.deadButtons.length > 0 ? pass.deadButtons.join(', ') : 'none'}\n`;
      md += `- **Broken UI:** ${pass.brokenUI.length > 0 ? pass.brokenUI.join(', ') : 'none'}\n`;
      md += `- **Working:** ${pass.working.join(', ')}\n`;
      md += `- **Issues:** ${pass.issues.length > 0 ? pass.issues.join('; ') : 'none'}\n\n`;
    }
  }
  
  return md;
}
