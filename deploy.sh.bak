#!/usr/bin/env bash
# =============================================================================
# Debt Consolidation Dashboard — Deploy Script
# Usage: ./deploy.sh [--skip-qa] [--no-cache-purge] [--dry-run]
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKIP_QA=false
PURGE_CACHE=true
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-qa)        SKIP_QA=true; shift ;;
    --no-cache-purge) PURGE_CACHE=false; shift ;;
    --dry-run)        DRY_RUN=true; shift ;;
    *)                echo "Unknown: $1"; exit 1 ;;
  esac
done

CF_API_TOKEN="dBR4yeXnfzK9a5nOwE7zvlVse1CfNaJMU4KDAzdj"
CF_ZONE_ID=""  # Will auto-detect

hr() { echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

echo "🚀 Debt Dashboard Deploy — $(date '+%Y-%m-%d %H:%M:%S %Z')"
hr

# --- Step 1: Pre-deploy QA ---
if [[ "$SKIP_QA" == false ]]; then
  echo "📋 Step 1: Running QA suite (local mode)..."
  if "$SCRIPT_DIR/tests/qa-suite.sh" --local; then
    echo "✅ Local QA passed"
  else
    echo "🔴 QA failed — aborting deploy"
    exit 1
  fi
else
  echo "⚠️  Step 1: QA skipped (--skip-qa)"
fi
hr

# --- Step 2: Git commit & push ---
echo "📦 Step 2: Git commit & push..."
cd "$SCRIPT_DIR"

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  if [[ "$DRY_RUN" == true ]]; then
    echo "  [dry-run] Would commit and push changes"
  else
    git add -A
    git commit -m "deploy: $(date '+%Y-%m-%d %H:%M') — auto-deploy" || true
    git push origin main 2>&1 || git push origin master 2>&1
    echo "✅ Pushed to GitHub"
  fi
else
  echo "  No changes to commit"
fi
hr

# --- Step 3: Cloudflare Pages rebuilds automatically on push ---
echo "⚡ Step 3: Cloudflare Pages auto-builds on git push"
echo "  Waiting 30s for build to start..."
if [[ "$DRY_RUN" == false ]]; then
  sleep 30
fi
hr

# --- Step 4: Purge Cloudflare cache ---
if [[ "$PURGE_CACHE" == true && "$DRY_RUN" == false ]]; then
  echo "🧹 Step 4: Purging Cloudflare cache..."
  
  # Get zone ID for alldayautomations.ai
  if [[ -z "$CF_ZONE_ID" ]]; then
    CF_ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=alldayautomations.ai" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['result'][0]['id'])" 2>/dev/null || echo "")
  fi
  
  if [[ -n "$CF_ZONE_ID" ]]; then
    result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}' 2>/dev/null)
    if echo "$result" | grep -q '"success":true'; then
      echo "✅ Cache purged successfully"
    else
      echo "⚠️  Cache purge may have failed: $result"
    fi
  else
    echo "⚠️  Could not determine zone ID — skipping cache purge"
  fi
else
  echo "⏭️  Step 4: Cache purge skipped"
fi
hr

# --- Step 5: Post-deploy verification ---
echo "🔍 Step 5: Post-deploy verification..."
if [[ "$DRY_RUN" == false ]]; then
  sleep 10  # Give CF a moment
  "$SCRIPT_DIR/tests/qa-suite.sh" --staging && echo "✅ Post-deploy QA passed" || echo "⚠️  Post-deploy QA had issues"
else
  echo "  [dry-run] Would run staging QA"
fi
hr

echo "🎉 Deploy complete — $(date '+%Y-%m-%d %H:%M:%S %Z')"
