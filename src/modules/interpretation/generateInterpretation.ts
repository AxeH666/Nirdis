import OpenAI from "openai";
import type { InterpretationInput, InterpretationOutput } from "./types";
import { buildFallback } from "./fallback";
import { sanitizeOutput } from "./guardrails";

const SYSTEM_PROMPT = `You are an astrology text rewriter. You receive structured astrology data and produce a short, grounded narrative.

STRICT RULES - NEVER VIOLATE:
- Do NOT use: diagnosis, disorders, trauma, therapy, mental health labels, personality tests.
- Do NOT make predictions, give advice, or claim future outcomes.
- Do NOT use medical or psychological terminology.
- Do NOT use authoritative certainty ("you will", "you should", "definitely", "certainly").
- Use simple English. Traditional astrology wording. Grounded, reflective tone. No emotional manipulation. No modern or AI-sounding phrases.
- Output valid JSON only.`;

function buildUserPrompt(input: InterpretationInput): string {
  const traitsText = input.traits.map((t) => `[${t.domain}] ${t.text}`).join("\n");
  return `Astrology summary: ${input.summary}

Traits (domain + text):
${traitsText}

Produce a JSON object with exactly these keys:
- "narrative": A 2-3 sentence overview. Simple English, traditional astrology tone.
- "sections": An object with keys "identity", "emotional_nature", "life_focus", "integration". Each value is 1-2 sentences. Use the trait data. For "integration", write how these areas connect in the chart. No advice, no predictions.`;
}

function parseResponse(content: string): InterpretationOutput | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    const narrative = typeof obj.narrative === "string" ? obj.narrative : "";
    const sections = obj.sections;
    if (!sections || typeof sections !== "object") return null;
    const s = sections as Record<string, unknown>;
    return {
      narrative: sanitizeOutput(narrative),
      sections: {
        identity: sanitizeOutput(String(s.identity ?? "")),
        emotional_nature: sanitizeOutput(String(s.emotional_nature ?? "")),
        life_focus: sanitizeOutput(String(s.life_focus ?? "")),
        integration: sanitizeOutput(String(s.integration ?? "")),
      },
    };
  } catch {
    return null;
  }
}

export async function generateInterpretation(
  input: InterpretationInput
): Promise<InterpretationOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallback(input);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.4,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return buildFallback(input);

    const parsed = parseResponse(content);
    if (parsed) return parsed;
  } catch {
    /* fall through to fallback */
  }

  return buildFallback(input);
}
