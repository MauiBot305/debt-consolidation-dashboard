// Demo Data Seeder for Debt Consolidation Empire Dashboard
// Loads demo calls, leads, activities, analytics, and gamification data into DebtDB

/**
 * Seeds ALL demo data into the application's localStorage database
 * Can be called from Settings page or auto-seeded on first load
 */
function seedAllDemoData() {
  console.log('[DemoSeeder] Starting comprehensive demo data seeding...');
  
  const results = {
    calls: { added: 0, skipped: false },
    leads: { added: 0, updated: 0 },
    activities: { added: 0 },
    notifications: { added: 0 },
    campaigns: { added: 0 },
    compliance: { added: false },
    gamification: { added: false }
  };

  // ============================================
  // 1. SEED DEMO CALLS
  // ============================================
  
  if (typeof DEMO_CALLS !== 'undefined' && DEMO_CALLS.length > 0) {
    const existingCalls = localStorage.getItem('debtDB_calls');
    if (!existingCalls) {
      const callsWithMetadata = DEMO_CALLS.map(call => ({
        ...call,
        _demo: true,
        _seededAt: new Date().toISOString()
      }));
      
      localStorage.setItem('debtDB_calls', JSON.stringify(callsWithMetadata));
      results.calls.added = callsWithMetadata.length;
      console.log(`[DemoSeeder] Added ${callsWithMetadata.length} demo calls`);
    } else {
      results.calls.skipped = true;
      console.log('[DemoSeeder] Calls already exist, skipping...');
    }
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
  results.leads.added = demoLeadsFromCalls.length;
  console.log(`[DemoSeeder] Added ${demoLeadsFromCalls.length} demo leads`);

  // ============================================
  // 3. SEED ACTIVITIES FROM CALLS
  // ============================================
  
  const existingActivities = JSON.parse(localStorage.getItem('debtDB_activities') || '[]');
  const demoActivitiesFromCalls = [];
  
  if (typeof DEMO_CALLS !== 'undefined') {
    DEMO_CALLS.forEach((call, index) => {
      demoActivitiesFromCalls.push({
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
  
  const allActivities = [...existingActivities, ...demoActivitiesFromCalls];
  localStorage.setItem('debtDB_activities', JSON.stringify(allActivities));
  results.activities.added = demoActivitiesFromCalls.length;
  console.log(`[DemoSeeder] Added ${demoActivitiesFromCalls.length} demo activities from calls`);

  // ============================================
  // 4. SEED ANALYTICS ACTIVITIES (50 entries)
  // ============================================
  
  if (typeof DEMO_ACTIVITIES !== 'undefined' && DEMO_ACTIVITIES.length > 0) {
    const activitiesWithMetadata = DEMO_ACTIVITIES.map(activity => ({
      ...activity,
      _demo: true,
      _seededAt: new Date().toISOString()
    }));
    
    const currentActivities = JSON.parse(localStorage.getItem('debtDB_activities') || '[]');
    const existingIds = new Set(currentActivities.map(a => a.id));
    const newActivities = activitiesWithMetadata.filter(a => !existingIds.has(a.id));
    
    if (newActivities.length > 0) {
      localStorage.setItem('debtDB_activities', JSON.stringify([...currentActivities, ...newActivities]));
      results.activities.added += newActivities.length;
      console.log(`[DemoSeeder] Added ${newActivities.length} demo activities from analytics`);
    }
  } else {
    console.warn('[DemoSeeder] DEMO_ACTIVITIES not found. Make sure demo-analytics.js is loaded first.');
  }

  // ============================================
  // 5. SEED NOTIFICATIONS
  // ============================================
  
  const existingNotifications = JSON.parse(localStorage.getItem('debtDB_notifications') || '[]');
  
  // Legacy demo notifications
  const legacyNotifications = [
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
  
  let allNotifications = [...existingNotifications];
  
  // Add legacy notifications if not exists
  const existingNotifIds = new Set(existingNotifications.map(n => n.id));
  legacyNotifications.forEach(n => {
    if (!existingNotifIds.has(n.id)) {
      allNotifications.push(n);
      existingNotifIds.add(n.id);
    }
  });
  
  // Add analytics notifications
  if (typeof DEMO_NOTIFICATIONS !== 'undefined' && DEMO_NOTIFICATIONS.length > 0) {
    const notificationsWithMetadata = DEMO_NOTIFICATIONS.map(n => ({
      ...n,
      link: n.actionUrl,
      _demo: true,
      _seededAt: new Date().toISOString()
    }));
    
    notificationsWithMetadata.forEach(n => {
      if (!existingNotifIds.has(n.id)) {
        allNotifications.push(n);
        existingNotifIds.add(n.id);
      }
    });
    
    results.notifications.added = legacyNotifications.length + notificationsWithMetadata.length;
    console.log(`[DemoSeeder] Added ${notificationsWithMetadata.length} demo notifications from analytics`);
  }
  
  localStorage.setItem('debtDB_notifications', JSON.stringify(allNotifications));

  // ============================================
  // 6. SEED MARKETING CAMPAIGNS
  // ============================================
  
  if (typeof DEMO_CAMPAIGNS !== 'undefined' && DEMO_CAMPAIGNS.length > 0) {
    const existingCampaigns = localStorage.getItem('debtDB_campaigns');
    if (!existingCampaigns) {
      const campaignsWithMetadata = DEMO_CAMPAIGNS.map(c => ({
        ...c,
        _demo: true,
        _seededAt: new Date().toISOString()
      }));
      
      localStorage.setItem('debtDB_campaigns', JSON.stringify(campaignsWithMetadata));
      results.campaigns.added = campaignsWithMetadata.length;
      console.log(`[DemoSeeder] Added ${campaignsWithMetadata.length} demo campaigns`);
    } else {
      console.log('[DemoSeeder] Campaigns already exist, skipping...');
    }
  } else {
    console.warn('[DemoSeeder] DEMO_CAMPAIGNS not found. Make sure demo-analytics.js is loaded first.');
  }

  // ============================================
  // 7. SEED COMPLIANCE DATA
  // ============================================
  
  if (typeof DEMO_COMPLIANCE !== 'undefined') {
    const existingCompliance = localStorage.getItem('debtDB_compliance');
    if (!existingCompliance) {
      const complianceWithMetadata = {
        ...DEMO_COMPLIANCE,
        _demo: true,
        _seededAt: new Date().toISOString()
      };
      
      localStorage.setItem('debtDB_compliance', JSON.stringify(complianceWithMetadata));
      results.compliance.added = true;
      console.log('[DemoSeeder] Added demo compliance data (15 licenses, 25 DNC, 30 audit log, 40 TCPA)');
    } else {
      console.log('[DemoSeeder] Compliance data already exists, skipping...');
    }
  } else {
    console.warn('[DemoSeeder] DEMO_COMPLIANCE not found. Make sure demo-analytics.js is loaded first.');
  }

  // ============================================
  // 8. SEED GAMIFICATION DATA
  // ============================================
  
  if (typeof DEMO_GAMIFICATION !== 'undefined') {
    const existingGamification = localStorage.getItem('debtDB_gamification');
    if (!existingGamification) {
      const gamificationWithMetadata = {
        ...DEMO_GAMIFICATION,
        _demo: true,
        _seededAt: new Date().toISOString()
      };
      
      localStorage.setItem('debtDB_gamification', JSON.stringify(gamificationWithMetadata));
      results.gamification.added = true;
      console.log('[DemoSeeder] Added demo gamification data (10 agents, 5 challenges, leaderboards)');
    } else {
      console.log('[DemoSeeder] Gamification data already exists, skipping...');
    }
  } else {
    console.warn('[DemoSeeder] DEMO_GAMIFICATION not found. Make sure demo-analytics.js is loaded first.');
  }

  // ============================================
  // 9. SEED CALL ANALYTICS SUMMARY
  // ============================================
  
  if (typeof DEMO_CALLS !== 'undefined' && DEMO_CALLS.length > 0) {
    const callAnalytics = {
      totalCalls: DEMO_CALLS.length,
      inboundCalls: DEMO_CALLS.filter(c => c.direction === 'inbound').length,
      outboundCalls: DEMO_CALLS.filter(c => c.direction === 'outbound').length,
      averageDuration: Math.round(DEMO_CALLS.reduce((acc, c) => acc + c.duration, 0) / DEMO_CALLS.length),
      dispositionBreakdown: DEMO_CALLS.reduce((acc, call) => {
        acc[call.disposition] = (acc[call.disposition] || 0) + 1;
        return acc;
      }, {}),
      sentimentBreakdown: DEMO_CALLS.reduce((acc, call) => {
        acc[call.sentiment] = (acc[call.sentiment] || 0) + 1;
        return acc;
      }, {}),
      _seededAt: new Date().toISOString()
    };
    
    localStorage.setItem('debtDB_callAnalytics', JSON.stringify(callAnalytics));
    console.log('[DemoSeeder] Added call analytics summary');
  }

  // ============================================
  // 10. MARK DB AS SEEDED
  // ============================================
  
  localStorage.setItem('debtDB_demoSeeded', 'true');
  localStorage.setItem('debtDB_demoSeededAt', new Date().toISOString());
  
  console.log('[DemoSeeder] ============================================');
  console.log('[DemoSeeder] Demo data seeding complete!');
  console.log('[DemoSeeder] Results:', results);
  console.log('[DemoSeeder] ============================================');
  
  return {
    success: true,
    message: 'All demo data seeded successfully',
    results: results
  };
}

/**
 * Legacy function for backward compatibility
 * Seeds basic demo data (calls, leads, activities, notifications)
 */
function seedDemoData() {
  console.log('[DemoSeeder] Using legacy seedDemoData() - consider migrating to seedAllDemoData()');
  return seedAllDemoData();
}

/**
 * Clears all demo data from localStorage
 */
function clearDemoData() {
  console.log('[DemoSeeder] Clearing demo data...');
  
  const keys = [
    'debtDB_calls', 
    'debtDB_leads', 
    'debtDB_activities', 
    'debtDB_notifications',
    'debtDB_campaigns',
    'debtDB_compliance',
    'debtDB_gamification',
    'debtDB_callAnalytics'
  ];
  
  let cleared = 0;
  
  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (key === 'debtDB_compliance' || key === 'debtDB_gamification') {
      // These are objects, not arrays
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      if (parsed._demo) {
        localStorage.removeItem(key);
        cleared++;
      }
    } else if (Array.isArray(data)) {
      const filtered = data.filter(item => !item._demo);
      cleared += data.length - filtered.length;
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  });
  
  localStorage.removeItem('debtDB_demoSeeded');
  localStorage.removeItem('debtDB_demoSeededAt');
  
  console.log(`[DemoSeeder] Cleared ${cleared} demo items`);
  return { success: true, message: `Cleared demo data from ${keys.length} stores` };
}

/**
 * Checks if demo data has been seeded
 */
function isDemoDataSeeded() {
  return localStorage.getItem('debtDB_demoSeeded') === 'true';
}

/**
 * Resets all data and re-seeds (for testing)
 */
function resetAndSeedDemoData() {
  console.log('[DemoSeeder] Resetting and re-seeding all demo data...');
  clearDemoData();
  return seedAllDemoData();
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
  return Math.round((totalDebt * 1.25 / 12) / 100) * 100;
}

function calculateDTI(totalDebt) {
  if (!totalDebt) return 50;
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
        seedAllDemoData();
      } else {
        console.log('[DemoSeeder] Database already has data or was previously seeded.');
      }
    }, 500);
  }
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    seedDemoData, 
    seedAllDemoData,
    clearDemoData, 
    isDemoDataSeeded,
    resetAndSeedDemoData
  };
}
