import { apiGet } from './api'

/** Horoscope API. Stub only — no logic yet. */
export const horoscopeService = {
  getDaily(_date?: string) {
    return apiGet<unknown>(_date ? `/horoscope/daily?date=${_date}` : '/horoscope/daily')
  },
  getMonthly(_period?: string) {
    return apiGet<unknown>(_period ? `/horoscope/monthly?period=${_period}` : '/horoscope/monthly')
  },
  getYearly(_year?: string) {
    return apiGet<unknown>(_year ? `/horoscope/yearly?year=${_year}` : '/horoscope/yearly')
  },
}
