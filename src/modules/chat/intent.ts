/**
 * Phase 3.9.2 — Intent & Depth Detection
 * Classifies user chat messages into domain, depth, and safety for routing.
 * Keyword-based, deterministic. No external APIs.
 */

export type IntentDomain =
  | "identity"
  | "relationships"
  | "work_and_duty"
  | "emotional_life"
  | "belief_and_meaning"
  | "general";

export type IntentDepth = "surface" | "reflective" | "existential";

export interface ChatIntent {
  domain: IntentDomain;
  depth: IntentDepth;
  safe: boolean;
  flags: string[];
}

const DOMAIN_KEYWORDS: Record<IntentDomain, string[]> = {
  identity: ["self", "personality", "who am i", "identity", "who i am"],
  relationships: ["love", "marriage", "partner", "breakup", "relationship", "spouse", "romance"],
  work_and_duty: ["job", "career", "work", "duty", "money", "income", "profession"],
  emotional_life: ["feelings", "emotions", "inner", "mood", "emotion", "feeling"],
  belief_and_meaning: ["purpose", "path", "destiny", "meaning"],
  general: [],
};

const DEPTH_SURFACE: string[] = ["what", "does this mean", "what does", "means"];
const DEPTH_REFLECTIVE: string[] = ["why", "pattern", "feel", "understand", "sense"];
const DEPTH_EXISTENTIAL: string[] = ["purpose", "path", "destiny", "meaning of life", "why am i"];

const FLAG_FATALISM: string[] = ["fate", "doomed", "fixed forever"];
const FLAG_DEPENDENCY: string[] = ["tell me what to do", "decide for me"];
const FLAG_MEDICAL_OR_MENTAL: string[] = [
  "depression",
  "anxiety",
  "illness",
  "suicide",
  "therapy",
  "diagnosis",
];

function containsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function detectDomain(text: string): IntentDomain {
  const lower = text.toLowerCase();
  if (containsAny(lower, DOMAIN_KEYWORDS.identity)) return "identity";
  if (containsAny(lower, DOMAIN_KEYWORDS.relationships)) return "relationships";
  if (containsAny(lower, DOMAIN_KEYWORDS.work_and_duty)) return "work_and_duty";
  if (containsAny(lower, DOMAIN_KEYWORDS.emotional_life)) return "emotional_life";
  if (containsAny(lower, DOMAIN_KEYWORDS.belief_and_meaning)) return "belief_and_meaning";
  return "general";
}

function detectDepth(text: string): IntentDepth {
  const lower = text.toLowerCase();
  if (containsAny(lower, DEPTH_EXISTENTIAL)) return "existential";
  if (containsAny(lower, DEPTH_REFLECTIVE)) return "reflective";
  if (containsAny(lower, DEPTH_SURFACE)) return "surface";
  return "surface";
}

function collectFlags(text: string): string[] {
  const lower = text.toLowerCase();
  const flags: string[] = [];
  if (containsAny(lower, FLAG_FATALISM)) flags.push("fatalism");
  if (containsAny(lower, FLAG_DEPENDENCY)) flags.push("dependency");
  if (containsAny(lower, FLAG_MEDICAL_OR_MENTAL)) flags.push("medical_or_mental");
  return flags;
}

export function detectChatIntent(message: string): ChatIntent {
  const normalized = message.toLowerCase().trim();
  const flags = collectFlags(normalized);
  const safe = !flags.includes("medical_or_mental");

  return {
    domain: detectDomain(normalized),
    depth: detectDepth(normalized),
    safe,
    flags,
  };
}
