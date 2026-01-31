/**
 * Phase 2.1 — Astrology Core, Whole Sign system.
 * Deterministic mock chart from birth date. No ephemeris, no randomness.
 */

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const PLANET_NAMES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export interface PlanetPlacement {
  sign: ZodiacSign;
  house: number;
}

export interface WholeSignChart {
  system: "whole_sign";
  ascendant: ZodiacSign;
  houses: Record<string, ZodiacSign>;
  planets: Record<string, PlanetPlacement>;
}

/**
 * Get zodiac sign by index (0–11).
 */
function signAtIndex(index: number): ZodiacSign {
  const i = ((index % 12) + 12) % 12;
  return ZODIAC_SIGNS[i];
}

/**
 * Deterministic ascendant index from birth date (no randomness).
 */
function ascendantIndexFromDate(birthDate: Date): number {
  const start = new Date(birthDate.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (birthDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  return (dayOfYear + birthDate.getFullYear()) % 12;
}

/**
 * Deterministic planet sign indices from birth date (mock; no real ephemeris).
 */
function planetSignIndicesFromDate(birthDate: Date): Record<string, number> {
  const y = birthDate.getFullYear();
  const m = birthDate.getMonth() + 1;
  const d = birthDate.getDate();

  return {
    Sun: (m + 8) % 12,
    Moon: (d + m * 7) % 12,
    Mercury: (d + 3) % 12,
    Venus: (d + 5) % 12,
    Mars: (d + 9) % 12,
    Jupiter: y % 12,
    Saturn: (y % 12 + 4) % 12,
  };
}

/**
 * Whole Sign: 1st house = ascendant sign, 2nd = next sign, … 12th = previous.
 * House number 1–12 for a sign index: (signIndex - ascIdx + 12) % 12 + 1.
 */
function houseNumberForSign(
  signIndex: number,
  ascendantIndex: number
): number {
  return ((signIndex - ascendantIndex + 12) % 12) + 1;
}

/**
 * Build Whole Sign chart from birth date. Deterministic mock.
 */
export function buildWholeSignChart(birthDate: Date): WholeSignChart {
  const ascIdx = ascendantIndexFromDate(birthDate);
  const ascendant = signAtIndex(ascIdx);

  const houses: Record<string, ZodiacSign> = {};
  for (let h = 1; h <= 12; h++) {
    const signIdx = (ascIdx + h - 1) % 12;
    houses[String(h)] = signAtIndex(signIdx);
  }

  const planetSignIndices = planetSignIndicesFromDate(birthDate);
  const planets: Record<string, PlanetPlacement> = {};

  for (const name of PLANET_NAMES) {
    const signIdx = planetSignIndices[name];
    const sign = signAtIndex(signIdx);
    const house = houseNumberForSign(signIdx, ascIdx);
    planets[name] = { sign, house };
  }

  return {
    system: "whole_sign",
    ascendant,
    houses,
    planets,
  };
}
