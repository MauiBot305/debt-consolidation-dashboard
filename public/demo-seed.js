// Demo Data Seeder for Debt Consolidation Empire Dashboard
// Loads demo calls, leads, activities, and notifications into DebtDB

/**
 * Seeds demo data into the application's localStorage database
 * Can be called from Settings page or auto-seeded on first load
 */
function seedDemoData() {
  console.log('[DemoSeeder] Starting demo data seeding...');
  
  // Check if demo data already exists
  const existingCalls = localStorage.getItem('debtDB_calls');
  if (existingCalls) {
    console.log('[DemoSeeder] Demo data already exists. Skipping seed.');
    return { success: false, message: 'Demo data already exists' };
  }

  let stats = {
    callsAdded: 0,
    leadsAdded: 0,
    activitiesAdded: 0,
    notificationsAdded: 0
  };

  // ============================================
  // 1. SEED DEMO CALLS
  // ============================================
  
  if (typeof DEMO_CALLS !== 'undefined') {
    const callsWithMetadata = DEMO_CALLS.map(call => ({
      ...call,
      _demo: true,
      _seededAt: new Date().toISOString()
    }));
    
    localStorage.setItem('debtDB_calls', JSON.stringify(callsWithMetadata));
    stats.callsAdded = callsWithMetadata.length;
    console.log(`[DemoSeeder] Added ${callsWithMetadata.length} demo calls`);
  } else {
    console.warn('[DemoSeeder] DEMO_CALLS not found. Make sure demo-calls.js is loaded first.');
  }

  // ============================================
  // 2. SEED/UPDATE LEADS FROM CALLS
  // ============================================
  
  const existingLeads = JSON.parse(localStorage.getItem('debtDB_leads') || '[]');
  const existingLeadIds = new Set(existingLeads.map(l => l.id));
  
  // Extract leads from demo calls
  const demoLeadsFromCalls = [];
  
  if (typeof DEMO_CALLS !== 'undefined') {
    DEMO_CALLS.forEach(call => {
      if (call.leadId && !existingLeadIds.has(call.leadId)) {
        demoLeadsFromCalls.push({
          id: call.leadId,
          name: call.callerName || 'Unknown',
          email: `${call.callerName?.toLowerCase().replace(/\s+/g, '.')}@email.com` || 'unknown@email.com',
          phone: call.callerNumber,
          stage: getStageFromDisposition(call.disposition),
          totalDebt: call.totalDebt || 0,
          monthlyIncome: estimateMonthlyIncome(call.totalDebt),
          debtToIncomeRatio: calculateDTI(call.totalDebt),
          creditors: generateCreditors(call.debtTypes),
          assignedAgent: call.agentId,
          createdAt: call.startTime,
          lastContact: call.endTime,
          priority: getPriorityFromDebt(call.totalDebt),
          source: call.direction === 'inbound' ? 'Inbound Call' : 'Outbound Call',
          _demo: true,
          _seededAt: new Date().toISOString()
        });
        existingLeadIds.add(call.leadId);
      }
    });
  }
  
  // Merge with existing leads
  const allLeads = [...existingLeads, ...demoLeadsFromCalls];
  localStorage.setItem('debtDB_leads', JSON.stringify(allLeads));
  stats.leadsAdded = demoLeadsFromCalls.length;
  console.log(`[DemoSeeder] Added ${demoLeadsFromCalls.length} demo leads`);

  // ============================================
  // 3. SEED ACTIVITIES FROM CALLS
  // ============================================
  
  const existingActivities = JSON.parse(localStorage.getItem('debtDB_activities') || '[]');
  const demoActivities = [];
  
  if (typeof DEMO_CALLS !== 'undefined') {
    DEMO_CALLS.forEach((call, index) => {
      demoActivities.push({
        id: `ACT_DEMO_${String(index + 1).padStart(3, '0')}`,
        type: 'call',
        agentId: call.agentId,
        leadId: call.leadId,
        description: `${call.direction === 'inbound' ? 'Inbound' : 'Outbound'} call - ${call.disposition}`,
        timestamp: call.endTime,
        result: call.disposition.toLowerCase().replace(/\s+/g, '_'),
        callId: call.id,
        duration: call.duration,
        sentiment: call.sentiment,
        _demo: true
      });
    });
  }
  
  const allActivities = [...existingActivities, ...demoActivities];
  localStorage.setItem('debtDB_activities', JSON.stringify(allActivities));
  stats.activitiesAdded = demoActivities.length;
  console.log(`[DemoSeeder] Added ${demoActivities.length} demo activities`);

  // ============================================
  // 4. SEED NOTIFICATIONS
  // ============================================
  
  const existingNotifications = JSON.parse(localStorage.getItem('debtDB_notifications') || '[]');
  
  const demoNotifications = [
    {
      id: 'NOTIF_DEMO_001',
      type: 'call',
      title: 'New Voicemail',
      message: 'You have a new voicemail from Jennifer Martinez regarding debt inquiry.',
      timestamp: '2026-02-23T11:01:15',
      read: false,
      link: '/calls/call_006',
      _demo: true
    },
    {
      id: 'NOTIF_DEMO_002',
      type: 'lead',
      title: 'Hot Lead Alert',
      message: 'James Rodriguez enrolled with $85,000 in credit card debt.',
      timestamp: '2026-02-24T09:28:45',
      read: false,
      link: '/leads/L001',
      _demo: true
    },
    {
      id: 'NOTIF_DEMO_003',
      type: 'escalation',
      title: 'Client Complaint',
      message: 'Andrew Stevens reported creditor harassment. Legal team notified.',
      timestamp: '2026-02-18T10:05:15',
      read: true,
      link: '/cases/L032',
      _demo: true
    },
    {
      id: 'NOTIF_DEMO_004',
      type: 'reminder',
      title: 'Scheduled Callback',
      message: 'Callback scheduled with Robert Chen and spouse at 6:30 PM today.',
      timestamp: '2026-02-22T12:08:30',
      read: false,
      link: '/calls/call_003',
      _demo: true
    },
    {
      id: 'NOTIF_DEMO_005',
      type: 'lead',
      title: 'Referral Received',
      message: 'Michelle Thompson called from Jessica Rodriguez referral.',
      timestamp: '2026-02-17T14:14:30',
      read: true,
      link: '/leads/L090',
      _demo: true
    }
  ];
  
  const allNotifications = [...existingNotifications, ...demoNotifications];
  localStorage.setItem('debtDB_notifications', JSON.stringify(allNotifications));
  stats.notificationsAdded = demoNotifications.length;
  console.log(`[DemoSeeder] Added ${demoNotifications.length} demo notifications`);

  // ============================================
  // 5. SEED CALL ANALYTICS SUMMARY
  // ============================================
  
  const callAnalytics = {
    totalCalls: DEMO_CALLS?.length || 0,
    inboundCalls: DEMO_CALLS?.filter(c => c.direction === 'inbound').length || 0,
    outboundCalls: DEMO_CALLS?.filter(c => c.direction === 'outbound').length || 0,
    averageDuration: Math.round(DEMO_CALLS?.reduce((acc, c) => acc + c.duration, 0) / (DEMO_CALLS?.length || 1)),
    dispositionBreakdown: DEMO_CALLS?.reduce((acc, call) => {
      acc[call.disposition] = (acc[call.disposition] || 0) + 1;
      return acc;
    }, {}) || {},
    sentimentBreakdown: DEMO_CALLS?.reduce((acc, call) => {
      acc[call.sentiment] = (acc[call.sentiment] || 0) + 1;
      return acc;
    }, {}) || {},
    _seededAt: new Date().toISOString()
  };
  
  localStorage.setItem('debtDB_callAnalytics', JSON.stringify(callAnalytics));
  console.log('[DemoSeeder] Added call analytics summary');

  // ============================================
  // 6. MARK DB AS SEEDED
  // ============================================
  
  localStorage.setItem('debtDB_demoSeeded', 'true');
  localStorage.setItem('debtDB_demoSeededAt', new Date().toISOString());
  
  console.log('[DemoSeeder] Demo data seeding complete!', stats);
  
  return {
    success: true,
    message: 'Demo data seeded successfully',
    stats: stats
  };
}

/**
 * Clears all demo data from localStorage
 */
function clearDemoData() {
  console.log('[DemoSeeder] Clearing demo data...');
  
  const keys = ['debtDB_calls', 'debtDB_leads', 'debtDB_activities', 'debtDB_notifications', 'debtDB_callAnalytics'];
  let cleared = 0;
  
  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = Array.isArray(data) 
      ? data.filter(item => !item._demo)
      : data;
    
    if (Array.isArray(data)) {
      localStorage.setItem(key, JSON.stringify(filtered));
      cleared += data.length - filtered.length;
    } else {
      localStorage.removeItem(key);
      cleared++;
    }
  });
  
  localStorage.removeItem('debtDB_demoSeeded');
  localStorage.removeItem('debtDB_demoSeededAt');
  
  console.log(`[DemoSeeder] Cleared ${cleared} demo items`);
  return { success: true, message: `Cleared ${cleared} demo items` };
}

/**
 * Checks if demo data has been seeded
 */
function isDemoDataSeeded() {
  return localStorage.getItem('debtDB_demoSeeded') === 'true';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStageFromDisposition(disposition) {
  const mapping = {
    'Enrolled': 'Enrolled',
    'Interested': 'Qualified',
    'Qualified': 'Qualified',
    'Sent Info': 'Contacted',
    'Callback Requested': 'Contacted',
    'Not Interested': 'Contacted',
    'Hung Up': 'New Lead',
    'Voicemail': 'New Lead',
    'Wrong Number': 'New Lead',
    'Transferred to Manager': 'Qualified'
  };
  return mapping[disposition] || 'New Lead';
}

function estimateMonthlyIncome(totalDebt) {
  if (!totalDebt) return 4000;
  // Rough estimate: debt-to-income ratio of 80% means income = debt * 1.25 / 12
  return Math.round((totalDebt * 1.25 / 12) / 100) * 100;
}

function calculateDTI(totalDebt) {
  if (!totalDebt) return 50;
  // Rough estimate for demo purposes
  return Math.min(Math.round((totalDebt / 12) / 40), 150);
}

function generateCreditors(debtTypes) {
  const creditors = {
    'Credit Card': ['Chase', 'Capital One', 'Discover', 'Amex', 'Citibank', 'BofA'],
    'Medical': ['Miami General Hospital', 'Regional Medical Center', 'Sunrise Labs'],
    'Student Loan': ['Navient', 'Nelnet', 'Great Lakes'],
    'Personal Loan': ['LendingClub', 'Prosper', 'Marcus'],
    'Auto': ['Ally Financial', 'Wells Fargo Auto', 'Capital One Auto']
  };
  
  const result = [];
  (debtTypes || []).forEach(type => {
    if (creditors[type]) {
      result.push(...creditors[type].slice(0, Math.floor(Math.random() * 2) + 1));
    }
  });
  
  return result.length > 0 ? result : ['Various Creditors'];
}

function getPriorityFromDebt(totalDebt) {
  if (totalDebt >= 100000) return 'high';
  if (totalDebt >= 50000) return 'medium';
  return 'low';
}

// ============================================
// AUTO-SEED ON LOAD (if DB is empty)
// ============================================

(function autoSeedIfEmpty() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndSeed);
  } else {
    checkAndSeed();
  }
  
  function checkAndSeed() {
    // Small delay to ensure other scripts load
    setTimeout(() => {
      const hasData = localStorage.getItem('debtDB_leads') || localStorage.getItem('debtDB_calls');
      const alreadySeeded = localStorage.getItem('debtDB_demoSeeded');
      
      if (!hasData && !alreadySeeded) {
        console.log('[DemoSeeder] Database empty - auto-seeding demo data...');
        seedDemoData();
      }
    }, 500);
  }
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { seedDemoData, clearDemoData, isDemoDataSeeded };
}
