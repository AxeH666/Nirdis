import 'dotenv/config';
import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { handleAuthRequest } from './modules/auth/auth.handler';
import { disconnectPrisma } from './config/prisma';
import { birthProfileRoutes } from './modules/birth-profile/birth-profile.routes';

const start = async () => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  // Register form body parser for application/x-www-form-urlencoded
  // This is required for Auth.js provider sign-in POST requests
  // Must be registered before routes
  await fastify.register(formbody);

  // Register cookie parser for CSRF token validation
  // This is required for Auth.js CSRF protection
  // Must be registered before auth routes
  await fastify.register(cookie);

  // Health endpoint
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      project: 'Nirdiś',
      timestamp: new Date().toISOString(),
    };
  });

  // Auth routes - handle all /auth requests
  // CRITICAL: Must match BOTH /auth AND /auth/* patterns
  // The /auth route is needed for /auth/session, /auth/csrf, etc.
  // Without this, MissingCSRF errors occur because /auth/csrf fails to match
  fastify.all('/auth', async (request, reply) => {
    await handleAuthRequest(request, reply);
  });

  fastify.all('/auth/*', async (request, reply) => {
    await handleAuthRequest(request, reply);
  });

  // API routes (authenticated)
  await fastify.register(birthProfileRoutes);

  // Graceful startup with port conflict handling
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`\n✓ Server listening on http://${host}:${port}`);
    console.log(`  Auth endpoints: http://${host}:${port}/auth/signin`);
    console.log(`  Health check:   http://${host}:${port}/health\n`);
  } catch (err) {
    // Handle common startup errors with helpful messages
    if (err instanceof Error) {
      if (err.message.includes('EADDRINUSE') || (err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        console.error(`\n✗ Port ${port} is already in use.`);
        console.error(`\nTo fix this, either:`);
        console.error(`  1. Kill the existing process:`);
        console.error(`     lsof -ti:${port} | xargs kill -9`);
        console.error(`  2. Or use a different port:`);
        console.error(`     PORT=3001 npm run dev\n`);
        process.exit(1);
      }

      if (err.message.includes('EACCES') || (err as NodeJS.ErrnoException).code === 'EACCES') {
        console.error(`\n✗ Permission denied to bind to port ${port}.`);
        console.error(`  Ports below 1024 require root privileges.`);
        console.error(`  Try using a port >= 1024 (e.g., PORT=3000)\n`);
        process.exit(1);
      }
    }

    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    try {
      await fastify.close();
      await disconnectPrisma();
      console.log('Server closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
