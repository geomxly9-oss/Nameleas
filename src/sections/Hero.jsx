import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import Magnetic from '../components/Magnetic'
import { useUI } from '../store/ui'
import { stage } from '../three/scene/Stage'
import { prefersReducedMotion, scrollToTarget } from '../lib/scroll'
import { getProduct, HERO_ID } from '../data/products'

gsap.registerPlugin(SplitText)

/* Concentric undulating rings: the Lumen weave, drawn large behind the watch. */
function WeaveRings() {
  const paths = useMemo(() => {
    const out = []
    for (let k = 0; k < 16; k++) {
      const r0 = 120 + k * 22
      let d = ''
      for (let j = 0; j <= 360; j++) {
        const th = (j / 360) * Math.PI * 2
        const r = r0 + 5 * Math.sin(th * 12 + k * 0.8)
        d += `${j ? 'L' : 'M'}${(500 + Math.cos(th) * r).toFixed(1)} ${(500 + Math.sin(th) * r).toFixed(1)}`
      }
      out.push(d + 'Z')
    }
    return out
  }, [])
  return (
    <svg className="hero__rings" viewBox="0 0 1000 1000" fill="none" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={i % 4 === 0 ? 1.2 : 0.6} />
      ))}
    </svg>
  )
}

function LocalTime() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="hero__time">{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
}

export default function Hero() {
  const ready = useUI((s) => s.ready)
  const root = useRef(null)
  const product = getProduct(HERO_ID)

  useGSAP(
    () => {
      if (!ready) return
      const reduce = prefersReducedMotion()
      const split = SplitText.create('.hero__title .line', { type: 'chars', charsClass: 'char', mask: 'chars' })
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to(stage, { intro: 1, duration: reduce ? 0.01 : 2.4, ease: 'power3.out' }, 0)
      if (!reduce) {
        tl.from(split.chars, { yPercent: 115, duration: 1.4, stagger: 0.035 }, 0.1)
        tl.from('.hero__sub > *, .hero__meta', { y: 24, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.7)
        tl.from('.hero__rings', { scale: 0.86, opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
        gsap.to('.hero__rings', { rotate: 40, scale: 1.18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('.hero__row--top', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('.hero__row--bottom', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      }
      return () => split.revert()
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section className="hero" ref={root} id="top" data-bg="#C6F0E4" aria-labelledby="hero-title">
      <WeaveRings />
      <h1 id="hero-title" className="hero__title display" style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <span className="hero__row hero__row--top">
          <span className="line">TIME</span> <span className="line">IS</span>
        </span>{' '}
        <span className="hero__row hero__row--bottom">
          <span className="line">YOUR</span> <span className="line">LEGACY.</span>
        </span>
      </h1>
      <div className="hero__foot">
        <div className="hero__sub">
          <p>Precision. Craftsmanship. Timeless Identity.</p>
          <Magnetic>
            <button type="button" className="btn" onClick={() => scrollToTarget('#collections')}>
              Explore Collection
            </button>
          </Magnetic>
        </div>
        <div className="hero__meta">
          <strong>
            {product.name}, {product.variant.toLowerCase()}
          </strong>
          <span>
            Set to your local time, <LocalTime />
          </span>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
    </section>
  )
}
