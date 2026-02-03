import { Link } from 'react-router-dom'
import { ROUTES } from '../app/routePaths'

export function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <section aria-label="Birth profile summary">
        <h2>Birth profile</h2>
        <div>Birth profile summary placeholder</div>
      </section>
      <section aria-label="Edit entry">
        <h2>Edit</h2>
        <div>Edit entry placeholder</div>
      </section>
      <section aria-label="Secondary info">
        <h2>Secondary info</h2>
        <div>Secondary info block placeholder</div>
      </section>
      <p><Link to={ROUTES.conversation}>Conversation</Link> (optional, low emphasis)</p>
    </div>
  )
}
