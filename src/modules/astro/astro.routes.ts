import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getSessionForRequest } from "../auth/auth.handler";
import { getOrCreateNormalizedBirth } from "./normalization/normalization.service";

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
 * GET /api/astro/normalized-birth
 * Read-only. Returns normalized birth data for the authenticated user.
 * If profile does not exist → 404.
 * If data already exists → returns stored values.
 * Otherwise normalizes (stub resolve + birthUtc), stores, returns.
 */
export async function astroRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/astro/normalized-birth", async (request, reply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const normalized = await getOrCreateNormalizedBirth(session.user.id);
      return reply.status(200).send(normalized);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return reply.status(404).send({
          error: "Not found",
          message: "You haven't submitted your birth details yet",
        });
      }
      fastify.log.error(err);
      return reply.status(500).send({
        error: "Internal error",
        message: "Could not load normalized birth data",
      });
    }
  });
}
