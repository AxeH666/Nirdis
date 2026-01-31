-- Auth.js Prisma Adapter tables for PostgreSQL
-- Run once as postgres (from project root):
--   sudo -u postgres psql -d nirdis -f auth_tables.sql
-- Uses IF NOT EXISTS / DO blocks for idempotency. Safe to run multiple times.

-- 1. Add Auth.js required columns to existing users table (additive, no data loss)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "image" TEXT;

-- 2. Create Account table (Auth.js OAuth token storage)
CREATE TABLE IF NOT EXISTS public."Account" (
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

-- 3. Create Session table (Auth.js database sessions)
CREATE TABLE IF NOT EXISTS public."Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- 4. Create VerificationToken table (Auth.js email verification)
CREATE TABLE IF NOT EXISTS public."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);

-- 5. Create indexes (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON public."Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON public."VerificationToken"("token");

-- 6. Add foreign keys (ignore if already exist)
DO $$ BEGIN
    ALTER TABLE public."Account" ADD CONSTRAINT "Account_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES public.users("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER TABLE public."Session" ADD CONSTRAINT "Session_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES public.users("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 7. Grant app user access (tables created as postgres are owned by postgres)
-- Replace nirdis_user with your app DB user if different
GRANT ALL PRIVILEGES ON TABLE public."Account" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."Session" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."VerificationToken" TO nirdis_user;
GRANT USAGE ON SCHEMA public TO nirdis_user;
