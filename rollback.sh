#!/usr/bin/env bash
set -euo pipefail
echo '🔄 Listing recent deployments...'
npx wrangler pages deployments list --project-name=debt-consolidation-dashboard
echo ''
echo 'To rollback, run:'
echo '  npx wrangler pages deployments rollback <deployment-id> --project-name=debt-consolidation-dashboard'
