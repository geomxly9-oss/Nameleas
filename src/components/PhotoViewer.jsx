import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PhotoSpinner from './PhotoSpinner'
import { IconClose } from './Icons'
import { stopScroll } from '../lib/scroll'

/* Full-screen 360° viewer for one watch photo, with previous / next. */
export default function PhotoViewer({ watches, index, onClose, onIndex }) {
  const open = index !== null
  const closeRef = useRef(null)
  const w = open ? watches[index] : null

  useEffect(() => {
    stopScroll(open)
    if (!open) return
    const prev = document.activeElement
    setTimeout(() => closeRef.current?.focus(), 60)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % watches.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + watches.length) % watches.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, index, watches.length, onClose, onIndex])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="viewer theme-dark" role="dialog" aria-modal="true" aria-labelledby="viewer-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} data-lenis-prevent>
          <button type="button" className="icon-btn viewer__close" onClick={onClose} aria-label="Close viewer" ref={closeRef}>
            <IconClose />
          </button>
          <motion.div key={w.src} className="viewer__stage" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <PhotoSpinner watch={w} alt={`${w.brand}: ${w.note}`} speed={22} className="viewer__spin" />
          </motion.div>
          <div className="viewer__foot">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onIndex((index - 1 + watches.length) % watches.length)}>
              Previous
            </button>
            <div className="viewer__caption">
              <span className="num">
                {String(index + 1).padStart(2, '0')} / {watches.length}
              </span>
              <h2 id="viewer-title" className="h3">
                {w.brand}
              </h2>
              <p>{w.note}</p>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onIndex((index + 1) % watches.length)}>
              Next
            </button>
          </div>
          <p className="viewer__hint">Drag the watch to spin it. Photographs and trademarks belong to their makers.</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
