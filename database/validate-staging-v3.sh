#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${STAGING_DATABASE_URL:-}" ]]; then
  echo "STAGING_DATABASE_URL is required."
  echo "Example:"
  echo "  STAGING_DATABASE_URL='postgresql://user:password@host:5432/dbname?sslmode=require' ./database/validate-staging-v3.sh"
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "validate-staging-v3.sh is kept for compatibility."
echo "Delegating to the current-release staging validator..."
echo ""

"${SCRIPT_DIR}/validate-staging.sh"
