// Demo Seed Data Loader
// Loads additional demo data on first run
// Functionality verified by Agent 4 (Kimi 5 equivalent)

(function() {
  'use strict';

  const SEED_KEY = 'debtdb_demo_seeded';

  // Check if already seeded
  if (localStorage.getItem(SEED_KEY)) {
    console.log('✅ Demo data already seeded');
    return;
  }

  console.log('🌱 Seeding demo data...');

  // Add 10 call records with realistic data
  const demoCalls = [
    {
      type: 'call',
      agentId: 'AGT001',
      leadId: 'L001',
      description: 'Qualification call - Client interested in program',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      result: 'qualified',
      duration: 840, // 14 minutes
      recording: 'call-audio.mp3',
      transcript: 'Agent: Thank you for calling Debt Consolidation Empire... Client: I have about $45,000 in credit card debt...',
      disposition: 'Hot Lead - Ready to enroll'
    },
    {
      type: 'call',
      agentId: 'AGT002',
      leadId: 'L002',
      description: 'Follow-up call - Document collection',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      result: 'completed',
      duration: 420,
      recording: 'call-audio.mp3',
      transcript: 'Agent: Hi Michael, following up on the documents... Client: Yes, I sent them via email...',
      disposition: 'Documents received'
    },
    {
      type: 'call',
      agentId: 'AGT001',
      leadId: 'L004',
      description: 'Initial contact - Left voicemail',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      result: 'voicemail',
      duration: 35,
      recording: null,
      transcript: null,
      disposition: 'Voicemail - callback scheduled'
    },
    {
      type: 'call',
      agentId: 'AGT003',
      leadId: 'L010',
      description: 'Enrollment call completed',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      result: 'enrolled',
      duration: 1820, // 30 minutes
      recording: 'call-audio.mp3',
      transcript: 'Agent: Congratulations on taking this step... Client: Thank you, I feel relieved...',
      disposition: 'Enrolled - $32,000 debt'
    },
    {
      type: 'call',
      agentId: 'AGT002',
      leadId: 'L015',
      description: 'Cold call - Not interested',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      result: 'not_interested',
      duration: 95,
      recording: null,
      transcript: null,
      disposition: 'Not interested - DNC'
    },
    {
      type: 'call',
      agentId: 'AGT004',
      leadId: 'L020',
      description: 'Negotiation update call',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      result: 'completed',
      duration: 540,
      recording: 'call-audio.mp3',
      transcript: 'Agent: We got a 40% settlement offer from Chase... Client: That\'s great news!',
      disposition: 'Client approved settlement'
    },
    {
      type: 'call',
      agentId: 'AGT001',
      leadId: 'L025',
      description: 'Qualification call - High debt-to-income ratio',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      result: 'qualified',
      duration: 720,
      recording: 'call-audio.mp3',
      transcript: 'Agent: Let me review your debt situation... Client: I have 8 credit cards all maxed out...',
      disposition: 'Qualified - needs immediate help'
    },
    {
      type: 'call',
      agentId: 'AGT005',
      leadId: 'L030',
      description: 'Welcome call - Program orientation',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      result: 'completed',
      duration: 980,
      recording: 'call-audio.mp3',
      transcript: 'Agent: Welcome to the program! Let me explain how it works...',
      disposition: 'Orientation completed'
    },
    {
      type: 'call',
      agentId: 'AGT003',
      leadId: 'L035',
      description: 'Re-contact attempt',
      timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      result: 'no_answer',
      duration: 0,
      recording: null,
      transcript: null,
      disposition: 'No answer - try again tomorrow'
    },
    {
      type: 'call',
      agentId: 'AGT002',
      leadId: 'L040',
      description: 'Payment plan setup call',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      result: 'completed',
      duration: 660,
      recording: 'call-audio.mp3',
      transcript: 'Agent: Your monthly payment will be $450... Client: That works with my budget...',
      disposition: 'Payment plan confirmed'
    }
  ];

  // Add calls to database
  demoCalls.forEach(call => {
    DebtDB.addCall(call);
  });

  // Add 20 more diverse leads
  const moreLeads = Array.from({ length: 20 }, (_, i) => ({
    name: ['John Doe', 'Jane Smith', 'Robert Johnson', 'Maria Lopez', 'David Kim',
           'Sarah Wilson', 'Michael Brown', 'Lisa Anderson', 'James Taylor', 'Jennifer White',
           'William Martinez', 'Elizabeth Garcia', 'Richard Lee', 'Barbara Moore', 'Joseph Clark',
           'Susan Rodriguez', 'Thomas Walker', 'Linda Harris', 'Charles Young', 'Nancy King'][i],
    email: `demo.lead${i + 51}@email.com`,
    phone: `(555) ${String(Math.floor(Math.random() * 900 + 100))}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
    stage: ['New Lead', 'Contacted', 'Qualified', 'Enrolled', 'In Program'][Math.floor(Math.random() * 5)],
    totalDebt: Math.floor(Math.random() * 100000 + 20000),
    monthlyIncome: Math.floor(Math.random() * 7000 + 3000),
    debtToIncomeRatio: Math.floor(Math.random() * 150 + 30),
    creditors: ['Chase', 'Capital One', 'Discover', 'Wells Fargo', 'Amex', 'Citibank', 'BofA', 'Synchrony', 'Medical', 'Student Loans']
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4 + 2)),
    assignedAgent: `AGT${String(Math.floor(Math.random() * 10 + 1)).padStart(3, '0')}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastContact: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null,
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    source: ['Web Form', 'Phone Inquiry', 'Referral', 'Social Media', 'Direct Mail'][Math.floor(Math.random() * 5)],
    notes: ['Initial contact made', 'Left voicemail', 'Interested in program', 'Requested more info', 'Will call back'][Math.floor(Math.random() * 5)]
  }));

  moreLeads.forEach(lead => {
    DebtDB.addLead(lead);
  });

  // Add 20 deals in various stages
  const demoDeals = Array.from({ length: 20 }, (_, i) => ({
    clientName: `Deal Client ${i + 1}`,
    leadId: `L${String(Math.floor(Math.random() * 50 + 1)).padStart(3, '0')}`,
    caseId: `CASE${String(Math.floor(Math.random() * 20 + 1)).padStart(3, '0')}`,
    creditor: ['Chase', 'Capital One', 'Discover', 'Wells Fargo', 'Amex', 'Citibank'][Math.floor(Math.random() * 6)],
    originalBalance: Math.floor(Math.random() * 30000 + 5000),
    settlementAmount: 0,
    settlementPercent: 0,
    status: ['Pending', 'Negotiating', 'Offer Received', 'Approved', 'Settled', 'Paid'][Math.floor(Math.random() * 6)],
    assignedAgent: `AGT${String(Math.floor(Math.random() * 10 + 1)).padStart(3, '0')}`,
    assignedNegotiator: `NEG${String(Math.floor(Math.random() * 5 + 1)).padStart(3, '0')}`,
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));

  // Calculate settlement amounts for deals
  demoDeals.forEach(deal => {
    if (['Offer Received', 'Approved', 'Settled', 'Paid'].includes(deal.status)) {
      deal.settlementPercent = Math.floor(Math.random() * 30 + 35); // 35-65% settlement
      deal.settlementAmount = Math.floor(deal.originalBalance * deal.settlementPercent / 100);
    }
    DebtDB.addDeal(deal);
  });

  // Add 5 notifications
  const notifications = [
    {
      type: 'alert',
      title: 'Urgent: Task Overdue',
      message: 'Task "Follow-up call with Sarah Mitchell" is overdue',
      priority: 'high',
      read: false
    },
    {
      type: 'success',
      title: 'New Enrollment',
      message: 'Agent John Smith enrolled a new client - $67,000 debt',
      priority: 'medium',
      read: false
    },
    {
      type: 'info',
      title: 'Settlement Offer Received',
      message: 'Chase offered 45% settlement for case CASE002',
      priority: 'medium',
      read: false
    },
    {
      type: 'warning',
      title: 'Compliance Review Due',
      message: 'Monthly compliance review due in 3 days',
      priority: 'medium',
      read: false
    },
    {
      type: 'info',
      title: 'New Lead Assigned',
      message: '5 new leads assigned to your queue',
      priority: 'low',
      read: true
    }
  ];

  notifications.forEach(notif => {
    DebtDB.addNotification(notif);
  });

  // Add 10 more tasks (some overdue for alerts)
  const moreTasks = [
    {
      agentId: 'AGT001',
      leadId: 'L001',
      title: 'Send follow-up email with program details',
      dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (overdue!)
      priority: 'high',
      status: 'pending'
    },
    {
      agentId: 'AGT002',
      leadId: 'L010',
      title: 'Review and approve settlement offer',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      status: 'pending'
    },
    {
      agentId: 'AGT001',
      leadId: 'L015',
      title: 'Callback attempt #3',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending'
    },
    {
      agentId: 'AGT003',
      leadId: 'L020',
      title: 'Schedule negotiation call with creditor',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue!
      priority: 'high',
      status: 'pending'
    },
    {
      agentId: 'AGT002',
      leadId: 'L025',
      title: 'Complete compliance checklist',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending'
    },
    {
      agentId: 'AGT001',
      leadId: 'L030',
      title: 'Welcome orientation call',
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending'
    },
    {
      agentId: 'AGT004',
      leadId: 'L035',
      title: 'Update case notes with client feedback',
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
      status: 'pending'
    },
    {
      agentId: 'AGT005',
      leadId: 'L040',
      title: 'Prepare monthly performance report',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending'
    },
    {
      agentId: 'AGT003',
      leadId: 'L045',
      title: 'Verify client payment received',
      dueDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours overdue!
      priority: 'high',
      status: 'pending'
    },
    {
      agentId: 'AGT002',
      leadId: 'L050',
      title: 'Send enrollment welcome package',
      dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      status: 'pending'
    }
  ];

  moreTasks.forEach(task => {
    DebtDB.addTask(task);
  });

  // Update revenue with more detailed analytics
  const enhancedRevenue = {
    today: 120500,
    yesterday: 98000,
    thisWeek: 487000,
    lastWeek: 423000,
    thisMonth: 1845000,
    lastMonth: 1620000,
    thisYear: 8920000,
    target: {
      daily: 100000,
      weekly: 500000,
      monthly: 2000000,
      yearly: 12000000
    },
    byAgent: {
      'AGT001': { total: 890000, commission: 267000, enrollments: 42, avgDealSize: 21190 },
      'AGT002': { total: 1120000, commission: 336000, enrollments: 56, avgDealSize: 20000 },
      'AGT003': { total: 765000, commission: 229500, enrollments: 38, avgDealSize: 20132 },
      'AGT004': { total: 620000, commission: 186000, enrollments: 29, avgDealSize: 21379 },
      'AGT005': { total: 540000, commission: 162000, enrollments: 25, avgDealSize: 21600 },
      'AGT006': { total: 480000, commission: 144000, enrollments: 22, avgDealSize: 21818 },
      'AGT007': { total: 420000, commission: 126000, enrollments: 19, avgDealSize: 22105 },
      'AGT008': { total: 380000, commission: 114000, enrollments: 17, avgDealSize: 22353 },
      'AGT009': { total: 340000, commission: 102000, enrollments: 15, avgDealSize: 22667 },
      'AGT010': { total: 310000, commission: 93000, enrollments: 14, avgDealSize: 22143 }
    },
    trends: {
      weekOverWeek: 15.1, // % growth
      monthOverMonth: 13.9,
      yearOverYear: 28.3
    }
  };

  DebtDB.updateRevenue(enhancedRevenue);

  // Mark as seeded
  localStorage.setItem(SEED_KEY, 'true');
  localStorage.setItem('debtdb_demo_seed_date', new Date().toISOString());

  console.log('✅ Demo data seeded successfully!');
  console.log(`   - ${demoCalls.length} call records added`);
  console.log(`   - ${moreLeads.length} additional leads added`);
  console.log(`   - ${demoDeals.length} deals added`);
  console.log(`   - ${notifications.length} notifications added`);
  console.log(`   - ${moreTasks.length} tasks added`);
  console.log('   - Enhanced revenue analytics loaded');

})();
