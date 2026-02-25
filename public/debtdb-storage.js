// DebtDB - LocalStorage Persistence Layer
// Shared database for all dashboard pages

const DebtDB = (function() {
  const STORAGE_PREFIX = 'debtDB_';

  // Initialize default data structures
  const defaults = {
    compliance: {
      score: 94,
      checklist: Array(8).fill(true),
      states: {},
      tcpaRecords: [],
      dncList: [],
      auditLog: []
    },
    financial: {
      payments: [],
      commissions: [],
      invoices: [],
      feeSchedule: [],
      revenue: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0
      }
    },
    marketing: {
      campaigns: [],
      templates: [],
      segments: [],
      leadSources: []
    },
    analytics: {
      kpis: {},
      dateRange: { start: null, end: null }
    },
    gamification: {
      achievements: [],
      points: {},
      challenges: [],
      rewards: []
    }
  };

  // Get data from localStorage
  function get(key) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaults[key] || null;
    } catch (e) {
      console.error('DebtDB get error:', e);
      return defaults[key] || null;
    }
  }

  // Set data to localStorage
  function set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('DebtDB set error:', e);
      return false;
    }
  }

  // Update specific field in a key
  function update(key, field, value) {
    const data = get(key) || {};
    data[field] = value;
    return set(key, data);
  }

  // Append to array field
  function append(key, field, value) {
    const data = get(key) || {};
    if (!Array.isArray(data[field])) {
      data[field] = [];
    }
    data[field].push(value);
    return set(key, data);
  }

  // Remove from array field by condition
  function remove(key, field, condition) {
    const data = get(key) || {};
    if (Array.isArray(data[field])) {
      data[field] = data[field].filter(item => !condition(item));
      return set(key, data);
    }
    return false;
  }

  // Clear all data
  function clear() {
    Object.keys(defaults).forEach(key => {
      localStorage.removeItem(STORAGE_PREFIX + key);
    });
  }

  // Initialize with defaults if empty
  function init() {
    Object.keys(defaults).forEach(key => {
      if (!localStorage.getItem(STORAGE_PREFIX + key)) {
        set(key, defaults[key]);
      }
    });
  }

  // Export to JSON
  function exportAll() {
    const data = {};
    Object.keys(defaults).forEach(key => {
      data[key] = get(key);
    });
    return data;
  }

  // Import from JSON
  function importAll(data) {
    Object.keys(data).forEach(key => {
      set(key, data[key]);
    });
  }

  // Initialize on load
  init();

  // Public API
  return {
    get,
    set,
    update,
    append,
    remove,
    clear,
    exportAll,
    importAll,
    defaults
  };
})();

// Toast notification system
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i data-lucide="${this.getIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.75rem;
          z-index: 10000;
          animation: toast-slide-in 0.3s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        @keyframes toast-slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes toast-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #f1f5f9;
        }

        .toast-info { border-left: 3px solid #3B82F6; }
        .toast-success { border-left: 3px solid #22C55E; }
        .toast-warning { border-left: 3px solid #F59E0B; }
        .toast-error { border-left: 3px solid #EF4444; }

        .toast i { width: 20px; height: 20px; }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Initialize lucide icons
    if (window.lucide) {
      lucide.createIcons({ icons: { [this.getIcon(type)]: true } });
    }

    // Remove after duration
    setTimeout(() => {
      toast.style.animation = 'toast-slide-out 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  getIcon(type) {
    const icons = {
      info: 'info',
      success: 'check-circle',
      warning: 'alert-triangle',
      error: 'x-circle'
    };
    return icons[type] || 'info';
  },

  info(message, duration) { this.show(message, 'info', duration); },
  success(message, duration) { this.show(message, 'success', duration); },
  warning(message, duration) { this.show(message, 'warning', duration); },
  error(message, duration) { this.show(message, 'error', duration); }
};
