import { useEffect, useLayoutEffect } from 'react'
import { HashRouter, MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene3D from './three/scene/Scene3D'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Cursor from './components/Cursor'
import Preloader from './components/Preloader'
import { Mark } from './components/Logo'
import Home from './pages/Home'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import { initScroll, getLenis } from './lib/scroll'

initScroll()

// Hosted previews only pass plain #name hashes, so they route in memory instead.
const Router = import.meta.env.VITE_MEMORY_ROUTER ? MemoryRouter : HashRouter

const EASE = [0.76, 0, 0.24, 1]

/* Cinematic page change: a plum curtain falls, the page swaps, the curtain lifts. */
function Page({ children }) {
  const location = useLocation()
  useLayoutEffect(() => {
    const lenis = getLenis()
    if (!location.state?.scrollTo) {
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
      else window.scrollTo(0, 0)
    }
    const t = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(t)
  }, [location.key, location.state])
  return (
    <>
      {children}
      <motion.div className="curtain" aria-hidden="true" initial={{ clipPath: 'inset(0% 0 0 0)' }} animate={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.9, ease: EASE, delay: 0.1 } }} exit={{ clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'], transition: { duration: 0.6, ease: EASE } }}>
        <Mark />
      </motion.div>
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/watch/:id" element={<Page><Product /></Page>} />
        <Route path="/checkout" element={<Page><Checkout /></Page>} />
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('orientationchange', onResize)
    return () => window.removeEventListener('orientationchange', onResize)
  }, [])
  return (
    <Router>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus?.(); document.getElementById('main')?.scrollIntoView() }}>
        Skip to content
      </a>
      <div className="page-bg" aria-hidden="true">
        <div className="page-bg__glow" />
      </div>
      <div className="app">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
      <Scene3D />
      <CartDrawer />
      <Toast />
      <Cursor />
      <Preloader />
    </Router>
  )
}
