/**
 * Horoscope module — deterministic daily / monthly / yearly horoscope
 * derived from the natal chart only. No transits, no ephemeris.
 */

import type { HoroscopeChartInput, HoroscopeResponse } from './types';
import { deriveDaily } from './deriveDaily';
import { deriveMonthly } from './deriveMonthly';
import { deriveYearly } from './deriveYearly';

/**
 * Builds the full horoscope response from chart data.
 * Pure function: same chart input always produces same output.
 */
export function buildHoroscope(chart: HoroscopeChartInput): HoroscopeResponse {
  return {
    today: deriveDaily(chart),
    month: deriveMonthly(chart),
    year: deriveYearly(chart),
  };
}

export type { HoroscopeResponse, HoroscopeChartInput } from './types';
