/**
 * Dashboard API Endpoints for AI Voice Agent & PowerDialer
 * Full access to CRM, cases, pipeline, agents, analytics, compliance
 */

/**
 * Mock database - in production, replace with D1 queries
 * For now, we'll use the same structure as database.js
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Search leads by name, phone, email
 * GET /api/dashboard/leads/search?q=John
 */
export async function searchLeads(request, env) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.toLowerCase() || '';
  
  if (!query || query.length < 2) {
    return errorResponse('Query must be at least 2 characters');
  }

  // In production, query D1 database
  // For now, filter mock data from localStorage or KV
  const leads = await getLeadsFromStorage(env);
  
  const results = leads.filter(lead => 
    lead.name?.toLowerCase().includes(query) ||
    lead.email?.toLowerCase().includes(query) ||
    lead.phone?.includes(query)
  ).slice(0, 20); // Limit to 20 results

  return jsonResponse({
    query,
    count: results.length,
    results
  });
}

/**
 * Get lead details by ID
 * GET /api/dashboard/leads/:id
 */
export async function getLeadById(leadId, env) {
  const leads = await getLeadsFromStorage(env);
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) {
    return errorResponse('Lead not found', 404);
  }

  // Get related data
  const cases = await getCasesFromStorage(env);
  const calls = await getCallsFromStorage(env);
  
  const leadCases = cases.filter(c => c.leadId === leadId);
  const leadCalls = calls.filter(c => c.leadId === leadId)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return jsonResponse({
    lead,
    cases: leadCases,
    calls: leadCalls,
    callCount: leadCalls.length,
    lastCall: leadCalls[0] || null,
    totalTalkTime: leadCalls.reduce((sum, c) => sum + (c.talkTime || 0), 0)
  });
}

/**
 * Get lead by phone number (for caller memory)
 * GET /api/dashboard/leads/by-phone/:phone
 */
export async function getLeadByPhone(phone, env) {
  const cleanPhone = phone.replace(/\D/g, '');
  const leads = await getLeadsFromStorage(env);
  
  const lead = leads.find(l => {
    const leadPhone = l.phone?.replace(/\D/g, '');
    return leadPhone === cleanPhone;
  });

  if (!lead) {
    return jsonResponse({ found: false, lead: null });
  }

  // Get call history for this lead
  const calls = await getCallsFromStorage(env);
  const leadCalls = calls.filter(c => c.leadId === lead.id)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // Calculate sentiment trend
  const sentimentTrend = leadCalls
    .filter(c => c.sentiment)
    .slice(0, 5)
    .map(c => c.sentiment);

  return jsonResponse({
    found: true,
    lead,
    history: {
      totalCalls: leadCalls.length,
      lastCall: leadCalls[0] || null,
      recentCalls: leadCalls.slice(0, 5),
      sentimentTrend,
      outcomes: leadCalls.reduce((acc, c) => {
        acc[c.disposition || 'unknown'] = (acc[c.disposition || 'unknown'] || 0) + 1;
        return acc;
      }, {}),
      actionItems: leadCalls
        .filter(c => c.followUp)
        .map(c => ({ date: c.startTime, action: c.followUp }))
    }
  });
}

/**
 * Get case details
 * GET /api/dashboard/cases/:id
 */
export async function getCaseById(caseId, env) {
  const cases = await getCasesFromStorage(env);
  const case_ = cases.find(c => c.id === caseId);
  
  if (!case_) {
    return errorResponse('Case not found', 404);
  }

  return jsonResponse(case_);
}

/**
 * Get pipeline status summary
 * GET /api/dashboard/pipeline/status
 */
export async function getPipelineStatus(env) {
  const leads = await getLeadsFromStorage(env);
  
  const pipelineStages = [
    'New Lead', 'Contacted', 'Qualified', 'Enrolled',
    'In Program', 'Negotiating', 'Settled', 'Completed'
  ];

  const summary = pipelineStages.map(stage => ({
    stage,
    count: leads.filter(l => l.stage === stage).length,
    totalValue: leads
      .filter(l => l.stage === stage)
      .reduce((sum, l) => sum + (l.totalDebt || 0), 0)
  }));

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0
    ? (leads.filter(l => ['Enrolled', 'In Program', 'Negotiating', 'Settled', 'Completed'].includes(l.stage)).length / totalLeads * 100).toFixed(1)
    : 0;

  return jsonResponse({
    stages: summary,
    totalLeads,
    conversionRate: parseFloat(conversionRate),
    totalPipelineValue: leads.reduce((sum, l) => sum + (l.totalDebt || 0), 0)
  });
}

/**
 * Get available agents for transfer
 * GET /api/dashboard/agents/available
 */
export async function getAvailableAgents(env) {
  const agents = await getAgentsFromStorage(env);
  
  // Filter for available agents (in production, check real availability)
  const available = agents.filter(a => a.status === 'available' || a.status === 'on-call');
  
  return jsonResponse({
    count: available.length,
    agents: available.map(a => ({
      id: a.id,
      name: a.name,
      extension: a.extension,
      phone: a.phone,
      status: a.status,
      currentCalls: a.currentCalls || 0,
      closeRate: a.stats?.closeRate || 0
    }))
  });
}

/**
 * Get agent performance stats
 * GET /api/dashboard/agents/:id/stats
 */
export async function getAgentStats(agentId, env) {
  const agents = await getAgentsFromStorage(env);
  const agent = agents.find(a => a.id === agentId);
  
  if (!agent) {
    return errorResponse('Agent not found', 404);
  }

  const calls = await getCallsFromStorage(env);
  const agentCalls = calls.filter(c => c.agentId === agentId);

  const stats = {
    id: agent.id,
    name: agent.name,
    totalCalls: agentCalls.length,
    avgDuration: agentCalls.length > 0
      ? Math.round(agentCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / agentCalls.length)
      : 0,
    conversions: agentCalls.filter(c => c.disposition === 'enrolled').length,
    closeRate: agentCalls.length > 0
      ? ((agentCalls.filter(c => c.disposition === 'enrolled').length / agentCalls.length) * 100).toFixed(1)
      : 0,
    callsPerHour: agent.stats?.callsPerHour || 0,
    avgTalkTime: agent.stats?.avgTalkTime || 0
  };

  return jsonResponse(stats);
}

/**
 * Get analytics summary
 * GET /api/dashboard/analytics/summary
 */
export async function getAnalyticsSummary(env) {
  const leads = await getLeadsFromStorage(env);
  const calls = await getCallsFromStorage(env);
  const cases = await getCasesFromStorage(env);

  const today = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter(c => c.startTime?.startsWith(today));

  const analytics = {
    leads: {
      total: leads.length,
      new: leads.filter(l => l.stage === 'New Lead').length,
      qualified: leads.filter(l => l.stage === 'Qualified').length,
      enrolled: leads.filter(l => l.stage === 'Enrolled').length
    },
    calls: {
      total: calls.length,
      today: todayCalls.length,
      avgDuration: calls.length > 0
        ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length)
        : 0,
      connectRate: calls.length > 0
        ? ((calls.filter(c => c.status === 'completed').length / calls.length) * 100).toFixed(1)
        : 0,
      conversionRate: calls.length > 0
        ? ((calls.filter(c => c.disposition === 'enrolled').length / calls.length) * 100).toFixed(1)
        : 0
    },
    cases: {
      total: cases.length,
      active: cases.filter(c => c.status === 'active').length,
      settled: cases.filter(c => c.status === 'settled').length,
      totalDebt: cases.reduce((sum, c) => sum + (c.totalDebt || 0), 0),
      totalSavings: cases.reduce((sum, c) => sum + (c.savings || 0), 0)
    }
  };

  return jsonResponse(analytics);
}

/**
 * Get compliance status for client
 * GET /api/dashboard/compliance/:clientId
 */
export async function getComplianceStatus(clientId, env) {
  const leads = await getLeadsFromStorage(env);
  const lead = leads.find(l => l.id === clientId);
  
  if (!lead) {
    return errorResponse('Client not found', 404);
  }

  // Mock compliance data (in production, query compliance records)
  const compliance = {
    clientId,
    clientName: lead.name,
    status: 'compliant',
    requiredDisclosures: [
      { name: 'Fee Agreement', signed: true, date: '2026-02-20' },
      { name: 'Right to Cancel', signed: true, date: '2026-02-20' },
      { name: 'Program Overview', signed: true, date: '2026-02-20' },
      { name: 'Credit Impact Notice', signed: false, date: null }
    ],
    flags: lead.stage === 'New Lead' ? ['Missing credit impact disclosure'] : [],
    lastReview: '2026-02-24',
    dncStatus: 'opted-in',
    consentRecorded: true
  };

  return jsonResponse(compliance);
}

/**
 * Get talk scripts by category
 * GET /api/dashboard/scripts/:category
 */
export async function getScripts(category, env) {
  const allScripts = {
    opening: [
      {
        title: "Opening / Introduction",
        content: "Hi, this is [Your Name] from Debt Solutions. I'm calling because you recently inquired about reducing your monthly debt payments. Is this still a priority for you?"
      }
    ],
    qualification: [
      {
        title: "Qualification",
        content: "Great! To help you best, I need to understand your situation. Can you tell me: 1) What's your total monthly debt payment right now? 2) What would be an ideal monthly payment for you? 3) Are you currently behind on any payments?"
      }
    ],
    objections: [
      {
        title: "Objection: Not Interested",
        content: "I understand. Let me ask you this - if I could show you a way to reduce your monthly payments by 30-50% and get you debt-free in 3-4 years instead of 10+, would that be worth 15 minutes of your time?"
      },
      {
        title: "Objection: Need to Think",
        content: "I completely understand wanting to think it over. That's smart. Let me ask - what specific concerns do you have? I'd rather address them now than have you worry about them unnecessarily."
      },
      {
        title: "Objection: Bankruptcy Concerns",
        content: "That's a great question. Our program is NOT bankruptcy. Your credit may actually improve because you'll be paying off debts faster. Plus, you avoid the 7-10 year bankruptcy mark on your record."
      }
    ],
    closing: [
      {
        title: "Close / Enrollment",
        content: "Based on everything we've discussed, I can see you qualifying for our program. Your new monthly payment would be around $[amount], and you'd be debt-free in [timeframe]. Sound good? Let's get you enrolled today."
      }
    ]
  };

  const scripts = allScripts[category] || allScripts.opening;

  return jsonResponse({
    category,
    scripts
  });
}

/**
 * Log call activity
 * POST /api/dashboard/calls/log
 */
export async function logCall(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const callData = await request.json();
  
  // Validate required fields
  if (!callData.callSid || !callData.from || !callData.to) {
    return errorResponse('Missing required fields: callSid, from, to');
  }

  // Create call record
  const call = {
    id: callData.callSid,
    callSid: callData.callSid,
    direction: callData.direction || 'outbound',
    from: callData.from,
    to: callData.to,
    leadId: callData.leadId || null,
    agentId: callData.agentId || 'AGT001',
    startTime: callData.startTime || new Date().toISOString(),
    endTime: callData.endTime || null,
    duration: callData.duration || 0,
    ringTime: callData.ringTime || 0,
    talkTime: callData.talkTime || 0,
    holdTime: callData.holdTime || 0,
    status: callData.status || 'completed',
    disposition: callData.disposition || null,
    recordingUrl: callData.recordingUrl || null,
    recordingSid: callData.recordingSid || null,
    notes: callData.notes || '',
    followUp: callData.followUp || null,
    tags: callData.tags || [],
    sentiment: callData.sentiment || null,
    previousCallCount: callData.previousCallCount || 0,
    createdAt: new Date().toISOString()
  };

  // Save to storage (KV or D1 in production)
  await saveCallToStorage(env, call);

  return jsonResponse({
    success: true,
    callId: call.id,
    message: 'Call logged successfully'
  });
}

/**
 * Storage helpers (mock - replace with KV/D1 in production)
 */

async function getLeadsFromStorage(env) {
  // In production, query from KV or D1
  // For now, return mock data
  return getMockLeads();
}

async function getCasesFromStorage(env) {
  return getMockCases();
}

async function getCallsFromStorage(env) {
  return getMockCalls();
}

async function getAgentsFromStorage(env) {
  return getMockAgents();
}

async function saveCallToStorage(env, call) {
  // In production, save to KV or D1
  console.log('Saving call:', call.id);
  // For now, just log (client will use localStorage)
}

/**
 * Mock data generators
 */

function getMockLeads() {
  return [
    {
      id: 'L001',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '(555) 234-5678',
      stage: 'New Lead',
      totalDebt: 45000,
      monthlyIncome: 4200,
      dtiRatio: 89,
      status: 'active'
    },
    {
      id: 'L002',
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '(555) 345-6789',
      stage: 'Contacted',
      totalDebt: 32000,
      monthlyIncome: 5500,
      dtiRatio: 48,
      status: 'active'
    }
  ];
}

function getMockCases() {
  return [
    {
      id: 'C001',
      leadId: 'L001',
      status: 'active',
      totalDebt: 45000,
      savings: 0,
      creditors: ['Chase', 'Capital One']
    }
  ];
}

function getMockCalls() {
  return [
    {
      id: 'CALL001',
      callSid: 'CA123',
      leadId: 'L001',
      agentId: 'AGT001',
      startTime: '2026-02-24T10:00:00',
      duration: 180,
      disposition: 'callback',
      status: 'completed'
    }
  ];
}

function getMockAgents() {
  return [
    {
      id: 'AGT001',
      name: 'John Smith',
      status: 'available',
      extension: '101',
      phone: '+15551234567',
      stats: { closeRate: 35, callsPerHour: 12 }
    },
    {
      id: 'AGT002',
      name: 'Jane Doe',
      status: 'on-call',
      extension: '102',
      phone: '+15551234568',
      stats: { closeRate: 42, callsPerHour: 15 }
    }
  ];
}
