import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'

const NAV_LINKS = [
  { to: ROUTES.landing, label: 'Landing' },
  { to: ROUTES.onboarding, label: 'Onboarding' },
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.chart, label: 'Chart' },
  { to: ROUTES.horoscope, label: 'Horoscope' },
  { to: ROUTES.conversation, label: 'Conversation' },
  { to: ROUTES.profile, label: 'Profile' },
  { to: ROUTES.settings, label: 'Settings' },
] as const

export function Layout() {
  const location = useLocation()

  return (
    <div>
      <nav aria-label="Primary">
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} data-active={location.pathname === to ? 'true' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
