import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'
import { getHoroscope } from '../services/api'
import type { HoroscopeResponse } from '../services/api'

type Period = 'daily' | 'monthly' | 'yearly'

export function HoroscopePage() {
  const [period, setPeriod] = useState<Period>('daily')
  const [data, setData] = useState<HoroscopeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getHoroscope()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load horoscope.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1>Horoscope</h1>
      <section aria-label="Period selector">
        <button type="button" onClick={() => setPeriod('daily')} aria-pressed={period === 'daily'}>Daily</button>
        <button type="button" onClick={() => setPeriod('monthly')} aria-pressed={period === 'monthly'}>Monthly</button>
        <button type="button" onClick={() => setPeriod('yearly')} aria-pressed={period === 'yearly'}>Yearly</button>
      </section>
      <section aria-label="Forecast content">
        {loading && <div>Loading…</div>}
        {error && <div>{error}</div>}
        {!loading && !error && data && (
          <div>
            {period === 'daily' && (
              <>
                <h2>{data.today.headline}</h2>
                <p>{data.today.focus}</p>
                <p>{data.today.guidance}</p>
              </>
            )}
            {period === 'monthly' && (
              <>
                <h2>{data.month.theme}</h2>
                <p>{data.month.areas_activated}</p>
                <p>{data.month.grounding_note}</p>
              </>
            )}
            {period === 'yearly' && (
              <>
                <h2>{data.year.overarching_theme}</h2>
                <p>{data.year.growth_direction}</p>
                <p>{data.year.stabilizing_principle}</p>
              </>
            )}
          </div>
        )}
        {(!data || loading || error) && <div>Forecast content placeholder</div>}
      </section>
      <section aria-label="Conversation entry">
        <p><Link to={ROUTES.conversation}>Conversation</Link></p>
      </section>
    </div>
  )
}
