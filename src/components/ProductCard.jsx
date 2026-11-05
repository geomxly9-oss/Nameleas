import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import WatchViewer from '../three/scene/WatchViewer'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { useUI } from '../store/ui'
import { getCollection } from '../data/products'
import { IconRotate } from './Icons'

/* Mount heavy 3D only once the card is close to the viewport, then keep it. */
export function useNearViewport(ref, margin = '600px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin, near])
  return near
}

export default function ProductCard({ product, index = 0 }) {
  const ref = useRef(null)
  const inner = useRef(null)
  const ctl = useRef(null)
  const near = useNearViewport(ref)
  const navigate = useNavigate()
  const add = useCart((s) => s.add)
  const showToast = useUI((s) => s.showToast)
  const col = getCollection(product.collection)

  const onMove = (e) => {
    if (e.pointerType === 'touch') return
    const r = inner.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    inner.current.style.transform = `rotateY(${nx * 7}deg) rotateX(${-ny * 6}deg) translateZ(0)`
    inner.current.style.setProperty('--sheen', `${50 - nx * 90}%`)
    if (ctl.current) {
      ctl.current.tiltX = nx
      ctl.current.tiltY = ny
    }
  }
  const onLeave = () => {
    inner.current.style.transform = ''
    inner.current.style.setProperty('--sheen', '100%')
    if (ctl.current) {
      ctl.current.tiltX = 0
      ctl.current.tiltY = 0
    }
  }

  const specs = [
    ['Case', product.specs.diameter],
    ['Movement', product.movement.name.replace('Calibre ', '')],
    ['Water', product.specs.water],
  ]

  return (
    <article className="card" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={`${product.name}, ${product.variant}`}>
      <div className="card__inner" ref={inner} style={{ transition: 'transform 0.6s cubic-bezier(.22,.61,.36,1), box-shadow .6s' }}>
        <div className="card__vitrine">
          <div className="card__shadow" />
          {product.stock === 'limited' && <span className="card__badge">{product.remaining} of {product.edition} remain</span>}
          {near && (
            <WatchViewer
              ref={ctl}
              className="card__view"
              product={product}
              quality="card"
              time="pose"
              initial={{ yaw: -0.5 + (index % 3) * 0.35, pitch: 0.14, autoRotate: 0.22 }}
              fit={[7.9, 6.3]}
              yOffset={0.15}
              aria-label={`3D model of ${product.name}. Drag to rotate.`}
              role="img"
            />
          )}
          <span className="card__drag" aria-hidden="true">
            <IconRotate /> Drag to rotate
          </span>
        </div>
        <div className="card__body">
          <div className="card__title">
            <h3 className="h3">{product.name}</h3>
            <span className="price num">{formatPrice(product.price)}</span>
          </div>
          <p className="card__variant">
            {product.variant}. {col.short}
          </p>
          <dl className="card__specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="card__actions">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => {
                add(product.id, 1, false)
                showToast({ text: `${product.name} added to your cart` })
              }}
            >
              Add to cart
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(`/watch/${product.id}`)}>
              View details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
