// localStorage availability check with in-memory fallback
(function() {
  try {
    if (typeof localStorage === 'undefined') throw new Error('not available');
    localStorage.setItem('__db_test__', '1');
    localStorage.removeItem('__db_test__');
  } catch(e) {
    console.warn('[DebtDB] localStorage unavailable, using in-memory fallback');
    window.__memStore = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: function(k) { return window.__memStore[k] || null; },
        setItem: function(k, v) { window.__memStore[k] = String(v); },
        removeItem: function(k) { delete window.__memStore[k]; },
        clear: function() { window.__memStore = {}; }
      }
    });
  }
})();

/**
 * DebtDB - Complete localStorage Database Abstraction
 * Core Engine for Debt Consolidation Empire Dashboard
 * Version: 2026-02-25
 * 
 * All data stored with prefix: debtdb_
 * All methods synchronous
 * All returns are deep copies (mutation-safe)
 * Auto-generates sequential IDs
 */

window.DebtDB = (function() {
  'use strict';
  
  const PREFIX = 'debtdb_';
  
  // ==================== UTILITIES ====================
  
  function getStorage(key) {
    try {
      const data = localStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`DebtDB: Error reading ${key}:`, e);
      return null;
    }
  }
  
  function setStorage(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`DebtDB: Error writing ${key}:`, e);
      return false;
    }
  }
  
  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  // ==================== FIX 3: STORAGE QUOTA WARNING ====================
  function checkStorageQuota() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
        }
      }
      const maxBytes = 5 * 1024 * 1024; // 5MB
      const usagePercent = (total / maxBytes) * 100;
      if (usagePercent > 80) {
        console.warn(`[DebtDB] Storage ${usagePercent.toFixed(1)}% full (${(total/1024).toFixed(0)}KB / ${(maxBytes/1024).toFixed(0)}KB)`);
        if (typeof Toast !== 'undefined') {
          Toast.show(`⚠️ Storage ${usagePercent.toFixed(0)}% full. Consider exporting data.`, 'warning', 8000);
        }
      }
      return { used: total, max: maxBytes, percent: usagePercent };
    } catch(e) {
      return { used: 0, max: 0, percent: 0 };
    }
  }
  
  // ==================== FIX 1: INPUT VALIDATION ====================
  function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
  }
  
  function validateLead(lead) {
    if (!lead || typeof lead !== 'object') {
      console.error('[DebtDB] addLead: invalid input');
      return null;
    }
    if (!lead.name || typeof lead.name !== 'string' || lead.name.trim().length === 0) {
      console.error('[DebtDB] addLead: name is required');
      return null;
    }
    return {
      ...lead,
      name: sanitizeInput(lead.name),
      email: lead.email ? sanitizeInput(lead.email) : lead.email,
      phone: lead.phone ? sanitizeInput(lead.phone) : lead.phone,
      notes: lead.notes ? sanitizeInput(lead.notes) : lead.notes
    };
  }
  
  function validateDeal(deal) {
    if (!deal || typeof deal !== 'object') {
      console.error('[DebtDB] addDeal: invalid input');
      return null;
    }
    if (!deal.client || typeof deal.client !== 'string' || deal.client.trim().length === 0) {
      console.error('[DebtDB] addDeal: client is required');
      return null;
    }
    return {
      ...deal,
      client: sanitizeInput(deal.client),
      notes: deal.notes ? sanitizeInput(deal.notes) : deal.notes
    };
  }
  
  function validateCase(caseData) {
    if (!caseData || typeof caseData !== 'object') {
      console.error('[DebtDB] addCase: invalid input');
      return null;
    }
    if (!caseData.client || typeof caseData.client !== 'string' || caseData.client.trim().length === 0) {
      console.error('[DebtDB] addCase: client is required');
      return null;
    }
    return {
      ...caseData,
      client: sanitizeInput(caseData.client)
    };
  }
  
  function validateActivity(activity) {
    if (!activity || typeof activity !== 'object') {
      console.error('[DebtDB] addActivity: invalid input');
      return null;
    }
    return activity;
  }
  
  function generateId(type, items) {
    const maxId = items.reduce((max, item) => {
      const num = parseInt(item.id.replace(/[^0-9]/g, ''), 10);
      return num > max ? num : max;
    }, 0);
    const nextNum = String(maxId + 1).padStart(3, '0');
    return `${type}_${nextNum}`;
  }
  
  function matchesFilters(item, filters) {
    if (!filters) return true;
    
    for (let key in filters) {
      const filterValue = filters[key];
      
      if (key === 'search') {
        // Global text search across common fields
        const searchStr = filterValue.toLowerCase();
        const searchable = JSON.stringify(item).toLowerCase();
        if (!searchable.includes(searchStr)) return false;
      } else if (key === 'minAmount') {
        if (item.amount < filterValue) return false;
      } else if (key === 'maxAmount') {
        if (item.amount > filterValue) return false;
      } else {
        // Exact match for other filters
        if (item[key] !== filterValue) return false;
      }
    }
    
    return true;
  }
  
  // ==================== LEADS ====================
  
  function getLeads(filters) {
    const leads = getStorage('leads') || [];
    if (!filters) return deepCopy(leads);
    return deepCopy(leads.filter(lead => matchesFilters(lead, filters)));
  }
  
  function getLead(id) {
    const leads = getStorage('leads') || [];
    const lead = leads.find(l => l.id === id);
    return lead ? deepCopy(lead) : null;
  }
  
  function addLead(data) {
    // FIX 1: Input validation
    const validated = validateLead(data);
    if (!validated) return null;
    
    const leads = getStorage('leads') || [];
    const newLead = {
      id: generateId('lead', leads),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...validated
    };
    leads.push(newLead);
    setStorage('leads', leads);
    checkStorageQuota(); // FIX 3: Storage quota check
    addActivity({ type: 'lead_created', entityId: newLead.id, data: { name: newLead.name } });
    return deepCopy(newLead);
  }
  
  
  function updateLead(id, data) {
    // FIX 2: Prevent ID mutation
    delete data.id;
    
    const leads = getStorage('leads') || [];
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    leads[index] = {
      ...leads[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStorage('leads', leads);
    addActivity({ type: 'lead_updated', entityId: id, data });
    return deepCopy(leads[index]);
  }
  
  function deleteLead(id) {
    // Delete lead
    const leads = getStorage('leads') || [];
    const filtered = leads.filter(l => l.id !== id);
    setStorage('leads', filtered);
    
    // FIX 4: Clean up orphaned records (cascade delete)
    const deals = getStorage('deals') || [];
    const filteredDeals = deals.filter(d => d.leadId !== id);
    if (deals.length !== filteredDeals.length) {
      setStorage('deals', filteredDeals);
      // console.log(`[DebtDB] Cleaned up ${deals.length - filteredDeals.length} orphaned deals`);
    }
    
    const cases = getStorage('cases') || [];
    const filteredCases = cases.filter(c => c.leadId !== id);
    if (cases.length !== filteredCases.length) {
      setStorage('cases', filteredCases);
      // console.log(`[DebtDB] Cleaned up ${cases.length - filteredCases.length} orphaned cases`);
    }
    
    const activities = getStorage('activities') || [];
    const filteredActivities = activities.filter(a => a.leadId !== id);
    if (activities.length !== filteredActivities.length) {
      setStorage('activities', filteredActivities);
      // console.log(`[DebtDB] Cleaned up ${activities.length - filteredActivities.length} orphaned activities`);
    }
    
    // console.log(`[DebtDB] Deleted lead ${id} and cleaned up all related records`);
    addActivity({ type: 'lead_deleted', entityId: id });
    return true;
  }
  
  
  // ==================== DEALS ====================
  
  function getDeals(filters) {
    const deals = getStorage('deals') || [];
    if (!filters) return deepCopy(deals);
    return deepCopy(deals.filter(deal => matchesFilters(deal, filters)));
  }
  
  function getDeal(id) {
    const deals = getStorage('deals') || [];
    const deal = deals.find(d => d.id === id);
    return deal ? deepCopy(deal) : null;
  }
  
  function addDeal(data) {
    // FIX 1: Input validation
    const validated = validateDeal(data);
    if (!validated) return null;
    
    const deals = getStorage('deals') || [];
    const newDeal = {
      id: generateId('deal', deals),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...validated
    };
    deals.push(newDeal);
    setStorage('deals', deals);
    checkStorageQuota(); // FIX 3: Storage quota check
    addActivity({ type: 'deal_created', entityId: newDeal.id, data: { client: newDeal.client } });
    return deepCopy(newDeal);
  }
  
  
  function updateDeal(id, data) {
    // FIX 2: Prevent ID mutation
    delete data.id;
    
    const deals = getStorage('deals') || [];
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    deals[index] = {
      ...deals[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStorage('deals', deals);
    addActivity({ type: 'deal_updated', entityId: id, data });
    return deepCopy(deals[index]);
  }
  
  function deleteDeal(id) {
    const deals = getStorage('deals') || [];
    const filtered = deals.filter(d => d.id !== id);
    setStorage('deals', filtered);
    addActivity({ type: 'deal_deleted', entityId: id });
    return true;
  }
  
  function moveDeal(id, newStage) {
    return updateDeal(id, { stage: newStage });
  }
  
  // ==================== CASES ====================
  
  function getCases(filters) {
    const cases = getStorage('cases') || [];
    if (!filters) return deepCopy(cases);
    return deepCopy(cases.filter(c => matchesFilters(c, filters)));
  }
  
  function getCase(id) {
    const cases = getStorage('cases') || [];
    const caseItem = cases.find(c => c.id === id);
    return caseItem ? deepCopy(caseItem) : null;
  }
  
  function addCase(data) {
    // FIX 1: Input validation
    const validated = validateCase(data);
    if (!validated) return null;
    
    const cases = getStorage('cases') || [];
    const newCase = {
      id: generateId('case', cases),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      payments: [],
      documents: [],
      ...validated
    };
    cases.push(newCase);
    setStorage('cases', cases);
    checkStorageQuota(); // FIX 3: Storage quota check
    addActivity({ type: 'case_created', entityId: newCase.id, data: { client: newCase.client } });
    return deepCopy(newCase);
  }
  
  
  function updateCase(id, data) {
    // FIX 2: Prevent ID mutation
    delete data.id;
    
    const cases = getStorage('cases') || [];
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    cases[index] = {
      ...cases[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStorage('cases', cases);
    addActivity({ type: 'case_updated', entityId: id, data });
    return deepCopy(cases[index]);
  }
  
  function deleteCase(id) {
    const cases = getStorage('cases') || [];
    const filtered = cases.filter(c => c.id !== id);
    setStorage('cases', filtered);
    addActivity({ type: 'case_deleted', entityId: id });
    return true;
  }
  
  function addCaseNote(caseId, note) {
    const caseItem = getCase(caseId);
    if (!caseItem) return null;
    
    const newNote = {
      id: `note_${Date.now()}`,
      text: note,
      createdAt: new Date().toISOString(),
      createdBy: getCurrentUser()?.id || 'system'
    };
    
    caseItem.notes = caseItem.notes || [];
    caseItem.notes.push(newNote);
    return updateCase(caseId, { notes: caseItem.notes });
  }
  
  function addCasePayment(caseId, payment) {
    const caseItem = getCase(caseId);
    if (!caseItem) return null;
    
    const newPayment = {
      id: `payment_${Date.now()}`,
      ...payment,
      createdAt: new Date().toISOString()
    };
    
    caseItem.payments = caseItem.payments || [];
    caseItem.payments.push(newPayment);
    return updateCase(caseId, { payments: caseItem.payments });
  }
  
  function addCaseDocument(caseId, doc) {
    const caseItem = getCase(caseId);
    if (!caseItem) return null;
    
    const newDoc = {
      id: `doc_${Date.now()}`,
      ...doc,
      uploadedAt: new Date().toISOString(),
      uploadedBy: getCurrentUser()?.id || 'system'
    };
    
    caseItem.documents = caseItem.documents || [];
    caseItem.documents.push(newDoc);
    return updateCase(caseId, { documents: caseItem.documents });
  }
  
  // ==================== CALLS ====================
  
  function getCalls(filters) {
    const calls = getStorage('calls') || [];
    if (!filters) return deepCopy(calls);
    return deepCopy(calls.filter(call => matchesFilters(call, filters)));
  }
  
  function addCall(data) {
    const calls = getStorage('calls') || [];
    const newCall = {
      id: generateId('call', calls),
      createdAt: new Date().toISOString(),
      ...data
    };
    calls.push(newCall);
    setStorage('calls', calls);
    addActivity({ type: 'call_logged', entityId: newCall.id, data: { disposition: newCall.disposition } });
    return deepCopy(newCall);
  }
  
  function updateCall(id, data) {
    // FIX 2: Prevent ID mutation
    delete data.id;
    
    const calls = getStorage('calls') || [];
    const index = calls.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    calls[index] = {
      ...calls[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStorage('calls', calls);
    return deepCopy(calls[index]);
  }
  
  // ==================== AGENTS/TEAM ====================
  
  function getAgents() {
    const agents = getStorage('agents') || [];
    return deepCopy(agents);
  }
  
  function getAgent(id) {
    const agents = getStorage('agents') || [];
    const agent = agents.find(a => a.id === id);
    return agent ? deepCopy(agent) : null;
  }
  
  function addAgent(data) {
    const agents = getStorage('agents') || [];
    const newAgent = {
      id: generateId('agent', agents),
      createdAt: new Date().toISOString(),
      stats: {
        calls_made: 0,
        deals_closed: 0,
        revenue_generated: 0,
        avg_call_duration: 0
      },
      ...data
    };
    agents.push(newAgent);
    setStorage('agents', agents);
    return deepCopy(newAgent);
  }
  
  function updateAgent(id, data) {
    // FIX 2: Prevent ID mutation
    delete data.id;
    
    const agents = getStorage('agents') || [];
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    agents[index] = {
      ...agents[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStorage('agents', agents);
    return deepCopy(agents[index]);
  }
  
  // ==================== ACTIVITIES ====================
  
  function getActivities(limit = 50) {
    const activities = getStorage('activities') || [];
    const sorted = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return deepCopy(sorted.slice(0, limit));
  }
  
  function addActivity(data) {
    // FIX 1: Input validation
    const validated = validateActivity(data);
    if (!validated) return null;
    
    const activities = getStorage('activities') || [];
    const newActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user: getCurrentUser()?.name || 'System',
      userId: getCurrentUser()?.id || 'system',
      ...validated
    };
    activities.push(newActivity);
    
    // Keep only last 500 activities
    if (activities.length > 500) {
      activities.splice(0, activities.length - 500);
    }
    
    setStorage('activities', activities);
    checkStorageQuota(); // FIX 3: Storage quota check
    return deepCopy(newActivity);
  }
  
  
  // ==================== NOTIFICATIONS ====================
  
  function getNotifications() {
    const notifications = getStorage('notifications') || [];
    return deepCopy(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
  
  function addNotification(data) {
    const notifications = getStorage('notifications') || [];
    const newNotification = {
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...data
    };
    notifications.push(newNotification);
    setStorage('notifications', notifications);
    return deepCopy(newNotification);
  }
  
  function markNotificationRead(id) {
    const notifications = getStorage('notifications') || [];
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    notifications[index].read = true;
    notifications[index].readAt = new Date().toISOString();
    setStorage('notifications', notifications);
    return true;
  }
  
  function getUnreadCount() {
    const notifications = getStorage('notifications') || [];
    return notifications.filter(n => !n.read).length;
  }
  
  // ==================== COMPLIANCE ====================
  
  function getComplianceChecklist() {
    return deepCopy(getStorage('compliance_checklist') || []);
  }
  
  function updateComplianceItem(id, data) {
    const checklist = getStorage('compliance_checklist') || [];
    const index = checklist.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    checklist[index] = { ...checklist[index], ...data };
    setStorage('compliance_checklist', checklist);
    return deepCopy(checklist[index]);
  }
  
  function getLicenses() {
    return deepCopy(getStorage('licenses') || []);
  }
  
  function updateLicense(state, data) {
    const licenses = getStorage('licenses') || [];
    const index = licenses.findIndex(l => l.state === state);
    
    if (index === -1) {
      licenses.push({ state, ...data });
    } else {
      licenses[index] = { ...licenses[index], ...data };
    }
    
    setStorage('licenses', licenses);
    return deepCopy(licenses);
  }
  
  function getDNCList() {
    return deepCopy(getStorage('dnc_list') || []);
  }
  
  function addToDNC(phone) {
    const dncList = getStorage('dnc_list') || [];
    if (!dncList.includes(phone)) {
      dncList.push(phone);
      setStorage('dnc_list', dncList);
      addAuditEntry({ action: 'dnc_added', phone });
    }
    return true;
  }
  
  function removeFromDNC(phone) {
    const dncList = getStorage('dnc_list') || [];
    const filtered = dncList.filter(p => p !== phone);
    setStorage('dnc_list', filtered);
    addAuditEntry({ action: 'dnc_removed', phone });
    return true;
  }
  
  function getAuditLog() {
    const log = getStorage('audit_log') || [];
    return deepCopy(log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }
  
  function addAuditEntry(data) {
    const log = getStorage('audit_log') || [];
    const entry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: getCurrentUser()?.name || 'System',
      userId: getCurrentUser()?.id || 'system',
      ...data
    };
    log.push(entry);
    
    // Keep only last 1000 entries
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }
    
    setStorage('audit_log', log);
    return deepCopy(entry);
  }
  
  // ==================== CAMPAIGNS ====================
  
  function getCampaigns() {
    return deepCopy(getStorage('campaigns') || []);
  }
  
  function addCampaign(data) {
    const campaigns = getStorage('campaigns') || [];
    const newCampaign = {
      id: generateId('campaign', campaigns),
      createdAt: new Date().toISOString(),
      ...data
    };
    campaigns.push(newCampaign);
    setStorage('campaigns', campaigns);
    return deepCopy(newCampaign);
  }
  
  function updateCampaign(id, data) {
    const campaigns = getStorage('campaigns') || [];
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    campaigns[index] = { ...campaigns[index], ...data };
    setStorage('campaigns', campaigns);
    return deepCopy(campaigns[index]);
  }
  
  // ==================== GAMIFICATION ====================
  
  function getLeaderboard() {
    const agents = getAgents();
    return agents
      .map(agent => ({
        ...agent,
        score: (agent.points || 0)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  function getAgentStats(agentId) {
    const agent = getAgent(agentId);
    if (!agent) return null;
    
    return {
      ...agent.stats,
      level: agent.level || 1,
      points: agent.points || 0,
      achievements: agent.achievements || [],
      currentStreak: agent.currentStreak || 0
    };
  }
  
  function addPoints(agentId, points, reason) {
    const agent = getAgent(agentId);
    if (!agent) return null;
    
    const newPoints = (agent.points || 0) + points;
    const newLevel = Math.floor(newPoints / 1000) + 1;
    
    updateAgent(agentId, {
      points: newPoints,
      level: newLevel
    });
    
    addActivity({
      type: 'points_earned',
      entityId: agentId,
      data: { points, reason, agentName: agent.name }
    });
    
    return { newPoints, newLevel };
  }
  
  function getAchievements(agentId) {
    const agent = getAgent(agentId);
    return agent?.achievements || [];
  }
  
  // ==================== SETTINGS ====================
  
  function getSettings() {
    return deepCopy(getStorage('settings') || {
      companyName: 'Debt Consolidation Empire',
      timezone: 'America/Chicago',
      currency: 'USD',
      fiscalYearStart: 'January'
    });
  }
  
  function updateSettings(data) {
    const current = getSettings();
    const updated = { ...current, ...data };
    setStorage('settings', updated);
    return deepCopy(updated);
  }
  
  // ==================== FINANCIAL ====================
  
  function getRevenue(period) {
    const deals = getDeals();
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }
    
    return deals
      .filter(deal => new Date(deal.createdAt) >= startDate)
      .reduce((sum, deal) => sum + (deal.amount || 0), 0);
  }
  
  function getPayments(filters) {
    const payments = getStorage('payments') || [];
    if (!filters) return deepCopy(payments);
    return deepCopy(payments.filter(p => matchesFilters(p, filters)));
  }
  
  function addPayment(data) {
    const payments = getStorage('payments') || [];
    const newPayment = {
      id: generateId('payment', payments),
      createdAt: new Date().toISOString(),
      ...data
    };
    payments.push(newPayment);
    setStorage('payments', payments);
    addActivity({ type: 'payment_received', entityId: newPayment.id, data: { amount: newPayment.amount } });
    return deepCopy(newPayment);
  }
  
  function getCommissions(agentId) {
    const deals = getDeals({ agent: agentId });
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const commissionRate = 0.10; // 10%
    return totalRevenue * commissionRate;
  }
  
  // ==================== GLOBAL SEARCH ====================
  
  function search(query) {
    if (!query || query.trim() === '') return [];
    
    const q = query.toLowerCase();
    const results = [];
    
    // Search leads
    getLeads().forEach(lead => {
      if (JSON.stringify(lead).toLowerCase().includes(q)) {
        results.push({ type: 'lead', data: lead });
      }
    });
    
    // Search cases
    getCases().forEach(caseItem => {
      if (JSON.stringify(caseItem).toLowerCase().includes(q)) {
        results.push({ type: 'case', data: caseItem });
      }
    });
    
    // Search deals
    getDeals().forEach(deal => {
      if (JSON.stringify(deal).toLowerCase().includes(q)) {
        results.push({ type: 'deal', data: deal });
      }
    });
    
    // Search agents
    getAgents().forEach(agent => {
      if (JSON.stringify(agent).toLowerCase().includes(q)) {
        results.push({ type: 'agent', data: agent });
      }
    });
    
    return results;
  }
  
  // ==================== STATS (COMPUTED) ====================
  
  function getDashboardStats() {
    const leads = getLeads();
    const cases = getCases();
    const deals = getDeals();
    const calls = getCalls();
    
    const today = new Date().toISOString().split('T')[0];
    const callsToday = calls.filter(c => c.createdAt.startsWith(today)).length;
    
    const convertedLeads = leads.filter(l => l.stage === 'Enrolled' || l.stage === 'In Program').length;
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length * 100).toFixed(1) : 0;
    
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const activeCases = cases.filter(c => c.status === 'Active' || c.status === 'In Progress').length;
    
    return {
      totalLeads: leads.length,
      activeCases,
      totalRevenue,
      callsToday,
      conversionRate: parseFloat(conversionRate)
    };
  }
  
  function getManagerStats() {
    const agents = getAgents();
    const deals = getDeals();
    const calls = getCalls();
    
    const today = new Date().toISOString().split('T')[0];
    
    return agents.map(agent => {
      const agentDeals = deals.filter(d => d.agent === agent.id);
      const agentCalls = calls.filter(c => c.agent === agent.id && c.createdAt.startsWith(today));
      const revenue = agentDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        callsToday: agentCalls.length,
        dealsThisWeek: agentDeals.length,
        revenue,
        performance: agent.stats?.calls_made || 0
      };
    });
  }
  
  function getOwnerStats() {
    const leads = getLeads();
    const cases = getCases();
    const deals = getDeals();
    const agents = getAgents();
    const campaigns = getCampaigns();
    
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const avgDealSize = deals.length > 0 ? totalRevenue / deals.length : 0;
    
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    
    return {
      totalLeads: leads.length,
      totalCases: cases.length,
      totalDeals: deals.length,
      totalAgents: agents.length,
      totalRevenue,
      avgDealSize,
      activeCampaigns
    };
  }
  
  // ==================== UTILITIES ====================
  
  function exportData(type) {
    const data = {
      leads: getLeads(),
      cases: getCases(),
      deals: getDeals(),
      agents: getAgents(),
      calls: getCalls(),
      campaigns: getCampaigns()
    }[type];
    
    if (!data) return null;
    
    // Convert to CSV
    if (data.length === 0) return '';
    
    // FIX 5: CSV injection protection
    const sanitizeCSVCell = (value) => {
      if (typeof value !== 'string') return value;
      // Prefix dangerous chars with single quote
      if (/^[=+\-@\t\r]/.test(value)) {
        return "'" + value;
      }
      return value;
    };
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h] || '';
        return JSON.stringify(sanitizeCSVCell(val));
      }).join(','))
    ].join('\n');
    
    return csv;
  }
  
  
  function importData(type, data) {
    setStorage(type, data);
    addActivity({ type: 'data_imported', data: { type, count: data.length } });
    return true;
  }
  
  function reset() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
    addActivity({ type: 'database_reset' });
    return true;
  }
  
  function getCount(type) {
    const data = getStorage(type) || [];
    return Array.isArray(data) ? data.length : 0;
  }
  
  // ==================== AUTH HELPER ====================
  
  function getCurrentUser() {
    try {
      // Try debt_empire_session first (auth.js login), then currentUser fallback
      const sessionData = localStorage.getItem('debt_empire_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check expiry (24h)
        if (session.timestamp && Date.now() - session.timestamp > 24 * 60 * 60 * 1000) return null;
        return session;
      }
      const authData = localStorage.getItem('currentUser');
      if (authData) return JSON.parse(authData);
      const legacyData = localStorage.getItem('debt_current_user');
      if (legacyData) return JSON.parse(legacyData);
      return null;
    } catch (e) {
      return null;
    }
  }
  
  // ==================== PUBLIC API ====================
  
  return {
    // LEADS
    getLeads,
    getLead,
    addLead,
    updateLead,
    deleteLead,
    
    // DEALS
    getDeals,
    getDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    
    // CASES
    getCases,
    getCase,
    addCase,
    updateCase,
    deleteCase,
    addCaseNote,
    addCasePayment,
    addCaseDocument,
    
    // CALLS
    getCalls,
    addCall,
    updateCall,
    
    // AGENTS
    getAgents,
    getAgent,
    addAgent,
    updateAgent,
    
    // ACTIVITIES
    getActivities,
    addActivity,
    
    // NOTIFICATIONS
    getNotifications,
    addNotification,
    markNotificationRead,
    getUnreadCount,
    
    // COMPLIANCE
    getComplianceChecklist,
    updateComplianceItem,
    getLicenses,
    updateLicense,
    getDNCList,
    addToDNC,
    removeFromDNC,
    getAuditLog,
    addAuditEntry,
    
    // CAMPAIGNS
    getCampaigns,
    addCampaign,
    updateCampaign,
    
    // GAMIFICATION
    getLeaderboard,
    getAgentStats,
    addPoints,
    getAchievements,
    
    // SETTINGS
    getSettings,
    updateSettings,
    
    // FINANCIAL
    getRevenue,
    getPayments,
    addPayment,
    getCommissions,
    
    // GLOBAL SEARCH
    search,
    
    // STATS
    getDashboardStats,
    getManagerStats,
    getOwnerStats,
    
    // AUTH
    getCurrentUser,
    
    // UTILITIES
    export: exportData,
    import: importData,
    reset,
    getCount
  };
})();

// console.log('✅ DebtDB loaded successfully');
