import { apiPost } from './api'

/** Interpretation API. Stub only — no logic yet. */
export const interpretationService = {
  getInterpretation(_payload: unknown) {
    return apiPost<unknown>('/interpretation', _payload)
  },
}
