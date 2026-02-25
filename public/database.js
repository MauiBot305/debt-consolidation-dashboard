// Mock Database for Debt Consolidation Empire Dashboard

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
      result: 'qualified'
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
      result: 'voicemail'
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
