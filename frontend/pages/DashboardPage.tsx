import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'
import { getChart } from '../services/api'
import type { ChartResponse } from '../services/api'

export function DashboardPage() {
  const [chart, setChart] = useState<ChartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getChart()
      .then((data) => {
        if (!cancelled) setChart(data)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load chart.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const summary = chart?.summary ?? (chart ? `${chart.system} natal chart with ${chart.ascendant} rising.` : '')

  return (
    <div>
      <section aria-label="Greeting">
        <h1>Dashboard</h1>
        <div>Greeting placeholder</div>
      </section>
      <section aria-label="Today insight">
        <h2>Today</h2>
        {loading && <div>Loading…</div>}
        {error && <div>{error}</div>}
        {!loading && !error && (summary ? <div>{summary}</div> : <div>Today insight placeholder</div>)}
      </section>
      <section aria-label="Conversation entry">
        <h2>Conversation</h2>
        <p><Link to={ROUTES.conversation}>Open conversation</Link></p>
      </section>
      <section aria-label="Secondary links">
        <p><Link to={ROUTES.chart}>Chart</Link></p>
        <p><Link to={ROUTES.horoscope}>Horoscope</Link></p>
      </section>
    </div>
  )
}
