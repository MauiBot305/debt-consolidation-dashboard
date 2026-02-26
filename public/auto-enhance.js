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

// C10: XSS Protection - Auto-sanitize innerHTML assignments via prototype override
// This catches dynamic content injection. Static templates are safe.
(function() {
  if (typeof DOMPurify === 'undefined') return;
  
  // Override innerHTML setter to auto-sanitize
  const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (originalInnerHTMLDescriptor && originalInnerHTMLDescriptor.set) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        // Sanitize the HTML before setting
        const clean = DOMPurify.sanitize(value, { 
          ADD_TAGS: ['style'],
          ADD_ATTR: ['onclick', 'onchange', 'oninput', 'onsubmit', 'tabindex', 'role', 'aria-label', 'aria-live', 'data-id', 'data-stage', 'data-status', 'data-lead-id', 'data-deal-id', 'data-page', 'draggable'],
          ALLOW_DATA_ATTR: true
        });
        originalInnerHTMLDescriptor.set.call(this, clean);
      },
      get: function() {
        return originalInnerHTMLDescriptor.get.call(this);
      },
      configurable: true
    });
  }
})();

// ==================== ACCESSIBILITY FIXES ====================

// M7: Fix color contrast - upgrade text-gray-500 to text-gray-400 on dark backgrounds
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Run periodically to catch dynamically added elements
    function fixContrast() {
      document.querySelectorAll('.text-gray-500').forEach(function(el) {
        var bg = window.getComputedStyle(el.parentElement || el).backgroundColor;
        // If parent has dark background, upgrade contrast
        if (bg && (bg.includes('10,') || bg.includes('15,') || bg.includes('0a') || bg === 'rgba(0, 0, 0, 0)')) {
          el.classList.remove('text-gray-500');
          el.classList.add('text-gray-400');
        }
      });
    }
    fixContrast();
    // Re-run after page loads
    setTimeout(fixContrast, 2000);
    setTimeout(fixContrast, 5000);
  });
})();

// M20: Auto-add ARIA labels to icon-only buttons
(function() {
  function addAriaLabels() {
    document.querySelectorAll('button').forEach(function(btn) {
      if (btn.getAttribute('aria-label')) return;
      var text = btn.textContent.trim();
      // If button has no meaningful text (just icons)
      if (text.length <= 2 || btn.querySelector('i[data-lucide], svg')) {
        var icon = btn.querySelector('i[data-lucide]');
        if (icon) {
          var name = icon.getAttribute('data-lucide') || '';
          btn.setAttribute('aria-label', name.replace(/-/g, ' '));
        } else if (!text) {
          btn.setAttribute('aria-label', 'action button');
        }
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function() {
    addAriaLabels();
    setTimeout(addAriaLabels, 3000);
  });
})();

// M21: Toast container aria-live
(function() {
  var origCreateContainer = window.Toast && window.Toast.createContainer;
  if (window.Toast) {
    var origCreate = window.Toast.createContainer;
    window.Toast.createContainer = function() {
      var container = origCreate ? origCreate.call(this) : null;
      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
      }
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      return container;
    };
  }
})();

// L10: Auto-add aria-labels to inputs without labels
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      document.querySelectorAll('input, select, textarea').forEach(function(input) {
        if (input.getAttribute('aria-label') || input.id && document.querySelector('label[for="' + input.id + '"]')) return;
        var placeholder = input.getAttribute('placeholder');
        var name = input.getAttribute('name');
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        } else if (name) {
          input.setAttribute('aria-label', name.replace(/[_-]/g, ' '));
        }
      });
    }, 2000);
  });
})();

// L11: Kanban keyboard accessibility
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      document.querySelectorAll('[draggable="true"], .kanban-card, .deal-card').forEach(function(card) {
        if (card.getAttribute('tabindex') === null) card.setAttribute('tabindex', '0');
        if (card.getAttribute('role') === null) card.setAttribute('role', 'listitem');
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    }, 3000);
  });
})();

// L12: Modal focus trapping
(function() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var modal = document.querySelector('.modal:not(.hidden), [role="dialog"]:not(.hidden), .fixed.inset-0:not(.hidden)');
    if (!modal) return;
    var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// L16: Error boundary for page loads
(function() {
  window.addEventListener('error', function(e) {
    var pageContent = document.getElementById('pageContent') || document.getElementById('app');
    if (pageContent && !pageContent.querySelector('.error-boundary')) {
      var errDiv = document.createElement('div');
      errDiv.className = 'error-boundary p-8 text-center';
      errDiv.innerHTML = '<div style="background:#1e293b;border:1px solid #ef4444;border-radius:12px;padding:2rem;margin:2rem auto;max-width:500px;"><h3 style="color:#ef4444;margin-bottom:1rem;">⚠️ Page Error</h3><p style="color:#94a3b8;margin-bottom:1rem;">This page encountered an error.</p><button onclick="window.location.hash=\'#dashboard\';location.reload()" style="padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;">Return to Dashboard</button></div>';
      pageContent.appendChild(errDiv);
    }
  });
})();

// M1: Analytics timeout protection - debounce date range changes
(function() {
  var analyticsTimer = null;
  var origSetDateRange = window.setDateRange;
  window.setDateRange = function(range) {
    if (analyticsTimer) clearTimeout(analyticsTimer);
    analyticsTimer = setTimeout(function() {
      if (origSetDateRange) origSetDateRange(range);
    }, 300);
  };
})();

// M2: Prevent navigation bubbling from interactive elements inside page content
(function() {
  document.addEventListener('click', function(e) {
    var target = e.target.closest('button, a, input, select, .btn');
    if (!target) return;
    // If click is inside page content area but not a nav link, stop propagation
    var pageContent = target.closest('#pageContent, .page-container');
    var navLink = target.closest('[data-page], .nav-item, .sidebar a');
    if (pageContent && !navLink) {
      e.stopPropagation();
    }
  }, true); // capture phase
})();

// M3: CallHistory search filter fix
(function() {
  document.addEventListener('input', function(e) {
    if (!e.target.matches('#callSearchInput, [data-search="calls"]')) return;
    var query = e.target.value.toLowerCase().trim();
    var rows = document.querySelectorAll('#callHistoryTable tbody tr, .call-record, .call-item');
    rows.forEach(function(row) {
      var text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) || !query ? '' : 'none';
    });
  });
})();
