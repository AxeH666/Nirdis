import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ROUTES } from './routePaths'
import { ChartPage } from '../pages/ChartPage'
import { ConversationPage } from '../pages/ConversationPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HoroscopePage } from '../pages/HoroscopePage'
import { LandingPage } from '../pages/LandingPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'

export { ROUTES }

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'landing', element: <LandingPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chart', element: <ChartPage /> },
      { path: 'horoscope', element: <HoroscopePage /> },
      { path: 'conversation', element: <ConversationPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to={ROUTES.landing} replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
