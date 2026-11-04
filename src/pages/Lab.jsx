import { useMemo, useRef, useState } from 'react'
import { products } from '../data/products'
import WatchViewer from '../three/scene/WatchViewer'
import { createInteraction } from '../three/watch/Watch'

export default function Lab() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const [id, setId] = useState(params.get('id') || products[0].id)
  const [ex, setEx] = useState(Number(params.get('ex') || 0))
  const explodeRef = useRef(ex)
  explodeRef.current = ex
  const interaction = useMemo(() => createInteraction(), [])
  const product = products.find((p) => p.id === id)
  const yaw = Number(params.get('yaw') ?? -0.5)
  const pitch = Number(params.get('pitch') ?? 0.15)
  return (
    <div style={{ minHeight: '100vh', background: params.get('bg') || '#C6F0E4', padding: 20 }}>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.id}</option>
          ))}
        </select>
        <input type="range" min="0" max="1" step="0.01" value={ex} onChange={(e) => setEx(Number(e.target.value))} />
      </div>
      <WatchViewer
        key={id}
        product={product}
        quality="high"
        time="pose"
        interaction={interaction}
        explodeRef={explodeRef}
        initial={{ yaw, pitch, autoRotate: Number(params.get('spin') ?? 0) }}
        fit={[Number(params.get('fh') || 8), Number(params.get('fw') || 6)]}
        style={{ width: '100%', height: '88vh' }}
        onPick={(p) => { interaction.selected.current = p; console.log('pick', p) }}
      />
    </div>
  )
}
