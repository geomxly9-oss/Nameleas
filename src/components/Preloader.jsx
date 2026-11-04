import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useUI } from '../store/ui'
import { prefersReducedMotion, stopScroll } from '../lib/scroll'
import { whenStable } from '../lib/ticker'

/* The opening: a dial ring draws, the hands sweep to 10:10 (our V), then the curtain lifts. */
export default function Preloader() {
  const setReady = useUI((s) => s.setReady)
  const [gone, setGone] = useState(false)
  const root = useRef(null)
  const count = useRef(null)

  useEffect(() => {
    stopScroll(true)
    const reduce = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          stopScroll(false)
          setGone(true)
        },
      })
      const n = { v: 0 }
      tl.fromTo('.preloader__ring', { strokeDashoffset: 415 }, { strokeDashoffset: 0, duration: reduce ? 0.01 : 1.4, ease: 'power2.inOut' }, 0)
      tl.to(n, { v: 100, duration: reduce ? 0.01 : 1.5, ease: 'power1.inOut', onUpdate: () => count.current && (count.current.textContent = String(Math.round(n.v)).padStart(3, '0')) }, 0)
      tl.fromTo('.preloader__h1', { rotate: 0 }, { rotate: -60, duration: reduce ? 0.01 : 1.2, ease: 'power3.inOut', transformOrigin: '66px 66px' }, 0.2)
      tl.fromTo('.preloader__h2', { rotate: 0 }, { rotate: 60 + 360, duration: reduce ? 0.01 : 1.3, ease: 'power3.inOut', transformOrigin: '66px 66px' }, 0.15)
      tl.fromTo('.preloader__name', { opacity: 0, letterSpacing: '0.6em' }, { opacity: 1, letterSpacing: '0.32em', duration: reduce ? 0.01 : 1.1, ease: 'power3.out' }, 0.3)
      // hold on the drawn dial until the 3D scene is rendering smoothly
      tl.addPause(reduce ? 0.04 : 1.5, () => {
        whenStable().then(() => tl.resume())
      })
      tl.call(() => setReady(true), null, reduce ? 0.05 : 1.55)
      tl.to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0.01 : 1.0, ease: 'expo.inOut' }, reduce ? 0.06 : 1.6)
    }, root)
    return () => ctx.revert()
  }, [setReady])

  if (gone) return null
  return (
    <div className="preloader" ref={root} style={{ clipPath: 'inset(0 0 0% 0)' }} aria-hidden="true">
      <div className="preloader__inner">
        <svg className="preloader__dial" viewBox="0 0 132 132" fill="none">
          <circle className="preloader__ring" cx="66" cy="66" r="62" stroke="currentColor" strokeWidth="1.2" strokeDasharray="415" />
          <circle cx="66" cy="66" r="52" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="66" y1="8" x2="66" y2={i % 3 === 0 ? 18 : 14} stroke="currentColor" strokeWidth={i % 3 === 0 ? 1.6 : 0.8} transform={`rotate(${i * 30} 66 66)`} />
          ))}
          <line className="preloader__h1" x1="66" y1="66" x2="66" y2="30" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <line className="preloader__h2" x1="66" y1="66" x2="66" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="66" cy="66" r="3" fill="#8A176E" />
        </svg>
        <div className="preloader__name">VELORA</div>
        <div className="preloader__count" ref={count}>
          000
        </div>
      </div>
    </div>
  )
}
