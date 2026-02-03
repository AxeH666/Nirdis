/**
 * Phase 2.3 — Frontend data contracts only.
 * No UI, no implementation. Locks what each page consumes and what Conversation receives.
 * See docs/frontend-phase-2.3-contracts.md for full spec.
 */

/** Placeholder until auth/profile exist. Session → User → BirthProfile. */
export interface UserContract {
  id: string
  [key: string]: unknown
}

/** Placeholder until onboarding persists. Produced by Onboarding; consumed by Chart, Conversation, Profile. */
export interface BirthProfileContract {
  [key: string]: unknown
}

/** Placeholder. Consumed by Settings only. */
export interface UserPreferencesContract {
  [key: string]: unknown
}

/** Light summary for Dashboard only. 1–2 lines max. Orientation, not reading. */
export interface DashboardInsightContract {
  summary: string
  [key: string]: unknown
}

/** Conversation state as Dashboard knows it: exists / last touched. No thread content. */
export interface ConversationStateContract {
  exists: boolean
  lastTouched?: string
  [key: string]: unknown
}

/**
 * Context passed silently into Conversation. Never announced.
 * From Dashboard: last conversation state (no astrology unless user engaged).
 * From Chart: natal placements; focused house/planet if clicked.
 * From Horoscope: period (today/month/year); last read section.
 */
export interface ConversationContextContract {
  /** When coming from Chart: natal chart scope. */
  chartScope?: {
    placements?: unknown[]
    focusedHouse?: number
    focusedPlanet?: string
  }
  /** When coming from Horoscope: selected period and section. */
  horoscopeScope?: {
    period: 'daily' | 'monthly' | 'yearly'
    section?: string
  }
  /** When coming from Dashboard: only that conversation exists / was touched. No astrology. */
  dashboardState?: ConversationStateContract
  [key: string]: unknown
}

/** Landing consumes nothing user-specific. Product narrative only. */
export type LandingPageDataContract = void

/** Onboarding consumes optional session; produces BirthProfile. No astrology. */
export interface OnboardingPageDataContract {
  consumes: { session?: unknown }
  produces: BirthProfileContract
}

/** Dashboard consumes User, light summary, Conversation state. Displays one insight + entry points. */
export interface DashboardPageDataContract {
  consumes: {
    user: UserContract | null
    insight: DashboardInsightContract | null
    conversationState: ConversationStateContract | null
  }
  displays: { oneInsightLine: string; entryPointsOnly: true }
}

/** Chart consumes full natal chart. Displays chart + lists. Provides chartScope to Conversation. */
export interface ChartPageDataContract {
  consumes: { chart: import('../services/api').ChartResponse | null }
  providesToConversation: ConversationContextContract['chartScope']
}

/** Horoscope consumes time-based forecast. Displays one period. Provides period/section to Conversation. */
export interface HoroscopePageDataContract {
  consumes: {
    forecast: import('../services/api').HoroscopeResponse | null
    selectedPeriod: 'daily' | 'monthly' | 'yearly'
  }
  providesToConversation: ConversationContextContract['horoscopeScope']
}

/** Conversation consumes session user, BirthProfile, optional page context. Owns thread + flow. */
export interface ConversationPageDataContract {
  consumes: {
    user: UserContract | null
    birthProfile: BirthProfileContract | null
    pageContext: ConversationContextContract | null
  }
  owns: { threadHistory: unknown; reflectionFlow: unknown }
}

/** Profile consumes User, BirthProfile. Allows edit birth data; no astrology. */
export interface ProfilePageDataContract {
  consumes: {
    user: UserContract | null
    birthProfile: BirthProfileContract | null
  }
}

/** Settings consumes user preferences only. No astrology, no Conversation. */
export interface SettingsPageDataContract {
  consumes: { preferences: UserPreferencesContract | null }
}
