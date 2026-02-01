/**
 * Daily horoscope — derived from Moon house + Ascendant.
 * Emotional tone and immediate focus. Deterministic: same chart = same output.
 */

import type { HoroscopeChartInput, HoroscopeToday } from './types';

// Moon house meanings: traditional astrology focus by house
const MOON_HOUSE_FOCUS: Record<number, { headline: string; focus: string; guidance: string }> = {
  1: {
    headline: 'The Moon in the first house emphasizes personal presence.',
    focus: 'self-care and how you present to the world',
    guidance: 'A calm approach to your own needs suggests a focus on grounding before outward action.',
  },
  2: {
    headline: 'The Moon in the second house brings attention to resources and values.',
    focus: 'material security and what you hold dear',
    guidance: 'Steady attention to your foundations suggests a focus on practical steps.',
  },
  3: {
    headline: 'The Moon in the third house emphasizes communication and local matters.',
    focus: 'exchange of ideas and nearby connections',
    guidance: 'A measured approach to speaking and listening suggests a focus on clarity.',
  },
  4: {
    headline: 'The Moon in the fourth house brings attention to home and roots.',
    focus: 'the domestic sphere and inner security',
    guidance: 'Nurturing your base suggests a focus on simple, grounding routines.',
  },
  5: {
    headline: 'The Moon in the fifth house emphasizes creative expression.',
    focus: 'joy, creation, and the heart\'s desires',
    guidance: 'Allowing space for play suggests a focus on lighthearted engagement.',
  },
  6: {
    headline: 'The Moon in the sixth house brings attention to work and service.',
    focus: 'routine, duty, and useful contribution',
    guidance: 'Order in small matters suggests a focus on one task at a time.',
  },
  7: {
    headline: 'The Moon in the seventh house emphasizes partnership.',
    focus: 'one-to-one connections and balance with others',
    guidance: 'Attuning to those close to you suggests a focus on harmony.',
  },
  8: {
    headline: 'The Moon in the eighth house brings attention to depth and renewal.',
    focus: 'shared resources and inner transformation',
    guidance: 'Quiet reflection suggests a focus on what endures beneath the surface.',
  },
  9: {
    headline: 'The Moon in the ninth house emphasizes belief and exploration.',
    focus: 'philosophy, learning, and the search for meaning',
    guidance: 'A broad perspective suggests a focus on the larger picture.',
  },
  10: {
    headline: 'The Moon in the tenth house brings attention to reputation and duty.',
    focus: 'public role and responsible action',
    guidance: 'Steady attention to obligations suggests a focus on integrity.',
  },
  11: {
    headline: 'The Moon in the eleventh house emphasizes community and hopes.',
    focus: 'friends, groups, and shared ideals',
    guidance: 'Connection with like-minded others suggests a focus on common ground.',
  },
  12: {
    headline: 'The Moon in the twelfth house brings attention to solitude and the unseen.',
    focus: 'rest, reflection, and inner work',
    guidance: 'Quiet time alone suggests a focus on replenishment.',
  },
};

// Ascendant modifier: adds a filter to the daily tone (deterministic by sign)
const ASCENDANT_EMPHASIS: Record<string, string> = {
  Aries: 'A pioneering quality',
  Taurus: 'A steady quality',
  Gemini: 'A curious quality',
  Cancer: 'A nurturing quality',
  Leo: 'A confident quality',
  Virgo: 'A careful quality',
  Libra: 'A balanced quality',
  Scorpio: 'An attentive quality',
  Sagittarius: 'An expansive quality',
  Capricorn: 'A structured quality',
  Aquarius: 'A detached quality',
  Pisces: 'A receptive quality',
};

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

/**
 * Derives today's horoscope from Moon house and Ascendant.
 * Pure function: no side effects.
 */
export function deriveDaily(chart: HoroscopeChartInput): HoroscopeToday {
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const moonHouse = moon?.house ?? 4;
  const base = MOON_HOUSE_FOCUS[moonHouse] ?? MOON_HOUSE_FOCUS[4];

  const ascSign = normalizeSign(chart.ascendant);
  const ascEmphasis = ASCENDANT_EMPHASIS[ascSign] ?? 'A grounded quality';

  return {
    headline: `${ascEmphasis} colors the day. ${base.headline}`,
    focus: base.focus,
    guidance: base.guidance,
  };
}
