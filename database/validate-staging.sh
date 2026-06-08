#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${STAGING_DATABASE_URL:-}" ]]; then
  echo "STAGING_DATABASE_URL is required."
  echo "Example:"
  echo "  STAGING_DATABASE_URL='postgresql://user:password@host:5432/dbname?sslmode=require' ./database/validate-staging.sh"
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK_SQL="${SCRIPT_DIR}/preflight-current-integrity-checks.sql"

echo "Running Foodly current-release staging validation..."
echo "Checking required database tables..."

missing_tables="$(psql "${STAGING_DATABASE_URL}" \
  --set=ON_ERROR_STOP=1 \
  --tuples-only \
  --no-align \
  --command="
WITH required(table_name) AS (
  VALUES
    ('flyway_schema_history'),
    ('users'),
    ('restaurants'),
    ('menu_items'),
    ('orders'),
    ('order_items'),
    ('wishlist'),
    ('reviews')
)
SELECT COALESCE(string_agg(table_name, ', ' ORDER BY table_name), '')
FROM required
WHERE to_regclass(table_name) IS NULL;
")"

if [[ -n "${missing_tables}" ]]; then
  echo "Missing required table(s): ${missing_tables}"
  echo ""
  echo "This usually means the staging database is empty or the backend has not started with Flyway enabled yet."
  echo "Deploy/start the backend against staging first, then rerun this validation."
  exit 3
fi

psql "${STAGING_DATABASE_URL}" \
  --set=ON_ERROR_STOP=1 \
  --file="${CHECK_SQL}"

echo ""
echo "Staging database validation passed. It is ready for production rehearsal."
