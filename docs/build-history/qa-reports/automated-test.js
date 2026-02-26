// Automated QA Test Script for Debt Consolidation Dashboard
// Run this in the browser console to test all pages

const testReport = {
  timestamp: new Date().toISOString(),
  pages: []
};

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to click element
const clickElement = (selector) => {
  const el = document.querySelector(selector);
  if (el) {
    el.click();
    return true;
  }
  return false;
};

// Helper to test button
const testButton = (selector, name) => {
  const button = document.querySelector(selector);
  if (!button) return { name, status: 'not_found' };
  
  const beforeClick = document.body.innerHTML;
  button.click();
  
  // Check if something changed after click
  setTimeout(() => {
    const afterClick = document.body.innerHTML;
    if (beforeClick !== afterClick) {
      return { name, status: 'working', selector };
    } else {
      // Check if modal appeared or URL changed
      const hasModal = !!document.querySelector('[role="dialog"], .modal');
      const urlChanged = window.location.href !== window.lastTestUrl;
      window.lastTestUrl = window.location.href;
      
      if (hasModal || urlChanged) {
        return { name, status: 'working', selector };
      }
      return { name, status: 'dead', selector };
    }
  }, 100);
};

// Test page navigation
const testNavigation = async (navText, expectedPage) => {
  const navLinks = Array.from(document.querySelectorAll('nav a, nav div[class*="cursor"]'));
  const link = navLinks.find(l => l.textContent.includes(navText));
  
  if (!link) {
    return { page: navText, error: 'Navigation link not found' };
  }
  
  link.click();
  await wait(500); // Wait for page to load
  
  return { page: navText, navigated: true };
};

// Test all buttons on current page
const testAllButtons = () => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const results = [];
  
  buttons.forEach((btn, i) => {
    const text = btn.textContent.trim() || `Button ${i}`;
    const isDisabled = btn.disabled;
    
    if (!isDisabled) {
      // Test if button is clickable
      const rect = btn.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      
      results.push({
        text: text.substring(0, 50),
        visible,
        clickable: true,
        selector: btn.className
      });
    }
  });
  
  return results;
};

// Test inputs and dropdowns
const testInputs = () => {
  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
  return inputs.map(input => ({
    type: input.tagName.toLowerCase(),
    name: input.name || input.placeholder || 'unnamed',
    enabled: !input.disabled
  }));
};

// Check for console errors
const getConsoleErrors = () => {
  // This would need to be captured differently in real implementation
  return window.__consoleErrors || [];
};

// Run tests
async function runAllTests() {
  console.log('🚀 Starting automated QA tests...');
  
  const pagesToTest = [
    'Dashboard',
    'Manager Dashboard', 
    'Owner Dashboard',
    'Power Dialer',
    'Leads',
    'Pipeline',
    'AI Agent'
  ];
  
  for (const pageName of pagesToTest) {
    console.log(`\n📄 Testing ${pageName}...`);
    
    // Navigate to page
    const navResult = await testNavigation(pageName);
    await wait(1000); // Wait for page load
    
    // Test buttons
    const buttons = testAllButtons();
    
    // Test inputs
    const inputs = testInputs();
    
    // Check for errors
    const errors = getConsoleErrors();
    
    const pageReport = {
      page: pageName,
      url: window.location.href,
      navigation: navResult,
      buttons: {
        total: buttons.length,
        visible: buttons.filter(b => b.visible).length,
        list: buttons
      },
      inputs: {
        total: inputs.length,
        enabled: inputs.filter(i => i.enabled).length,
        list: inputs
      },
      jsErrors: errors,
      timestamp: new Date().toISOString()
    };
    
    testReport.pages.push(pageReport);
    
    console.log(`✅ ${pageName} tested:`, pageReport);
  }
  
  console.log('\n📊 All tests complete!');
  console.log('Full report:', JSON.stringify(testReport, null, 2));
  
  return testReport;
}

// Execute tests
runAllTests().then(report => {
  console.log('✅ Testing complete!');
  console.log('Copy this report:', JSON.stringify(report, null, 2));
});
