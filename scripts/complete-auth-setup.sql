-- ============================================================================
-- COMPLETE AUTH.JS + PRISMA SETUP FOR POSTGRESQL
-- ============================================================================
-- This script creates all required Auth.js tables and grants proper permissions
-- to the application database user (nirdis_user).
--
-- MUST BE RUN AS POSTGRES SUPERUSER:
--   sudo -u postgres psql -d nirdis -f scripts/complete-auth-setup.sql
--
-- This script is IDEMPOTENT - safe to run multiple times.
-- ============================================================================

-- Enable helpful output
\echo '=============================================='
\echo 'Starting Auth.js + Prisma complete setup...'
\echo '=============================================='

-- ============================================================================
-- SECTION 1: ENSURE ENUMS EXIST (from Prisma schema)
-- ============================================================================
\echo 'Creating enums if they do not exist...'

DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'EMAIL');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type AuthProvider already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type Plan already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE "ActionType" AS ENUM ('ASTROLOGY', 'PALM', 'CHAT');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type ActionType already exists, skipping.';
END $$;

-- ============================================================================
-- SECTION 2: CREATE CORE APPLICATION TABLES (if not exist)
-- ============================================================================
\echo 'Creating core application tables...'

-- Users table (Auth.js compatible)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'GOOGLE',
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Guests table
CREATE TABLE IF NOT EXISTS "guests" (
    "id" TEXT NOT NULL,
    "astrology_reads_used" INTEGER NOT NULL DEFAULT 0,
    "palm_reads_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3),
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS "usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_id" TEXT,
    "action_type" "ActionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- SECTION 3: CREATE AUTH.JS REQUIRED TABLES
-- ============================================================================
\echo 'Creating Auth.js tables...'

-- Account table (stores OAuth provider tokens)
-- Uses composite primary key (provider, providerAccountId)
CREATE TABLE IF NOT EXISTS "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId")
);

-- Session table (stores database sessions)
CREATE TABLE IF NOT EXISTS "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- VerificationToken table (for email verification - optional but required by schema)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);

-- ============================================================================
-- SECTION 4: CREATE INDEXES
-- ============================================================================
\echo 'Creating indexes...'

-- Core table indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "guests_created_at_idx" ON "guests"("created_at");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_idx" ON "usage_logs"("user_id");
CREATE INDEX IF NOT EXISTS "usage_logs_guest_id_idx" ON "usage_logs"("guest_id");
CREATE INDEX IF NOT EXISTS "usage_logs_created_at_idx" ON "usage_logs"("created_at");
CREATE INDEX IF NOT EXISTS "usage_logs_action_type_idx" ON "usage_logs"("action_type");

-- Auth.js table indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- ============================================================================
-- SECTION 5: CREATE FOREIGN KEYS (idempotent)
-- ============================================================================
\echo 'Creating foreign key constraints...'

-- usage_logs -> users
DO $$ BEGIN
  ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK usage_logs_user_id_fkey already exists, skipping.';
END $$;

-- usage_logs -> guests
DO $$ BEGIN
  ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_guest_id_fkey"
    FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK usage_logs_guest_id_fkey already exists, skipping.';
END $$;

-- Account -> users (Auth.js)
DO $$ BEGIN
  ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK Account_userId_fkey already exists, skipping.';
END $$;

-- Session -> users (Auth.js)
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK Session_userId_fkey already exists, skipping.';
END $$;

-- ============================================================================
-- SECTION 6: GRANT PERMISSIONS TO APPLICATION USER
-- ============================================================================
\echo 'Granting permissions to nirdis_user...'

-- Schema access
GRANT USAGE ON SCHEMA public TO nirdis_user;
GRANT CREATE ON SCHEMA public TO nirdis_user;

-- Grant on ALL EXISTING tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nirdis_user;

-- Grant on ALL EXISTING sequences (for auto-increment/serial columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nirdis_user;

-- Grant on ALL EXISTING types (enums)
DO $$ 
DECLARE
  type_name TEXT;
BEGIN
  FOR type_name IN SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('GRANT USAGE ON TYPE public.%I TO nirdis_user', type_name);
  END LOOP;
END $$;

-- Set DEFAULT privileges for FUTURE objects created by postgres
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nirdis_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nirdis_user;

-- ============================================================================
-- SECTION 7: CHANGE OWNERSHIP (Alternative to grants - ensures full control)
-- ============================================================================
\echo 'Transferring table ownership to nirdis_user...'

-- Transfer ownership of all tables to nirdis_user
-- This ensures nirdis_user has full control without needing grants
ALTER TABLE IF EXISTS "users" OWNER TO nirdis_user;
ALTER TABLE IF EXISTS "guests" OWNER TO nirdis_user;
ALTER TABLE IF EXISTS "usage_logs" OWNER TO nirdis_user;
ALTER TABLE IF EXISTS "Account" OWNER TO nirdis_user;
ALTER TABLE IF EXISTS "Session" OWNER TO nirdis_user;
ALTER TABLE IF EXISTS "VerificationToken" OWNER TO nirdis_user;

-- Transfer ownership of types (enums)
ALTER TYPE IF EXISTS "AuthProvider" OWNER TO nirdis_user;
ALTER TYPE IF EXISTS "Plan" OWNER TO nirdis_user;
ALTER TYPE IF EXISTS "ActionType" OWNER TO nirdis_user;

-- ============================================================================
-- SECTION 8: VERIFICATION
-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'VERIFICATION'
\echo '=============================================='

-- List all tables with owners
\echo 'Tables and their owners:'
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List Auth.js specific tables
\echo ''
\echo 'Auth.js tables status:'
SELECT 
  table_name,
  CASE WHEN table_name IN ('Account', 'Session', 'VerificationToken', 'users') 
       THEN '✓ Required for Auth.js' 
       ELSE '' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check indexes
\echo ''
\echo 'Critical indexes:'
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (indexname LIKE '%Session%' OR indexname LIKE '%Account%' OR indexname LIKE '%Verification%')
ORDER BY indexname;

\echo ''
\echo '=============================================='
\echo 'Setup complete!'
\echo ''
\echo 'Next steps:'
\echo '  1. Run: npx prisma generate'
\echo '  2. Run: npm run dev'
\echo '  3. Visit: http://localhost:3000/auth/signin'
\echo '=============================================='
