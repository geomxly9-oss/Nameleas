import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router'
import Logo from './Logo'
import { IconBag, IconClose } from './Icons'
import { useCart, cartCount } from '../store/cart'
import { useSectionNav, NAV } from './useSectionNav'
import { onTick } from '../lib/ticker'
import { currentScroll, stopScroll } from '../lib/scroll'

export default function Header() {
  const items = useCart((s) => s.items)
  const setOpen = useCart((s) => s.setOpen)
  const go = useSectionNav()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const location = useLocation()
  const count = cartCount(items)

  useEffect(() => {
    let last = 0
    let sc = false
    let hd = false
    return onTick(() => {
      const y = currentScroll()
      const s = y > 24
      const h = y > 600 && y > last + 2 ? true : y < last - 2 ? false : hd
      last = y
      if (s !== sc) setScrolled((sc = s))
      if (h !== hd) setHidden((hd = h))
    }, 5)
  }, [])

  useEffect(() => {
    stopScroll(menu)
    if (!menu) return
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  useEffect(() => setMenu(false), [location.pathname])

  const nav = (id) => {
    setMenu(false)
    go(id)
  }

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''} ${hidden && !menu ? 'is-hidden' : ''}`} data-theme="light" id="site-header">
        <div className="header__inner">
          <Logo />
          <nav className="header__nav" aria-label="Main">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => nav(n.id)}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="header__end">
            <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
              <IconBag />
              <span className="cart-btn__label">Cart</span>
              <span className="cart-btn__count num" aria-hidden="true">
                {count}
              </span>
            </button>
            <button type="button" className="menu-btn" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}>
              <span />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <button type="button" className="mobile-menu__close" onClick={() => setMenu(false)} aria-label="Close menu">
              <IconClose width="16" height="16" />
            </button>
            <nav aria-label="Mobile">
              {NAV.map((n, i) => (
                <motion.button
                  key={n.id}
                  type="button"
                  onClick={() => nav(n.id)}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {n.label}
                </motion.button>
              ))}
            </nav>
            <div className="mobile-menu__foot">
              Geneva boutique, Rue du Rhône 48. Open Monday to Saturday, 10:00 to 19:00.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
