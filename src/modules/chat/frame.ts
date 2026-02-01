/**
 * Phase 3.9.3 — Response Framing Engine
 * Builds a response frame from chat intent for consistent tone, voice, and structure.
 * Deterministic. No external APIs.
 */

export type FrameTone = "grounded" | "gentle" | "reflective";
export type FrameVoice = "neutral_astrologer" | "guru_like";
export type FrameLength = "short" | "medium";

export interface ResponseFrame {
  tone: FrameTone;
  voice: FrameVoice;
  length: FrameLength;
  allowed_sections: string[];
  opening_style: string;
  closing_style: string;
}

interface IntentInput {
  domain: string;
  depth: string;
  safe: boolean;
  flags: string[];
}

// Depth → tone: surface = grounded, reflective = gentle, existential = reflective
function getTone(depth: string): FrameTone {
  if (depth === "surface") return "grounded";
  if (depth === "reflective") return "gentle";
  if (depth === "existential") return "reflective";
  return "grounded";
}

// Domain → voice: belief_and_meaning = guru_like, else neutral_astrologer
function getVoice(domain: string): FrameVoice {
  if (domain === "belief_and_meaning") return "guru_like";
  return "neutral_astrologer";
}

// Depth → length: surface = short, reflective/existential = medium
function getLength(depth: string): FrameLength {
  if (depth === "surface") return "short";
  if (depth === "reflective" || depth === "existential") return "medium";
  return "short";
}

// Domain → allowed sections from context
function getAllowedSections(domain: string): string[] {
  const mapping: Record<string, string[]> = {
    relationships: ["relationships", "identity"],
    emotional_life: ["inner_world"],
    work_and_duty: ["work_and_duty"],
    belief_and_meaning: ["growth_and_belief", "previous_life"],
    identity: ["identity"],
    general: ["summary"],
  };
  return mapping[domain] ?? ["summary"];
}

// Tone → opening phrase
function getOpeningStyle(tone: FrameTone): string {
  const mapping: Record<FrameTone, string> = {
    grounded: "Let us look at this calmly.",
    gentle: "This can be understood with some patience.",
    reflective: "This question touches a deeper layer.",
  };
  return mapping[tone];
}

// Voice → closing phrase
function getClosingStyle(voice: FrameVoice): string {
  const mapping: Record<FrameVoice, string> = {
    neutral_astrologer: "This reflects the structure of the chart.",
    guru_like: "This understanding unfolds over time.",
  };
  return mapping[voice];
}

export function buildResponseFrame(intent: IntentInput): ResponseFrame {
  const tone = getTone(intent.depth);
  const voice = getVoice(intent.domain);
  const length = getLength(intent.depth);

  return {
    tone,
    voice,
    length,
    allowed_sections: getAllowedSections(intent.domain),
    opening_style: getOpeningStyle(tone),
    closing_style: getClosingStyle(voice),
  };
}
