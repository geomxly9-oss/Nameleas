import { useState } from 'react'
import WatchViewer from '../three/scene/WatchViewer'
import { getProduct, MOVEMENT_ID } from '../data/products'
import { RevealHeading, Reveal } from '../components/Reveal'
import { useNearViewport } from '../components/ProductCard'
import { useRef } from 'react'

export default function Movement() {
  const p = getProduct(MOVEMENT_ID)
  const [rotor, setRotor] = useState(true)
  const [train, setTrain] = useState(true)
  const ref = useRef(null)
  const near = useNearViewport(ref, '400px')
  const hidden = [!rotor && 'rotor', !train && 'gears'].filter(Boolean)
  const rows = [
    ['Power reserve', '72 hours'],
    ['Frequency', '4 Hz, 28,800 vph'],
    ['Jewels', '31'],
    ['Components', '209'],
    ['Rotor', '18k Velor gold'],
    ['Hairspring', 'Silicon, anti-magnetic'],
  ]
  return (
    <section className="section movement theme-dark" id="movement" data-bg="#64165D" aria-labelledby="movement-title">
      <div className="wrap movement__grid">
        <div className="movement__view" ref={ref}>
          <div className="movement__ring" aria-hidden="true" />
          {near && (
            <WatchViewer
              product={p}
              quality="high"
              time="pose"
              parts={['movement', 'gears', 'rotor']}
              hidden={hidden}
              initial={{ yaw: 0.45, pitch: 0.5, autoRotate: 0.16 }}
              fit={[4.3, 4.3]}
              rim="#A7E8D7"
              aria-label="3D model of Calibre VT-28. Drag to rotate."
              role="img"
            />
          )}
        </div>
        <div style={{ display: 'grid', gap: 26 }}>
          <p className="kicker">Movement engineering</p>
          <RevealHeading id="movement-title" className="h2">
            Calibre VT-28. Designed, made and regulated in our own workshop.
          </RevealHeading>
          <Reveal as="p" className="body">
            The VT-28 is wound by a gold rotor that turns in both directions, so a few hours on the wrist fill its twin barrels. Each one is regulated in five positions and two temperatures before it is cased, then tested again for ten days inside its case.
          </Reveal>
          <div className="toggles" role="group" aria-label="Show or hide movement parts">
            <button type="button" className="toggle" role="switch" aria-checked={rotor} onClick={() => setRotor(!rotor)}>
              <i aria-hidden="true" />
              Automatic rotor
            </button>
            <button type="button" className="toggle" role="switch" aria-checked={train} onClick={() => setTrain(!train)}>
              <i aria-hidden="true" />
              Gear train
            </button>
          </div>
          <dl className="datasheet">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
