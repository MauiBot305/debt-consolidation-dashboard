// Auto-Enhance Script - Adds full functionality to all dashboard pages
// Include this script in index.html or each page's <head>

(function() {
  'use strict';

  // Detect current page
  function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('Compliance') || document.getElementById('compliance-page')) return 'compliance';
    if (path.includes('Financial') || document.getElementById('financial-page')) return 'financial';
    if (path.includes('Marketing') || document.getElementById('marketing-page')) return 'marketing';
    if (path.includes('Analytics') || document.getElementById('analytics-page')) return 'analytics';
    if (path.includes('Gamification') || document.getElementById('gamification-page')) return 'gamification';
    return null;
  }

  // Load script dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize enhancements
  async function init() {
    try {
      // Load DebtDB storage layer first
// console.log('✓ DebtDB storage loaded');

      const page = getCurrentPage();
      if (!page) {
// console.log('No specific page detected');
        return;
      }

      // Load page-specific functionality
      const scriptPath = `/pages/${page}-functions.js`;
      await loadScript(scriptPath);
// console.log(`✓ ${page} functions loaded`);

      // Trigger page-specific init if available
      const initFn = window[`${page.charAt(0).toUpperCase() + page.slice(1)}Functions`]?.init;
      if (typeof initFn === 'function') {
        initFn();
// console.log(`✓ ${page} initialized`);
      }
    } catch (error) {
      console.warn('Auto-enhance error:', error);
    }
  }

  // Wait for DOM then initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
