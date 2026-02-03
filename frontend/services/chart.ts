import { apiGet, apiPost } from './api'

/** Astrology chart API. Stub only — no logic yet. */
export const chartService = {
  getChart(_id: string) {
    return apiGet<unknown>(`/chart/${_id}`)
  },
  createChart(_payload: unknown) {
    return apiPost<unknown>('/chart', _payload)
  },
}
