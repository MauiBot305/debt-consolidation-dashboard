// Enhanced Database for Debt Consolidation Empire Dashboard
// Functionality verified by Agent 4 (Kimi 5 equivalent)

// Static sample data (used as fallback/defaults)
const DB = {
  // Pipeline Stages
  pipelineStages: [
    'New Lead',
    'Contacted',
    'Qualified',
    'Enrolled',
    'In Program',
    'Negotiating',
    'Settled',
    'Completed'
  ],

  // Sample Leads
  leads: [
    {
      id: 'L001',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '(555) 234-5678',
      stage: 'New Lead',
      totalDebt: 45000,
      monthlyIncome: 4200,
      debtToIncomeRatio: 89,
      creditors: ['Chase', 'Capital One', 'Medical'],
      assignedAgent: 'AGT001',
      createdAt: '2026-02-24T08:30:00',
      lastContact: null,
      priority: 'high'
    },
    {
      id: 'L002',
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '(555) 345-6789',
      stage: 'Contacted',
      totalDebt: 32000,
      monthlyIncome: 5500,
      debtToIncomeRatio: 48,
      creditors: ['Discover', 'Wells Fargo'],
      assignedAgent: 'AGT001',
      createdAt: '2026-02-23T14:20:00',
      lastContact: '2026-02-24T09:15:00',
      priority: 'medium'
    },
    {
      id: 'L003',
      name: 'Jessica Rodriguez',
      email: 'jrodriguez@email.com',
      phone: '(555) 456-7890',
      stage: 'Qualified',
      totalDebt: 67000,
      monthlyIncome: 3800,
      debtToIncomeRatio: 147,
      creditors: ['Amex', 'Citibank', 'BofA', 'Student Loans'],
      assignedAgent: 'AGT001',
      createdAt: '2026-02-22T11:00:00',
      lastContact: '2026-02-24T10:30:00',
      priority: 'high'
    },
    {
      id: 'L004',
      name: 'David Thompson',
      email: 'dthompson@email.com',
      phone: '(555) 567-8901',
      stage: 'New Lead',
      totalDebt: 28000,
      monthlyIncome: 6200,
      debtToIncomeRatio: 38,
      creditors: ['Chase', 'Target'],
      assignedAgent: 'AGT002',
      createdAt: '2026-02-24T07:45:00',
      lastContact: null,
      priority: 'low'
    },
    {
      id: 'L005',
      name: 'Emily Parker',
      email: 'eparker@email.com',
      phone: '(555) 678-9012',
      stage: 'Enrolled',
      totalDebt: 52000,
      monthlyIncome: 4800,
      debtToIncomeRatio: 90,
      creditors: ['Capital One', 'Synchrony', 'Medical'],
      assignedAgent: 'AGT001',
      createdAt: '2026-02-20T09:30:00',
      lastContact: '2026-02-23T15:00:00',
      priority: 'medium'
    },
    // Adding 45 more leads with varied data
    ...Array.from({ length: 45 }, (_, i) => ({
      id: `L${String(i + 6).padStart(3, '0')}`,
      name: `Lead ${i + 6}`,
      email: `lead${i + 6}@email.com`,
      phone: `(555) ${String(Math.floor(Math.random() * 900 + 100))}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
      stage: ['New Lead', 'Contacted', 'Qualified', 'Enrolled'][Math.floor(Math.random() * 4)],
      totalDebt: Math.floor(Math.random() * 80000 + 15000),
      monthlyIncome: Math.floor(Math.random() * 5000 + 3000),
      debtToIncomeRatio: Math.floor(Math.random() * 120 + 30),
      creditors: ['Chase', 'Capital One', 'Discover', 'Wells Fargo', 'Amex'].slice(0, Math.floor(Math.random() * 3 + 1)),
      assignedAgent: `AGT${String(Math.floor(Math.random() * 10 + 1)).padStart(3, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastContact: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : null,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }))
  ],

  // Sample Cases (Enrolled and Beyond)
  cases: [
    {
      id: 'CASE001',
      leadId: 'L005',
      clientName: 'Emily Parker',
      stage: 'In Program',
      totalDebt: 52000,
      settledAmount: 0,
      programFee: 7800,
      monthlyPayment: 650,
      accountBalance: 3250,
      enrollmentDate: '2026-02-20',
      estimatedCompletion: '2027-08-20',
      creditors: [
        { name: 'Capital One', balance: 18000, status: 'In Program' },
        { name: 'Synchrony', balance: 22000, status: 'In Program' },
        { name: 'Medical', balance: 12000, status: 'In Program' }
      ],
      assignedAgent: 'AGT001',
      assignedNegotiator: 'NEG003'
    },
    {
      id: 'CASE002',
      leadId: 'L020',
      clientName: 'Robert Williams',
      stage: 'Negotiating',
      totalDebt: 38000,
      settledAmount: 12000,
      programFee: 5700,
      monthlyPayment: 475,
      accountBalance: 9500,
      enrollmentDate: '2026-01-15',
      estimatedCompletion: '2027-01-15',
      creditors: [
        { name: 'Chase', balance: 15000, status: 'Settled', settledFor: 6000 },
        { name: 'Discover', balance: 23000, status: 'Negotiating', offer: 9200 }
      ],
      assignedAgent: 'AGT002',
      assignedNegotiator: 'NEG001'
    },
    // Adding 18 more cases
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `CASE${String(i + 3).padStart(3, '0')}`,
      leadId: `L${String(i + 10).padStart(3, '0')}`,
      clientName: `Client ${i + 3}`,
      stage: ['In Program', 'Negotiating', 'Settled', 'Completed'][Math.floor(Math.random() * 4)],
      totalDebt: Math.floor(Math.random() * 60000 + 20000),
      settledAmount: Math.floor(Math.random() * 30000),
      programFee: Math.floor(Math.random() * 8000 + 3000),
      monthlyPayment: Math.floor(Math.random() * 400 + 300),
      accountBalance: Math.floor(Math.random() * 15000),
      enrollmentDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedCompletion: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creditors: [
        { name: 'Various', balance: Math.floor(Math.random() * 30000 + 10000), status: 'In Program' }
      ],
      assignedAgent: `AGT${String(Math.floor(Math.random() * 10 + 1)).padStart(3, '0')}`,
      assignedNegotiator: `NEG${String(Math.floor(Math.random() * 5 + 1)).padStart(3, '0')}`
    }))
  ],

  // Sample Agents
  agents: [
    {
      id: 'AGT001',
      name: 'John Smith',
      email: 'agent@demo.com',
      role: 'agent',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3B82F6&color=fff',
      stats: {
        callsToday: 47,
        leadsContacted: 23,
        enrollments: 8,
        revenue: 48500,
        commission: 14550,
        avgCallDuration: '8:32',
        conversionRate: 34.8
      },
      targets: {
        dailyCalls: 60,
        weeklyEnrollments: 10,
        monthlyRevenue: 150000
      },
      performance: {
        thisWeek: { calls: 234, enrollments: 8, revenue: 48500 },
        lastWeek: { calls: 198, enrollments: 6, revenue: 36000 },
        thisMonth: { calls: 892, enrollments: 28, revenue: 168000 }
      }
    },
    {
      id: 'AGT002',
      name: 'Maria Garcia',
      email: 'maria@debtco.com',
      role: 'agent',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=06B6D4&color=fff',
      stats: {
        callsToday: 52,
        leadsContacted: 28,
        enrollments: 12,
        revenue: 72000,
        commission: 21600,
        avgCallDuration: '7:15',
        conversionRate: 42.9
      }
    },
    // Adding 8 more agents
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `AGT${String(i + 3).padStart(3, '0')}`,
      name: `Agent ${i + 3}`,
      email: `agent${i + 3}@debtco.com`,
      role: 'agent',
      avatar: `https://ui-avatars.com/api/?name=Agent+${i + 3}&background=3B82F6&color=fff`,
      stats: {
        callsToday: Math.floor(Math.random() * 40 + 20),
        leadsContacted: Math.floor(Math.random() * 20 + 10),
        enrollments: Math.floor(Math.random() * 8 + 2),
        revenue: Math.floor(Math.random() * 50000 + 20000),
        commission: Math.floor(Math.random() * 15000 + 6000),
        avgCallDuration: `${Math.floor(Math.random() * 5 + 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        conversionRate: Math.floor(Math.random() * 30 + 20)
      }
    }))
  ],

  // Activities
  activities: [
    {
      id: 'ACT001',
      type: 'call',
      agentId: 'AGT001',
      leadId: 'L003',
      description: 'Qualification call completed - High potential',
      timestamp: '2026-02-24T10:30:00',
      result: 'qualified',
      duration: 510
    },
    {
      id: 'ACT002',
      type: 'enrollment',
      agentId: 'AGT001',
      leadId: 'L005',
      description: 'Client enrolled in debt program - $52,000 total debt',
      timestamp: '2026-02-24T09:15:00',
      result: 'success'
    },
    {
      id: 'ACT003',
      type: 'follow_up',
      agentId: 'AGT001',
      leadId: 'L002',
      description: 'Scheduled follow-up call for document collection',
      timestamp: '2026-02-24T08:45:00',
      result: 'scheduled'
    },
    {
      id: 'ACT004',
      type: 'call',
      agentId: 'AGT001',
      leadId: 'L001',
      description: 'Initial contact - Left voicemail',
      timestamp: '2026-02-24T08:15:00',
      result: 'voicemail',
      duration: 45
    }
  ],

  // Tasks/Follow-ups
  tasks: [
    {
      id: 'TASK001',
      agentId: 'AGT001',
      leadId: 'L003',
      title: 'Send enrollment documents to Jessica Rodriguez',
      dueDate: '2026-02-24T15:00:00',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'TASK002',
      agentId: 'AGT001',
      leadId: 'L002',
      title: 'Follow-up call - Document collection',
      dueDate: '2026-02-24T16:30:00',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 'TASK003',
      agentId: 'AGT001',
      leadId: 'L001',
      title: 'Second attempt contact - Sarah Mitchell',
      dueDate: '2026-02-25T09:00:00',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'TASK004',
      agentId: 'AGT001',
      leadId: 'L005',
      title: 'Welcome call - Program orientation',
      dueDate: '2026-02-24T14:00:00',
      priority: 'medium',
      status: 'pending'
    }
  ],

  // Appointments
  appointments: [
    {
      id: 'APP001',
      agentId: 'AGT001',
      leadId: 'L003',
      title: 'Enrollment Call - Jessica Rodriguez',
      dateTime: '2026-02-25T10:00:00',
      duration: 60,
      type: 'enrollment',
      status: 'scheduled'
    },
    {
      id: 'APP002',
      agentId: 'AGT001',
      leadId: 'L002',
      title: 'Document Review - Michael Chen',
      dateTime: '2026-02-25T14:30:00',
      duration: 30,
      type: 'follow_up',
      status: 'scheduled'
    }
  ],

  // Deals (for tracking settlements)
  deals: [],

  // Notifications
  notifications: [],

  // Revenue/Commission Data
  revenue: {
    today: 48500,
    thisWeek: 168000,
    thisMonth: 645000,
    thisYear: 2340000,
    byAgent: {
      'AGT001': { total: 168000, commission: 50400 },
      'AGT002': { total: 210000, commission: 63000 }
    }
  },

  // Settings
  settings: {
    companyName: 'Debt Consolidation Empire',
    timezone: 'America/New_York',
    currency: 'USD',
    businessHours: { start: '09:00', end: '18:00' }
  }
};

// Helper functions
const DBHelpers = {
  getLeadById(id) {
    return DB.leads.find(l => l.id === id);
  },

  getLeadsByAgent(agentId) {
    return DB.leads.filter(l => l.assignedAgent === agentId);
  },

  getAgentById(id) {
    return DB.agents.find(a => a.id === id);
  },

  getActivitiesByAgent(agentId, limit = 10) {
    return DB.activities
      .filter(a => a.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  getTasksByAgent(agentId) {
    return DB.tasks
      .filter(t => t.agentId === agentId && t.status === 'pending')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  getAppointmentsByAgent(agentId) {
    return DB.appointments
      .filter(a => a.agentId === agentId && a.status === 'scheduled')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  getStageColor(stage) {
    const colors = {
      'New Lead': 'text-gray-400',
      'Contacted': 'text-blue-400',
      'Qualified': 'text-cyan-400',
      'Enrolled': 'text-green-400',
      'In Program': 'text-yellow-400',
      'Negotiating': 'text-orange-400',
      'Settled': 'text-emerald-400',
      'Completed': 'text-teal-400'
    };
    return colors[stage] || 'text-gray-400';
  }
};

// ============================================================================
// DEBTDB - CRUD Operations with localStorage Persistence
// ============================================================================

const DebtDB = {
  // Storage keys
  KEYS: {
    leads: 'debtdb_leads',
    cases: 'debtdb_cases',
    deals: 'debtdb_deals',
    agents: 'debtdb_agents',
    calls: 'debtdb_calls',
    activities: 'debtdb_activities',
    notifications: 'debtdb_notifications',
    tasks: 'debtdb_tasks',
    appointments: 'debtdb_appointments',
    revenue: 'debtdb_revenue',
    settings: 'debtdb_settings',
    initialized: 'debtdb_initialized'
  },

  // Initialize database (load from localStorage or seed with defaults)
  init() {
    if (!localStorage.getItem(this.KEYS.initialized)) {
      // First run - seed with default data
      this.seedData();
      localStorage.setItem(this.KEYS.initialized, 'true');
    }
  },

  // Seed database with default data
  seedData() {
    localStorage.setItem(this.KEYS.leads, JSON.stringify(DB.leads));
    localStorage.setItem(this.KEYS.cases, JSON.stringify(DB.cases));
    localStorage.setItem(this.KEYS.deals, JSON.stringify(DB.deals || []));
    localStorage.setItem(this.KEYS.agents, JSON.stringify(DB.agents));
    localStorage.setItem(this.KEYS.activities, JSON.stringify(DB.activities));
    localStorage.setItem(this.KEYS.notifications, JSON.stringify(DB.notifications || []));
    localStorage.setItem(this.KEYS.tasks, JSON.stringify(DB.tasks));
    localStorage.setItem(this.KEYS.appointments, JSON.stringify(DB.appointments));
    localStorage.setItem(this.KEYS.revenue, JSON.stringify(DB.revenue));
    localStorage.setItem(this.KEYS.settings, JSON.stringify(DB.settings));
  },

  // Generic get method
  _get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Generic set method
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // LEADS CRUD
  getLeads(filters = {}) {
    let leads = this._get(this.KEYS.leads);
    
    // Apply filters
    if (filters.stage) {
      leads = leads.filter(l => l.stage === filters.stage);
    }
    if (filters.assignedAgent) {
      leads = leads.filter(l => l.assignedAgent === filters.assignedAgent);
    }
    if (filters.priority) {
      leads = leads.filter(l => l.priority === filters.priority);
    }
    
    return JSON.parse(JSON.stringify(leads)); // Return deep copy
  },

  getLeadById(id) {
    const leads = this._get(this.KEYS.leads);
    const lead = leads.find(l => l.id === id);
    return lead ? JSON.parse(JSON.stringify(lead)) : null;
  },

  addLead(lead) {
    const leads = this._get(this.KEYS.leads);
    lead.id = lead.id || `L${String(leads.length + 1).padStart(3, '0')}`;
    lead.createdAt = lead.createdAt || new Date().toISOString();
    leads.push(lead);
    this._set(this.KEYS.leads, leads);
    return lead;
  },

  updateLead(id, updates) {
    const leads = this._get(this.KEYS.leads);
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      this._set(this.KEYS.leads, leads);
      return leads[index];
    }
    return null;
  },

  deleteLead(id) {
    let leads = this._get(this.KEYS.leads);
    leads = leads.filter(l => l.id !== id);
    this._set(this.KEYS.leads, leads);
    return true;
  },

  // CASES CRUD
  getCases(filters = {}) {
    let cases = this._get(this.KEYS.cases);
    
    if (filters.stage) {
      cases = cases.filter(c => c.stage === filters.stage);
    }
    if (filters.assignedAgent) {
      cases = cases.filter(c => c.assignedAgent === filters.assignedAgent);
    }
    
    return JSON.parse(JSON.stringify(cases));
  },

  getCaseById(id) {
    const cases = this._get(this.KEYS.cases);
    const caseItem = cases.find(c => c.id === id);
    return caseItem ? JSON.parse(JSON.stringify(caseItem)) : null;
  },

  addCase(caseItem) {
    const cases = this._get(this.KEYS.cases);
    caseItem.id = caseItem.id || `CASE${String(cases.length + 1).padStart(3, '0')}`;
    caseItem.enrollmentDate = caseItem.enrollmentDate || new Date().toISOString().split('T')[0];
    cases.push(caseItem);
    this._set(this.KEYS.cases, cases);
    return caseItem;
  },

  updateCase(id, updates) {
    const cases = this._get(this.KEYS.cases);
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      cases[index] = { ...cases[index], ...updates };
      this._set(this.KEYS.cases, cases);
      return cases[index];
    }
    return null;
  },

  deleteCase(id) {
    let cases = this._get(this.KEYS.cases);
    cases = cases.filter(c => c.id !== id);
    this._set(this.KEYS.cases, cases);
    return true;
  },

  // DEALS CRUD
  getDeals(filters = {}) {
    let deals = this._get(this.KEYS.deals);
    
    if (filters.status) {
      deals = deals.filter(d => d.status === filters.status);
    }
    if (filters.assignedAgent) {
      deals = deals.filter(d => d.assignedAgent === filters.assignedAgent);
    }
    
    return JSON.parse(JSON.stringify(deals));
  },

  getDealById(id) {
    const deals = this._get(this.KEYS.deals);
    const deal = deals.find(d => d.id === id);
    return deal ? JSON.parse(JSON.stringify(deal)) : null;
  },

  addDeal(deal) {
    const deals = this._get(this.KEYS.deals);
    deal.id = deal.id || `DEAL${String(deals.length + 1).padStart(3, '0')}`;
    deal.createdAt = deal.createdAt || new Date().toISOString();
    deals.push(deal);
    this._set(this.KEYS.deals, deals);
    return deal;
  },

  updateDeal(id, updates) {
    const deals = this._get(this.KEYS.deals);
    const index = deals.findIndex(d => d.id === id);
    if (index !== -1) {
      deals[index] = { ...deals[index], ...updates };
      this._set(this.KEYS.deals, deals);
      return deals[index];
    }
    return null;
  },

  deleteDeal(id) {
    let deals = this._get(this.KEYS.deals);
    deals = deals.filter(d => d.id !== id);
    this._set(this.KEYS.deals, deals);
    return true;
  },

  // AGENTS CRUD
  getAgents(filters = {}) {
    let agents = this._get(this.KEYS.agents);
    
    if (filters.role) {
      agents = agents.filter(a => a.role === filters.role);
    }
    
    return JSON.parse(JSON.stringify(agents));
  },

  getAgentById(id) {
    const agents = this._get(this.KEYS.agents);
    const agent = agents.find(a => a.id === id);
    return agent ? JSON.parse(JSON.stringify(agent)) : null;
  },

  addAgent(agent) {
    const agents = this._get(this.KEYS.agents);
    agent.id = agent.id || `AGT${String(agents.length + 1).padStart(3, '0')}`;
    agents.push(agent);
    this._set(this.KEYS.agents, agents);
    return agent;
  },

  updateAgent(id, updates) {
    const agents = this._get(this.KEYS.agents);
    const index = agents.findIndex(a => a.id === id);
    if (index !== -1) {
      agents[index] = { ...agents[index], ...updates };
      this._set(this.KEYS.agents, agents);
      return agents[index];
    }
    return null;
  },

  // CALLS/ACTIVITIES CRUD
  getCalls(filters = {}) {
    let activities = this._get(this.KEYS.activities);
    activities = activities.filter(a => a.type === 'call');
    
    if (filters.agentId) {
      activities = activities.filter(a => a.agentId === filters.agentId);
    }
    if (filters.result) {
      activities = activities.filter(a => a.result === filters.result);
    }
    
    return JSON.parse(JSON.stringify(activities));
  },

  addCall(call) {
    const activities = this._get(this.KEYS.activities);
    call.id = call.id || `ACT${String(activities.length + 1).padStart(3, '0')}`;
    call.type = 'call';
    call.timestamp = call.timestamp || new Date().toISOString();
    activities.push(call);
    this._set(this.KEYS.activities, activities);
    return call;
  },

  updateCall(id, updates) {
    const activities = this._get(this.KEYS.activities);
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates };
      this._set(this.KEYS.activities, activities);
      return activities[index];
    }
    return null;
  },

  // ACTIVITIES CRUD
  getActivities(filters = {}) {
    let activities = this._get(this.KEYS.activities);
    
    if (filters.type) {
      activities = activities.filter(a => a.type === filters.type);
    }
    if (filters.agentId) {
      activities = activities.filter(a => a.agentId === filters.agentId);
    }
    if (filters.leadId) {
      activities = activities.filter(a => a.leadId === filters.leadId);
    }
    
    // Sort by timestamp desc
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return JSON.parse(JSON.stringify(activities));
  },

  addActivity(activity) {
    const activities = this._get(this.KEYS.activities);
    activity.id = activity.id || `ACT${String(activities.length + 1).padStart(3, '0')}`;
    activity.timestamp = activity.timestamp || new Date().toISOString();
    activities.push(activity);
    this._set(this.KEYS.activities, activities);
    return activity;
  },

  // NOTIFICATIONS CRUD
  getNotifications() {
    const notifications = this._get(this.KEYS.notifications);
    return JSON.parse(JSON.stringify(notifications));
  },

  addNotification(notification) {
    const notifications = this._get(this.KEYS.notifications);
    notification.id = notification.id || `NOTIF${String(notifications.length + 1).padStart(3, '0')}`;
    notification.timestamp = notification.timestamp || new Date().toISOString();
    notification.read = notification.read || false;
    notifications.unshift(notification); // Add to beginning
    this._set(this.KEYS.notifications, notifications);
    return notification;
  },

  clearNotification(id) {
    let notifications = this._get(this.KEYS.notifications);
    notifications = notifications.filter(n => n.id !== id);
    this._set(this.KEYS.notifications, notifications);
    return true;
  },

  markNotificationRead(id) {
    const notifications = this._get(this.KEYS.notifications);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this._set(this.KEYS.notifications, notifications);
      return true;
    }
    return false;
  },

  // TASKS CRUD
  getTasks(filters = {}) {
    let tasks = this._get(this.KEYS.tasks);
    
    if (filters.agentId) {
      tasks = tasks.filter(t => t.agentId === filters.agentId);
    }
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }
    
    // Sort by due date
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return JSON.parse(JSON.stringify(tasks));
  },

  addTask(task) {
    const tasks = this._get(this.KEYS.tasks);
    task.id = task.id || `TASK${String(tasks.length + 1).padStart(3, '0')}`;
    task.status = task.status || 'pending';
    tasks.push(task);
    this._set(this.KEYS.tasks, tasks);
    return task;
  },

  updateTask(id, updates) {
    const tasks = this._get(this.KEYS.tasks);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this._set(this.KEYS.tasks, tasks);
      return tasks[index];
    }
    return null;
  },

  // SETTINGS
  getSettings() {
    const settings = this._get(this.KEYS.settings);
    return settings.length ? settings : DB.settings;
  },

  updateSettings(key, value) {
    let settings = this._get(this.KEYS.settings);
    if (!settings || typeof settings !== 'object') {
      settings = DB.settings;
    }
    settings[key] = value;
    this._set(this.KEYS.settings, settings);
    return settings;
  },

  // GLOBAL SEARCH
  search(query) {
    query = query.toLowerCase().trim();
    if (!query) return { leads: [], cases: [], agents: [], deals: [] };

    const leads = this.getLeads().filter(l =>
      l.name.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.phone.includes(query) ||
      l.id.toLowerCase().includes(query)
    );

    const cases = this.getCases().filter(c =>
      c.clientName.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query) ||
      c.leadId.toLowerCase().includes(query)
    );

    const agents = this.getAgents().filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      a.id.toLowerCase().includes(query)
    );

    const deals = this.getDeals().filter(d =>
      d.id.toLowerCase().includes(query) ||
      (d.clientName && d.clientName.toLowerCase().includes(query))
    );

    return { leads, cases, agents, deals };
  },

  // ANALYTICS HELPERS
  getRevenue() {
    return this._get(this.KEYS.revenue) || DB.revenue;
  },

  updateRevenue(updates) {
    let revenue = this._get(this.KEYS.revenue) || DB.revenue;
    revenue = { ...revenue, ...updates };
    this._set(this.KEYS.revenue, revenue);
    return revenue;
  }
};

// Initialize DebtDB on load
DebtDB.init();

// Expose globally
window.DebtDB = DebtDB;
window.DB = DB; // Keep static DB for reference
window.DBHelpers = DBHelpers;
