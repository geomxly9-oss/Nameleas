import { useEffect, useRef } from 'react'
import { onTick } from '../lib/ticker'

// Scroll progress for the pinned ring, written by the Home scroll scene.
export const galleryState = { p: 0 }

// Photographs supplied for the gallery. Each watch is credited to its maker.
const WATCHES = [
  { src: '01-jacob-co-casino', brand: 'Jacob & Co', note: 'Casino, with a working roulette wheel around the dial' },
  { src: '02-ak', brand: 'AK', note: 'Hours on turning cylinders above a minutes arc' },
  { src: '03-the-electricianz', brand: 'The Electricianz', note: 'A grid dial lit in green' },
  { src: '04-jacob-co-cr7', brand: 'Jacob & Co', note: 'CR7 skeleton with a football-shaped cage' },
  { src: '05-jacob-co-football', brand: 'Jacob & Co', note: 'Tourbillon at twelve over a green sapphire dial' },
  { src: '06-jacob-co-world', brand: 'Jacob & Co', note: 'A world map dial with two time zones' },
  { src: '07-jacob-co-astronomia', brand: 'Jacob & Co', note: 'Astronomia Solar, with gemstone planets in orbit' },
  { src: '08-ulysse-nardin-freak', brand: 'Ulysse Nardin', note: 'Freak, the movement on show over a blue dial' },
  { src: '09-richard-mille-rm72', brand: 'Richard Mille', note: 'RM 72-01 chronograph in a baguette-set case' },
  { src: '10-bonest-gatti', brand: 'Bonest Gatti', note: 'A clear case with a green serpent across the movement' },
  { src: '11-lucky-harvey', brand: 'Lucky Harvey', note: 'A green serpent across an automatic skeleton dial' },
  { src: '12-zbicland', brand: 'Zbicland', note: 'Harry Potter edition, a gold serpent over twelve wheels' },
  { src: '13-louis-moinet', brand: 'Louis Moinet', note: 'Skeleton chronograph in rose gold and red' },
]

const N = WATCHES.length
const STEP = (Math.PI * 2) / N

export default function Gallery3D() {
  const items = useRef([])
  const ring = useRef(null)
  const brand = useRef(null)
  const note = useRef(null)
  const count = useRef(null)
  const bar = useRef(null)

  useEffect(() => {
    let current = -1
    let t = 0
    return onTick((_, dtMs) => {
      t += (dtMs || 16) / 1000
      const el = ring.current
      if (!el) return
      const w = el.clientWidth
      const R = Math.min(w * (w > 900 ? 0.5 : 0.42), 760)
      const f = galleryState.p * (N - 1) // continuous index of the front watch
      const base = -f * STEP
      items.current.forEach((node, i) => {
        if (!node) return
        const phi = i * STEP + base
        const c = Math.cos(phi)
        const s = Math.sin(phi)
        const front = (c + 1) / 2 // 1 at the front, 0 at the back
        const x = s * R
        const z = (c - 1) * R
        const y = (1 - front) * -70 + Math.sin(t * 1.1 + i) * 6 * front
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-phi * 0.45 * 57.3).toFixed(2)}deg)`
        node.style.opacity = (0.12 + 0.88 * Math.pow(front, 1.6)).toFixed(3)
        node.style.zIndex = String(Math.round(front * 100))
      })
      const idx = Math.min(N - 1, Math.max(0, Math.round(f)))
      if (bar.current) bar.current.style.transform = `scaleX(${(f / (N - 1)).toFixed(4)})`
      if (idx !== current) {
        current = idx
        const wch = WATCHES[idx]
        if (brand.current) brand.current.textContent = wch.brand
        if (note.current) note.current.textContent = wch.note
        if (count.current) count.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${N}`
      }
    }, 6)
  }, [])

  return (
    <div className="pin-wrap">
      <section className="gallery theme-dark" id="gallery" data-bg="#64165D" aria-labelledby="gallery-title">
        <div className="gallery__head">
          <p className="kicker">The gallery</p>
          <h2 id="gallery-title" className="h2">
            Watches we admire
          </h2>
          <p className="gallery__sub">Thirteen pieces from other independent houses. Keep scrolling to turn the ring.</p>
        </div>
        <div className="gallery__ring" ref={ring}>
          {WATCHES.map((w, i) => (
            <figure key={w.src} className="gallery__item" ref={(el) => (items.current[i] = el)}>
              <img src={`./gallery/${w.src}.webp`} alt={`${w.brand}: ${w.note}`} decoding="async" draggable="false" />
              <span className="gallery__shadow" aria-hidden="true" />
            </figure>
          ))}
        </div>
        <div className="gallery__foot">
          <div className="gallery__caption" aria-live="polite">
            <span className="gallery__count num" ref={count}>
              01 / {N}
            </span>
            <strong ref={brand}>{WATCHES[0].brand}</strong>
            <span ref={note}>{WATCHES[0].note}</span>
          </div>
          <div className="gallery__progress" aria-hidden="true">
            <b ref={bar} />
          </div>
          <p className="gallery__credit">Photographs and trademarks belong to their makers.</p>
        </div>
      </section>
    </div>
  )
}
