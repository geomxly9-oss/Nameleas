import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import WatchViewer from '../three/scene/WatchViewer'
import { createInteraction } from '../three/watch/Watch'
import { getProduct, getCollection, products } from '../data/products'
import { componentInfo, PART_ORDER } from '../data/components'
import { formatPrice } from '../lib/format'
import { useCart } from '../store/cart'
import { useUI } from '../store/ui'
import ProductCard from '../components/ProductCard'
import Magnetic from '../components/Magnetic'
import { IconBox, IconClose, IconMinus, IconPlus, IconShield, IconTruck } from '../components/Icons'
import NotFound from './NotFound'

const ANGLES = [
  { id: 'front', label: 'Front', yaw: 0, pitch: 0.04 },
  { id: 'three', label: 'Three-quarter', yaw: -0.62, pitch: 0.2 },
  { id: 'profile', label: 'Profile', yaw: -1.5, pitch: 0.05 },
  { id: 'back', label: 'Case back', yaw: Math.PI, pitch: 0.12 },
  { id: 'top', label: 'Top', yaw: -0.3, pitch: 1.05 },
]

function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div className="acc__item" key={it.title}>
          <h3>
            <button type="button" className="acc__btn" aria-expanded={open === i} aria-controls={`acc-${i}`} id={`accb-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
              {it.title}
              <IconPlus />
            </button>
          </h3>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                id={`acc-${i}`}
                role="region"
                aria-labelledby={`accb-${i}`}
                className="acc__panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {it.body}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

const Specs = ({ rows }) => (
  <dl className="speclist">
    {rows.map(([k, v]) => (
      <div key={k}>
        <dt>{k}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
)

export default function Product() {
  const { id } = useParams()
  const product = getProduct(id)
  if (!product) return <NotFound />
  return <ProductInner key={product.id} product={product} />
}

function ProductInner({ product: p }) {
  const navigate = useNavigate()
  const add = useCart((s) => s.add)
  const showToast = useUI((s) => s.showToast)
  const ctl = useRef(null)
  const interaction = useMemo(() => createInteraction(), [])
  const explodeRef = useRef(0)
  const explodeObj = useRef({ v: 0 })
  const [angle, setAngle] = useState('three')
  const [spin, setSpin] = useState(true)
  const [exploded, setExploded] = useState(false)
  const [part, setPart] = useState(null)
  const col = getCollection(p.collection)
  const info = part ? componentInfo(part, p) : null

  useEffect(() => {
    interaction.selected.current = part
  }, [part, interaction])

  useEffect(() => {
    document.title = `${p.name}, ${p.variant} — Velora Time`
    return () => {
      document.title = 'Velora Time — Swiss Haute Horlogerie'
    }
  }, [p])

  const setExplode = (on) => {
    setExploded(on)
    gsap.to(explodeObj.current, {
      v: on ? 1 : 0,
      duration: on ? 2.2 : 1.6,
      ease: 'power3.inOut',
      onUpdate: () => (explodeRef.current = explodeObj.current.v),
    })
    if (ctl.current) {
      ctl.current.targetYaw = on ? -0.85 : -0.62
      ctl.current.targetPitch = on ? 0.32 : 0.2
      ctl.current.targetZoom = 1
    }
    if (!on) setPart(null)
  }

  const goAngle = (a) => {
    setAngle(a.id)
    setSpin(false)
    if (ctl.current) {
      ctl.current.autoRotate = 0
      ctl.current.targetYaw = a.yaw
      ctl.current.targetPitch = a.pitch
      ctl.current.vel = 0
    }
  }
  const toggleSpin = () => {
    const next = !spin
    setSpin(next)
    if (ctl.current) ctl.current.autoRotate = next ? 0.35 : 0
  }
  const zoom = (dz) => {
    if (!ctl.current) return
    ctl.current.targetZoom = Math.min(2.8, Math.max(0.75, ctl.current.targetZoom * dz))
  }
  const choosePart = (id) => {
    if (!exploded && id) setExplode(true)
    setPart(id)
  }

  const s = p.specs
  const mv = p.movement
  const related = useMemo(() => {
    const same = products.filter((x) => x.collection === p.collection && x.id !== p.id)
    const others = products.filter((x) => x.collection !== p.collection)
    return [...same, ...others].slice(0, 3)
  }, [p])

  return (
    <main id="main" className="pdp">
      <div className="pdp__grid">
        <div className="pdp__stage">
          <WatchViewer
            ref={ctl}
            product={p}
            quality="high"
            time="live"
            initial={{ yaw: -0.62, pitch: 0.2, autoRotate: 0.35 }}
            fit={exploded ? [12.6, 11.5] : [7.6, 6.2]}
            interaction={interaction}
            explodeRef={explodeRef}
            onPick={(id) => exploded && setPart(id)}
            onHover={(id) => {
              if (!exploded) return
              interaction.hovered.current = id
            }}
            aria-label={`Interactive 3D model of ${p.name}. Drag to rotate.`}
            role="img"
          />
          <div className="pdp__corner">
            <span>{exploded ? 'Select any part on the watch' : 'Drag to turn it a full 360°'}</span>
            <div className="seg" role="group" aria-label="Zoom">
              <button type="button" onClick={() => zoom(1 / 1.25)} aria-label="Zoom out">
                <IconMinus width="12" height="12" />
              </button>
              <button type="button" onClick={() => zoom(1.25)} aria-label="Zoom in">
                <IconPlus width="12" height="12" />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {info && (
              <motion.div className="pdp__part" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} key={part}>
                <button type="button" className="icon-btn pdp__part-close" onClick={() => setPart(null)} aria-label="Close component details">
                  <IconClose />
                </button>
                <h3 className="h3">{info.name}</h3>
                <dl style={{ display: 'grid', gap: 8 }}>
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
            )}
          </AnimatePresence>
          <div className="pdp__tools">
            <div className="seg" role="group" aria-label="Viewing angle">
              {ANGLES.map((a) => (
                <button key={a.id} type="button" aria-pressed={angle === a.id && !spin} onClick={() => goAngle(a)}>
                  {a.label}
                </button>
              ))}
              <button type="button" aria-pressed={spin} onClick={toggleSpin}>
                360°
              </button>
            </div>
            <div className="seg">
              <button type="button" aria-pressed={exploded} onClick={() => setExplode(!exploded)}>
                {exploded ? 'Assemble watch' : 'Explore components'}
              </button>
            </div>
          </div>
        </div>

        <div className="pdp__info">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/" state={{ scrollTo: 'collections' }}>
              {col.name}
            </Link>
          </nav>
          <div style={{ display: 'grid', gap: 12 }}>
            <h1 className="h1 pdp__title">{p.name}</h1>
            <p className="lead italic" style={{ marginTop: -4 }}>
              {p.variant}
            </p>
            <p className="pdp__ref">Reference {p.ref}</p>
          </div>
          <div className="price-row">
            <span className="price">{formatPrice(p.price)}</span>
            <span className="avail">{p.availability}</span>
          </div>
          <div className="pdp__buy">
            <Magnetic className="btn-wrap">
              <button
                type="button"
                className="btn btn--block"
                onClick={() => {
                  add(p.id, 1, false)
                  showToast({ text: `${p.name} added to your cart` })
                }}
              >
                Add to cart
              </button>
            </Magnetic>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => {
                add(p.id, 1, false)
                navigate('/checkout')
              }}
            >
              Buy now
            </button>
          </div>
          <ul className="pdp__perks">
            <li>
              <IconTruck /> Complimentary insured delivery in 2 to 4 working days
            </li>
            <li>
              <IconShield /> Five-year international warranty
            </li>
            <li>
              <IconBox /> Presentation box in plum lacquer, returns within 30 days
            </li>
          </ul>
          <div className="pdp__desc">
            {p.description.map((t) => (
              <p className="body" key={t.slice(0, 20)}>
                {t}
              </p>
            ))}
          </div>
          <Accordion
            items={[
              {
                title: 'Case and dial',
                body: (
                  <Specs
                    rows={[
                      ['Case diameter', s.diameter],
                      ['Thickness', s.thickness],
                      ['Case material', s.material],
                      ['Bezel', s.bezel],
                      ['Crystal', s.crystal],
                      ['Dial', s.dial],
                    ]}
                  />
                ),
              },
              {
                title: 'Movement',
                body: (
                  <Specs
                    rows={[
                      ['Calibre', mv.name],
                      ['Type', mv.type],
                      ['Power reserve', mv.reserve],
                      ['Frequency', mv.frequency],
                      ['Jewels', String(mv.jewels)],
                      ['Functions', mv.functions],
                    ]}
                  />
                ),
              },
              {
                title: 'Strap and water resistance',
                body: (
                  <Specs
                    rows={[
                      ['Strap', s.strap],
                      ['Clasp', s.clasp],
                      ['Water resistance', s.water],
                    ]}
                  />
                ),
              },
              {
                title: 'Components',
                body: (
                  <ol className="parts" style={{ padding: '4px 0 18px' }}>
                    {PART_ORDER.map((pid, i) => (
                      <li key={pid}>
                        <button type="button" aria-pressed={part === pid} onClick={() => choosePart(part === pid ? null : pid)}>
                          <span>{String(i + 1).padStart(2, '0')}</span>
                          {componentInfo(pid, p).name}
                        </button>
                      </li>
                    ))}
                  </ol>
                ),
              },
            ]}
          />
        </div>
      </div>

      <section className="related" aria-labelledby="related-title">
        <div className="section-head">
          <h2 id="related-title" className="h2">
            You may also consider
          </h2>
        </div>
        <div className="grid-products">
          {related.map((r, i) => (
            <ProductCard key={r.id} product={r} index={i} />
          ))}
        </div>
      </section>
    </main>
  )
}
