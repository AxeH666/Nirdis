import { apiPost } from './api'

/** Chat API. Stub only — no logic yet. */
export const chatService = {
  sendMessage(_payload: unknown) {
    return apiPost<unknown>('/chat', _payload)
  },
}
