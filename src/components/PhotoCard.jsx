import { useRef } from 'react'
import PhotoSpinner from './PhotoSpinner'
import { IconRotate } from './Icons'

/* Shop card for a supplied watch photo: same arched vitrine and tilt as the
   3D cards, with the photo spinning a full 360°. */
export default function PhotoCard({ watch, index = 0, feature = false, onOpen }) {
  const inner = useRef(null)
  const spin = useRef(null)
  const onMove = (e) => {
    if (e.pointerType === 'touch' || !inner.current) return
    const r = inner.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    inner.current.style.transform = `rotateY(${nx * 7}deg) rotateX(${-ny * 6}deg) translateZ(0)`
    inner.current.style.setProperty('--sheen', `${50 - nx * 90}%`)
    if (spin.current) {
      spin.current.tiltX = nx
      spin.current.tiltY = ny
    }
  }
  const onLeave = () => {
    if (!inner.current) return
    inner.current.style.transform = ''
    inner.current.style.setProperty('--sheen', '100%')
    if (spin.current) {
      spin.current.tiltX = 0
      spin.current.tiltY = 0
    }
  }
  return (
    <article className={`card photo-card ${feature ? 'photo-card--feature' : ''}`} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={`${watch.brand}: ${watch.note}`}>
      <div className="card__inner" ref={inner} style={{ transition: 'transform 0.6s cubic-bezier(.22,.61,.36,1), box-shadow .6s' }}>
        <div className="card__vitrine">
          <PhotoSpinner ref={spin} watch={watch} alt={`${watch.brand}: ${watch.note}`} startYaw={index * -37} speed={feature ? 24 : 30} />
          <span className="card__drag" aria-hidden="true">
            <IconRotate /> Drag to spin 360°
          </span>
        </div>
        <div className="card__body">
          <div className="card__title">
            <h3 className="h3">{watch.brand}</h3>
          </div>
          <p className="card__variant">{watch.note}</p>
          <div className="card__actions card__actions--single">
            <button type="button" className="btn btn--sm" onClick={() => onOpen(index)}>
              View 360°
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
