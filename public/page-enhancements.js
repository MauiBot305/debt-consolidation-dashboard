// v2026-02-25
/**
 * Universal Page Enhancements
 * Applies consistent polish to all dashboard pages
 */

(function() {
  'use strict';

  // Click guard: prevent page content clicks from reaching sidebar nav
  function installClickGuard() {
    var pc = document.getElementById('pageContent');
    if (!pc || pc.__clickGuard) return;
    pc.__clickGuard = true;
    pc.addEventListener('click', function(e) { e.stopPropagation(); }, false);
  }

  // ====================================
  // 1. LOADING SKELETON SYSTEM
  // ====================================
  
  function showLoadingSkeleton() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
    
    // Add skeleton overlay
    const skeleton = document.createElement('div');
    skeleton.id = 'loadingSkeleton';
    skeleton.className = 'fixed inset-0 z-50 bg-[#0a0f1a] flex items-center justify-center';
    skeleton.innerHTML = `
      <div class="text-center">
        <div class="skeleton skeleton-circle mx-auto mb-4"></div>
        <div class="skeleton skeleton-title mx-auto mb-4"></div>
        <div class="skeleton skeleton-text mx-auto"></div>
      </div>
    `;
    pageContent.prepend(skeleton);
    
    // Remove after short delay
    setTimeout(() => {
      skeleton.style.opacity = '0';
      skeleton.style.transition = 'opacity 0.3s';
      setTimeout(() => skeleton.remove(), 300);
    }, 500);
  }

  // ====================================
  // 2. STAGGERED ANIMATION APPLICATION
  // ====================================
  
  function applyStaggeredAnimations() {
    // Find all cards/sections that should animate
    const animatableSelectors = [
      '.glass-card',
      '.stat-card', 
      '.metric-card',
      '.kpi-card',
      '[class*="card"]'
    ];
    
    animatableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        if (!el.classList.contains('fade-in-up')) {
          el.classList.add('fade-in-up', `stagger-${Math.min(index + 1, 8)}`);
        }
      });
    });
  }

  // ====================================
  // 3. TOOLTIP SYSTEM
  // ====================================
  
  function initializeTooltips() {
    document.querySelectorAll(".tooltip").forEach(t => t.remove());
    // Find all elements with title attribute or data-tooltip
    const tooltipElements = document.querySelectorAll('[title], [data-tooltip]');
    
    tooltipElements.forEach(el => {
      const tooltipText = el.getAttribute('data-tooltip') || el.getAttribute('title');
      if (!tooltipText) return;
      
      // Remove default browser tooltip
      el.removeAttribute('title');
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);
      
      // Show/hide handlers
      el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 8}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.classList.add('show');
      });
      
      el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
      });
    });
  }

  // ====================================
  // 4. EMPTY STATE DETECTION
  // ====================================
  
  function handleEmptyStates() {
    // Skip empty state injection - page scripts handle their own empty states
    // This was causing race conditions with async page init in SPA mode
    return;
    
    // Look for empty tables, lists, grids
    const tables = document.querySelectorAll('table tbody');
    tables.forEach(tbody => {
      if (tbody.children.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="100%" class="p-12">
              <div class="empty-state">
                <i data-lucide="inbox" class="empty-state-icon"></i>
                <h3 class="empty-state-title">No data available</h3>
                <p class="empty-state-description">There are no items to display at this time.</p>
              </div>
            </td>
          </tr>
        `;
        if (window.lucide) if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { lucide.createIcons(); } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } };
      }
    });
    
    // Look for empty lists
    const lists = document.querySelectorAll('[data-list], .list-container');
    lists.forEach(list => {
      if (list.children.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <i data-lucide="search-x" class="empty-state-icon"></i>
            <h3 class="empty-state-title">No results found</h3>
            <p class="empty-state-description">Try adjusting your filters or search terms.</p>
          </div>
        `;
        if (window.lucide) if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { lucide.createIcons(); } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } };
      }
    });
  }

  // ====================================
  // 5. ENSURE ORBITRON ON STAT NUMBERS
  // ====================================
  
  function enforceOrbitronFont() {
    // Find all elements that look like stat numbers
    const statSelectors = [
      '.stat-number',
      '[class*="stat"] h1',
      '[class*="stat"] h2',
      '[class*="stat"] h3',
      '[class*="kpi"] h1',
      '[class*="kpi"] h2',
      '[class*="kpi"] h3',
      '[class*="metric"] .font-bold',
      '.text-3xl.font-bold',
      '.text-4xl.font-bold',
      '.text-5xl.font-bold'
    ];
    
    statSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Only apply if it looks like a number
        if (/[\d$,%]+/.test(el.textContent)) {
          el.classList.add('font-orbitron');
        }
      });
    });
  }

  // ====================================
  // 6. ENSURE GLASS MORPHISM ON CARDS
  // ====================================
  
  function enforceGlassMorphism() {
    // Find divs that look like cards but don't have glass effect
    const potentialCards = document.querySelectorAll('.glass-card, .stat-card, .metric-card, .kpi-card, .overview-card, .campaign-card, .deal-card');
    
    potentialCards.forEach(el => {
      const hasGlass = el.classList.contains('glass-card') || 
                      el.classList.contains('stat-card') ||
                      el.classList.contains('metric-card');
      
      if (!hasGlass && el.children.length > 0) {
        // Check if it has the glass effect manually applied
        const computedStyle = window.getComputedStyle(el);
        const hasBackdropFilter = computedStyle.backdropFilter !== 'none';
        const hasBlur = computedStyle.backdropFilter.includes('blur');
        
        if (!hasBackdropFilter || !hasBlur) {
          // Add glass class as fallback
          el.style.background = 'rgba(15, 23, 42, 0.8)';
          el.style.backdropFilter = 'blur(20px)';
          el.style.webkitBackdropFilter = 'blur(20px)';
          el.style.border = '1px solid rgba(59, 130, 246, 0.1)';
          el.style.borderRadius = el.style.borderRadius || '16px';
        }
      }
    });
  }

  // ====================================
  // 7. ADD HOVER TRANSFORMS
  // ====================================
  
  function addHoverTransforms() {
    const interactiveElements = document.querySelectorAll(
      '.glass-card, .stat-card, .metric-card, .kpi-card, [class*="card"]:not(.no-hover)'
    );
    
    interactiveElements.forEach(el => {
      el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 12px 48px rgba(59, 130, 246, 0.15)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '';
      });
    });
  }

  // ====================================
  // 8. ACTIVE/SELECTED STATE STYLING
  // ====================================
  
  function enhanceActiveStates() {
    // Find tabs, filters, buttons that might need active states
    const tabElements = document.querySelectorAll(
      '[role="tab"], [data-tab], .tab, .filter-btn, [class*="tab"]'
    );
    
    tabElements.forEach(el => {
      el.addEventListener('click', function() {
        // Remove active from siblings
        if (this.parentElement) {
          Array.from(this.parentElement.children).forEach(sibling => {
            sibling.classList.remove('active', 'selected');
            sibling.style.background = '';
            sibling.style.color = '';
            sibling.style.borderColor = '';
          });
        }
        
        // Add active to this
        this.classList.add('active');
        this.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.1))';
        this.style.color = '#fff';
        this.style.borderColor = 'rgba(59, 130, 246, 0.5)';
      });
    });
  }

  // ====================================
  // 9. SMOOTH PAGE FADE-IN
  // ====================================
  
  function fadeInPage() {
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
      pageContent.style.opacity = '0';
      setTimeout(() => {
        pageContent.style.transition = 'opacity 0.5s ease';
        pageContent.style.opacity = '1';
      }, 100);
    }
  }

  // ====================================
  // 10. INITIALIZE EVERYTHING
  // ====================================
  
  function initialize() {
    // Run on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runEnhancements);
    } else {
      runEnhancements();
    }
  }

  function runEnhancements() {
    installClickGuard();
    // Wait for page content to be injected
    setTimeout(() => {
      fadeInPage();
      applyStaggeredAnimations();
      initializeTooltips();
      handleEmptyStates();
      enforceOrbitronFont();
      enforceGlassMorphism();
      addHoverTransforms();
      enhanceActiveStates();
      
      // Re-run some enhancements after a delay (for dynamic content)
      setTimeout(() => {
        enforceOrbitronFont();
        handleEmptyStates();
      }, 1000);
    }, 100);
  }

  // Auto-initialize
  initialize();

  // Expose for manual re-initialization
  window.PageEnhancements = {
    reinitialize: runEnhancements,
    applyStaggeredAnimations,
    enforceOrbitronFont,
    handleEmptyStates
  };

})();
