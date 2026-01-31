import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getSessionForRequest } from "../auth/auth.handler";
import { prisma } from "../../config/prisma";
import { buildWholeSignChart } from "./chart.service";

async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ user: { id: string } } | null> {
  const session = await getSessionForRequest(request);
  if (!session?.user?.id) {
    reply.status(401).send({ error: "Unauthorized", message: "You must be logged in" });
    return null;
  }
  return session as { user: { id: string } };
}

/**
 * GET /api/astrology/chart
 * Returns Whole Sign chart for the authenticated user's birth profile.
 * Requires authentication. If no birth profile exists, returns 400.
 */
export async function astrologyRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/astrology/chart", async (request, reply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const profile = await prisma.birthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return reply.status(400).send({
        error: "Bad request",
        message: "You need to submit your birth details before viewing a chart",
      });
    }

    const chart = buildWholeSignChart(profile.birthDate);
    return reply.status(200).send(chart);
  });
}
