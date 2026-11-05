import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { stage } from '../three/scene/Stage'
import { onTick } from '../lib/ticker'
import { componentInfo, PART_ORDER } from '../data/components'
import { getProduct, HERO_ID } from '../data/products'
import PartPreview from '../three/scene/PartPreview'
import Magnetic from '../components/Magnetic'

export default function Components3D() {
  const product = getProduct(HERO_ID)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [assembled, setAssembled] = useState(false)
  const meter = useRef(null)
  const hit = useRef(null)
  const drag = useRef(null)
  const info = selected ? componentInfo(selected, product) : null
  const names = useMemo(() => Object.fromEntries(PART_ORDER.map((id) => [id, componentInfo(id, product).name])), [product])

  useEffect(() => {
    stage.interaction.selected.current = selected
  }, [selected])
  useEffect(() => {
    stage.interaction.hovered.current = hover
  }, [hover])

  // live readout + auto-reset of the assemble override when the visitor scrolls back out
  useEffect(
    () =>
      onTick(() => {
        if (meter.current) meter.current.textContent = `Disassembly ${Math.round(stage.explode.current * 100)}%`
        if (stage.p.compEntry < 0.2 && stage.assemble > 0 && !gsap.isTweening(stage)) {
          stage.assemble = 0
          setAssembled(false)
        }
      }, 7),
    [],
  )

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const toggleAssemble = () => {
    const next = !assembled
    setAssembled(next)
    gsap.to(stage, { assemble: next ? 1 : 0, duration: 1.8, ease: 'power3.inOut' })
  }

  const ndc = (e) => [(e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1]
  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), id: e.pointerId }
    stage.dragging = true
    stage.userVel = 0
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }
  const onMove = (e) => {
    const d = drag.current
    if (d && d.id === e.pointerId) {
      const now = performance.now()
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      stage.userYaw += dx * 0.008
      if (e.pointerType !== 'touch') stage.userPitch = Math.max(-0.5, Math.min(0.7, stage.userPitch + dy * 0.004))
      stage.userVel = Math.max(-8, Math.min(8, (dx * 0.008) / (Math.max(1, now - d.t) / 1000)))
      d.x = e.clientX
      d.y = e.clientY
      d.t = now
      return
    }
    if (e.pointerType === 'touch' || !stage.interaction.pick) return
    const id = stage.interaction.pick(...ndc(e))
    setHover(id)
    hit.current?.classList.toggle('is-hovering', !!id)
  }
  const onUp = (e) => {
    const d = drag.current
    stage.dragging = false
    drag.current = null
    if (!d) return
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6 && stage.interaction.pick) {
      stage.userVel = 0
      const id = stage.interaction.pick(...ndc(e))
      setSelected(id || null)
    }
  }

  return (
    <div className="pin-wrap">
      <section className="comp theme-dark" id="components" data-bg="#8A176E" aria-labelledby="comp-title">
        <div className="comp__grid">
          <div className="comp__stage">
            <div
              className="comp__hit"
              ref={hit}
              data-cursor="drag"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onPointerLeave={() => setHover(null)}
              aria-hidden="true"
            />
            <div className="comp__head">
              <h2 id="comp-title" className="h2">
                Explore 3D Components
              </h2>
              <p className="comp__hint">
                Keep scrolling to take the Regalis apart. Drag to turn it, then select any of its fifteen parts to see what it does and what it is made of.
              </p>
            </div>
            <div />
            <div className="comp__actions">
              <Magnetic>
                <button type="button" className="btn btn--light" onClick={toggleAssemble} aria-pressed={assembled}>
                  {assembled ? 'Explode watch' : 'Assemble watch'}
                </button>
              </Magnetic>
              <span className="comp__meter" ref={meter} aria-hidden="true">
                Disassembly 0%
              </span>
            </div>
          </div>
          <aside className="comp__panel" aria-label="Watch components">
            <ol className="parts">
              {PART_ORDER.map((id, i) => (
                <li key={id}>
                  <button type="button" aria-pressed={selected === id} onClick={() => setSelected(selected === id ? null : id)} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {names[id]}
                  </button>
                </li>
              ))}
            </ol>
            <div className="part-card" aria-live="polite">
              <PartPreview product={product} part={selected || 'movement'} className="part-card__view" />
              <AnimatePresence mode="wait">
                {info ? (
                  <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                    <h3 className="h3">{info.name}</h3>
                    <dl style={{ marginTop: 12 }}>
                      <div>
                        <dt>What it does</dt>
                        <dd>{info.fn}</dd>
                      </div>
                      <div>
                        <dt>Material</dt>
                        <dd>{info.material}</dd>
                      </div>
                    </dl>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="h3">Calibre VT-28</h3>
                    <p className="part-card__empty" style={{ marginTop: 10 }}>
                      Select a part in the list, or click it on the watch, for a close-up view.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
