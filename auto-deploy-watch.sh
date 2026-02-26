#!/bin/bash
# Auto-deploy watcher: checks for new commits on main and deploys
cd /Users/mauichinery/Projects/debt-consolidation-dashboard
export PATH=/opt/homebrew/bin:/Users/motherfuckingpatrick/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:/Users/motherfuckingpatrick/Library/pnpm:/Users/motherfuckingpatrick/.local/bin:/Users/motherfuckingpatrick/.yarn/bin:/usr/bin:/bin:/Users/motherfuckingpatrick/.nvm:/Users/motherfuckingpatrick/.npm-global/bin:/Users/motherfuckingpatrick/bin:/Users/motherfuckingpatrick/.volta/bin:/Users/motherfuckingpatrick/.asdf/shims:/Users/motherfuckingpatrick/.bun/bin:/Users/motherfuckingpatrick/Library/Application Support/fnm/aliases/default/bin:/Users/motherfuckingpatrick/.fnm/aliases/default/bin:/Users/motherfuckingpatrick/.local/share/pnpm

# Get current local and remote HEADs
LOCAL=f1547a6b75b077752bb701b7407a3ac4e513776d
git fetch origin main --quiet 2>/dev/null
REMOTE=f1547a6b75b077752bb701b7407a3ac4e513776d

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "[$(date)] New commits detected. Pulling and deploying..."
  git pull origin main --quiet 2>/dev/null
  npx wrangler pages deploy public --project-name=debt-consolidation-dashboard --commit-dirty=true --branch=main 2>&1
  echo "[$(date)] Deploy complete."
else
  # Same HEAD, but check if last deploy failed
  echo "[$(date)] No new commits. Skipping."
fi
