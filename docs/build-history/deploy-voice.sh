#!/usr/bin/env bash
# =============================================================================
# Debt Voice Stack — Deploy Script (Fly.io)
# Usage: ./deploy-voice.sh [--dry-run]
# =============================================================================
set -euo pipefail

VOICE_DIR="$HOME/Projects/debt-voice-stack"
VOICE_URL="https://debt-voice-stack.fly.dev"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

hr() { echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

echo "🎙️ Voice Stack Deploy — $(date '+%Y-%m-%d %H:%M:%S %Z')"
hr

# --- Pre-deploy health check ---
echo "📋 Step 1: Pre-deploy health check..."
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$VOICE_URL/" 2>/dev/null || echo "000")
echo "  Current status: HTTP $code"

# --- Git push ---
echo "📦 Step 2: Git commit & push..."
if [[ -d "$VOICE_DIR" ]]; then
  cd "$VOICE_DIR"
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    if [[ "$DRY_RUN" == false ]]; then
      git add -A
      git commit -m "deploy: $(date '+%Y-%m-%d %H:%M') — voice stack update" || true
      git push origin main 2>&1 || git push origin master 2>&1 || true
    else
      echo "  [dry-run] Would commit and push"
    fi
  else
    echo "  No changes to commit"
  fi
else
  echo "  ⚠️  Voice stack dir not found at $VOICE_DIR"
fi
hr

# --- Fly deploy ---
echo "🚀 Step 3: Fly.io deploy..."
if [[ "$DRY_RUN" == false ]]; then
  if command -v flyctl &>/dev/null; then
    cd "$VOICE_DIR"
    flyctl deploy --remote-only 2>&1 || echo "⚠️  Fly deploy may have failed"
  elif command -v fly &>/dev/null; then
    cd "$VOICE_DIR"
    fly deploy --remote-only 2>&1 || echo "⚠️  Fly deploy may have failed"
  else
    echo "  ⚠️  flyctl not found — deploy via: cd $VOICE_DIR && flyctl deploy"
  fi
else
  echo "  [dry-run] Would run flyctl deploy"
fi
hr

# --- Post-deploy verification ---
echo "🔍 Step 4: Post-deploy verification..."
if [[ "$DRY_RUN" == false ]]; then
  sleep 15
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$VOICE_URL/" 2>/dev/null || echo "000")
  body=$(curl -s --max-time 10 "$VOICE_URL/" 2>/dev/null || echo "")
  if [[ "$code" == "200" ]] && echo "$body" | grep -q "Debt Voice Stack"; then
    echo "  ✅ Voice stack healthy (HTTP $code)"
  else
    echo "  ⚠️  Voice stack may have issues (HTTP $code)"
  fi
fi
hr

echo "🎉 Voice stack deploy complete — $(date '+%Y-%m-%d %H:%M:%S %Z')"
