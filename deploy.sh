#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "🚀 Manual deploy to Cloudflare Pages..."
npx wrangler pages deploy public --project-name=debt-consolidation-dashboard --commit-dirty=true --branch=main
echo "✅ Done! https://debt.alldayautomations.ai"
