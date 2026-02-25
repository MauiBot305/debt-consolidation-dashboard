// QA Browser Test Script — paste into browser console after login
// Tests all 19 pages, captures errors, checks button functionality

const pages = [
  'AgentDashboard', 'ManagerDashboard', 'OwnerDashboard',
  'PowerDialer', 'CRMLeads', 'DealPipeline', 'CaseManagement',
  'CallHistory', 'Analytics', 'AICoach', 'Compliance', 'Financial',
  'Marketing', 'Gamification', 'Automation', 'TeamManagement',
  'Settings', 'ClientPortal', 'DataImport'
];

const errors = [];
const deadButtons = [];

window.addEventListener('error', (e) => {
  errors.push({ page: window.__currentPage, error: e.message, source: e.filename, line: e.lineno });
});

async function testAllPages() {
  console.log('🧪 Starting QA test of all 19 pages...');
  
  for (const page of pages) {
    window.__currentPage = page;
    console.log(`📄 Testing: ${page}`);
    
    // Navigate
    try {
      await App.loadPage(page);
      await new Promise(r => setTimeout(r, 1500));
    } catch(e) {
      errors.push({ page, error: `loadPage failed: ${e.message}` });
      continue;
    }
    
    // Check all buttons
    const buttons = document.querySelectorAll('#mainContent button[onclick], #mainContent [onclick]');
    for (const btn of buttons) {
      const onclick = btn.getAttribute('onclick');
      if (onclick) {
        const funcName = onclick.match(/^(\w+)/);
        if (funcName && typeof window[funcName[1]] !== 'function') {
          deadButtons.push({ page, button: btn.textContent.trim().substring(0,30), onclick, func: funcName[1] });
        }
      }
    }
  }
  
  // Navigate each page AGAIN (tests re-navigation / IIFE re-execution)
  console.log('🔄 Round 2: Re-navigation test...');
  for (const page of pages) {
    window.__currentPage = page + '_round2';
    try {
      await App.loadPage(page);
      await new Promise(r => setTimeout(r, 800));
    } catch(e) {
      errors.push({ page: page + '_round2', error: `re-nav failed: ${e.message}` });
    }
  }
  
  console.log('\n========== QA RESULTS ==========');
  console.log(`❌ JS Errors: ${errors.length}`);
  errors.forEach(e => console.log(`  [${e.page}] ${e.error}`));
  console.log(`💀 Dead Buttons: ${deadButtons.length}`);
  deadButtons.forEach(b => console.log(`  [${b.page}] "${b.button}" → ${b.func}() not defined`));
  console.log(`✅ Pages tested: ${pages.length} × 2 navigations`);
  console.log('================================');
  
  return { errors, deadButtons, totalPages: pages.length };
}

testAllPages();
