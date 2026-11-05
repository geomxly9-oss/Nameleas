import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { useCart, cartLines, cartTotal } from '../store/cart'
import { formatPrice } from '../lib/format'
import { dialThumb } from '../three/textures'
import { IconClose, IconMinus, IconPlus } from './Icons'
import { stopScroll } from '../lib/scroll'

export function LineItem({ line, editable = true }) {
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const p = line.product
  return (
    <li className="line-item">
      <img src={dialThumb(p)} alt="" width="72" height="72" />
      <div>
        <h3>{p.name}</h3>
        <p>{p.variant}</p>
        {editable ? (
          <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
            <button type="button" onClick={() => setQty(p.id, line.qty - 1)} aria-label="Decrease quantity" disabled={line.qty <= 1}>
              <IconMinus width="12" height="12" />
            </button>
            <span className="num" aria-live="polite">
              {line.qty}
            </span>
            <button type="button" onClick={() => setQty(p.id, line.qty + 1)} aria-label="Increase quantity" disabled={line.qty >= 5}>
              <IconPlus width="12" height="12" />
            </button>
          </div>
        ) : (
          <p>Quantity {line.qty}</p>
        )}
      </div>
      <div className="line-item__end">
        <span className="num">{formatPrice(p.price * line.qty)}</span>
        {editable && (
          <button type="button" className="line-item__remove" onClick={() => remove(p.id)}>
            Remove
          </button>
        )}
      </div>
    </li>
  )
}

export default function CartDrawer() {
  const open = useCart((s) => s.open)
  const setOpen = useCart((s) => s.setOpen)
  const items = useCart((s) => s.items)
  const navigate = useNavigate()
  const closeRef = useRef(null)
  const lines = cartLines(items)

  useEffect(() => {
    stopScroll(open)
    if (!open) return
    const prev = document.activeElement
    setTimeout(() => closeRef.current?.focus(), 60)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
          <motion.aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="drawer__head">
              <h2 id="cart-title" className="h3">
                Your cart
              </h2>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart" ref={closeRef}>
                <IconClose />
              </button>
            </div>
            <div className="drawer__body">
              {lines.length === 0 ? (
                <div className="drawer__empty">
                  <p className="lead">Your cart is empty. Every watch can be turned, opened and inspected in 3D before you choose.</p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setOpen(false)
                      navigate('/', { state: { scrollTo: 'collections' } })
                    }}
                  >
                    Explore the collections
                  </button>
                </div>
              ) : (
                <ul>
                  {lines.map((l) => (
                    <LineItem key={l.id} line={l} />
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 && (
              <div className="drawer__foot">
                <div className="totals">
                  <span>Subtotal, duties included</span>
                  <b className="num">{formatPrice(cartTotal(items))}</b>
                </div>
                <button
                  type="button"
                  className="btn btn--block"
                  onClick={() => {
                    setOpen(false)
                    navigate('/checkout')
                  }}
                >
                  Go to checkout
                </button>
                <p className="drawer__note">Complimentary insured delivery in a Velora presentation box. Returns accepted within 30 days.</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
