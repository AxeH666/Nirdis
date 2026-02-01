/**
 * Integration Summary — weaves ascendant, Sun house, Moon house, and previous-life brief.
 * Deterministic. Ancient, grounded tone. No predictions, no advice.
 */

import type { PreviousLifeBrief } from "../astrology/previousLife";

const ASCENDANT_PHRASES: Record<string, string> = {
  Aries: "The ascendant in Aries brings a direct, initiating quality to the native's approach.",
  Taurus: "The ascendant in Taurus brings a steady, grounded quality to the native's approach.",
  Gemini: "The ascendant in Gemini brings a curious, adaptable quality to the native's approach.",
  Cancer: "The ascendant in Cancer brings a protective, responsive quality to the native's approach.",
  Leo: "The ascendant in Leo brings a confident, expressive quality to the native's approach.",
  Virgo: "The ascendant in Virgo brings a discerning, service-oriented quality to the native's approach.",
  Libra: "The ascendant in Libra brings a balanced, relationship-oriented quality to the native's approach.",
  Scorpio: "The ascendant in Scorpio brings an intense, penetrating quality to the native's approach.",
  Sagittarius: "The ascendant in Sagittarius brings an expansive, questing quality to the native's approach.",
  Capricorn: "The ascendant in Capricorn brings a structured, purposeful quality to the native's approach.",
  Aquarius: "The ascendant in Aquarius brings an independent, forward-looking quality to the native's approach.",
  Pisces: "The ascendant in Pisces brings a receptive, fluid quality to the native's approach.",
};

const SUN_HOUSE_PHRASES: Record<number, string> = {
  1: "The Sun in the first house accents identity and visible expression.",
  2: "The Sun in the second house accents resources and material grounding.",
  3: "The Sun in the third house accents communication and local ties.",
  4: "The Sun in the fourth house accents home, roots, and inner foundation.",
  5: "The Sun in the fifth house accents creativity and self-expression.",
  6: "The Sun in the sixth house accents service, health, and daily routine.",
  7: "The Sun in the seventh house accents partnership and open dealings.",
  8: "The Sun in the eighth house accents transformation and shared resources.",
  9: "The Sun in the ninth house accents philosophy, travel, and higher meaning.",
  10: "The Sun in the tenth house accents vocation and public standing.",
  11: "The Sun in the eleventh house accents community, ideals, and future vision.",
  12: "The Sun in the twelfth house accents inner life and behind-the-scenes work.",
};

const MOON_HOUSE_PHRASES: Record<number, string> = {
  1: "The Moon in the first house shapes the instinctive approach to life.",
  2: "The Moon in the second house shapes the need for material security.",
  3: "The Moon in the third house shapes the need for mental exchange.",
  4: "The Moon in the fourth house shapes the need for roots and belonging.",
  5: "The Moon in the fifth house shapes the need for creative expression.",
  6: "The Moon in the sixth house shapes the need for useful service.",
  7: "The Moon in the seventh house shapes the need for partnership.",
  8: "The Moon in the eighth house shapes the need for depth and transformation.",
  9: "The Moon in the ninth house shapes the need for meaning and expansion.",
  10: "The Moon in the tenth house shapes the need for public recognition.",
  11: "The Moon in the eleventh house shapes the need for community and ideals.",
  12: "The Moon in the twelfth house shapes the need for solitude and release.",
};

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

export function buildIntegrationSummary(
  ascendant: string,
  sunHouse: number,
  moonHouse: number,
  previousLifeBrief: PreviousLifeBrief | null
): string {
  const sentences: string[] = [];

  const ascPhrase = ASCENDANT_PHRASES[normalizeSign(ascendant)];
  if (ascPhrase) sentences.push(ascPhrase);

  const sunPhrase = SUN_HOUSE_PHRASES[sunHouse];
  if (sunPhrase) sentences.push(sunPhrase);

  const moonPhrase = MOON_HOUSE_PHRASES[moonHouse];
  if (moonPhrase) sentences.push(moonPhrase);

  if (previousLifeBrief) {
    sentences.push(
      `The twelfth house suggests an inherited pattern reflected in the present: ${previousLifeBrief.theme}`
    );
    sentences.push(previousLifeBrief.present_life_shift);
  }

  return sentences.join(" ");
}
