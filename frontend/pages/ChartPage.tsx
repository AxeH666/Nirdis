import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'
import { getChart } from '../services/api'
import type { ChartResponse } from '../services/api'

export function ChartPage() {
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
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load chart')
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
      <section aria-label="Chart visualization">
        <h1>Chart</h1>
        {loading && <div>Loading…</div>}
        {error && <div>Unable to load chart</div>}
        {!loading && !error && chart && (
          <div>
            <p>Ascendant: {chart.ascendant}</p>
            <p>Summary: {(chart.summary as string) || `${chart.system} natal chart with ${chart.ascendant} rising.`}</p>
          </div>
        )}
        {!loading && !error && !chart && <div>Chart visualization placeholder</div>}
      </section>
      <section aria-label="Data list">
        <h2>Houses and planets</h2>
        {!loading && !error && chart && (
          <>
            <ul>
              {(chart.houses || []).map((h) => (
                <li key={h.number}>House {h.number}: {h.sign}</li>
              ))}
            </ul>
            <ul>
              {(chart.planets || []).map((p) => (
                <li key={p.name}>{p.name} — House {p.house}</li>
              ))}
            </ul>
          </>
        )}
        {(!chart || loading || error) && <div>Data list placeholder</div>}
      </section>
      <section aria-label="Conversation entry">
        <p><Link to={ROUTES.conversation}>Ask about this</Link></p>
      </section>
    </div>
  )
}
