import 'dotenv/config';
import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { handleAuthRequest } from './modules/auth/auth.handler';

const start = async () => {
  const fastify = Fastify({
    logger: true,
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
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      project: 'Nirdiś',
    };
  });

  // Auth routes - handle all /auth/* requests
  fastify.all('/auth/*', async (request, reply) => {
    await handleAuthRequest(request, reply);
  });

  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
