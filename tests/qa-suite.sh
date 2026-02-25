#!/usr/bin/env bash
# =============================================================================
# Debt Consolidation Dashboard — Comprehensive QA Test Suite
# Run: ./tests/qa-suite.sh [--live | --staging | --local]
# Exit code: 0 = all pass, 1 = failures
# =============================================================================
set -uo pipefail

# --- Configuration ---
LIVE_URL="https://debt.alldayautomations.ai"
STAGING_URL="https://a81c66cd.debt-consolidation-dashboard-8e1.pages.dev"
VOICE_URL="https://debt-voice-stack.fly.dev"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)/public"

# Default to staging (most reliable due to cache issues on custom domain)
BASE_URL="$STAGING_URL"
MODE="staging"

while [[ $# -gt 0 ]]; do
  case $1 in
    --live)    BASE_URL="$LIVE_URL"; MODE="live"; shift ;;
    --staging) BASE_URL="$STAGING_URL"; MODE="staging"; shift ;;
    --local)   MODE="local"; shift ;;
    *)         echo "Unknown option: $1"; exit 1 ;;
  esac
done

# --- Counters ---
PASS=0
FAIL=0
WARN=0
ERRORS=()

# --- Helpers ---
pass() { ((PASS++)); echo "  ✅ PASS: $1"; }
fail() { ((FAIL++)); ERRORS+=("$1"); echo "  ❌ FAIL: $1"; }
warn() { ((WARN++)); echo "  ⚠️  WARN: $1"; }

check_http() {
  local url="$1" label="$2" expected="${3:-200}"
  local code
  code=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "$expected" ]]; then
    pass "$label (HTTP $code)"
  else
    fail "$label — expected $expected, got $code"
  fi
}

check_content() {
  local url="$1" label="$2" needle="$3"
  local body
  body=$(curl -sL --max-time 10 "$url" 2>/dev/null || echo "")
  if echo "$body" | grep -qiE "$needle"; then
    pass "$label — contains '$needle'"
  else
    fail "$label — missing '$needle'"
  fi
}

hr() { echo ""; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

# =============================================================================
echo "🔍 Debt Dashboard QA Suite — $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "   Mode: $MODE | URL: ${BASE_URL:-local}"
hr

# --- 1. MAIN PAGE ---
echo "📄 1. Main Page (index.html)"
if [[ "$MODE" == "local" ]]; then
  [[ -f "$LOCAL_DIR/index.html" ]] && pass "index.html exists" || fail "index.html missing"
  [[ -f "$LOCAL_DIR/presentation.html" ]] && pass "presentation.html exists" || fail "presentation.html missing"
else
  check_http "$BASE_URL/" "index.html loads"
  check_content "$BASE_URL/" "index.html has branding" "Debt Empire"
fi

# --- 2. ALL 20 SPA PAGES ---
hr
echo "📄 2. SPA Pages (20 pages under /pages/)"
PAGES=(
  AIAgentManagement AICoach AgentDashboard Analytics Automation
  CRMLeads CallHistory CaseManagement ClientPortal Compliance
  DataImport DealPipeline Financial Gamification ManagerDashboard
  Marketing OwnerDashboard PowerDialer Settings TeamManagement
)

for page in "${PAGES[@]}"; do
  if [[ "$MODE" == "local" ]]; then
    [[ -f "$LOCAL_DIR/pages/${page}.html" ]] && pass "$page.html exists" || fail "$page.html missing"
  else
    check_http "$BASE_URL/pages/${page}.html" "$page.html"
  fi
done

# --- 3. JAVASCRIPT FILES ---
hr
echo "📄 3. JavaScript Files"
JS_FILES=(
  auth.js database.js demo-seed.js data-import-engine.js
  page-enhancements.js voice-api.js database-wrapper.js
  debtdb-storage.js auto-enhance.js
  demo-analytics.js demo-calls.js demo-deals.js demo-leads.js
  twilio.js twilio-client.js twilio-config.js twilio-manager.js
)

for js in "${JS_FILES[@]}"; do
  if [[ "$MODE" == "local" ]]; then
    [[ -f "$LOCAL_DIR/$js" ]] && pass "$js exists" || fail "$js missing"
  else
    check_http "$BASE_URL/$js" "$js"
  fi
done

# Page-specific JS
PAGE_JS=(
  "pages/compliance-functions.js"
  "pages/financial-functions.js"
  "pages/marketing-analytics-gamification-functions.js"
)
for js in "${PAGE_JS[@]}"; do
  if [[ "$MODE" == "local" ]]; then
    [[ -f "$LOCAL_DIR/$js" ]] && pass "$js exists" || fail "$js missing"
  else
    check_http "$BASE_URL/$js" "$js"
  fi
done

# --- 4. CONTENT CHECKS ---
hr
echo "📄 4. Content Integrity Checks"
if [[ "$MODE" != "local" ]]; then
  check_content "$BASE_URL/" "Login page has auth system" "auth.js|loginForm|authentication"
  check_content "$BASE_URL/" "Login page has auth.js" "auth.js"
  check_content "$BASE_URL/" "Dark theme present" "dark|1a1a2e|bg-gray"
  check_content "$BASE_URL/" "SPA router present" "loadPage"
else
  grep -qi "agent@demo.com" "$LOCAL_DIR/index.html" 2>/dev/null && pass "Login has demo accounts" || fail "Login missing demo accounts"
  grep -qi "loadPage" "$LOCAL_DIR/index.html" 2>/dev/null && pass "SPA router present" || fail "SPA router missing"
fi

# --- 5. VOICE STACK ---
hr
echo "📄 5. Voice Stack Health"
check_http "$VOICE_URL/" "Voice stack root"
check_content "$VOICE_URL/" "Voice stack identifies itself" "Debt Voice Stack"

# Check key API endpoints exist (may return 4xx without auth, but not 404)
for endpoint in "/api/agent/status" "/api/calls" "/api/callers"; do
  code=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 "$VOICE_URL$endpoint" 2>/dev/null || echo "000")
  if [[ "$code" != "404" && "$code" != "000" ]]; then
    pass "Voice $endpoint reachable (HTTP $code)"
  else
    fail "Voice $endpoint unreachable ($code)"
  fi
done

# --- 6. CLOUDFLARE CACHE CHECK ---
hr
echo "📄 6. Cloudflare Headers"
if [[ "$MODE" != "local" ]]; then
  cf_status=$(curl -sIL --max-time 10 "$BASE_URL/" 2>/dev/null | grep -i "cf-cache-status" | head -1 || echo "")
  if [[ -n "$cf_status" ]]; then
    pass "Cloudflare cache header present: $(echo "$cf_status" | tr -d '\r')"
  else
    warn "No cf-cache-status header (may be expected for HTML)"
  fi
  
  server=$(curl -sIL --max-time 10 "$BASE_URL/" 2>/dev/null | grep -i "^server:" | head -1 || echo "")
  if echo "$server" | grep -qi "cloudflare"; then
    pass "Served via Cloudflare"
  else
    warn "Not clearly served via Cloudflare: $server"
  fi
fi

# --- 7. CROSS-ORIGIN / SECURITY HEADERS ---
hr
echo "📄 7. Security Headers"
if [[ "$MODE" != "local" ]]; then
  headers=$(curl -sIL --max-time 10 "$BASE_URL/" 2>/dev/null)
  echo "$headers" | grep -qi "x-frame-options\|content-security-policy" && pass "Security headers present" || warn "No X-Frame-Options or CSP header"
  echo "$headers" | grep -qi "strict-transport" && pass "HSTS header present" || warn "No HSTS header"
fi

# --- 8. LIVE vs STAGING CONSISTENCY ---
hr
echo "📄 8. Live vs Staging Consistency"
if [[ "$MODE" != "local" ]]; then
  live_size=$(curl -s --max-time 10 "$LIVE_URL/" 2>/dev/null | wc -c | tr -d ' ')
  staging_size=$(curl -s --max-time 10 "$STAGING_URL/" 2>/dev/null | wc -c | tr -d ' ')
  if [[ "$live_size" -gt 0 && "$staging_size" -gt 0 ]]; then
    diff_pct=$(( (live_size - staging_size) * 100 / (staging_size + 1) ))
    if [[ "${diff_pct#-}" -lt 5 ]]; then
      pass "Live/staging size similar (live: ${live_size}B, staging: ${staging_size}B, diff: ${diff_pct}%)"
    else
      warn "Live/staging size mismatch (live: ${live_size}B, staging: ${staging_size}B, diff: ${diff_pct}%) — possible cache staleness"
    fi
  fi
fi

# =============================================================================
hr
echo ""
echo "📊 QA RESULTS SUMMARY"
echo "   ✅ Passed: $PASS"
echo "   ❌ Failed: $FAIL"
echo "   ⚠️  Warnings: $WARN"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo "❌ FAILURES:"
  for err in "${ERRORS[@]}"; do
    echo "   - $err"
  done
  echo ""
  echo "🔴 QA SUITE FAILED ($FAIL failures)"
  exit 1
else
  echo "🟢 QA SUITE PASSED — All tests green!"
  exit 0
fi
