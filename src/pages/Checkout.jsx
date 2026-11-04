import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useCart, cartLines, cartTotal } from '../store/cart'
import { formatPrice } from '../lib/format'
import { LineItem } from '../components/CartDrawer'
import { Mark } from '../components/Logo'

const COUNTRIES = ['Switzerland', 'France', 'Germany', 'Italy', 'United Kingdom', 'United Arab Emirates', 'Japan', 'Singapore', 'United States', 'Other']
const BOUTIQUES = ['Geneva, Rue du Rhône 48', 'Paris, Place Vendôme 21', 'Tokyo, Ginza 6-chome', 'Dubai, Mall of the Emirates', 'New York, Madison Avenue 711']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Field({ id, label, error, children }) {
  return (
    <label className="input" htmlFor={id} data-invalid={!!error}>
      {label}
      {children}
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </label>
  )
}

export default function Checkout() {
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const lines = cartLines(items)
  const total = cartTotal(items)
  const [method, setMethod] = useState('delivery')
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'Switzerland', address: '', city: '', postcode: '', boutique: BOUTIQUES[0], note: '' })
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!EMAIL.test(form.email.trim())) e.email = 'Enter an email address like name@example.com.'
    if (form.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number so your advisor can reach you.'
    if (method === 'delivery') {
      if (form.address.trim().length < 4) e.address = 'Enter a street address.'
      if (form.city.trim().length < 2) e.city = 'Enter a city.'
      if (form.postcode.trim().length < 3) e.postcode = 'Enter a postcode.'
    }
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus()
      return
    }
    const ref = `VT-${String(Date.now()).slice(-6)}`
    setOrder({ ref, total, count: lines.length, email: form.email.trim(), method, boutique: form.boutique })
    clear()
  }

  const ref = useMemo(() => (order ? order.ref : null), [order])

  if (order) {
    return (
      <main id="main" className="checkout">
        <motion.div className="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Mark className="confirm__mark" />
          <h1 className="h1">Order received</h1>
          <p className="lead">
            Thank you. Order {ref} is reserved in your name. A client advisor will call you within one working day to confirm the details and arrange payment, and we will email a summary to {order.email}.
          </p>
          <p className="body">{order.method === 'boutique' ? `Your watch will be prepared at ${order.boutique}.` : 'Your watch will travel insured, in its presentation box, once payment is confirmed.'}</p>
          <Link className="btn" to="/">
            Back to the collections
          </Link>
        </motion.div>
      </main>
    )
  }

  if (!lines.length) {
    return (
      <main id="main" className="checkout">
        <div className="confirm">
          <Mark />
          <h1 className="h1">Your cart is empty</h1>
          <p className="lead">Add a watch to your cart to check out.</p>
          <Link className="btn" to="/" state={{ scrollTo: 'collections' }}>
            Explore the collections
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="checkout">
      <div className="checkout__grid">
        <form className="form" onSubmit={submit} noValidate>
          <h1 className="h1" style={{ marginBottom: 12 }}>
            Checkout
          </h1>
          <fieldset>
            <legend>Your details</legend>
            <Field id="name" label="Full name" error={errors.name}>
              <input id="name" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} />
            </Field>
            <div className="row">
              <Field id="email" label="Email" error={errors.email}>
                <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined} />
              </Field>
              <Field id="phone" label="Phone" error={errors.phone}>
                <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-err' : undefined} />
              </Field>
            </div>
          </fieldset>
          <fieldset>
            <legend>Delivery</legend>
            <div className="seg" role="radiogroup" aria-label="Delivery method" style={{ justifySelf: 'start' }}>
              <button type="button" role="radio" aria-checked={method === 'delivery'} aria-pressed={method === 'delivery'} onClick={() => setMethod('delivery')}>
                Insured delivery
              </button>
              <button type="button" role="radio" aria-checked={method === 'boutique'} aria-pressed={method === 'boutique'} onClick={() => setMethod('boutique')}>
                Collect in a boutique
              </button>
            </div>
            {method === 'delivery' ? (
              <>
                <Field id="country" label="Country">
                  <select id="country" autoComplete="country-name" value={form.country} onChange={set('country')}>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field id="address" label="Street address" error={errors.address}>
                  <input id="address" autoComplete="street-address" value={form.address} onChange={set('address')} aria-invalid={!!errors.address} />
                </Field>
                <div className="row">
                  <Field id="city" label="City" error={errors.city}>
                    <input id="city" autoComplete="address-level2" value={form.city} onChange={set('city')} aria-invalid={!!errors.city} />
                  </Field>
                  <Field id="postcode" label="Postcode" error={errors.postcode}>
                    <input id="postcode" autoComplete="postal-code" value={form.postcode} onChange={set('postcode')} aria-invalid={!!errors.postcode} />
                  </Field>
                </div>
              </>
            ) : (
              <Field id="boutique" label="Boutique">
                <select id="boutique" value={form.boutique} onChange={set('boutique')}>
                  {BOUTIQUES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field id="note" label="Engraving or note for your advisor (optional)">
              <textarea id="note" value={form.note} onChange={set('note')} maxLength={240} />
            </Field>
          </fieldset>
          <p className="body" style={{ fontSize: '0.9rem' }}>
            No payment is taken online. After you place the order, a client advisor calls you to confirm it and arrange payment by bank transfer or in a boutique.
          </p>
          <button type="submit" className="btn" style={{ justifySelf: 'start' }}>
            Place order
          </button>
        </form>
        <aside className="summary" aria-labelledby="summary-title">
          <h2 id="summary-title" className="h3">
            Order summary
          </h2>
          <ul>
            {lines.map((l) => (
              <LineItem key={l.id} line={l} />
            ))}
          </ul>
          <div className="summary__rows">
            <div>
              <span>Subtotal</span>
              <b className="num">{formatPrice(total)}</b>
            </div>
            <div>
              <span>Insured delivery</span>
              <b>Complimentary</b>
            </div>
            <div>
              <span>Duties and taxes</span>
              <b>Included</b>
            </div>
          </div>
          <div className="totals">
            <span>Total</span>
            <b className="num">{formatPrice(total)}</b>
          </div>
        </aside>
      </div>
    </main>
  )
}
