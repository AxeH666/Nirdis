import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton Prisma client instance
// This ensures exactly ONE PrismaClient instance exists across the entire application
let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaPool: Pool | undefined;
}

// Factory function to create PrismaClient
// Prisma 7.3+ requires a database adapter for the "client" engine type
// We use the PostgreSQL adapter with a connection pool
function createPrismaClient(): PrismaClient {
  // Create a single connection pool (singleton)
  if (!global.__prismaPool) {
    global.__prismaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  
  // Create Prisma adapter using the pool
  const adapter = new PrismaPg(global.__prismaPool);
  
  // Create PrismaClient with the adapter
  return new PrismaClient({ adapter });
}

// In development, use global variable to prevent multiple instances during hot reload
// In production, create a new instance
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma as PrismaClient;
}

export { prisma };
