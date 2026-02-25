// DebtDB - LocalStorage-persisted database wrapper

const DebtDB = {
  // Storage keys
  KEYS: {
    LEADS: 'debtempire_leads',
    CASES: 'debtempire_cases',
    AGENTS: 'debtempire_agents',
    ACTIVITIES: 'debtempire_activities',
    TASKS: 'debtempire_tasks',
    APPOINTMENTS: 'debtempire_appointments',
    CALLS: 'debtempire_calls',
    REVENUE: 'debtempire_revenue'
  },

  // Initialize database with sample data if empty
  init() {
    // Initialize from original DB mock if localStorage is empty
    if (!localStorage.getItem(this.KEYS.LEADS)) {
      localStorage.setItem(this.KEYS.LEADS, JSON.stringify(DB.leads));
    }
    if (!localStorage.getItem(this.KEYS.CASES)) {
      localStorage.setItem(this.KEYS.CASES, JSON.stringify(DB.cases));
    }
    if (!localStorage.getItem(this.KEYS.AGENTS)) {
      localStorage.setItem(this.KEYS.AGENTS, JSON.stringify(DB.agents));
    }
    if (!localStorage.getItem(this.KEYS.ACTIVITIES)) {
      localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(DB.activities));
    }
    if (!localStorage.getItem(this.KEYS.TASKS)) {
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(DB.tasks));
    }
    if (!localStorage.getItem(this.KEYS.APPOINTMENTS)) {
      localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(DB.appointments));
    }
    if (!localStorage.getItem(this.KEYS.CALLS)) {
      localStorage.setItem(this.KEYS.CALLS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.REVENUE)) {
      localStorage.setItem(this.KEYS.REVENUE, JSON.stringify(DB.revenue));
    }
  },

  // GET methods
  get leads() {
    return JSON.parse(localStorage.getItem(this.KEYS.LEADS) || '[]');
  },

  get cases() {
    return JSON.parse(localStorage.getItem(this.KEYS.CASES) || '[]');
  },

  get agents() {
    return JSON.parse(localStorage.getItem(this.KEYS.AGENTS) || '[]');
  },

  get activities() {
    return JSON.parse(localStorage.getItem(this.KEYS.ACTIVITIES) || '[]');
  },

  get tasks() {
    return JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
  },

  get appointments() {
    return JSON.parse(localStorage.getItem(this.KEYS.APPOINTMENTS) || '[]');
  },

  get calls() {
    return JSON.parse(localStorage.getItem(this.KEYS.CALLS) || '[]');
  },

  get revenue() {
    return JSON.parse(localStorage.getItem(this.KEYS.REVENUE) || '{}');
  },

  // SAVE methods
  saveLeads(leads) {
    localStorage.setItem(this.KEYS.LEADS, JSON.stringify(leads));
  },

  saveCases(cases) {
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
  },

  saveAgents(agents) {
    localStorage.setItem(this.KEYS.AGENTS, JSON.stringify(agents));
  },

  saveActivities(activities) {
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  saveTasks(tasks) {
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
  },

  saveAppointments(appointments) {
    localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  saveCalls(calls) {
    localStorage.setItem(this.KEYS.CALLS, JSON.stringify(calls));
  },

  saveRevenue(revenue) {
    localStorage.setItem(this.KEYS.REVENUE, JSON.stringify(revenue));
  },

  // ADD methods
  addLead(lead) {
    const leads = this.leads;
    leads.unshift(lead);
    this.saveLeads(leads);
    return lead;
  },

  addCase(caseData) {
    const cases = this.cases;
    cases.unshift(caseData);
    this.saveCases(cases);
    return caseData;
  },

  addActivity(activity) {
    const activities = this.activities;
    activities.unshift(activity);
    this.saveActivities(activities);
    return activity;
  },

  addTask(task) {
    const tasks = this.tasks;
    tasks.unshift(task);
    this.saveTasks(tasks);
    return task;
  },

  addAppointment(appointment) {
    const appointments = this.appointments;
    appointments.unshift(appointment);
    this.saveAppointments(appointments);
    return appointment;
  },

  addCall(call) {
    const calls = this.calls;
    calls.unshift(call);
    this.saveCalls(calls);
    return call;
  },

  // UPDATE methods
  updateLead(id, updates) {
    const leads = this.leads;
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      this.saveLeads(leads);
      return leads[index];
    }
    return null;
  },

  updateCase(id, updates) {
    const cases = this.cases;
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      cases[index] = { ...cases[index], ...updates };
      this.saveCases(cases);
      return cases[index];
    }
    return null;
  },

  updateTask(id, updates) {
    const tasks = this.tasks;
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  // DELETE methods
  deleteLead(id) {
    const leads = this.leads.filter(l => l.id !== id);
    this.saveLeads(leads);
  },

  deleteCase(id) {
    const cases = this.cases.filter(c => c.id !== id);
    this.saveCases(cases);
  },

  deleteTask(id) {
    const tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  // QUERY methods
  getLeadById(id) {
    return this.leads.find(l => l.id === id);
  },

  getCaseById(id) {
    return this.cases.find(c => c.id === id);
  },

  getLeadsByAgent(agentId) {
    return this.leads.filter(l => l.assignedAgent === agentId);
  },

  getCasesByAgent(agentId) {
    return this.cases.filter(c => c.assignedAgent === agentId);
  },

  getTasksByAgent(agentId) {
    return this.tasks.filter(t => t.agentId === agentId && t.status === 'pending');
  },

  getActivitiesByAgent(agentId, limit = 10) {
    return this.activities
      .filter(a => a.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  getAppointmentsByAgent(agentId) {
    return this.appointments
      .filter(a => a.agentId === agentId && a.status === 'scheduled')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  },

  // UTILITY methods (from DBHelpers)
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

// Initialize on load
if (typeof window !== 'undefined') {
  DebtDB.init();
}
