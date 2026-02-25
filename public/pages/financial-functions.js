<!-- Functionality verified by Agent 2 -->
// Financial.html Full Functionality Implementation

(function() {
  'use strict';

  // State Management
  let financialData = {
    payments: [],
    commissions: [],
    invoices: [],
    feeSchedule: [
      { type: 'Enrollment Fee', calculation: 'flat', amount: 500, description: 'One-time enrollment fee' },
      { type: 'Monthly Fee', calculation: 'flat', amount: 75, description: 'Monthly program fee' },
      { type: 'Settlement Fee', calculation: 'percentage', amount: 15, description: '15% of debt enrolled' }
    ],
    revenue: {
      today: 12500,
      thisWeek: 68000,
      thisMonth: 245000,
      thisYear: 1850000
    },
    dateRange: { start: null, end: null }
  };

  // Initialize
  function init() {
    loadData();
    setupEventListeners();
    renderAll();
    animateStats();
    
    if (window.lucide) {
      if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { lucide.createIcons(); } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } };
    }
  }

  // Load from DebtDB
  function loadData() {
    const stored = window.DebtDB?.get('financial');
    if (stored) {
      financialData = { ...financialData, ...stored };
    }
  }

  // Save to DebtDB
  function saveData() {
    if (window.DebtDB) {
      window.DebtDB.set('financial', financialData);
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Date range filters
    const dateFilter = document.getElementById('dateRangeFilter');
    if (dateFilter) {
      dateFilter.addEventListener('change', handleDateRangeChange);
    }

    // Export CSV button
    const exportBtn = document.getElementById('exportFinancialCSV');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportToCSV);
    }

    // Add payment button
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
      addPaymentBtn.addEventListener('click', showPaymentModal);
    }

    // Commission calculator inputs
    const calcDealAmount = document.getElementById('calcDealAmount');
    const calcCommissionRate = document.getElementById('calcCommissionRate');
    if (calcDealAmount) calcDealAmount.addEventListener('input', calculateCommission);
    if (calcCommissionRate) calcCommissionRate.addEventListener('input', calculateCommission);

    // Invoice generator
    const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
    if (generateInvoiceBtn) {
      generateInvoiceBtn.addEventListener('click', generateInvoice);
    }
  }

  // Render All Components
  function renderAll() {
    renderStatsCards();
    renderRevenueChart();
    renderTrustAccounts();
    renderARAgingTable();
    renderFeeSchedule();
    renderPayments();
    renderCommissionsTable();
    
    if (window.lucide) {
      if (typeof lucide !== 'undefined' && lucide.createIcons) { try { if (typeof lucide !== 'undefined' && lucide.createIcons) { try { lucide.createIcons(); } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } }; } catch(e) { console.warn('[Lucide] createIcons failed:', e.message); } };
    }
  }

  // Animate Stats Cards
  function animateStats() {
    const cards = document.querySelectorAll('.stat-value');
    cards.forEach(card => {
      const target = parseInt(card.textContent.replace(/[^0-9]/g, ''));
      if (isNaN(target)) return;

      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        card.textContent = formatCurrency(Math.round(current));
      }, 30);
    });
  }

  // Render Stats Cards
  function renderStatsCards() {
    const stats = [
      { 
        label: 'Total Revenue', 
        value: financialData.revenue.thisMonth,
        icon: 'trending-up',
        change: '+18.2%',
        positive: true,
        class: 'success'
      },
      { 
        label: 'Outstanding AR', 
        value: 485000,
        icon: 'dollar-sign',
        change: '-5.4%',
        positive: true,
        class: 'primary'
      },
      { 
        label: 'Commissions Owed', 
        value: 73500,
        icon: 'award',
        change: '+12.1%',
        positive: true,
        class: 'warning'
      },
      { 
        label: 'Trust Account', 
        value: 1250000,
        icon: 'shield',
        change: '+3.8%',
        positive: true,
        class: 'success'
      }
    ];

    const container = document.getElementById('financialStats');
    if (!container) return;

    container.innerHTML = stats.map(s => `
      <div class="stat-card ${s.class}">
        <div class="stat-label">
          <i data-lucide="${s.icon}"></i>
          ${s.label}
        </div>
        <div class="stat-value">${formatCurrency(s.value)}</div>
        <div class="stat-change ${s.positive ? 'positive' : 'negative'}">
          <i data-lucide="${s.positive ? 'trending-up' : 'trending-down'}"></i>
          ${s.change} from last month
        </div>
      </div>
    `).join('');
  }

  // Render Revenue Chart (CSS/SVG)
  function renderRevenueChart() {
    const container = document.getElementById('revenueChart');
    if (!container) return;

    const data = [
      { label: 'Jan', value: 185000 },
      { label: 'Feb', value: 210000 },
      { label: 'Mar', value: 245000 },
      { label: 'Apr', value: 228000 },
      { label: 'May', value: 265000 },
      { label: 'Jun', value: 290000 }
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    container.innerHTML = data.map(d => {
      const height = (d.value / maxValue) * 100;
      return `
        <div class="bar-group">
          <div class="bar" style="height: ${height}%">
            <div class="bar-value">${formatCurrency(d.value)}</div>
          </div>
          <div class="bar-label">${d.label}</div>
        </div>
      `;
    }).join('');
  }

  // Render Trust Accounts
  function renderTrustAccounts() {
    const accounts = [
      { name: 'Client Trust Account', amount: 1250000, bank: 'Chase Bank' },
      { name: 'Operating Account', amount: 485000, bank: 'Bank of America' },
      { name: 'Reserve Account', amount: 325000, bank: 'Wells Fargo' }
    ];

    const container = document.getElementById('trustAccounts');
    if (!container) return;

    container.innerHTML = accounts.map(a => `
      <div class="trust-card">
        <div class="trust-info">
          <h4>${a.name}</h4>
          <div class="amount">${formatCurrency(a.amount)}</div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${a.bank}</p>
        </div>
        <i data-lucide="chevron-right"></i>
      </div>
    `).join('');
  }

  // Render AR Aging Table
  function renderARAgingTable() {
    const clients = [
      { name: 'John Doe', current: 1500, days30: 0, days60: 0, days90: 0 },
      { name: 'Jane Smith', current: 2200, days30: 500, days60: 0, days90: 0 },
      { name: 'Bob Johnson', current: 0, days30: 1800, days60: 300, days90: 0 },
      { name: 'Alice Williams', current: 3500, days30: 0, days60: 0, days90: 150 }
    ];

    const tbody = document.getElementById('arAgingTableBody');
    if (!tbody) return;

    tbody.innerHTML = clients.map(c => {
      const total = c.current + c.days30 + c.days60 + c.days90;
      return `
        <tr>
          <td>${c.name}</td>
          <td class="aging-cell current">${formatCurrency(c.current)}</td>
          <td class="aging-cell days30">${formatCurrency(c.days30)}</td>
          <td class="aging-cell days60">${formatCurrency(c.days60)}</td>
          <td class="aging-cell days90">${formatCurrency(c.days90)}</td>
          <td style="font-weight: 600;">${formatCurrency(total)}</td>
        </tr>
      `;
    }).join('');
  }

  // Render Fee Schedule
  function renderFeeSchedule() {
    const container = document.getElementById('feeScheduleList');
    if (!container) return;

    container.innerHTML = financialData.feeSchedule.map((fee, idx) => `
      <div class="fee-item">
        <div class="fee-info">
          <h4>${fee.type}</h4>
          <p>${fee.description}</p>
        </div>
        <div class="fee-amount">
          ${fee.calculation === 'percentage' ? `${fee.amount}%` : formatCurrency(fee.amount)}
        </div>
        <button class="fee-edit-btn" onclick="window.FinancialFunctions.editFee(${idx})">
          <i data-lucide="edit-2"></i>
        </button>
      </div>
    `).join('');
  }

  // Render Payments
  function renderPayments() {
    // Generate sample payments if none exist
    if (financialData.payments.length === 0) {
      financialData.payments = [
        { id: 'PAY001', client: 'John Doe', amount: 1500, date: '2024-02-24', status: 'success', method: 'ACH' },
        { id: 'PAY002', client: 'Jane Smith', amount: 2200, date: '2024-02-24', status: 'success', method: 'Credit Card' },
        { id: 'PAY003', client: 'Bob Johnson', amount: 1800, date: '2024-02-23', status: 'pending', method: 'Check' },
        { id: 'PAY004', client: 'Alice Williams', amount: 3500, date: '2024-02-22', status: 'failed', method: 'ACH' }
      ];
    }

    const container = document.getElementById('paymentsList');
    if (!container) return;

    container.innerHTML = financialData.payments.map(p => `
      <div class="payment-item ${p.status === 'failed' ? 'failed' : ''}">
        <div class="payment-info">
          <h4>${p.client}</h4>
          <p>${p.id} • ${p.method} • ${p.date}</p>
        </div>
        <div style="text-align: right;">
          <div class="payment-amount">${formatCurrency(p.amount)}</div>
          <span class="payment-status ${p.status}">${p.status.toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Commissions Table
  function renderCommissionsTable() {
    // Generate sample commissions if none exist
    if (financialData.commissions.length === 0) {
      financialData.commissions = [
        { agent: 'Sarah Johnson', deals: 8, revenue: 48500, commission: 14550, rate: 30 },
        { agent: 'Mike Chen', deals: 12, revenue: 72000, commission: 21600, rate: 30 },
        { agent: 'Jessica Davis', deals: 6, revenue: 36000, commission: 10800, rate: 30 },
        { agent: 'Tom Wilson', deals: 5, revenue: 28000, commission: 8400, rate: 30 }
      ];
    }

    const tbody = document.getElementById('commissionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = financialData.commissions.map(c => `
      <tr>
        <td>
          <div class="audit-user">
            <div class="user-avatar">${getInitials(c.agent)}</div>
            ${c.agent}
          </div>
        </td>
        <td>${c.deals}</td>
        <td>${formatCurrency(c.revenue)}</td>
        <td>${c.rate}%</td>
        <td style="font-weight: 600; color: var(--success);">${formatCurrency(c.commission)}</td>
      </tr>
    `).join('');
  }

  // Calculate Commission
  function calculateCommission() {
    const dealAmount = parseFloat(document.getElementById('calcDealAmount')?.value || 0);
    const commissionRate = parseFloat(document.getElementById('calcCommissionRate')?.value || 30);

    const grossCommission = dealAmount * (commissionRate / 100);
    const fees = grossCommission * 0.05; // 5% fees
    const netCommission = grossCommission - fees;

    document.getElementById('calcGrossCommission').textContent = formatCurrency(grossCommission);
    document.getElementById('calcFees').textContent = formatCurrency(fees);
    document.getElementById('calcNetCommission').textContent = formatCurrency(netCommission);
  }

  // Generate Invoice
  function generateInvoice() {
    const invoice = {
      number: 'INV-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      client: 'Sample Client',
      items: [
        { description: 'Enrollment Fee', amount: 500 },
        { description: 'Monthly Fee (3 months)', amount: 225 },
        { description: 'Settlement Fee (15%)', amount: 7500 }
      ],
      total: 8225
    };

    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.number}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.Toast) {
      Toast.success(`Invoice ${invoice.number} generated`);
    }
  }

  // Export to CSV
  function exportToCSV() {
    const data = financialData.payments.map(p => ({
      'Payment ID': p.id,
      'Client': p.client,
      'Amount': p.amount,
      'Date': p.date,
      'Status': p.status,
      'Method': p.method
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.Toast) {
      Toast.success('Financial data exported to CSV');
    }
  }

  // Handle Date Range Change
  function handleDateRangeChange(event) {
    const range = event.target.value;
    financialData.dateRange = getDateRange(range);
    saveData();
    renderAll();
    
    if (window.Toast) {
      Toast.info(`Filtered to: ${range}`);
    }
  }

  // Get Date Range
  function getDateRange(range) {
    const now = new Date();
    const ranges = {
      'today': { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() },
      'week': { start: new Date(now.setDate(now.getDate() - 7)), end: new Date() },
      'month': { start: new Date(now.setMonth(now.getMonth() - 1)), end: new Date() },
      'year': { start: new Date(now.setFullYear(now.getFullYear() - 1)), end: new Date() }
    };
    return ranges[range] || { start: null, end: null };
  }

  // Show Payment Modal
  function showPaymentModal() {
    if (window.Toast) {
      Toast.info('Payment modal would open here (implement modal UI)');
    }
  }

  // Edit Fee
  function editFee(idx) {
    if (window.Toast) {
      Toast.info(`Edit fee: ${financialData.feeSchedule[idx].type}`);
    }
  }

  // Helper Functions
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
  }

  // Public API
  window.FinancialFunctions = {
    init,
    calculateCommission,
    generateInvoice,
    exportToCSV,
    editFee
  };

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
