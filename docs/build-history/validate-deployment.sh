#!/bin/bash
# Deployment Validation Script
# Tests that all pages are accessible and properly formatted

BASE_URL="https://debt.alldayautomations.ai"

echo "🔍 Validating Debt Consolidation Dashboard Deployment"
echo "Base URL: $BASE_URL"
echo ""

# Test main index
echo "Testing index.html..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$STATUS" = "200" ]; then
  echo "✅ index.html: OK (HTTP $STATUS)"
else
  echo "❌ index.html: FAILED (HTTP $STATUS)"
fi

# Test all 19 pages
PAGES=(
  "AgentDashboard"
  "ManagerDashboard"
  "OwnerDashboard"
  "PowerDialer"
  "CallHistory"
  "CRMLeads"
  "DealPipeline"
  "CaseManagement"
  "Compliance"
  "Financial"
  "Marketing"
  "Analytics"
  "Gamification"
  "AICoach"
  "Automation"
  "TeamManagement"
  "Settings"
  "ClientPortal"
  "DataImport"
)

echo ""
echo "Testing all 19 pages..."
for page in "${PAGES[@]}"; do
  URL="$BASE_URL/pages/${page}.html"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  if [ "$STATUS" = "200" ]; then
    echo "✅ $page.html: OK"
  else
    echo "❌ $page.html: FAILED (HTTP $STATUS)"
  fi
done

# Test Twilio Worker
echo ""
echo "Testing Twilio Worker API..."
WORKER_URL="https://debt-dashboard-api.maui-6b7.workers.dev"

HEALTH=$(curl -s "$WORKER_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Twilio Worker: OK"
  echo "   $HEALTH"
else
  echo "❌ Twilio Worker: FAILED"
  echo "   $HEALTH"
fi

# Test token generation
echo ""
echo "Testing Twilio token generation..."
TOKEN_RESPONSE=$(curl -s "$WORKER_URL/api/twilio/token?identity=test")
if echo "$TOKEN_RESPONSE" | grep -q "token"; then
  echo "✅ Token generation: OK"
  echo "   Token length: $(echo "$TOKEN_RESPONSE" | jq -r '.token' | wc -c)"
else
  echo "❌ Token generation: FAILED"
  echo "   $TOKEN_RESPONSE"
fi

echo ""
echo "✅ Validation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open $BASE_URL in browser"
echo "2. Login with owner@demo.com / demo"
echo "3. Navigate through all 19 pages (check console for errors)"
echo "4. Test Power Dialer by calling (305) 427-3952"
echo "5. Call +17542542410 to test AI agent pickup"
