import { useState } from 'react'
import { RevealHeading } from '../components/Reveal'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState({ kind: 'idle', text: '' })
  const submit = (e) => {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) return setState({ kind: 'error', text: 'Enter an email address like name@example.com.' })
    if (!consent) return setState({ kind: 'error', text: 'Tick the box to agree to receive the Journal.' })
    setState({ kind: 'ok', text: `Subscribed. The next Journal will arrive at ${email.trim()}.` })
    setEmail('')
    setConsent(false)
  }
  return (
    <section className="section newsletter" id="journal" data-bg="#C6F0E4" aria-labelledby="journal-title">
      <div className="wrap newsletter__box">
        <div style={{ display: 'grid', gap: 20 }}>
          <RevealHeading id="journal-title" className="h1">
            The Velora Journal
          </RevealHeading>
          <p className="lead">New references, atelier stories and invitations to private viewings. Four letters a year, never more.</p>
        </div>
        <form onSubmit={submit} noValidate>
          <label htmlFor="nl-email" className="sr-only">
            Email address
          </label>
          <div className="field">
            <input id="nl-email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={state.kind === 'error'} aria-describedby="nl-note" />
            <button type="submit" className="btn">
              Subscribe
            </button>
          </div>
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I agree to receive the Velora Journal by email. You can unsubscribe at any time.</span>
          </label>
          <p id="nl-note" className="form-note" data-state={state.kind} role="status">
            {state.text}
          </p>
        </form>
      </div>
    </section>
  )
}
