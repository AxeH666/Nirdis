/**
 * Phase 3.9.4 — Controlled OpenAI Response Generation
 * Generates chat responses using context, intent, and frame.
 * Safety: unsafe intents bypass AI entirely. Prompts enforce strict guardrails.
 */

import OpenAI from "openai";

const UNSAFE_RESPONSE = {
  text: "This question goes beyond what astrology can safely explore. It may help to speak with a qualified professional.",
};

// Max tokens by length: short = 120, medium = 220
function getMaxTokens(length: string): number {
  if (length === "medium") return 220;
  return 120;
}

// Build system prompt: role, prohibitions, scope limited to allowed_sections
function buildSystemPrompt(allowed_sections: string[]): string {
  const sectionsList = allowed_sections.join(", ");
  return `You are a traditional astrologer. Your role is to explain chart symbolism in clear, grounded language.

STRICT RULES - NEVER VIOLATE:
- Do NOT make predictions about the future.
- Do NOT diagnose, label, or use psychology or medical terms.
- Do NOT express certainty ("you will", "you should", "definitely").
- Use simple English. Calm, grounded tone. Symbolic language only.
- Limit your discussion to these context sections: ${sectionsList}.
- Explain what the chart suggests. Do not advise or prescribe.`;
}

// Build user prompt: opening, context, instruction, closing
function buildUserPrompt(
  opening_style: string,
  context: unknown,
  closing_style: string
): string {
  const contextStr = JSON.stringify(context, null, 0).trim();
  return `${opening_style}

Astrology context (use only relevant sections):
${contextStr}

Instructions: Explain what the chart indicates in relation to the user's question. Use symbolic, traditional language. Do not advise. Do not predict. End with a brief grounded note.

${closing_style}`;
}

export interface GenerateAstroChatResponseInput {
  context: unknown;
  intent: {
    domain: string;
    depth: string;
    safe: boolean;
    flags: string[];
  };
  frame: {
    tone: string;
    voice: string;
    length: string;
    allowed_sections: string[];
    opening_style: string;
    closing_style: string;
  };
}

export interface GenerateAstroChatResponseOutput {
  text: string;
}

export async function generateAstroChatResponse(
  input: GenerateAstroChatResponseInput
): Promise<GenerateAstroChatResponseOutput> {
  // Safety: unsafe intents never reach OpenAI; return fixed professional signpost
  if (input.intent.safe === false) {
    return UNSAFE_RESPONSE;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      text: "Astrology chat is not available at the moment. Please try again later.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const systemPrompt = buildSystemPrompt(input.frame.allowed_sections);
    const userPrompt = buildUserPrompt(
      input.frame.opening_style,
      input.context,
      input.frame.closing_style
    );

    const maxTokens = getMaxTokens(input.frame.length);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() : "";

    if (!text) {
      return {
        text: "I could not generate a response. Please try rephrasing your question.",
      };
    }

    return { text };
  } catch {
    return {
      text: "Astrology chat is temporarily unavailable. Please try again later.",
    };
  }
}
