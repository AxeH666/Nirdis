/**
 * Monthly horoscope — derived from Sun house + Ascendant ruler.
 * Life direction and active domains. Deterministic: same chart = same output.
 */

import type { HoroscopeChartInput, HoroscopeMonth } from './types';

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

// Sun house themes: traditional life-area emphasis
const SUN_HOUSE_THEME: Record<number, { theme: string; areas: string; grounding: string }> = {
  1: {
    theme: 'Vitality and self-expression take center stage.',
    areas: 'identity, appearance, and new beginnings',
    grounding: 'Return to the body and simple movement when scattered.',
  },
  2: {
    theme: 'Resources and values come into focus.',
    areas: 'income, possessions, and what you value',
    grounding: 'Practical routines and tangible goals steady the mind.',
  },
  3: {
    theme: 'Communication and local ties are highlighted.',
    areas: 'writing, speaking, siblings, and short travel',
    grounding: 'A clear list and one conversation at a time.',
  },
  4: {
    theme: 'Home and roots receive emphasis.',
    areas: 'family, domestic life, and inner security',
    grounding: 'Time at home and familiar rituals.',
  },
  5: {
    theme: 'Creativity and joy are emphasized.',
    areas: 'children, pleasure, and creative work',
    grounding: 'Lighthearted activity and simple enjoyment.',
  },
  6: {
    theme: 'Work and service are in focus.',
    areas: 'routine, health, and useful contribution',
    grounding: 'Order in the small details of daily life.',
  },
  7: {
    theme: 'Partnership and balance are highlighted.',
    areas: 'marriage, contracts, and one-to-one ties',
    grounding: 'Fair exchange and clear agreements.',
  },
  8: {
    theme: 'Depth and transformation are emphasized.',
    areas: 'shared resources, inheritance, and inner change',
    grounding: 'Quiet reflection and patience with process.',
  },
  9: {
    theme: 'Philosophy and expansion are in focus.',
    areas: 'higher learning, travel, and belief',
    grounding: 'A single principle or book to return to.',
  },
  10: {
    theme: 'Career and reputation receive emphasis.',
    areas: 'public role, authority, and long-term goals',
    grounding: 'One concrete step toward a visible aim.',
  },
  11: {
    theme: 'Community and hopes are highlighted.',
    areas: 'friends, groups, and shared ideals',
    grounding: 'Connection with those who share your vision.',
  },
  12: {
    theme: 'Solitude and the unseen are emphasized.',
    areas: 'rest, retreat, and inner work',
    grounding: 'Silence, sleep, and compassionate self-care.',
  },
};

// Ruler quality: what the Ascendant ruler brings to the month
const RULER_QUALITY: Record<string, string> = {
  Sun: 'Vitality accents the active domains.',
  Moon: 'Rhythm and instinct accent the active domains.',
  Mercury: 'Clarity and exchange accent the active domains.',
  Venus: 'Harmony and connection accent the active domains.',
  Mars: 'Initiative and courage accent the active domains.',
  Jupiter: 'Expansion and principle accent the active domains.',
  Saturn: 'Structure and patience accent the active domains.',
};

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

/**
 * Derives the monthly horoscope from Sun house and Ascendant ruler.
 * Pure function: no side effects.
 */
export function deriveMonthly(chart: HoroscopeChartInput): HoroscopeMonth {
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const sunHouse = sun?.house ?? 1;
  const base = SUN_HOUSE_THEME[sunHouse] ?? SUN_HOUSE_THEME[1];

  const ascSign = normalizeSign(chart.ascendant);
  const ruler = SIGN_RULERS[ascSign] ?? 'Saturn';
  const rulerNote = RULER_QUALITY[ruler] ?? 'Patience accents the active domains.';

  return {
    theme: `${base.theme} ${rulerNote}`,
    areas_activated: base.areas,
    grounding_note: base.grounding,
  };
}
