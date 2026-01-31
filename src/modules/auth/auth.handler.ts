import { Auth } from "@auth/core";
import { authConfig } from "./auth.config";
import type { FastifyRequest, FastifyReply } from "fastify";

export async function handleAuthRequest(
  req: FastifyRequest,
  res: FastifyReply
) {
  const protocol = (req.headers["x-forwarded-proto"] as string) ?? "http";
  const host = req.headers.host ?? "localhost:3000";
  const fullUrl = new URL(req.raw.url ?? "/", `${protocol}://${host}`);

  // Build body for POST requests - @fastify/formbody has already parsed it
  let body: string | undefined;
  const method = req.raw.method ?? "GET";
  if (!["GET", "HEAD"].includes(method) && req.body && typeof req.body === "object") {
    body = new URLSearchParams(req.body as Record<string, string>).toString();
  }

  // Convert to Web API Request - Auth.js expects fetch API Request type
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.raw.headers)) {
    if (value !== undefined && key.toLowerCase() !== "content-length") {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const request = new Request(fullUrl.toString(), {
    method,
    headers,
    body,
  });

  const response = await Auth(request, {
    ...authConfig,
    basePath: "/auth",
    trustHost: true,
  });

  response.headers.forEach((value, key) => {
    res.raw.setHeader(key, value);
  });

  res.raw.statusCode = response.status;
  res.raw.end(await response.text());
}
