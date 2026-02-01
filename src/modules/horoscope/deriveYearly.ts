/**
 * Yearly horoscope — derived from Sun house + Ascendant polarity (1st–7th axis).
 * Long-term integration theme. Deterministic: same chart = same output.
 */

import type { HoroscopeChartInput, HoroscopeYear } from './types';

// 1st–7th axis: opposite house pairs (self vs other, inner vs outer)
// House 1 ↔ 7, 2 ↔ 8, 3 ↔ 9, 4 ↔ 10, 5 ↔ 11, 6 ↔ 12
const OPPOSITE_HOUSE: Record<number, number> = {
  1: 7,
  2: 8,
  3: 9,
  4: 10,
  5: 11,
  6: 12,
  7: 1,
  8: 2,
  9: 3,
  10: 4,
  11: 5,
  12: 6,
};

// Sun house overarching themes for the year
const SUN_HOUSE_YEARLY: Record<
  number,
  { theme: string; growth: string; stabilizing: string }
> = {
  1: {
    theme: 'Integration of self and identity.',
    growth: 'toward clearer self-expression and presence',
    stabilizing: 'Grounding in the body and simple routines.',
  },
  2: {
    theme: 'Integration of values and resources.',
    growth: 'toward steadier foundations and right use of what you have',
    stabilizing: 'Practical habits and honest assessment.',
  },
  3: {
    theme: 'Integration of communication and connection.',
    growth: 'toward clearer exchange and local ties',
    stabilizing: 'One clear message, one conversation.',
  },
  4: {
    theme: 'Integration of home and roots.',
    growth: 'toward deeper security and belonging',
    stabilizing: 'Domestic order and family bonds.',
  },
  5: {
    theme: 'Integration of creativity and joy.',
    growth: 'toward freer expression and heart-led action',
    stabilizing: 'Play, rest, and simple pleasure.',
  },
  6: {
    theme: 'Integration of work and service.',
    growth: 'toward useful contribution and healthy routine',
    stabilizing: 'Order in daily tasks and care of the body.',
  },
  7: {
    theme: 'Integration of partnership and balance.',
    growth: 'toward harmony in one-to-one ties',
    stabilizing: 'Fair exchange and clear agreements.',
  },
  8: {
    theme: 'Integration of depth and renewal.',
    growth: 'toward acceptance of change and shared resources',
    stabilizing: 'Quiet reflection and patience.',
  },
  9: {
    theme: 'Integration of belief and wisdom.',
    growth: 'toward a broader perspective and higher understanding',
    stabilizing: 'A principle or practice to return to.',
  },
  10: {
    theme: 'Integration of career and reputation.',
    growth: 'toward visible achievement and responsible role',
    stabilizing: 'One step at a time toward a clear aim.',
  },
  11: {
    theme: 'Integration of community and hopes.',
    growth: 'toward shared ideals and supportive bonds',
    stabilizing: 'Connection with those who share your vision.',
  },
  12: {
    theme: 'Integration of solitude and the unseen.',
    growth: 'toward rest, reflection, and inner work',
    stabilizing: 'Silence, sleep, and compassionate self-care.',
  },
};

// Polarity note: 1st–7th axis emphasizes self-other balance
const POLARITY_NOTE: Record<number, string> = {
  1: 'The year emphasizes the balance between self and other.',
  7: 'The year emphasizes the balance between self and other.',
  2: 'The year emphasizes the balance between what you hold and what you share.',
  8: 'The year emphasizes the balance between what you hold and what you share.',
  3: 'The year emphasizes the balance between local and distant.',
  9: 'The year emphasizes the balance between local and distant.',
  4: 'The year emphasizes the balance between private and public.',
  10: 'The year emphasizes the balance between private and public.',
  5: 'The year emphasizes the balance between personal joy and shared hopes.',
  11: 'The year emphasizes the balance between personal joy and shared hopes.',
  6: 'The year emphasizes the balance between daily duty and greater service.',
  12: 'The year emphasizes the balance between daily duty and greater service.',
};

/**
 * Derives the yearly horoscope from Sun house and Ascendant polarity (1st–7th axis).
 * Pure function: no side effects.
 */
export function deriveYearly(chart: HoroscopeChartInput): HoroscopeYear {
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const sunHouse = sun?.house ?? 1;
  const base = SUN_HOUSE_YEARLY[sunHouse] ?? SUN_HOUSE_YEARLY[1];

  const oppositeHouse = OPPOSITE_HOUSE[sunHouse] ?? 7;
  const polarityNote = POLARITY_NOTE[sunHouse] ?? POLARITY_NOTE[1];

  return {
    overarching_theme: `${polarityNote} ${base.theme}`,
    growth_direction: base.growth,
    stabilizing_principle: base.stabilizing,
  };
}
