/**
 * Horoscope response shape. All fields must be populated.
 */

export interface HoroscopeToday {
  headline: string;
  focus: string;
  guidance: string;
}

export interface HoroscopeMonth {
  theme: string;
  areas_activated: string;
  grounding_note: string;
}

export interface HoroscopeYear {
  overarching_theme: string;
  growth_direction: string;
  stabilizing_principle: string;
}

export interface HoroscopeResponse {
  today: HoroscopeToday;
  month: HoroscopeMonth;
  year: HoroscopeYear;
}

/** Chart input for derive functions. Minimal subset needed for horoscope. */
export interface HoroscopeChartInput {
  ascendant: string;
  houses: Array<{ number: number; sign: string }>;
  planets: Array<{ name: string; house: number; sign?: string }>;
}
