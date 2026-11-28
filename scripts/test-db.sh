#!/usr/bin/env bash
# Runs the database security tests against a throwaway Postgres.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="pm_rls_test_$$"
psql -qc "create database $DB" >/dev/null
trap 'psql -qc "drop database if exists $DB" >/dev/null' EXIT
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f supabase/tests/auth_shim.sql -f supabase/migrations/20261128000000_portfolio_maldives.sql >/dev/null
out=$(psql -d "$DB" -q -f supabase/tests/rls_test.sql)
echo "$out" | grep -E "PASS|FAIL"
echo "$out" | grep -q "| FAIL" && { echo "Some checks failed."; exit 1; }
echo "All checks passed."
