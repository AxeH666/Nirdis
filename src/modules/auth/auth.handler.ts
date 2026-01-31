import { Auth } from "@auth/core";
import { authConfig } from "./auth.config";
import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Handles all Auth.js requests by converting Fastify request/response
 * to Web API Request/Response that Auth.js expects.
 *
 * Key requirements for Auth.js:
 * 1. Valid absolute URL (protocol + host + path)
 * 2. Cookies forwarded in headers
 * 3. POST body as URLSearchParams with correct Content-Type
 * 4. CSRF token in both cookie AND body for POST requests
 */
export async function handleAuthRequest(
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> {
  try {
    // Construct absolute URL - Auth.js requires valid absolute URLs
    // Use x-forwarded-proto for reverse proxy scenarios, default to http for dev
    const protocol = getProtocol(req);
    const host = req.headers.host ?? `localhost:${process.env.PORT ?? 3000}`;
    const path = req.raw.url ?? "/";

    // Validate URL construction to prevent "Invalid URL" errors
    let fullUrl: URL;
    try {
      fullUrl = new URL(path, `${protocol}://${host}`);
    } catch (urlError) {
      req.log.error({ protocol, host, path }, "Failed to construct URL for Auth.js");
      res.status(400).send({ error: "Invalid request URL" });
      return;
    }

    const method = req.raw.method ?? "GET";

    // Build headers - copy all except content-length (will be recalculated)
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.raw.headers)) {
      if (value === undefined) continue;
      if (key.toLowerCase() === "content-length") continue;

      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }

    // Build body for POST/PUT/PATCH requests
    // @fastify/formbody already parsed the body, we need to re-serialize it
    let body: BodyInit | undefined;
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      if (req.body && typeof req.body === "object") {
        // Re-serialize parsed form body to URLSearchParams
        body = new URLSearchParams(req.body as Record<string, string>).toString();
        // Ensure Content-Type is set correctly for form data
        headers.set("content-type", "application/x-www-form-urlencoded");
      } else if (typeof req.body === "string") {
        body = req.body;
      }
    }

    // Create Web API Request for Auth.js
    // Note: duplex is required for Node.js Request with body
    const request = new Request(fullUrl.toString(), {
      method,
      headers,
      body,
      // @ts-expect-error - duplex is required in Node.js but not in TypeScript types
      duplex: body ? "half" : undefined,
    });

    // Call Auth.js handler
    const response = await Auth(request, {
      ...authConfig,
      basePath: "/auth",
      trustHost: true,
    });

    // Forward response headers to Fastify
    response.headers.forEach((value, key) => {
      // Handle Set-Cookie specially - can have multiple values
      if (key.toLowerCase() === "set-cookie") {
        res.raw.appendHeader(key, value);
      } else {
        res.raw.setHeader(key, value);
      }
    });

    // Send response
    res.raw.statusCode = response.status;

    // Stream response body
    if (response.body) {
      const text = await response.text();
      res.raw.end(text);
    } else {
      res.raw.end();
    }
  } catch (error) {
    // Log detailed error for debugging
    req.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: req.raw.url,
        method: req.raw.method,
      },
      "Auth.js handler error"
    );

    // Return generic error to client (don't leak internal details)
    if (!res.sent) {
      res.status(500).send({
        error: "Authentication service error",
        message: process.env.NODE_ENV === "development"
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      });
    }
  }
}

/**
 * Get the current session for a Fastify request (e.g. for protecting API routes).
 * Resolves Auth.js session by issuing an internal GET /auth/session with the same cookies.
 */
export async function getSessionForRequest(req: FastifyRequest): Promise<{ user: { id: string; [key: string]: unknown } } | null> {
  const protocol = getProtocol(req);
  const host = req.headers.host ?? `localhost:${process.env.PORT ?? 3000}`;
  const sessionUrl = `${protocol}://${host}/auth/session`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.raw.headers)) {
    if (value === undefined || key.toLowerCase() === "content-length") continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }
  const request = new Request(sessionUrl, { method: "GET", headers });
  const response = await Auth(request, {
    ...authConfig,
    basePath: "/auth",
    trustHost: true,
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data && typeof data === "object" && data.user ? data : null;
}

/**
 * Determine protocol from request headers
 * Handles reverse proxy scenarios (x-forwarded-proto) and direct connections
 */
function getProtocol(req: FastifyRequest): string {
  // Check x-forwarded-proto header (set by reverse proxies like nginx, cloudflare)
  const forwarded = req.headers["x-forwarded-proto"];
  if (forwarded) {
    // Can be comma-separated list, take first value
    const proto = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return proto.trim();
  }

  // Check if connection is encrypted (direct TLS)
  // @ts-expect-error - encrypted property exists on TLS sockets
  if (req.raw.socket?.encrypted) {
    return "https";
  }

  // Default to http for local development
  return "http";
}
