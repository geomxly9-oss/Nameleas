import { useEffect, useRef } from 'react'
import { onTick } from '../lib/ticker'
import { WATCHES } from '../data/gallery'

// Scroll progress for the pinned ring, written by the Home scroll scene.
export const galleryState = { p: 0 }

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
