import { Auth } from "@auth/core";
import { authConfig } from "./auth.config";
import type { FastifyRequest, FastifyReply } from "fastify";

export async function handleAuthRequest(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const fullUrl = new URL(
    req.url,
    `${req.protocol}://${req.headers.host}`
  );

  const request = new Request(fullUrl.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : JSON.stringify(req.body),
  });

  const response = await Auth(request, {
    ...authConfig,
    basePath: "/auth",
    trustHost: true,
  });

  reply.status(response.status);

  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });

  const body = await response.text();
  reply.send(body);
}
