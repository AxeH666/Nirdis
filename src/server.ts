import 'dotenv/config';
import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { handleAuthRequest } from './modules/auth/auth.handler';
import { getChart } from './modules/astrology/chart.service';
import { buildLifeDomains } from './modules/astrology/lifeDomains';
import { generatePreviousLifeBrief } from './modules/astrology/previousLife';
import { derivePreviousLifeInsight } from './modules/astrology/previousLifeInsight';
import { generateInterpretation } from './modules/interpretation';
import { buildIntegrationSummary } from './modules/interpretation/integrationSummary';
import { buildPreviousLifeSection } from './modules/interpretation/previousLifeSection';
import { mapChartToInsights } from './modules/psychology';
import { handleChatRequest } from './modules/chat/chat.route';
import { attachSession } from './modules/auth/session';

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  // formbody and cookie MUST come first (Auth.js needs both)
  await fastify.register(formbody, { bodyLimit: 1048576 });
  await fastify.register(cookie, {
    secret: process.env.AUTH_SECRET ?? "fallback-secret-change-in-production",
  });
  await fastify.register(cors, { origin: true, credentials: true });

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

  // Chat endpoint (preHandler attaches req.user from session)
  fastify.post('/api/chat', { preHandler: attachSession }, handleChatRequest);

  // Astrology chart endpoint
  fastify.get('/api/astrology/chart', async (request, reply) => {
    const chart = await getChart();
    const life_domains = buildLifeDomains(chart);
    const summary = `${chart.system} natal chart with ${chart.ascendant} rising.`;
    const previous_life_brief = generatePreviousLifeBrief(chart);
    return {
      ...chart,
      summary,
      life_domains,
      ...(previous_life_brief && { previous_life_brief }),
    };
  });

  // Interpretation endpoint (uses chart data, does not recompute astrology)
  fastify.get('/api/interpretation', async (request, reply) => {
    const chart = await getChart();
    const summary = `${chart.system} natal chart with ${chart.ascendant} rising.`;
    const traits = mapChartToInsights(chart);
    const interpretation = await generateInterpretation({ summary, traits });

    const sun = chart.planets?.find((p) => p.name === 'Sun');
    const moon = chart.planets?.find((p) => p.name === 'Moon');
    const sunHouse = sun?.house ?? 1;
    const moonHouse = moon?.house ?? 1;
    const previousLifeBrief = generatePreviousLifeBrief(chart);
    const integration_summary = buildIntegrationSummary(
      chart.ascendant,
      sunHouse,
      moonHouse,
      previousLifeBrief
    );

    const result: Record<string, unknown> = {
      ...interpretation,
      integration_summary,
    };
    if (previousLifeBrief) {
      const baseSection = buildPreviousLifeSection(previousLifeBrief);
      const insight = derivePreviousLifeInsight(chart);
      result.sections = {
        ...interpretation.sections,
        previous_life: {
          ...baseSection,
          ...(insight && {
            theme: insight.theme,
            unresolved_pattern: insight.unresolved_pattern,
            carried_instincts: insight.carried_instincts,
            present_life_correction: insight.present_life_correction,
          }),
        },
      };
    }
    return result;
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
