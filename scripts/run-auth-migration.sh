#!/bin/bash
# Run Auth.js tables migration.
# Use a database user with ownership of the existing tables, or postgres superuser.
# Example: PGPASSWORD=your_password psql -U postgres -d nirdis -h localhost -f prisma/migrations/20250131000000_add_authjs_tables/migration.sql
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_ROOT/prisma/migrations/20250131000000_add_authjs_tables/migration.sql"

echo "Running Auth.js migration from $MIGRATION_FILE"
echo "Ensure your DB user has permission to ALTER users table and CREATE tables."
echo ""

if [ -n "$DATABASE_URL" ]; then
  # Extract connection params from DATABASE_URL if available
  psql "$DATABASE_URL" -f "$MIGRATION_FILE"
else
  echo "Usage: DATABASE_URL='postgresql://user:pass@host:5432/nirdis' $0"
  echo "Or: psql -U YOUR_DB_USER -d nirdis -h localhost -f $MIGRATION_FILE"
  exit 1
fi

echo "Migration complete. Record it with: npx prisma migrate resolve --applied 20250131000000_add_authjs_tables"
