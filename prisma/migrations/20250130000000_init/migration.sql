-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'EMAIL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "ActionType" AS ENUM ('ASTROLOGY', 'PALM', 'CHAT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "guests" (
    "id" TEXT NOT NULL,
    "astrology_reads_used" INTEGER NOT NULL DEFAULT 0,
    "palm_reads_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3),
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE IF NOT EXISTS "usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_id" TEXT,
    "action_type" "ActionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "guests_created_at_idx" ON "guests"("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_idx" ON "usage_logs"("user_id");
CREATE INDEX IF NOT EXISTS "usage_logs_guest_id_idx" ON "usage_logs"("guest_id");
CREATE INDEX IF NOT EXISTS "usage_logs_created_at_idx" ON "usage_logs"("created_at");
CREATE INDEX IF NOT EXISTS "usage_logs_action_type_idx" ON "usage_logs"("action_type");

-- AddForeignKey (ignore if exists)
DO $$ BEGIN
  ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
