import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getSessionForRequest } from "../auth/auth.handler";
import { prisma } from "../../config/prisma";
import { createBirthProfileSchema } from "./validation";
import { birthDatetimeUtc } from "./birth-datetime";
import { resolveLocation } from "../location-resolver/location-resolver";
import { TimeConfidence } from "@prisma/client";

const LOCKED_MESSAGE = "Birth profile is locked and cannot be modified";

/**
 * Map API time_confidence string to Prisma enum
 */
function toTimeConfidence(value: string): TimeConfidence {
  switch (value) {
    case "exact":
      return TimeConfidence.exact;
    case "approx":
      return TimeConfidence.approx;
    case "unknown":
      return TimeConfidence.unknown;
    default:
      return TimeConfidence.unknown;
  }
}

/**
 * Require authentication. Returns 401 if no session.
 */
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

export async function birthProfileRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/birth-profile
   * Create a birth profile for the authenticated user.
   * Only one profile per user; rejects if one already exists.
   */
  fastify.post("/api/birth-profile", async (request, reply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const parseResult = createBirthProfileSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.flatten().fieldErrors;
      const message = Object.values(firstError).flat().join("; ") || "Validation failed";
      return reply.status(400).send({ error: "Validation error", message, details: firstError });
    }

    const body = parseResult.data;
    const userId = session.user.id;

    const existing = await prisma.birthProfile.findUnique({ where: { userId } });
    if (existing) {
      return reply.status(409).send({
        error: "Conflict",
        message: "A birth profile already exists for this user",
      });
    }

    let location;
    try {
      location = await resolveLocation(body.birth_place);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to resolve birth place location";
      return reply.status(400).send({
        error: "Location resolution failed",
        message,
      });
    }

    const birthTime = body.time_confidence === "unknown" ? "00:00" : (body.birth_time as string);
    let birthUtc: Date;
    try {
      birthUtc = birthDatetimeUtc(body.birth_date, birthTime, location.timezone);
    } catch (err) {
      return reply.status(400).send({
        error: "Invalid birth date/time",
        message: "Could not compute birth datetime in UTC",
      });
    }

    await prisma.birthProfile.create({
      data: {
        userId,
        birthDate: body.birth_date,
        birthTime,
        timeConfidence: toTimeConfidence(body.time_confidence),
        birthPlaceInput: body.birth_place,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        birthUtc,
        locked: true,
      },
    });

    return reply.status(201).send({ success: true, message: "Birth profile created" });
  });

  /**
   * PUT /api/birth-profile
   * Updates are not allowed; birth profiles are immutable.
   */
  fastify.put("/api/birth-profile", async (_request, reply) => {
    return reply.status(403).send({
      error: "Forbidden",
      message: LOCKED_MESSAGE,
    });
  });

  /**
   * PATCH /api/birth-profile
   * Updates are not allowed; birth profiles are immutable.
   */
  fastify.patch("/api/birth-profile", async (_request, reply) => {
    return reply.status(403).send({
      error: "Forbidden",
      message: LOCKED_MESSAGE,
    });
  });
}
