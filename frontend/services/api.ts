/**
 * Single API client for backend calls. Uses fetch, JSON, gentle error handling.
 * Vite proxies /api to the backend (see vite.config.ts).
 */
const API_BASE = '/api'

/** Chart response from GET /api/astrology/chart */
export interface ChartResponse {
  system: string
  ascendant: string
  houses: Array<{ number: number; sign: string; [key: string]: unknown }>
  planets: Array<{ name: string; house: number; sign?: string; [key: string]: unknown }>
  summary?: string
  [key: string]: unknown
}

/** Horoscope: daily slice from GET /api/horoscope */
export interface HoroscopeToday {
  headline: string
  focus: string
  guidance: string
}

/** Horoscope: monthly slice */
export interface HoroscopeMonth {
  theme: string
  areas_activated: string
  grounding_note: string
}

/** Horoscope: yearly slice */
export interface HoroscopeYear {
  overarching_theme: string
  growth_direction: string
  stabilizing_principle: string
}

/** Full horoscope response from GET /api/horoscope */
export interface HoroscopeResponse {
  today: HoroscopeToday
  month: HoroscopeMonth
  year: HoroscopeYear
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Request failed: ${res.status}`)
    }
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Network error')
  }
}

/**
 * GET /api/astrology/chart — returns chart data (read-only).
 */
export async function getChart(): Promise<ChartResponse> {
  return request<ChartResponse>('/astrology/chart')
}

/**
 * Full horoscope (today + month + year). One request; use for pages that switch period.
 */
export async function getHoroscope(): Promise<HoroscopeResponse> {
  try {
    return await request<HoroscopeResponse>('/horoscope')
  } catch {
    return {
      today: {
        headline: '[Mock] Today’s focus',
        focus: 'Reflection on the chart’s daily emphasis.',
        guidance: 'Take a moment to notice what is already present.',
      },
      month: {
        theme: '[Mock] Month theme',
        areas_activated: 'Areas suggested by the chart for this period.',
        grounding_note: 'Steady attention to what matters.',
      },
      year: {
        overarching_theme: '[Mock] Year theme',
        growth_direction: 'Direction implied by the chart over the year.',
        stabilizing_principle: 'A steadying note for the year.',
      },
    }
  }
}

async function fetchHoroscope(): Promise<HoroscopeResponse> {
  return request<HoroscopeResponse>('/horoscope')
}

/**
 * Daily horoscope. Uses real backend when available; otherwise deterministic mock.
 */
export async function getDailyHoroscope(): Promise<HoroscopeToday> {
  try {
    const data = await fetchHoroscope()
    return data.today
  } catch {
    return {
      headline: '[Mock] Today’s focus',
      focus: 'Reflection on the chart’s daily emphasis.',
      guidance: 'Take a moment to notice what is already present.',
    }
  }
}

/**
 * Monthly horoscope. Uses real backend when available; otherwise deterministic mock.
 */
export async function getMonthlyHoroscope(): Promise<HoroscopeMonth> {
  try {
    const data = await fetchHoroscope()
    return data.month
  } catch {
    return {
      theme: '[Mock] Month theme',
      areas_activated: 'Areas suggested by the chart for this period.',
      grounding_note: 'Steady attention to what matters.',
    }
  }
}

/**
 * Yearly horoscope. Uses real backend when available; otherwise deterministic mock.
 */
export async function getYearlyHoroscope(): Promise<HoroscopeYear> {
  try {
    const data = await fetchHoroscope()
    return data.year
  } catch {
    return {
      overarching_theme: '[Mock] Year theme',
      growth_direction: 'Direction implied by the chart over the year.',
      stabilizing_principle: 'A steadying note for the year.',
    }
  }
}

/** Low-level GET (for other services). */
export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

/** Low-level POST (for other services). */
export async function apiPost<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
