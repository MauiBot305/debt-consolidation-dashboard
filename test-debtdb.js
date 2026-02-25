/**
 * DebtDB Test Suite
 * Run in browser console after loading the dashboard
 */

console.log('🧪 Starting DebtDB Test Suite...\n');

// Test 1: Verify DebtDB is loaded
console.log('Test 1: DebtDB loaded?');
console.log(typeof DebtDB === 'object' ? '✅ PASS' : '❌ FAIL');

// Test 2: Check all methods exist
console.log('\nTest 2: All methods exist?');
const requiredMethods = [
  // LEADS
  'getLeads', 'getLead', 'addLead', 'updateLead', 'deleteLead',
  // DEALS
  'getDeals', 'getDeal', 'addDeal', 'updateDeal', 'deleteDeal', 'moveDeal',
  // CASES
  'getCases', 'getCase', 'addCase', 'updateCase', 'deleteCase',
  'addCaseNote', 'addCasePayment', 'addCaseDocument',
  // CALLS
  'getCalls', 'addCall', 'updateCall',
  // AGENTS
  'getAgents', 'getAgent', 'addAgent', 'updateAgent',
  // ACTIVITIES
  'getActivities', 'addActivity',
  // NOTIFICATIONS
  'getNotifications', 'addNotification', 'markNotificationRead', 'getUnreadCount',
  // COMPLIANCE
  'getComplianceChecklist', 'updateComplianceItem', 'getLicenses', 'updateLicense',
  'getDNCList', 'addToDNC', 'removeFromDNC', 'getAuditLog', 'addAuditEntry',
  // CAMPAIGNS
  'getCampaigns', 'addCampaign', 'updateCampaign',
  // GAMIFICATION
  'getLeaderboard', 'getAgentStats', 'addPoints', 'getAchievements',
  // SETTINGS
  'getSettings', 'updateSettings',
  // FINANCIAL
  'getRevenue', 'getPayments', 'addPayment', 'getCommissions',
  // SEARCH
  'search',
  // STATS
  'getDashboardStats', 'getManagerStats', 'getOwnerStats',
  // UTILITIES
  'export', 'import', 'reset', 'getCount'
];

let missingMethods = [];
requiredMethods.forEach(method => {
  if (typeof DebtDB[method] !== 'function') {
    missingMethods.push(method);
  }
});

if (missingMethods.length === 0) {
  console.log(`✅ PASS - All ${requiredMethods.length} methods exist`);
} else {
  console.log(`❌ FAIL - Missing methods:`, missingMethods);
}

// Test 3: Data seeded?
console.log('\nTest 3: Demo data seeded?');
const leadCount = DebtDB.getLeads().length;
const dealCount = DebtDB.getDeals().length;
const caseCount = DebtDB.getCases().length;
const agentCount = DebtDB.getAgents().length;
console.log(`Leads: ${leadCount}, Deals: ${dealCount}, Cases: ${caseCount}, Agents: ${agentCount}`);
console.log(leadCount >= 50 && agentCount >= 10 ? '✅ PASS' : '❌ FAIL');

// Test 4: CRUD operations
console.log('\nTest 4: CRUD operations');
try {
  // Create
  const testLead = DebtDB.addLead({
    name: 'Test User',
    email: 'test@example.com',
    phone: '(555) 000-0000',
    status: 'New',
    totalDebt: 50000
  });
  console.log('✅ addLead works - ID:', testLead.id);
  
  // Read
  const retrievedLead = DebtDB.getLead(testLead.id);
  console.log(retrievedLead.name === 'Test User' ? '✅ getLead works' : '❌ getLead failed');
  
  // Update
  const updatedLead = DebtDB.updateLead(testLead.id, { status: 'Contacted' });
  console.log(updatedLead.status === 'Contacted' ? '✅ updateLead works' : '❌ updateLead failed');
  
  // Delete
  DebtDB.deleteLead(testLead.id);
  const deletedCheck = DebtDB.getLead(testLead.id);
  console.log(deletedCheck === null ? '✅ deleteLead works' : '❌ deleteLead failed');
} catch (error) {
  console.log('❌ FAIL -', error.message);
}

// Test 5: Search functionality
console.log('\nTest 5: Search functionality');
try {
  const searchResults = DebtDB.search('Chase');
  console.log(`Found ${searchResults.length} results for "Chase"`);
  console.log(searchResults.length > 0 ? '✅ search works' : '⚠️  No results (may be OK)');
} catch (error) {
  console.log('❌ FAIL -', error.message);
}

// Test 6: Stats
console.log('\nTest 6: Dashboard stats');
try {
  const stats = DebtDB.getDashboardStats();
  console.log('Dashboard Stats:', stats);
  console.log(typeof stats.totalLeads === 'number' ? '✅ getDashboardStats works' : '❌ FAIL');
} catch (error) {
  console.log('❌ FAIL -', error.message);
}

// Test 7: Notifications
console.log('\nTest 7: Notifications');
try {
  const notifCount = DebtDB.getUnreadCount();
  console.log(`Unread notifications: ${notifCount}`);
  console.log(typeof notifCount === 'number' ? '✅ Notification system works' : '❌ FAIL');
} catch (error) {
  console.log('❌ FAIL -', error.message);
}

// Test 8: Financial
console.log('\nTest 8: Financial data');
try {
  const monthlyRevenue = DebtDB.getRevenue('monthly');
  console.log(`Monthly revenue: $${monthlyRevenue.toLocaleString()}`);
  console.log(typeof monthlyRevenue === 'number' ? '✅ getRevenue works' : '❌ FAIL');
} catch (error) {
  console.log('❌ FAIL -', error.message);
}

console.log('\n✅ Test suite complete!');
console.log('\n📊 DebtDB Method List (for other agents):');
console.log(requiredMethods.sort());
