import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'
import { onTick } from '../lib/ticker'
import { prefersReducedMotion } from '../lib/scroll'

const LAYERS = 4 // dark edge layers so the photo has some thickness side-on
const GAP = 3 // px between layers

/*
 * A watch photo that turns a full 360°: it spins on its own, can be dragged
 * with momentum, tilts toward the cursor, and carries a moving shine and a
 * floor shadow that narrows as it turns side-on. The back shows the watch as
 * a dark silhouette, since a photo has no real back.
 */
const PhotoSpinner = forwardRef(function PhotoSpinner({ watch, src, alt, speed = 30, startYaw = 0, className = '' }, ref) {
  const root = useRef(null)
  const obj = useRef(null)
  const shine = useRef(null)
  const shadow = useRef(null)
  const st = useRef({ yaw: startYaw, vel: 0, dragging: false, x: 0, sx: 0, t: 0, id: null, tiltX: 0, tiltY: 0, visible: false })
  useImperativeHandle(ref, () => st.current, [])

  useEffect(() => {
    const el = root.current
    const io = new IntersectionObserver(([e]) => (st.current.visible = e.isIntersecting), { rootMargin: '200px' })
    io.observe(el)
    const auto = prefersReducedMotion() ? 0 : speed
    const off = onTick((_, dtMs) => {
      const s = st.current
      if (!s.visible || !obj.current) return
      const dt = Math.min((dtMs || 16) / 1000, 0.05)
      if (!s.dragging) {
        // linger facing front, sweep quickly through the side and back
        const front = Math.max(0, Math.cos((s.yaw * Math.PI) / 180))
        s.yaw += (auto * (1.7 - 1.35 * front) + s.vel) * dt
        s.vel *= Math.exp(-dt * 2.4)
      }
      const yaw = s.yaw + s.tiltX * 18
      obj.current.style.transform = `rotateX(${(-s.tiltY * 12).toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`
      const r = (yaw * Math.PI) / 180
      if (shine.current) shine.current.style.backgroundPosition = `${(50 + Math.sin(r) * 60).toFixed(1)}% 0`
      if (shadow.current) shadow.current.style.transform = `translateX(-50%) scaleX(${(0.3 + 0.7 * Math.abs(Math.cos(r))).toFixed(3)})`
    }, 7)
    return () => {
      io.disconnect()
      off()
    }
  }, [speed])

  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    const s = st.current
    Object.assign(s, { dragging: true, vel: 0, x: e.clientX, sx: e.clientX, t: performance.now(), id: e.pointerId })
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }
  const move = (e) => {
    const s = st.current
    if (!s.dragging || s.id !== e.pointerId) return
    const now = performance.now()
    const dx = e.clientX - s.x
    s.yaw += dx * 0.6
    s.vel = Math.max(-900, Math.min(900, (dx * 0.6) / (Math.max(1, now - s.t) / 1000)))
    s.x = e.clientX
    s.t = now
  }
  const up = () => {
    st.current.dragging = false
  }

  const url = src || `./gallery/${watch.src}.webp`
  const plate = { '--ar': `${watch.w} / ${watch.h}` }
  const mask = { WebkitMaskImage: `url(${url})`, maskImage: `url(${url})` }

  return (
    <div className={`spin ${className}`} ref={root} data-cursor="drag" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <span className="spin__shadow" ref={shadow} aria-hidden="true" />
      <div className="spin__obj" ref={obj}>
        <div className="spin__plate spin__front" style={plate}>
          <img src={url} alt={alt} draggable="false" decoding="async" />
          <span className="spin__shine" ref={shine} style={mask} aria-hidden="true" />
        </div>
        {Array.from({ length: LAYERS }).map((_, i) => (
          <div key={i} className="spin__plate spin__edge" style={{ ...plate, '--z': `${-(i + 1) * GAP}px` }} aria-hidden="true">
            <img src={url} alt="" draggable="false" decoding="async" />
          </div>
        ))}
        <div className="spin__plate spin__back" style={{ ...plate, '--z': `${-(LAYERS + 1) * GAP}px` }} aria-hidden="true">
          <img src={url} alt="" draggable="false" decoding="async" />
        </div>
      </div>
    </div>
  )
})

export default PhotoSpinner
