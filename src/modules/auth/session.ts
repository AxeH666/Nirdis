/**
 * Shared session resolution for Fastify. Resolves Auth.js session from request
 * and attaches req.user for downstream handlers.
 *
 * Why curl may return 401 / null session: curl does not send cookies unless
 * you pass -b/--cookie. Browsers store the session cookie after OAuth and
 * automatically send it with same-origin requests. Use: curl -b cookies.txt -c cookies.txt
 * (save cookies from browser) or sign in via browser first, then copy the
 * authjs.session-token cookie value into curl -H "Cookie: authjs.session-token=..."
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { parse } from 'cookie';
import { prisma } from '../../config/prisma';

// Must match auth.config.ts cookies.sessionToken.name exactly
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

export interface ResolvedUser {
  id: string;
}

/** Dev-only fallback user when no session exists. Never used in production. */
const DEV_MOCK_USER_ID = 'dev-mock-user';

/**
 * Resolves session from request cookies and returns user if valid.
 * Uses request.cookies (from @fastify/cookie) when available, else parses Cookie header.
 */
export async function resolveSession(
  request: FastifyRequest
): Promise<ResolvedUser | null> {
  let sessionToken: string | undefined;

  const cookieSource =
    (request as { cookies?: Record<string, string> }).cookies ??
    parse(request.headers.cookie ?? '');

  sessionToken = cookieSource[SESSION_COOKIE_NAME];

  if (!sessionToken) {
    request.log.info('[auth] Session missing: no session token in cookies');
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    request.log.info('[auth] Session missing: not found or expired');
    return null;
  }

  request.log.info({ userId: session.userId }, '[auth] Session found');
  return { id: session.userId };
}

/**
 * PreHandler that attaches req.user from session. In development only,
 * if no session exists, injects a fallback user so /api/chat works for
 * curl and local testing without OAuth.
 */
export async function attachSession(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const req = request as FastifyRequest & { user?: ResolvedUser };

  const user = await resolveSession(request);
  if (user) {
    req.user = user;
    return;
  }

  // DEV-ONLY: fallback when no session so /api/chat is usable for local curl/testing
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: DEV_MOCK_USER_ID };
    request.log.info('[auth] Dev fallback: no session, using mock user');
  }
}
