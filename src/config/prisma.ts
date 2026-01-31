import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Singleton Prisma Client Configuration
 *
 * This module ensures exactly ONE PrismaClient instance exists across the
 * entire application lifecycle, preventing connection pool exhaustion.
 *
 * For Prisma 7.3+, we use the @prisma/adapter-pg driver adapter which
 * provides better connection management and is required for the "client"
 * engine type.
 */

// Type declarations for global singleton storage
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaPool: Pool | undefined;
}

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set.\n' +
    'Please add it to your .env file:\n' +
    'DATABASE_URL="postgresql://nirdis_user:password@localhost:5432/nirdis"'
  );
}

/**
 * Creates a singleton connection pool for PostgreSQL
 */
function getPool(): Pool {
  if (!global.__prismaPool) {
    global.__prismaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Connection pool settings optimized for typical web app
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Fail fast if can't connect in 5s
    });

    // Log pool errors (don't crash, just log)
    global.__prismaPool.on('error', (err) => {
      console.error('[Prisma Pool] Unexpected error on idle client:', err);
    });
  }
  return global.__prismaPool;
}

/**
 * Creates a PrismaClient instance with the PostgreSQL adapter
 */
function createPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

  return client;
}

// Singleton pattern with hot-reload protection for development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // In development, store in global to survive hot reloads
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };

/**
 * Gracefully disconnect Prisma and close the pool
 * Call this on application shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    if (global.__prismaPool) {
      await global.__prismaPool.end();
      global.__prismaPool = undefined;
    }
    global.__prisma = undefined;
    console.log('[Prisma] Disconnected successfully');
  } catch (err) {
    console.error('[Prisma] Error during disconnect:', err);
  }
}
