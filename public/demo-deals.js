// Demo Deals Data - 20 Realistic Florida Deals
// Generated for Debt Consolidation Empire Dashboard
// Pipeline stages: New Lead, Contacted, Qualified, Enrolled, In Program, Negotiating, Settled, Completed

const demoDealsData = [
  // ==================== NEW LEAD STAGE (3 deals) ====================
  {
    id: 'DEAL001',
    leadId: 'LEAD005',
    clientName: 'Michael Johnson',
    totalDebt: 125000,
    enrolledDebt: 118000,
    monthlyPayment: 850,
    programLength: 36,
    stage: 'New Lead',
    enrollmentDate: '2026-02-24',
    expectedSettlement: 59000,
    fees: 22000,
    assignedAgent: 'AGT004',
    creditors: [
      { name: 'Chase', originalBalance: 35000, currentBalance: 35000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Discover', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Citi', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'IRS', originalBalance: 15000, currentBalance: 15000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-24', text: 'Lead assigned to agent. Client has tax debt component requiring special handling.' },
      { date: '2026-02-24', text: 'Initial outreach attempted, left voicemail.' }
    ]
  },
  {
    id: 'DEAL002',
    leadId: 'LEAD009',
    clientName: 'James Wilson',
    totalDebt: 62000,
    enrolledDebt: 52000,
    monthlyPayment: 450,
    programLength: 30,
    stage: 'New Lead',
    enrollmentDate: '2026-02-23',
    expectedSettlement: 26000,
    fees: 9500,
    assignedAgent: 'AGT001',
    creditors: [
      { name: 'Bank of America', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Wells Fargo', originalBalance: 24000, currentBalance: 24000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-23', text: 'New lead from website. Auto loan upside down, needs guidance.' },
      { date: '2026-02-24', text: 'First contact attempt scheduled.' }
    ]
  },
  {
    id: 'DEAL003',
    leadId: 'LEAD003',
    clientName: 'Robert Santos',
    totalDebt: 89000,
    enrolledDebt: 85000,
    monthlyPayment: 620,
    programLength: 36,
    stage: 'New Lead',
    enrollmentDate: '2026-02-22',
    expectedSettlement: 42500,
    fees: 16000,
    assignedAgent: 'AGT003',
    creditors: [
      { name: 'Chase', originalBalance: 25000, currentBalance: 25000, status: 'In Program' },
      { name: 'American Express', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Ally Auto', originalBalance: 20000, currentBalance: 20000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-22', text: 'High DTI lead. Very motivated, needs immediate assistance.' },
      { date: '2026-02-22', text: 'Agent assigned, preparing for qualification call.' }
    ]
  },

  // ==================== CONTACTED STAGE (3 deals) ====================
  {
    id: 'DEAL004',
    leadId: 'LEAD011',
    clientName: 'Thomas Anderson',
    totalDebt: 95000,
    enrolledDebt: 90000,
    monthlyPayment: 750,
    programLength: 36,
    stage: 'Contacted',
    enrollmentDate: '2026-02-18',
    expectedSettlement: 45000,
    fees: 17500,
    assignedAgent: 'AGT001',
    creditors: [
      { name: 'Chase', originalBalance: 30000, currentBalance: 30000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 25000, currentBalance: 25000, status: 'In Program' },
      { name: 'Discover', originalBalance: 20000, currentBalance: 20000, status: 'In Program' },
      { name: 'Marcus', originalBalance: 15000, currentBalance: 15000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-18', text: 'Initial contact made. Client interested but wants to discuss with wife.' },
      { date: '2026-02-24', text: 'Follow-up call completed. Wife supportive, gathering documents.' },
      { date: '2026-02-24', text: 'Callback scheduled for Friday evening to finalize.' }
    ]
  },
  {
    id: 'DEAL005',
    leadId: 'LEAD015',
    clientName: 'Kevin Taylor',
    totalDebt: 110000,
    enrolledDebt: 105000,
    monthlyPayment: 680,
    programLength: 42,
    stage: 'Contacted',
    enrollmentDate: '2026-02-15',
    expectedSettlement: 52500,
    fees: 21000,
    assignedAgent: 'AGT005',
    creditors: [
      { name: 'American Express', originalBalance: 35000, currentBalance: 35000, status: 'In Program' },
      { name: 'Chase', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Citi', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'IRS', originalBalance: 20000, currentBalance: 20000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-15', text: 'Business owner with tax issues. Complex case flagged for specialist review.' },
      { date: '2026-02-21', text: 'Second call completed. Client reviewing fee structure.' },
      { date: '2026-02-21', text: 'Tax resolution partner consulted on IRS component.' }
    ]
  },
  {
    id: 'DEAL006',
    leadId: 'LEAD019',
    clientName: 'Brian Martin',
    totalDebt: 82000,
    enrolledDebt: 78000,
    monthlyPayment: 580,
    programLength: 36,
    stage: 'Contacted',
    enrollmentDate: '2026-02-16',
    expectedSettlement: 39000,
    fees: 15600,
    assignedAgent: 'AGT004',
    creditors: [
      { name: 'Wells Fargo', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Synchrony', originalBalance: 24000, currentBalance: 24000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Barclays', originalBalance: 12000, currentBalance: 12000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-16', text: 'Construction worker with medical debt from accident.' },
      { date: '2026-02-21', text: 'Settlement check from accident expected soon.' },
      { date: '2026-02-21', text: 'Client ready to enroll once check arrives.' }
    ]
  },

  // ==================== QUALIFIED STAGE (3 deals) ====================
  {
    id: 'DEAL007',
    leadId: 'LEAD021',
    clientName: 'Jason Garcia',
    totalDebt: 87000,
    enrolledDebt: 83000,
    monthlyPayment: 720,
    programLength: 30,
    stage: 'Qualified',
    enrollmentDate: '2026-02-10',
    expectedSettlement: 41500,
    fees: 16600,
    assignedAgent: 'AGT001',
    creditors: [
      { name: 'Chase', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 24000, currentBalance: 24000, status: 'In Program' },
      { name: 'Discover', originalBalance: 19000, currentBalance: 19000, status: 'In Program' },
      { name: 'LendingClub', originalBalance: 12000, currentBalance: 12000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-10', text: 'Lead created. High debt-to-income, good candidate.' },
      { date: '2026-02-18', text: 'Qualified through phone call. Income verified.' },
      { date: '2026-02-23', text: 'Client wants weekend to think. Hot lead, very motivated.' },
      { date: '2026-02-23', text: 'Callback scheduled for Monday morning.' }
    ]
  },
  {
    id: 'DEAL008',
    leadId: 'LEAD025',
    clientName: 'Ryan Hall',
    totalDebt: 92000,
    enrolledDebt: 87000,
    monthlyPayment: 780,
    programLength: 36,
    stage: 'Qualified',
    enrollmentDate: '2026-02-14',
    expectedSettlement: 43500,
    fees: 17400,
    assignedAgent: 'AGT005',
    creditors: [
      { name: 'Chase', originalBalance: 30000, currentBalance: 30000, status: 'In Program' },
      { name: 'American Express', originalBalance: 26000, currentBalance: 26000, status: 'In Program' },
      { name: 'Citi', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Marcus', originalBalance: 13000, currentBalance: 13000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-14', text: 'Sales executive with tax lien issue.' },
      { date: '2026-02-21', text: 'Qualified. High income but poor money management.' },
      { date: '2026-02-21', text: 'Tax specialist referral arranged for IRS component.' },
      { date: '2026-02-21', text: 'Client reviewing both proposals.' }
    ]
  },
  {
    id: 'DEAL009',
    leadId: 'LEAD029',
    clientName: 'Joshua Adams',
    totalDebt: 69000,
    enrolledDebt: 66000,
    monthlyPayment: 550,
    programLength: 30,
    stage: 'Qualified',
    enrollmentDate: '2026-02-17',
    expectedSettlement: 33000,
    fees: 13200,
    assignedAgent: 'AGT004',
    creditors: [
      { name: 'Bank of America', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Wells Fargo', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Synchrony', originalBalance: 15000, currentBalance: 15000, status: 'In Program' },
      { name: 'LendingTree', originalBalance: 11000, currentBalance: 11000, status: 'In Program' }
    ],
    payments: [],
    notes: [
      { date: '2026-02-17', text: 'Recent medical emergency, good credit before that.' },
      { date: '2026-02-24', text: 'Qualified. All documentation complete.' },
      { date: '2026-02-24', text: 'Excellent settlement candidate - recent hardship.' },
      { date: '2026-02-24', text: 'Client pressing to start ASAP.' }
    ]
  },

  // ==================== ENROLLED STAGE (3 deals) ====================
  {
    id: 'DEAL010',
    leadId: 'LEAD031',
    clientName: 'Mark Green',
    totalDebt: 65000,
    enrolledDebt: 62000,
    monthlyPayment: 520,
    programLength: 30,
    stage: 'Enrolled',
    enrollmentDate: '2026-02-19',
    expectedSettlement: 31000,
    fees: 12400,
    assignedAgent: 'AGT001',
    creditors: [
      { name: 'Chase', originalBalance: 25000, currentBalance: 25000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Discover', originalBalance: 15000, currentBalance: 15000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-02-19', amount: 520, status: 'completed' }
    ],
    notes: [
      { date: '2026-02-19', text: 'ENROLLMENT COMPLETED! First payment received.' },
      { date: '2026-02-19', text: 'Welcome packet sent. Program orientation scheduled.' },
      { date: '2026-02-24', text: 'First payment cleared. Account funded.' },
      { date: '2026-02-24', text: 'Creditor notifications being prepared.' }
    ]
  },
  {
    id: 'DEAL011',
    leadId: 'LEAD034',
    clientName: 'Stephanie Carter',
    totalDebt: 92000,
    enrolledDebt: 88000,
    monthlyPayment: 650,
    programLength: 36,
    stage: 'Enrolled',
    enrollmentDate: '2026-02-16',
    expectedSettlement: 44000,
    fees: 17600,
    assignedAgent: 'AGT004',
    creditors: [
      { name: 'American Express', originalBalance: 30000, currentBalance: 30000, status: 'In Program' },
      { name: 'Chase', originalBalance: 25000, currentBalance: 25000, status: 'In Program' },
      { name: 'Citi', originalBalance: 20000, currentBalance: 20000, status: 'In Program' },
      { name: 'IRS', originalBalance: 13000, currentBalance: 13000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-02-16', amount: 325, status: 'completed' },
      { date: '2026-03-01', amount: 325, status: 'pending' }
    ],
    notes: [
      { date: '2026-02-16', text: 'ENROLLMENT COMPLETED! Business owner with irregular income.' },
      { date: '2026-02-16', text: 'Setup with bi-monthly payment schedule to match cash flow.' },
      { date: '2026-02-24', text: 'First payment received. Second payment scheduled.' },
      { date: '2026-02-24', text: 'Tax resolution specialist assigned for IRS component.' }
    ]
  },
  {
    id: 'DEAL012',
    leadId: 'LEAD037',
    clientName: 'Edward Phillips',
    totalDebt: 85000,
    enrolledDebt: 80000,
    monthlyPayment: 580,
    programLength: 36,
    stage: 'Enrolled',
    enrollmentDate: '2026-02-14',
    expectedSettlement: 40000,
    fees: 16000,
    assignedAgent: 'AGT002',
    creditors: [
      { name: 'US Bank', originalBalance: 26000, currentBalance: 26000, status: 'In Program' },
      { name: 'Wells Fargo', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Barclays', originalBalance: 14000, currentBalance: 14000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-02-14', amount: 580, status: 'completed' },
      { date: '2026-02-28', amount: 580, status: 'completed' }
    ],
    notes: [
      { date: '2026-02-14', text: 'ENROLLMENT COMPLETED! Military veteran.' },
      { date: '2026-02-14', text: 'Chose 36-month program for lower monthly payment.' },
      { date: '2026-02-21', text: 'Second payment received on time.' },
      { date: '2026-02-24', text: 'Account building balance. First settlements expected in 4-6 months.' }
    ]
  },

  // ==================== IN PROGRAM STAGE (3 deals) ====================
  {
    id: 'DEAL013',
    leadId: 'LEAD038',
    clientName: 'Katherine Turner',
    totalDebt: 73000,
    enrolledDebt: 69000,
    monthlyPayment: 490,
    programLength: 36,
    stage: 'In Program',
    enrollmentDate: '2026-01-15',
    expectedSettlement: 34500,
    fees: 13800,
    assignedAgent: 'AGT003',
    creditors: [
      { name: 'Chase', originalBalance: 28000, currentBalance: 28000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 25000, currentBalance: 25000, status: 'In Program' },
      { name: 'Bank of America', originalBalance: 16000, currentBalance: 16000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-01-15', amount: 490, status: 'completed' },
      { date: '2026-01-30', amount: 490, status: 'completed' },
      { date: '2026-02-14', amount: 490, status: 'completed' },
      { date: '2026-02-28', amount: 490, status: 'completed' }
    ],
    notes: [
      { date: '2026-01-15', text: 'ENROLLMENT COMPLETED! Client wants to protect home equity.' },
      { date: '2026-02-01', text: 'Second month in program. All payments on time.' },
      { date: '2026-02-15', text: 'Account balance building. Negotiator assigned.' },
      { date: '2026-02-24', text: 'In Program - 6 weeks complete. First settlement offers expected soon.' }
    ]
  },
  {
    id: 'DEAL014',
    leadId: 'LEAD032',
    clientName: 'Rebecca Baker',
    totalDebt: 78000,
    enrolledDebt: 74000,
    monthlyPayment: 620,
    programLength: 30,
    stage: 'In Program',
    enrollmentDate: '2026-01-20',
    expectedSettlement: 37000,
    fees: 14800,
    assignedAgent: 'AGT002',
    creditors: [
      { name: 'Chase', originalBalance: 26000, currentBalance: 26000, status: 'In Program' },
      { name: 'Discover', originalBalance: 22000, currentBalance: 22000, status: 'In Program' },
      { name: 'Synchrony', originalBalance: 18000, currentBalance: 18000, status: 'In Program' },
      { name: 'Cleveland Clinic', originalBalance: 12000, currentBalance: 12000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-01-20', amount: 620, status: 'completed' },
      { date: '2026-02-03', amount: 620, status: 'completed' },
      { date: '2026-02-17', amount: 620, status: 'completed' }
    ],
    notes: [
      { date: '2026-01-20', text: 'ENROLLMENT COMPLETED! Referred by 3 completed clients.' },
      { date: '2026-02-05', text: 'Waiting for bank account verification.' },
      { date: '2026-02-17', text: 'Third payment received. Account verified.' },
      { date: '2026-02-24', text: 'In Program - building account balance for settlements.' }
    ]
  },
  {
    id: 'DEAL015',
    leadId: 'LEAD036',
    clientName: 'Cynthia Roberts',
    totalDebt: 61000,
    enrolledDebt: 58000,
    monthlyPayment: 485,
    programLength: 30,
    stage: 'In Program',
    enrollmentDate: '2026-01-22',
    expectedSettlement: 29000,
    fees: 11600,
    assignedAgent: 'AGT001',
    creditors: [
      { name: 'Chase', originalBalance: 24000, currentBalance: 24000, status: 'In Program' },
      { name: 'Capital One', originalBalance: 19000, currentBalance: 19000, status: 'In Program' },
      { name: 'Navient', originalBalance: 15000, currentBalance: 15000, status: 'In Program' }
    ],
    payments: [
      { date: '2026-01-22', amount: 485, status: 'completed' },
      { date: '2026-02-05', amount: 485, status: 'completed' },
      { date: '2026-02-19', amount: 485, status: 'completed' }
    ],
    notes: [
      { date: '2026-01-22', text: 'ENROLLMENT COMPLETED! Marketing professional, works remote.' },
      { date: '2026-02-10', text: 'Second payment on time. Very responsive via text.' },
      { date: '2026-02-19', text: 'Third payment received. Account growing.' },
      { date: '2026-02-24', text: 'In Program - approaching first settlement threshold.' }
    ]
  },

  // ==================== NEGOTIATING STAGE (2 deals) ====================
  {
    id: 'DEAL016',
    leadId: 'LEAD033',
    clientName: 'Steven Nelson',
    totalDebt: 54000,
    enrolledDebt: 51000,
    monthlyPayment: 425,
    programLength: 30,
    stage: 'Negotiating',
    enrollmentDate: '2025-12-10',
    expectedSettlement: 25500,
    fees: 10200,
    assignedAgent: 'AGT003',
    creditors: [
      { name: 'Chase', originalBalance: 22000, currentBalance: 22000, status: 'Negotiating' },
      { name: 'Ally Auto', originalBalance: 20000, currentBalance: 19000, status: 'Negotiating' },
      { name: 'Capital One', originalBalance: 12000, currentBalance: 9000, status: 'Settled' }
    ],
    payments: [
      { date: '2025-12-10', amount: 425, status: 'completed' },
      { date: '2025-12-24', amount: 425, status: 'completed' },
      { date: '2026-01-07', amount: 425, status: 'completed' },
      { date: '2026-01-21', amount: 425, status: 'completed' },
      { date: '2026-02-04', amount: 425, status: 'completed' },
      { date: '2026-02-18', amount: 425, status: 'completed' }
    ],
    notes: [
      { date: '2025-12-10', text: 'ENROLLMENT COMPLETED! Bi-lingual client.' },
      { date: '2026-01-15', text: 'Capital One settled for 75% ($9,000 on $12k).' },
      { date: '2026-02-01', text: 'Chase negotiations ongoing. Counter-offer received.' },
      { date: '2026-02-20', text: 'Ally Auto negotiations started. Vehicle surrendered.' },
      { date: '2026-02-24', text: 'NEGOTIATING - 2 of 3 creditors in active settlement talks.' }
    ]
  },
  {
    id: 'DEAL017',
    leadId: 'LEAD035',
    clientName: 'Timothy Mitchell',
    totalDebt: 47000,
    enrolledDebt: 45000,
    monthlyPayment: 380,
    programLength: 36,
    stage: 'Negotiating',
    enrollmentDate: '2025-11-15',
    expectedSettlement: 22500,
    fees: 9000,
    assignedAgent: 'AGT005',
    creditors: [
      { name: 'Chase', originalBalance: 20000, currentBalance: 20000, status: 'Negotiating' },
      { name: 'Baptist Health', originalBalance: 15000, currentBalance: 6500, status: 'Settled' },
      { name: 'Discover', originalBalance: 12000, currentBalance: 10000, status: 'Negotiating' }
    ],
    payments: [
      { date: '2025-11-15', amount: 380, status: 'completed' },
      { date: '2025-11-30', amount: 380, status: 'completed' },
      { date: '2026-01-15', amount: 380, status: 'completed' },
      { date: '2026-02-15', amount: 380, status: 'completed' }
    ],
    notes: [
      { date: '2025-11-15', text: 'ENROLLMENT COMPLETED! University professor.' },
      { date: '2025-12-15', text: 'Medical debt settled for 43% ($6,500 on $15k).' },
      { date: '2026-01-20', text: 'Chase initial offer 65%, client wants 45%.' },
      { date: '2026-02-15', text: 'Discover countered at 80%, negotiating.' },
      { date: '2026-02-24', text: 'NEGOTIATING - Medical settled, credit cards in progress.' }
    ]
  },

  // ==================== SETTLED STAGE (2 deals) ====================
  {
    id: 'DEAL018',
    leadId: 'LEAD028',
    clientName: 'Ashley Wright',
    totalDebt: 51000,
    enrolledDebt: 48000,
    monthlyPayment: 400,
    programLength: 36,
    stage: 'Settled',
    enrollmentDate: '2025-09-01',
    expectedSettlement: 24000,
    fees: 9600,
    assignedAgent: 'AGT003',
    creditors: [
      { name: 'Chase', originalBalance: 24000, currentBalance: 0, status: 'Settled', settledAmount: 10500, settledDate: '2025-12-15' },
      { name: 'Capital One', originalBalance: 19000, currentBalance: 0, status: 'Settled', settledAmount: 8500, settledDate: '2026-01-20' },
      { name: 'Navient', originalBalance: 15000, currentBalance: 15000, status: 'In Program' }
    ],
    payments: [
      { date: '2025-09-01', amount: 400, status: 'completed' },
      { date: '2025-09-16', amount: 400, status: 'completed' },
      { date: '2025-10-01', amount: 400, status: 'completed' },
      { date: '2025-10-16', amount: 400, status: 'completed' },
      { date: '2025-11-01', amount: 400, status: 'completed' },
      { date: '2025-11-16', amount: 400, status: 'completed' },
      { date: '2025-12-01', amount: 400, status: 'completed' },
      { date: '2025-12-16', amount: 400, status: 'completed' },
      { date: '2026-01-01', amount: 400, status: 'completed' },
      { date: '2026-01-16', amount: 400, status: 'completed' },
      { date: '2026-02-01', amount: 400, status: 'completed' }
    ],
    notes: [
      { date: '2025-09-01', text: 'ENROLLMENT COMPLETED! Teacher at Miami-Dade school.' },
      { date: '2025-12-15', text: 'Chase settled at 43.75% ($10,500 on $24k)!' },
      { date: '2026-01-20', text: 'Capital One settled at 44.7% ($8,500 on $19k)!' },
      { date: '2026-02-01', text: '2 of 3 creditors settled. Student loan remaining.' },
      { date: '2026-02-24', text: 'SETTLED - Major credit cards resolved. Student loan separate.' }
    ]
  },
  {
    id: 'DEAL019',
    leadId: 'LEAD022',
    clientName: 'Melissa Lopez',
    totalDebt: 56000,
    enrolledDebt: 53000,
    monthlyPayment: 450,
    programLength: 30,
    stage: 'Settled',
    enrollmentDate: '2025-08-15',
    expectedSettlement: 26500,
    fees: 10600,
    assignedAgent: 'AGT002',
    creditors: [
      { name: 'Chase', originalBalance: 22000, currentBalance: 0, status: 'Settled', settledAmount: 9500, settledDate: '2025-11-01' },
      { name: 'Capital One', originalBalance: 18000, currentBalance: 0, status: 'Settled', settledAmount: 7500, settledDate: '2025-12-10' },
      { name: 'Memorial Healthcare', originalBalance: 16000, currentBalance: 0, status: 'Settled', settledAmount: 6800, settledDate: '2026-01-15' }
    ],
    payments: [
      { date: '2025-08-15', amount: 450, status: 'completed' },
      { date: '2025-08-30', amount: 450, status: 'completed' },
      { date: '2025-09-15', amount: 450, status: 'completed' },
      { date: '2025-09-30', amount: 450, status: 'completed' },
      { date: '2025-10-15', amount: 450, status: 'completed' },
      { date: '2025-10-30', amount: 450, status: 'completed' },
      { date: '2025-11-15', amount: 450, status: 'completed' },
      { date: '2025-11-30', amount: 450, status: 'completed' },
      { date: '2025-12-15', amount: 450, status: 'completed' },
      { date: '2025-12-30', amount: 450, status: 'completed' },
      { date: '2026-01-15', amount: 450, status: 'completed' },
      { date: '2026-01-30', amount: 450, status: 'completed' }
    ],
    notes: [
      { date: '2025-08-15', text: 'ENROLLMENT COMPLETED! Referred by 3 neighbors.' },
      { date: '2025-11-01', text: 'Chase settled at 43% ($9,500 on $22k)!' },
      { date: '2025-12-10', text: 'Capital One settled at 41.6% ($7,500 on $18k)!' },
      { date: '2026-01-15', text: 'Medical debt settled at 42.5% ($6,800 on $16k)!' },
      { date: '2026-02-24', text: 'SETTLED - All enrolled creditors resolved. Graduating soon!' }
    ]
  },

  // ==================== COMPLETED STAGE (1 deal) ====================
  {
    id: 'DEAL020',
    leadId: 'LEAD027',
    clientName: 'Eric King',
    totalDebt: 105000,
    enrolledDebt: 98000,
    monthlyPayment: 680,
    programLength: 36,
    stage: 'Completed',
    enrollmentDate: '2024-06-01',
    expectedSettlement: 49000,
    fees: 19600,
    assignedAgent: 'AGT002',
    creditors: [
      { name: 'Chase', originalBalance: 28000, currentBalance: 0, status: 'Settled', settledAmount: 12000, settledDate: '2024-10-15' },
      { name: 'Capital One', originalBalance: 25000, currentBalance: 0, status: 'Settled', settledAmount: 10500, settledDate: '2024-11-20' },
      { name: 'American Express', originalBalance: 22000, currentBalance: 0, status: 'Settled', settledAmount: 9500, settledDate: '2025-01-10' },
      { name: 'Wells Fargo', originalBalance: 18000, currentBalance: 0, status: 'Settled', settledAmount: 7800, settledDate: '2025-03-01' },
      { name: 'LendingClub', originalBalance: 15000, currentBalance: 0, status: 'Settled', settledAmount: 6500, settledDate: '2025-04-15' }
    ],
    payments: [
      { date: '2024-06-01', amount: 680, status: 'completed' },
      { date: '2024-06-16', amount: 680, status: 'completed' },
      { date: '2024-07-01', amount: 680, status: 'completed' },
      { date: '2024-07-16', amount: 680, status: 'completed' },
      { date: '2024-08-01', amount: 680, status: 'completed' },
      { date: '2024-08-16', amount: 680, status: 'completed' },
      { date: '2024-09-01', amount: 680, status: 'completed' },
      { date: '2024-09-16', amount: 680, status: 'completed' },
      { date: '2024-10-01', amount: 680, status: 'completed' },
      { date: '2024-10-16', amount: 680, status: 'completed' },
      { date: '2024-11-01', amount: 680, status: 'completed' },
      { date: '2024-11-16', amount: 680, status: 'completed' },
      { date: '2025-01-01', amount: 680, status: 'completed' },
      { date: '2025-01-16', amount: 680, status: 'completed' },
      { date: '2025-02-01', amount: 680, status: 'completed' },
      { date: '2025-02-16', amount: 680, status: 'completed' },
      { date: '2025-03-01', amount: 680, status: 'completed' },
      { date: '2025-03-16', amount: 680, status: 'completed' },
      { date: '2025-04-01', amount: 680, status: 'completed' },
      { date: '2025-04-16', amount: 680, status: 'completed' }
    ],
    notes: [
      { date: '2024-06-01', text: 'ENROLLMENT COMPLETED! Business owner with failed startup.' },
      { date: '2024-10-15', text: 'First settlement with Chase - 42.8%!' },
      { date: '2024-11-20', text: 'Capital One settled - 42%!' },
      { date: '2025-01-10', text: 'Amex settled - 43.1%!' },
      { date: '2025-03-01', text: 'Wells Fargo settled - 43.3%!' },
      { date: '2025-04-15', text: 'Final creditor (LendingClub) settled - 43.3%!' },
      { date: '2025-05-01', text: 'PROGRAM COMPLETE! All debts settled.' },
      { date: '2026-02-24', text: 'COMPLETED - Client debt-free for 10 months. Credit rebuilding successfully.' }
    ]
  }
];

// Helper to convert deal to legacy case format if needed
function convertDealToLegacyCase(deal) {
  const settledAmount = deal.creditors
    .filter(c => c.status === 'Settled')
    .reduce((sum, c) => sum + (c.settledAmount || 0), 0);
  
  const totalCreditorBalance = deal.creditors.reduce((sum, c) => sum + c.originalBalance, 0);
  
  return {
    id: deal.id.replace('DEAL', 'CASE'),
    leadId: deal.leadId.replace('LEAD', 'L'),
    clientName: deal.clientName,
    stage: deal.stage,
    totalDebt: deal.totalDebt,
    settledAmount: settledAmount,
    programFee: deal.fees,
    monthlyPayment: deal.monthlyPayment,
    accountBalance: deal.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) - settledAmount,
    enrollmentDate: deal.enrollmentDate,
    estimatedCompletion: calculateEstimatedCompletion(deal),
    creditors: deal.creditors.map(c => ({
      name: c.name,
      balance: c.currentBalance,
      status: c.status,
      ...(c.settledAmount && { settledFor: c.settledAmount })
    })),
    assignedAgent: deal.assignedAgent,
    assignedNegotiator: 'NEG001'
  };
}

function calculateEstimatedCompletion(deal) {
  const remainingDebt = deal.creditors
    .filter(c => c.status !== 'Settled')
    .reduce((sum, c) => sum + c.currentBalance, 0);
  const monthsToComplete = Math.ceil(remainingDebt / deal.monthlyPayment);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToComplete);
  return date.toISOString().split('T')[0];
}

// Export for use in demo-seed.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demoDealsData, convertDealToLegacyCase };
}
