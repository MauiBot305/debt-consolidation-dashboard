# DebtDB API Reference

**Complete localStorage Database for Debt Consolidation Empire Dashboard**

All methods are **synchronous** and return **deep copies** (mutation-safe).  
All IDs are auto-generated in format: `{type}_{number}` (e.g., `lead_001`, `deal_042`)

---

## 📋 LEADS

### `getLeads(filters?)`
Returns array of all leads. Optional filters:
- `status` - Filter by status
- `source` - Filter by source
- `agent` - Filter by assigned agent ID
- `search` - Text search across all fields
- `priority` - Filter by priority ('high', 'medium', 'low')

**Example:**
```javascript
DebtDB.getLeads({ status: 'Qualified', agent: 'agent_001' })
```

### `getLead(id)`
Returns single lead by ID, or `null` if not found.

### `addLead(data)`
Creates new lead with auto-generated ID. Returns created lead.

**Required fields:** `name`, `email`, `phone`

**Example:**
```javascript
DebtDB.addLead({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  status: 'New',
  totalDebt: 45000,
  source: 'Google Ads'
})
```

### `updateLead(id, data)`
Partial update of lead. Returns updated lead.

### `deleteLead(id)`
Deletes lead. Returns `true`.

---

## 💼 DEALS

### `getDeals(filters?)`
Returns array of all deals. Optional filters:
- `stage` - Filter by pipeline stage
- `agent` - Filter by agent ID
- `minAmount` - Minimum deal amount
- `maxAmount` - Maximum deal amount
- `search` - Text search

### `getDeal(id)`
Returns single deal by ID.

### `addDeal(data)`
Creates new deal. Returns created deal.

### `updateDeal(id, data)`
Partial update of deal. Returns updated deal.

### `deleteDeal(id)`
Deletes deal. Returns `true`.

### `moveDeal(id, newStage)`
Moves deal to new pipeline stage. Returns updated deal.

**Pipeline stages:**
- New Lead
- Contacted
- Qualified
- Enrolled
- In Program
- Negotiating
- Settled
- Completed

---

## 📁 CASES

### `getCases(filters?)`
Returns array of all cases. Optional filters:
- `status` - Filter by status
- `client` - Filter by client name
- `agent` - Filter by agent ID

### `getCase(id)`
Returns single case by ID.

### `addCase(data)`
Creates new case with empty notes/payments/documents arrays. Returns created case.

### `updateCase(id, data)`
Partial update of case. Returns updated case.

### `deleteCase(id)`
Deletes case. Returns `true`.

### `addCaseNote(caseId, note)`
Adds note (string) to case. Returns updated case.

### `addCasePayment(caseId, payment)`
Adds payment object to case. Returns updated case.

**Payment object:**
```javascript
{ amount: 500, date: '2026-02-24', method: 'ACH' }
```

### `addCaseDocument(caseId, doc)`
Adds document object to case. Returns updated case.

**Document object:**
```javascript
{ name: 'Agreement.pdf', type: 'Contract', url: '/docs/...' }
```

---

## 📞 CALLS

### `getCalls(filters?)`
Returns array of all calls. Optional filters:
- `date` - Filter by date (YYYY-MM-DD)
- `agent` - Filter by agent ID
- `disposition` - Filter by call outcome
- `direction` - 'inbound' or 'outbound'

### `addCall(data)`
Creates new call record. Returns created call.

**Example:**
```javascript
DebtDB.addCall({
  leadId: 'lead_001',
  agent: 'agent_001',
  direction: 'outbound',
  disposition: 'Qualified',
  duration: 420,
  transcript: '...'
})
```

### `updateCall(id, data)`
Partial update of call. Returns updated call.

---

## 👥 AGENTS / TEAM

### `getAgents()`
Returns array of all agents.

### `getAgent(id)`
Returns single agent by ID.

### `addAgent(data)`
Creates new agent with default stats. Returns created agent.

**Example:**
```javascript
DebtDB.addAgent({
  name: 'Sarah Chen',
  email: 'schen@company.com',
  role: 'Debt Specialist',
  phone: '(312) 555-0102'
})
```

### `updateAgent(id, data)`
Partial update of agent. Returns updated agent.

---

## 🔔 ACTIVITIES

### `getActivities(limit = 50)`
Returns recent activity feed (sorted by timestamp, newest first). Default limit: 50.

### `addActivity(data)`
Creates activity record with auto-timestamp and current user. Returns created activity.

**Example:**
```javascript
DebtDB.addActivity({
  type: 'lead_created',
  entityId: 'lead_001',
  data: { name: 'John Doe' }
})
```

---

## 🔔 NOTIFICATIONS

### `getNotifications()`
Returns all notifications (sorted newest first).

### `addNotification(data)`
Creates notification. Returns created notification.

**Example:**
```javascript
DebtDB.addNotification({
  type: 'urgent',
  title: 'High-Value Lead',
  message: 'New lead with $85K debt'
})
```

### `markNotificationRead(id)`
Marks notification as read. Returns `true`.

### `getUnreadCount()`
Returns count of unread notifications.

---

## ✅ COMPLIANCE

### `getComplianceChecklist()`
Returns compliance checklist items.

### `updateComplianceItem(id, data)`
Updates checklist item. Returns updated item.

### `getLicenses()`
Returns state license records.

### `updateLicense(state, data)`
Updates or creates license for state. Returns all licenses.

**Example:**
```javascript
DebtDB.updateLicense('CA', {
  status: 'Active',
  number: 'CA-DRC-2024-123',
  expires: '2027-12-31'
})
```

### `getDNCList()`
Returns Do-Not-Call phone number list.

### `addToDNC(phone)`
Adds phone to DNC list. Returns `true`.

### `removeFromDNC(phone)`
Removes phone from DNC list. Returns `true`.

### `getAuditLog()`
Returns audit log entries (sorted newest first).

### `addAuditEntry(data)`
Creates audit log entry. Returns created entry.

---

## 📣 CAMPAIGNS

### `getCampaigns()`
Returns all marketing campaigns.

### `addCampaign(data)`
Creates new campaign. Returns created campaign.

### `updateCampaign(id, data)`
Updates campaign. Returns updated campaign.

---

## 🏆 GAMIFICATION

### `getLeaderboard()`
Returns agents sorted by points (highest first).

### `getAgentStats(agentId)`
Returns agent stats including level, points, achievements, streak.

### `addPoints(agentId, points, reason)`
Adds points to agent and updates level. Returns `{ newPoints, newLevel }`.

**Example:**
```javascript
DebtDB.addPoints('agent_001', 100, 'Closed high-value deal')
```

### `getAchievements(agentId)`
Returns array of agent's achievements.

---

## ⚙️ SETTINGS

### `getSettings()`
Returns company settings object.

### `updateSettings(data)`
Updates settings. Returns updated settings.

---

## 💰 FINANCIAL

### `getRevenue(period)`
Returns revenue for time period.

**Periods:** `'daily'`, `'weekly'`, `'monthly'`, `'yearly'`

### `getPayments(filters?)`
Returns payment records. Optional filters same as other entities.

### `addPayment(data)`
Creates payment record. Returns created payment.

### `getCommissions(agentId)`
Returns calculated commissions for agent (10% of deals).

---

## 🔍 GLOBAL SEARCH

### `search(query)`
Searches across leads, cases, deals, and agents. Returns array of results.

**Result format:**
```javascript
[
  { type: 'lead', data: {...} },
  { type: 'case', data: {...} },
  { type: 'deal', data: {...} },
  { type: 'agent', data: {...} }
]
```

---

## 📊 STATS (COMPUTED)

### `getDashboardStats()`
Returns overview stats:
```javascript
{
  totalLeads: 50,
  activeCases: 12,
  totalRevenue: 1245000,
  callsToday: 34,
  conversionRate: 18.5
}
```

### `getManagerStats()`
Returns array of agent performance stats.

### `getOwnerStats()`
Returns company-wide KPIs.

---

## 🛠️ UTILITIES

### `export(type)`
Exports data as CSV string. Types: `'leads'`, `'cases'`, `'deals'`, `'agents'`, `'calls'`, `'campaigns'`

### `import(type, data)`
Imports array of data. Returns `true`.

### `reset()`
**⚠️ DANGER:** Clears ALL data from localStorage. Returns `true`.

### `getCount(type)`
Returns count of entities. Types same as export.

---

## 🔐 AUTHENTICATION HELPER

### Internal: `getCurrentUser()`
Returns current logged-in user from localStorage, or `null`.

Used internally by methods that need to track who made changes.

---

## 📝 NOTES FOR OTHER AGENTS

1. **All methods are synchronous** - No promises, no async/await needed
2. **All returns are deep copies** - Mutating returned objects won't affect stored data
3. **IDs are auto-generated** - Never manually create IDs
4. **Timestamps are automatic** - `createdAt` and `updatedAt` handled automatically
5. **Current user tracking** - Activities and audit logs auto-capture current user
6. **localStorage prefix** - All keys use `debtdb_` prefix

---

## 🧪 TESTING

Run test suite in browser console:
```javascript
// Load test-debtdb.js in browser console
```

Or test individual methods:
```javascript
console.log(DebtDB.getLeads({ status: 'Qualified' }))
console.log(DebtDB.getDashboardStats())
console.log(DebtDB.search('Chase'))
```

---

## ✅ COMPLETE METHOD LIST (69 total)

**Leads (5):** getLeads, getLead, addLead, updateLead, deleteLead  
**Deals (6):** getDeals, getDeal, addDeal, updateDeal, deleteDeal, moveDeal  
**Cases (8):** getCases, getCase, addCase, updateCase, deleteCase, addCaseNote, addCasePayment, addCaseDocument  
**Calls (3):** getCalls, addCall, updateCall  
**Agents (4):** getAgents, getAgent, addAgent, updateAgent  
**Activities (2):** getActivities, addActivity  
**Notifications (4):** getNotifications, addNotification, markNotificationRead, getUnreadCount  
**Compliance (9):** getComplianceChecklist, updateComplianceItem, getLicenses, updateLicense, getDNCList, addToDNC, removeFromDNC, getAuditLog, addAuditEntry  
**Campaigns (3):** getCampaigns, addCampaign, updateCampaign  
**Gamification (4):** getLeaderboard, getAgentStats, addPoints, getAchievements  
**Settings (2):** getSettings, updateSettings  
**Financial (4):** getRevenue, getPayments, addPayment, getCommissions  
**Search (1):** search  
**Stats (3):** getDashboardStats, getManagerStats, getOwnerStats  
**Utilities (4):** export, import, reset, getCount  

---

**Last updated:** Feb 24, 2026  
**Agent:** SONNET AGENT 1 - CORE ENGINE REBUILD
