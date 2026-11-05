import { useRef } from 'react'
import { useNavigate } from 'react-router'
import WatchViewer from '../three/scene/WatchViewer'
import { getProduct, LIMITED_ID } from '../data/products'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { RevealHeading, Reveal } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import { useNearViewport } from '../components/ProductCard'

export default function LimitedEdition() {
  const p = getProduct(LIMITED_ID)
  const navigate = useNavigate()
  const add = useCart((s) => s.add)
  const ref = useRef(null)
  const near = useNearViewport(ref, '400px')
  const sold = p.edition - p.remaining
  return (
    <section className="section limited theme-dark" id="limited" data-bg="#8A176E" aria-labelledby="limited-title">
      <div className="limited__bg" aria-hidden="true" />
      <div className="wrap limited__grid">
        <div style={{ display: 'grid', gap: 26 }}>
          <p className="kicker">Limited edition of {p.edition}</p>
          <RevealHeading id="limited-title" className="h1">
            {p.name}
          </RevealHeading>
          <Reveal as="p" className="lead">
            {p.description[0]}
          </Reveal>
          <div className="edition">
            <div className="edition__bar" role="meter" aria-valuemin={0} aria-valuemax={p.edition} aria-valuenow={sold} aria-label="Pieces allocated">
              <b style={{ width: `${(sold / p.edition) * 100}%` }} />
            </div>
            <div className="edition__label">
              <span>{sold} pieces allocated</span>
              <span>{p.remaining} remain</span>
            </div>
          </div>
          <div className="price-row">
            <span className="price">{formatPrice(p.price)}</span>
            <span className="avail">Allocated by private appointment</span>
          </div>
          <div className="btn-row">
            <Magnetic>
              <button type="button" className="btn btn--light" onClick={() => add(p.id)}>
                Reserve yours
              </button>
            </Magnetic>
            <button type="button" className="btn btn--ghost" onClick={() => navigate(`/watch/${p.id}`)}>
              View details
            </button>
          </div>
        </div>
        <div className="limited__view" ref={ref}>
          {near && (
            <WatchViewer
              product={p}
              quality="high"
              time="live"
              initial={{ yaw: -0.4, pitch: 0.12, autoRotate: 0.18 }}
              fit={[7.6, 6.4]}
              rim="#A7E8D7"
              aria-label={`3D model of ${p.name}. Drag to rotate.`}
              role="img"
            />
          )}
        </div>
      </div>
    </section>
  )
}
