import { Link } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'

export function ConversationPage() {
  return (
    <div>
      <h1>Conversation</h1>
      <section aria-label="Thread container">
        <div>Message list placeholder</div>
      </section>
      <section aria-label="Input">
        <div>Input placeholder</div>
      </section>
      <p><Link to={ROUTES.dashboard}>Dashboard</Link></p>
    </div>
  )
}
