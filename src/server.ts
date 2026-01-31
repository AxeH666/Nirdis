import 'dotenv/config';
import Fastify from 'fastify';
import { handleAuthRequest } from './modules/auth/auth.handler';
import { getChart } from './modules/astrology/chart.service';
import { buildLifeDomains } from './modules/astrology/lifeDomains';

const fastify = Fastify({
  logger: true,
});

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

// Astrology chart endpoint
fastify.get('/api/astrology/chart', async (request, reply) => {
  const chart = await getChart();
  const life_domains = buildLifeDomains(chart);
  const summary = `${chart.system} natal chart with ${chart.ascendant} rising.`;
  return {
    ...chart,
    summary,
    life_domains,
  };
});

const start = async () => {
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
