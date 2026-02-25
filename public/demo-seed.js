// v2026-02-25
/**
 * Demo Seed Data for Debt Consolidation Empire Dashboard
 * DebtStoppers-relevant realistic data
 * 
 * Automatically seeds on page load if localStorage is empty
 */

(function() {
  'use strict';
  
  // Check if already seeded
  if (localStorage.getItem('debtdb_seeded') === 'true') {
    console.log('📦 Demo data already seeded');
    return;
  }
  
  console.log('🌱 Seeding demo data...');
  
  // ==================== AGENTS ====================
  
  const agents = [
    {
      id: 'agent_001',
      name: 'Michael Rodriguez',
      email: 'mrodriguez@debtempire.com',
      role: 'Senior Debt Consultant',
      phone: '(312) 555-0101',
      status: 'active',
      stats: {
        calls_made: 342,
        deals_closed: 28,
        revenue_generated: 185000,
        avg_call_duration: 420 // 7 minutes
      },
      level: 5,
      points: 4200,
      achievements: ['Top Closer', '100 Calls Milestone'],
      currentStreak: 12
    },
    {
      id: 'agent_002',
      name: 'Sarah Chen',
      email: 'schen@debtempire.com',
      role: 'Debt Specialist',
      phone: '(312) 555-0102',
      status: 'active',
      stats: {
        calls_made: 298,
        deals_closed: 24,
        revenue_generated: 156000,
        avg_call_duration: 390
      },
      level: 4,
      points: 3800,
      achievements: ['Fast Closer'],
      currentStreak: 8
    },
    {
      id: 'agent_003',
      name: 'James Thompson',
      email: 'jthompson@debtempire.com',
      role: 'Debt Consultant',
      phone: '(312) 555-0103',
      status: 'active',
      stats: {
        calls_made: 276,
        deals_closed: 21,
        revenue_generated: 142000,
        avg_call_duration: 410
      },
      level: 4,
      points: 3400,
      achievements: ['Persistent Pro'],
      currentStreak: 5
    },
    {
      id: 'agent_004',
      name: 'Lisa Martinez',
      email: 'lmartinez@debtempire.com',
      role: 'Senior Consultant',
      phone: '(312) 555-0104',
      status: 'active',
      stats: {
        calls_made: 315,
        deals_closed: 26,
        revenue_generated: 172000,
        avg_call_duration: 405
      },
      level: 5,
      points: 4000,
      achievements: ['Master Closer', 'High Volume'],
      currentStreak: 10
    },
    {
      id: 'agent_005',
      name: 'David Kim',
      email: 'dkim@debtempire.com',
      role: 'Debt Specialist',
      phone: '(312) 555-0105',
      status: 'active',
      stats: {
        calls_made: 189,
        deals_closed: 15,
        revenue_generated: 98000,
        avg_call_duration: 380
      },
      level: 3,
      points: 2400,
      achievements: ['Rising Star'],
      currentStreak: 3
    },
    {
      id: 'agent_006',
      name: 'Jennifer Wilson',
      email: 'jwilson@debtempire.com',
      role: 'Debt Consultant',
      phone: '(312) 555-0106',
      status: 'active',
      stats: {
        calls_made: 245,
        deals_closed: 19,
        revenue_generated: 124000,
        avg_call_duration: 395
      },
      level: 3,
      points: 2800,
      achievements: ['Consistent Performer'],
      currentStreak: 6
    },
    {
      id: 'agent_007',
      name: 'Robert Jackson',
      email: 'rjackson@debtempire.com',
      role: 'Junior Consultant',
      phone: '(312) 555-0107',
      status: 'active',
      stats: {
        calls_made: 156,
        deals_closed: 11,
        revenue_generated: 72000,
        avg_call_duration: 360
      },
      level: 2,
      points: 1600,
      achievements: ['First Deal'],
      currentStreak: 2
    },
    {
      id: 'agent_008',
      name: 'Maria Gonzalez',
      email: 'mgonzalez@debtempire.com',
      role: 'Debt Specialist',
      phone: '(312) 555-0108',
      status: 'active',
      stats: {
        calls_made: 267,
        deals_closed: 22,
        revenue_generated: 145000,
        avg_call_duration: 400
      },
      level: 4,
      points: 3200,
      achievements: ['Team Player'],
      currentStreak: 7
    },
    {
      id: 'agent_009',
      name: 'Kevin Brown',
      email: 'kbrown@debtempire.com',
      role: 'Senior Specialist',
      phone: '(312) 555-0109',
      status: 'active',
      stats: {
        calls_made: 289,
        deals_closed: 23,
        revenue_generated: 151000,
        avg_call_duration: 415
      },
      level: 4,
      points: 3600,
      achievements: ['Veteran Closer'],
      currentStreak: 9
    },
    {
      id: 'agent_010',
      name: 'Amanda Taylor',
      email: 'ataylor@debtempire.com',
      role: 'Debt Consultant',
      phone: '(312) 555-0110',
      status: 'active',
      stats: {
        calls_made: 203,
        deals_closed: 16,
        revenue_generated: 105000,
        avg_call_duration: 385
      },
      level: 3,
      points: 2600,
      achievements: ['Quick Learner'],
      currentStreak: 4
    }
  ];
  
  agents.forEach(agent => DebtDB.addAgent(agent));
  
  // ==================== LEADS ====================
  
  const leadStatuses = ['New', 'Contacted', 'Qualified', 'Enrolled', 'Not Interested', 'Follow-Up'];
  const sources = ['Google Ads', 'TV Ad', 'Radio', 'Referral', 'Website', 'Facebook', 'Direct Mail'];
  const debtTypes = ['Credit Card', 'Medical', 'Student Loan', 'Personal Loan', 'Auto', 'Tax'];
  
  const stateAddresses = {
    IL: [
      { city: 'Chicago', zip: '60601', street: '123 N Michigan Ave' },
      { city: 'Aurora', zip: '60505', street: '456 Oak Street' },
      { city: 'Naperville', zip: '60540', street: '789 Main Street' },
      { city: 'Joliet', zip: '60435', street: '321 River Road' }
    ],
    FL: [
      { city: 'Miami', zip: '33101', street: '555 Biscayne Blvd' },
      { city: 'Tampa', zip: '33602', street: '777 Harbor Way' },
      { city: 'Orlando', zip: '32801', street: '888 Orange Ave' }
    ],
    MI: [
      { city: 'Detroit', zip: '48201', street: '999 Woodward Ave' },
      { city: 'Grand Rapids', zip: '49503', street: '111 Division St' }
    ],
    GA: [
      { city: 'Atlanta', zip: '30303', street: '222 Peachtree St' },
      { city: 'Savannah', zip: '31401', street: '333 River Street' }
    ],
    TX: [
      { city: 'Houston', zip: '77002', street: '444 Main Street' },
      { city: 'Dallas', zip: '75201', street: '666 Elm Street' }
    ]
  };
  
  const firstNames = ['John', 'Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'Robert', 'Maria', 'James', 'Jessica', 'William', 'Emily', 'Richard', 'Amanda', 'Thomas', 'Ashley', 'Daniel', 'Nicole', 'Matthew', 'Stephanie'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const leads = [];
  const statusDistribution = {
    'New': 10,
    'Contacted': 10,
    'Qualified': 10,
    'Enrolled': 8,
    'Not Interested': 5,
    'Follow-Up': 7
  };
  
  let leadCounter = 0;
  
  for (let status in statusDistribution) {
    for (let i = 0; i < statusDistribution[status]; i++) {
      leadCounter++;
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const state = Object.keys(stateAddresses)[Math.floor(Math.random() * 5)];
      const address = stateAddresses[state][Math.floor(Math.random() * stateAddresses[state].length)];
      
      const totalDebt = Math.floor(Math.random() * (200000 - 15000) + 15000);
      const monthlyIncome = Math.floor(Math.random() * (8000 - 2500) + 2500);
      
      const numCreditors = Math.floor(Math.random() * 4) + 2;
      const creditors = ['Chase', 'Capital One', 'Bank of America', 'Discover', 'Citi', 'Wells Fargo', 'Synchrony', 'AMEX']
        .sort(() => 0.5 - Math.random())
        .slice(0, numCreditors);
      
      const numDebtTypes = Math.floor(Math.random() * 3) + 1;
      const clientDebtTypes = debtTypes
        .sort(() => 0.5 - Math.random())
        .slice(0, numDebtTypes);
      
      const daysAgo = Math.floor(Math.random() * 30);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      const lead = {
        id: `lead_${String(leadCounter).padStart(3, '0')}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${address.street}, ${address.city}, ${state} ${address.zip}`,
        status: status,
        source: sources[Math.floor(Math.random() * sources.length)],
        totalDebt: totalDebt,
        monthlyIncome: monthlyIncome,
        debtTypes: clientDebtTypes,
        creditors: creditors,
        agent: agents[Math.floor(Math.random() * agents.length)].id,
        priority: totalDebt > 100000 ? 'high' : totalDebt > 50000 ? 'medium' : 'low',
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
        notes: status !== 'New' ? [
          `Initial contact made. Client expressed interest in ${clientDebtTypes[0].toLowerCase()} relief.`,
          status === 'Qualified' || status === 'Enrolled' ? 'Verified income and debt details. Qualified for program.' : '',
          status === 'Not Interested' ? 'Client decided to pursue other options.' : ''
        ].filter(n => n) : []
      };
      
      leads.push(lead);
    }
  }
  
  leads.forEach(lead => DebtDB.addLead(lead));
  
  // ==================== DEALS ====================
  
  const dealStages = ['New Lead', 'Contacted', 'Qualified', 'Enrolled', 'In Program', 'Negotiating', 'Settled', 'Completed'];
  const stageDistribution = {
    'New Lead': 3,
    'Contacted': 3,
    'Qualified': 3,
    'Enrolled': 3,
    'In Program': 3,
    'Negotiating': 2,
    'Settled': 2,
    'Completed': 1
  };
  
  let dealCounter = 0;
  
  for (let stage in stageDistribution) {
    for (let i = 0; i < stageDistribution[stage]; i++) {
      dealCounter++;
      
      const lead = leads[Math.floor(Math.random() * leads.length)];
      const enrolledDebt = lead.totalDebt;
      const settlementRate = Math.random() * (0.60 - 0.40) + 0.40; // 40-60%
      const settlementAmount = Math.floor(enrolledDebt * settlementRate);
      const programLength = Math.floor(Math.random() * (48 - 24) + 24); // 24-48 months
      
      const daysAgo = Math.floor(Math.random() * 60);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      const deal = {
        id: `deal_${String(dealCounter).padStart(3, '0')}`,
        client: lead.name,
        leadId: lead.id,
        stage: stage,
        enrolledDebt: enrolledDebt,
        settlementAmount: settlementAmount,
        settlementRate: Math.round(settlementRate * 100),
        programLength: programLength,
        monthlyPayment: Math.floor(settlementAmount / programLength),
        creditors: lead.creditors,
        agent: lead.agent,
        amount: stage === 'Completed' || stage === 'Settled' ? settlementAmount : enrolledDebt,
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString()
      };
      
      DebtDB.addDeal(deal);
    }
  }
  
  // ==================== CASES ====================
  
  const caseTypes = ['Chapter 7', 'Chapter 13', 'Debt Consolidation', 'Debt Settlement'];
  const caseStatuses = ['Active', 'In Progress', 'Pending', 'Completed'];
  
  for (let i = 1; i <= 15; i++) {
    const lead = leads[Math.floor(Math.random() * leads.length)];
    const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    const status = caseStatuses[Math.floor(Math.random() * caseStatuses.length)];
    
    const numCreditors = Math.floor(Math.random() * 5) + 3;
    const creditorList = [];
    
    for (let j = 0; j < numCreditors; j++) {
      creditorList.push({
        name: ['Chase', 'Capital One', 'Bank of America', 'Discover', 'Citi', 'Wells Fargo', 'Synchrony', 'AMEX', 'Barclays'][j % 9],
        balance: Math.floor(Math.random() * 25000) + 5000,
        accountNumber: `****${Math.floor(Math.random() * 9000) + 1000}`
      });
    }
    
    const totalDebt = creditorList.reduce((sum, c) => sum + c.balance, 0);
    
    const daysAgo = Math.floor(Math.random() * 90);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);
    
    const caseData = {
      id: `case_${String(i).padStart(3, '0')}`,
      client: lead.name,
      leadId: lead.id,
      type: caseType,
      status: status,
      totalDebt: totalDebt,
      creditors: creditorList,
      agent: lead.agent,
      filingDate: createdDate.toISOString().split('T')[0],
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      notes: [
        { id: 'note_1', text: 'Initial consultation completed. Client qualified for program.', createdAt: createdDate.toISOString(), createdBy: lead.agent },
        { id: 'note_2', text: 'Submitted documentation to creditors.', createdAt: new Date(createdDate.getTime() + 86400000 * 7).toISOString(), createdBy: lead.agent }
      ],
      payments: status === 'Active' || status === 'Completed' ? [
        { id: 'payment_1', amount: 500, date: createdDate.toISOString().split('T')[0], method: 'ACH', createdAt: createdDate.toISOString() }
      ] : [],
      documents: [
        { id: 'doc_1', name: 'Client Agreement.pdf', type: 'Contract', uploadedAt: createdDate.toISOString(), uploadedBy: lead.agent },
        { id: 'doc_2', name: 'Income Verification.pdf', type: 'Financial', uploadedAt: createdDate.toISOString(), uploadedBy: lead.agent }
      ]
    };
    
    DebtDB.addCase(caseData);
  }
  
  // ==================== CALLS ====================
  
  const callDispositions = ['Qualified', 'Follow-Up Needed', 'Not Interested', 'Voicemail', 'Enrolled'];
  const callDirections = ['inbound', 'outbound'];
  
  const callTranscripts = [
    {
      disposition: 'Qualified',
      transcript: "Agent: Hi, this is Michael from Debt Solutions. I'm calling about your recent inquiry. Client: Yes, I've been struggling with credit card debt. Agent: I understand. Can you tell me about your total debt amount? Client: About $45,000 across three cards. Agent: And your monthly income? Client: Around $4,200. Agent: Great, you qualify for our debt consolidation program. Let me explain how it works..."
    },
    {
      disposition: 'Follow-Up Needed',
      transcript: "Agent: Hi Sarah, following up on our conversation yesterday. Client: Oh yes, I'm still thinking about it. Agent: Totally understand. Do you have any questions I can answer? Client: I need to talk to my spouse first. Can you call back next week? Agent: Absolutely, I'll schedule a follow-up for Tuesday."
    },
    {
      disposition: 'Not Interested',
      transcript: "Agent: Good afternoon, this is James from Debt Solutions. Client: I'm not interested, please remove me from your list. Agent: I understand. I'll make sure you're removed. Have a great day."
    },
    {
      disposition: 'Voicemail',
      transcript: "Left voicemail: Hi, this is Lisa from Debt Solutions returning your call about debt consolidation options. Please call me back at (312) 555-0104. Looking forward to speaking with you."
    },
    {
      disposition: 'Enrolled',
      transcript: "Agent: So you're ready to move forward? Client: Yes, I want to get started. Agent: Perfect! I'm going to send you the enrollment agreement. Once you sign that, we'll begin working with your creditors immediately. Client: How long will it take? Agent: Typically 24-48 months depending on your debt amount. You'll see results within the first 6 months."
    }
  ];
  
  for (let i = 1; i <= 10; i++) {
    const lead = leads[Math.floor(Math.random() * leads.length)];
    const agent = agents.find(a => a.id === lead.agent);
    const transcriptData = callTranscripts[i % callTranscripts.length];
    
    const daysAgo = Math.floor(Math.random() * 14);
    const callDate = new Date();
    callDate.setDate(callDate.getDate() - daysAgo);
    
    const duration = Math.floor(Math.random() * (600 - 180) + 180); // 3-10 minutes
    
    DebtDB.addCall({
      id: `call_${String(i).padStart(3, '0')}`,
      leadId: lead.id,
      leadName: lead.name,
      agent: agent.id,
      agentName: agent.name,
      direction: callDirections[Math.floor(Math.random() * 2)],
      disposition: transcriptData.disposition,
      duration: duration,
      transcript: transcriptData.transcript,
      date: callDate.toISOString().split('T')[0],
      createdAt: callDate.toISOString()
    });
  }
  
  // ==================== CAMPAIGNS ====================
  
  const campaigns = [
    { name: 'Google Search Ads - Debt Relief', type: 'Google Ads', budget: 5000, spent: 3200, leads: 45, status: 'active' },
    { name: 'Chicago TV Commercial', type: 'TV Ad', budget: 15000, spent: 15000, leads: 78, status: 'completed' },
    { name: 'FM Radio - Drive Time', type: 'Radio', budget: 3000, spent: 2100, leads: 28, status: 'active' },
    { name: 'Facebook Lead Gen', type: 'Facebook', budget: 2000, spent: 1850, leads: 52, status: 'active' },
    { name: 'Direct Mail - IL Residents', type: 'Direct Mail', budget: 8000, spent: 8000, leads: 34, status: 'completed' },
    { name: 'Referral Program', type: 'Referral', budget: 1000, spent: 650, leads: 19, status: 'active' },
    { name: 'Website SEO', type: 'Website', budget: 2500, spent: 2500, leads: 41, status: 'ongoing' },
    { name: 'Instagram Stories', type: 'Social Media', budget: 1500, spent: 980, leads: 23, status: 'active' }
  ];
  
  campaigns.forEach((campaign, i) => {
    DebtDB.addCampaign({
      ...campaign,
      id: `campaign_${String(i + 1).padStart(3, '0')}`,
      costPerLead: campaign.leads > 0 ? Math.round(campaign.spent / campaign.leads) : 0,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  });
  
  // ==================== COMPLIANCE ====================
  
  // State Licenses
  const statesWithLicenses = [
    { state: 'IL', status: 'Active', number: 'IL-DSC-2024-001', expires: '2027-12-31' },
    { state: 'FL', status: 'Active', number: 'FL-DRC-2024-445', expires: '2027-06-30' },
    { state: 'MI', status: 'Active', number: 'MI-DCS-2024-789', expires: '2027-09-15' },
    { state: 'GA', status: 'Active', number: 'GA-DR-2024-332', expires: '2027-08-20' },
    { state: 'TX', status: 'Active', number: 'TX-DSA-2024-556', expires: '2027-11-30' },
    { state: 'OH', status: 'Pending', number: 'OH-PENDING', expires: '2027-12-31' },
    { state: 'PA', status: 'Active', number: 'PA-DRC-2024-221', expires: '2027-07-15' },
    { state: 'NC', status: 'Active', number: 'NC-DS-2024-098', expires: '2027-10-01' },
    { state: 'VA', status: 'Expired', number: 'VA-DR-2023-443', expires: '2026-01-15' },
    { state: 'NY', status: 'Active', number: 'NY-DCS-2024-777', expires: '2027-12-01' }
  ];
  
  statesWithLicenses.forEach(license => {
    DebtDB.updateLicense(license.state, license);
  });
  
  // DNC List
  const dncNumbers = [];
  for (let i = 0; i < 25; i++) {
    dncNumbers.push(`(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`);
  }
  dncNumbers.forEach(phone => DebtDB.addToDNC(phone));
  
  // TCPA Consent Records (stored in audit log)
  for (let i = 0; i < 40; i++) {
    DebtDB.addAuditEntry({
      action: 'tcpa_consent_obtained',
      leadId: leads[i % leads.length].id,
      phone: leads[i % leads.length].phone,
      method: ['web_form', 'verbal', 'sms_opt_in'][i % 3],
      timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Compliance Checklist
  const complianceChecklist = [
    { id: 'comp_001', task: 'Monthly TCPA Compliance Review', status: 'completed', dueDate: '2026-02-28', completedBy: 'manager@demo.com' },
    { id: 'comp_002', task: 'DNC List Scrub', status: 'completed', dueDate: '2026-02-25', completedBy: 'manager@demo.com' },
    { id: 'comp_003', task: 'State License Renewals Check', status: 'pending', dueDate: '2026-03-15', completedBy: null },
    { id: 'comp_004', task: 'Agent Training - Compliance', status: 'in_progress', dueDate: '2026-03-01', completedBy: null },
    { id: 'comp_005', task: 'Audit Call Recordings', status: 'pending', dueDate: '2026-03-10', completedBy: null }
  ];
  
  localStorage.setItem('debtdb_compliance_checklist', JSON.stringify(complianceChecklist));
  
  // ==================== NOTIFICATIONS ====================
  
  const notifications = [
    { type: 'urgent', title: 'High-Value Lead Assigned', message: 'Sarah Mitchell ($45K debt) assigned to you', read: false },
    { type: 'info', title: 'Team Meeting', message: 'Weekly standup in 1 hour', read: false },
    { type: 'success', title: 'Deal Closed', message: 'Congratulations! Deal #12 closed successfully', read: true },
    { type: 'warning', title: 'License Expiring', message: 'VA state license expires in 30 days', read: false },
    { type: 'info', title: 'New Campaign Live', message: 'Google Ads campaign now active', read: true }
  ];
  
  notifications.forEach(notif => DebtDB.addNotification(notif));
  
  // ==================== SETTINGS ====================
  
  DebtDB.updateSettings({
    companyName: 'Debt Consolidation Empire',
    timezone: 'America/Chicago',
    currency: 'USD',
    fiscalYearStart: 'January',
    defaultCommissionRate: 10,
    leadRotation: 'round_robin',
    autoAssignLeads: true,
    enableGamification: true
  });
  
  // Mark as seeded
  localStorage.setItem('debtdb_seeded', 'true');
  
  console.log('✅ Demo data seeded successfully!');
  console.log(`   - ${agents.length} Agents`);
  console.log(`   - ${leads.length} Leads`);
  console.log(`   - ${DebtDB.getDeals().length} Deals`);
  console.log(`   - ${DebtDB.getCases().length} Cases`);
  console.log(`   - ${DebtDB.getCalls().length} Calls`);
  console.log(`   - ${campaigns.length} Campaigns`);
  console.log(`   - ${statesWithLicenses.length} State Licenses`);
  console.log(`   - ${dncNumbers.length} DNC Numbers`);
  
})();

// Auto-seed on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Demo seed loaded');
  });
} else {
  console.log('📦 Demo seed loaded');
}
