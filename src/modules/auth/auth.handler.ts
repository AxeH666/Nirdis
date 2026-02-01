import { Auth } from "@auth/core";
import { authConfig } from "./auth.config";
import type { FastifyRequest, FastifyReply } from "fastify";

const AUTH_LOG = process.env.AUTH_DEBUG === "1";

function getRequestBody(req: FastifyRequest): string | undefined {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  const contentType = (req.headers["content-type"] ?? "").toLowerCase();
  const body = req.body;
  if (body === undefined || body === null) return undefined;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      for (const [k, v] of Object.entries(body)) {
        params.set(k, String(v ?? ""));
      }
    }
    return params.toString();
  }
  return typeof body === "string" ? body : JSON.stringify(body);
}

function copyHeadersToReply(response: Response, reply: FastifyReply): void {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    reply.raw.setHeader("Set-Cookie", setCookies);
    if (AUTH_LOG)
      reply.request.log.debug(
        { count: setCookies.length },
        "[auth] Set-Cookie headers forwarded"
      );
  }
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      reply.raw.setHeader(key, value);
    }
  });
}

export async function handleAuthRequest(
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (AUTH_LOG) req.log.debug("[auth] Auth handler invoked");

  const protocol =
    (req as { protocol?: string }).protocol ??
    (req.headers["x-forwarded-proto"] as string) ??
    "http";
  const baseUrl = `${protocol}://${req.headers.host ?? "localhost"}`;
  const fullUrl = new URL(req.url, baseUrl);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined && value !== null) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
    }
  }

  const body = getRequestBody(req);
  const request = new Request(fullUrl.toString(), {
    method: req.method,
    headers,
    body: body ?? undefined,
  });

  const response = await Auth(request, {
    ...authConfig,
    basePath: "/auth",
    trustHost: true,
  });

  if (AUTH_LOG) {
    req.log.debug({ status: response.status, url: req.url }, "[auth] Auth response");
  }

  reply.code(response.status);
  copyHeadersToReply(response, reply);

  const bodyText = await response.text();
  return reply.send(bodyText);
}
