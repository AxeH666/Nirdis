-- Birth profiles table (Phase 1.1 - Birth Data Ingestion)
-- Run as postgres (or table owner): sudo -u postgres psql -d nirdis -f scripts/add-birth-profiles-table.sql
-- Or use: npx prisma db push (if DB user can create tables)

\echo 'Adding TimeConfidence enum and birth_profiles table...'

DO $$ BEGIN
  CREATE TYPE "TimeConfidence" AS ENUM ('exact', 'approx', 'unknown');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type TimeConfidence already exists, skipping.';
END $$;

CREATE TABLE IF NOT EXISTS "birth_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT NOT NULL,
    "timeConfidence" "TimeConfidence" NOT NULL,
    "birthPlaceInput" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "birthUtc" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "birth_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "birth_profiles_userId_key" ON "birth_profiles"("userId");
CREATE INDEX IF NOT EXISTS "birth_profiles_userId_idx" ON "birth_profiles"("userId");

DO $$ BEGIN
  ALTER TABLE "birth_profiles" ADD CONSTRAINT "birth_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK birth_profiles_userId_fkey already exists, skipping.';
END $$;

GRANT ALL PRIVILEGES ON TABLE "birth_profiles" TO nirdis_user;
ALTER TABLE "birth_profiles" OWNER TO nirdis_user;
ALTER TYPE "TimeConfidence" OWNER TO nirdis_user;

\echo 'birth_profiles table ready.'
