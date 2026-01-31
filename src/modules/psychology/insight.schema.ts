export type InsightDomain =
  | "identity"
  | "emotional_nature"
  | "relationships"
  | "work_direction"
  | "life_theme";

export type InsightTone = "soft" | "direct";

export type InsightDepth = "simple" | "reflective";

export interface AstrologyInsight {
  domain: InsightDomain;
  tone: InsightTone;
  depth: InsightDepth;
  source: "astrology";
  text: string;
}
