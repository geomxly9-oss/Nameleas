import { useNavigate } from 'react-router'
import { getProduct, HERO_ID, getCollection } from '../data/products'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import Magnetic from '../components/Magnetic'
import { RevealHeading, Reveal } from '../components/Reveal'

export default function Featured() {
  const p = getProduct(HERO_ID)
  const navigate = useNavigate()
  const add = useCart((s) => s.add)
  const rows = [
    ['Case', `${p.specs.diameter}, ${p.specs.material.toLowerCase()}`],
    ['Movement', `${p.movement.name}, self-winding`],
    ['Power reserve', p.movement.reserve],
    ['Water resistance', p.specs.water],
  ]
  return (
    <section className="section featured" id="featured" data-bg="#A7E8D7" aria-labelledby="featured-title">
      <div className="wrap featured__grid">
        <div className="featured__copy">
          <p className="kicker">{getCollection(p.collection).name}</p>
          <RevealHeading id="featured-title" className="h1 featured__name">
            {p.name}
            <span className="variant">in steel, with a plum Lumen-weave dial</span>
          </RevealHeading>
          <Reveal as="p" className="lead">
            {p.description[0]}
          </Reveal>
          <Reveal as="dl" className="speclist">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </Reveal>
          <div className="price-row">
            <span className="price">{formatPrice(p.price)}</span>
            <span className="avail">{p.availability}</span>
          </div>
          <div className="btn-row">
            <Magnetic>
              <button type="button" className="btn" onClick={() => navigate(`/watch/${p.id}`)}>
                Discover {p.name}
              </button>
            </Magnetic>
            <button type="button" className="btn btn--ghost" onClick={() => add(p.id)}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
