import { Link } from 'react-router'
import { Mark } from '../components/Logo'

export default function NotFound() {
  return (
    <main id="main" className="notfound">
      <div style={{ display: 'grid', gap: 22, justifyItems: 'center' }}>
        <Mark className="logo__mark" />
        <h1 className="h1">This page has stopped.</h1>
        <p className="lead">The address may be out of date. The collections are still running.</p>
        <Link className="btn" to="/">
          Back to Velora Time
        </Link>
      </div>
    </main>
  )
}
