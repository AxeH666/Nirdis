/**
 * Phase 3.9.5 — Hardened Chat Endpoint Wiring
 * POST /api/chat — single-turn astrology chat with strict guardrails.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { getChart } from "../astrology/chart.service";
import { buildLifeDomains } from "../astrology/lifeDomains";
import { generatePreviousLifeBrief } from "../astrology/previousLife";
import { derivePreviousLifeInsight } from "../astrology/previousLifeInsight";
import { generateInterpretation } from "../interpretation";
import { buildPreviousLifeSection } from "../interpretation/previousLifeSection";
import { mapChartToInsights } from "../psychology";
import {
  buildAstroChatContext,
  type BuildAstroChatContextInput,
} from "./context";
import { detectChatIntent } from "./intent";
import { buildResponseFrame } from "./frame";
import { generateAstroChatResponse } from "./generate";

interface ChatRequestBody {
  message?: unknown;
}

export async function handleChatRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Step 1: Authentication guard — req.user set by attachSession preHandler
  const user = (request as { user?: { id: string } }).user;
  if (!user) {
    reply.status(401).send();
    return;
  }

  // Step 2: Input validation guard — manual, no new libraries
  const body = request.body as ChatRequestBody | undefined;
  const rawMessage =
    body && typeof body === "object" && "message" in body
      ? body.message
      : undefined;

  if (typeof rawMessage !== "string") {
    reply.status(400).send({
      message: "A message is required to continue.",
    });
    return;
  }

  const message = rawMessage.trim();
  if (message.length === 0 || message.length > 500) {
    reply.status(400).send({
      message: "A message is required to continue.",
    });
    return;
  }

  // Step 3: Context construction — wrap in try/catch, 500 on failure
  let context: Awaited<ReturnType<typeof buildAstroChatContext>>;
  try {
    const chart = await getChart();
    const life_domains = buildLifeDomains(chart);
    const summary = `${chart.system} natal chart with ${chart.ascendant} rising.`;
    const traits = mapChartToInsights(chart);
    const interpretation = await generateInterpretation({ summary, traits });

    const previousLifeBrief = generatePreviousLifeBrief(chart);
    const insight = derivePreviousLifeInsight(chart);
    const interpretationForContext =
      previousLifeBrief && insight
        ? {
            sections: {
              ...interpretation.sections,
              previous_life: {
                theme: insight.theme,
                unresolved_pattern: insight.unresolved_pattern,
                carried_instincts: insight.carried_instincts,
                present_life_correction: insight.present_life_correction,
              },
            },
          }
        : { sections: interpretation.sections };

    const contextInput: BuildAstroChatContextInput = {
      chart,
      life_domains,
      interpretation: interpretationForContext as BuildAstroChatContextInput["interpretation"],
    };
    context = buildAstroChatContext(contextInput);
  } catch {
    reply.status(500).send({
      message: "The chart could not be accessed at this time.",
    });
    return;
  }

  // Step 4: Intent detection — store result, do not mutate
  const intent = detectChatIntent(message);

  // Step 5: Response framing — must happen before any AI call
  const frame = buildResponseFrame(intent);

  // Step 6: Response generation — OpenAI boundary, catch errors, return 200 with fallback
  let result: { text: string };
  try {
    result = await generateAstroChatResponse({
      context,
      intent,
      frame,
    });
  } catch {
    result = {
      text: "The chart can be reflected on calmly. Please try again shortly.",
    };
  }

  // Step 7: Final response — { text } only, no append
  reply.status(200).send({ text: result.text });
}
