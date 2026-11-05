import { useEffect, useRef } from 'react'
import { onTick } from '../lib/ticker'

/* A quiet ring cursor. It only announces two things: links, and things you can drag. */
export default function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    const pos = { x: -100, y: -100, tx: -100, ty: -100 }
    let mode = ''
    const onMove = (e) => {
      pos.tx = e.clientX
      pos.ty = e.clientY
      const t = e.target instanceof Element ? e.target : null
      const drag = t?.closest('[data-cursor="drag"]')
      const link = t?.closest('a, button, [role="button"], select, label, input[type="checkbox"]')
      const next = link ? 'link' : drag ? 'drag' : ''
      if (next !== mode) {
        mode = next
        el.dataset.mode = mode
        el.querySelector('.cursor__ring').textContent = mode === 'drag' ? 'Drag' : ''
      }
      const dark = t?.closest('.theme-dark, .footer, .mobile-menu')
      el.dataset.dark = dark ? 'true' : 'false'
    }
    const off = onTick(() => {
      pos.x += (pos.tx - pos.x) * 0.22
      pos.y += (pos.ty - pos.y) * 0.22
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
    }, 20)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.classList.add('has-cursor')
    return () => {
      off()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="cursor__ring" />
      <div className="cursor__dot" />
    </div>
  )
}
