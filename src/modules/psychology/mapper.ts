import type { AstrologyInsight } from "./insight.schema";
import {
  ASCENDANT_IDENTITY_RULES,
  SUN_HOUSE_LIFE_FOCUS_RULES,
  MOON_SIGN_GROUP_EMOTIONAL_RULES,
  MOON_SIGN_TO_GROUP,
} from "./rules";

interface ChartInput {
  ascendant?: string | { sign: string };
  houses?: Array<{ number: number; sign: string }>;
  planets?: Array<{ name: string; house: number; sign?: string }>;
  sun?: { sign: string; house: number };
  moon?: { sign: string; house: number };
}

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

function getAscendantSign(chart: ChartInput): string | undefined {
  const a = chart.ascendant;
  if (!a) return undefined;
  return typeof a === "string" ? a : a.sign;
}

export function mapChartToInsights(chart: ChartInput): AstrologyInsight[] {
  const insights: AstrologyInsight[] = [];

  const ascendantSign = getAscendantSign(chart);
  if (ascendantSign) {
    const sign = normalizeSign(ascendantSign);
    const text = ASCENDANT_IDENTITY_RULES[sign as keyof typeof ASCENDANT_IDENTITY_RULES];
    if (text) {
      insights.push({
        domain: "identity",
        tone: "soft",
        depth: "simple",
        source: "astrology",
        text,
      });
    }
  }

  const sun = chart.sun ?? chart.planets?.find((p) => p.name === "Sun");
  const sunHouse = sun && "house" in sun ? sun.house : undefined;
  if (sunHouse !== undefined && sunHouse >= 1 && sunHouse <= 12) {
    const text = SUN_HOUSE_LIFE_FOCUS_RULES[sunHouse as keyof typeof SUN_HOUSE_LIFE_FOCUS_RULES];
    if (text) {
      insights.push({
        domain: "life_theme",
        tone: "soft",
        depth: "simple",
        source: "astrology",
        text,
      });
    }
  }

  const moon = chart.moon ?? chart.planets?.find((p) => p.name === "Moon");
  if (moon) {
    let moonSign = "sign" in moon ? moon.sign : undefined;
    if (!moonSign && chart.houses && "house" in moon) {
      const moonHouse = chart.houses.find((h) => h.number === moon.house);
      moonSign = moonHouse?.sign;
    }
    if (moonSign) {
      const sign = normalizeSign(moonSign);
      const group = MOON_SIGN_TO_GROUP[sign as keyof typeof MOON_SIGN_TO_GROUP];
      if (group) {
        const text = MOON_SIGN_GROUP_EMOTIONAL_RULES[group];
        insights.push({
          domain: "emotional_nature",
          tone: "soft",
          depth: "simple",
          source: "astrology",
          text,
        });
      }
    }
  }

  return insights;
}
