import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { View, PerspectiveCamera } from '@react-three/drei'
import { WatchModel } from '../watch/Watch'
import { makeDims, partFraming } from '../watch/config'
import { StudioEnv, StudioLights } from './Scene3D'
import { fitDistance } from './WatchViewer'

/* Clears depth inside this view's rectangle before it renders, so it always
   draws on top of the full-screen stage behind it. */
function DepthClear({ track, priority }) {
  useFrame(({ gl }) => {
    const el = track.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const h = gl.domElement.clientHeight
    gl.setScissorTest(true)
    gl.setScissor(r.left, h - r.bottom, r.width, r.height)
    gl.clear(false, true, false)
    gl.setScissorTest(false)
  }, priority)
  return null
}

function PreviewRig({ product, part }) {
  const g = useRef()
  const inner = useRef()
  const cam = useThree((s) => s.camera)
  const d = useMemo(() => makeDims(product.model), [product])
  const f = partFraming(part, d, product.model)
  const yaw = useRef(0)
  useFrame((_, dt) => {
    yaw.current += Math.min(dt, 0.05) * 0.45
    if (g.current) {
      const base = f.back ? Math.PI : f.side ? -1.1 : 0
      g.current.rotation.set(f.tilt, base + Math.sin(yaw.current) * 0.7, 0)
    }
    const dist = fitDistance(f.s * 1.2, f.s * 1.2, cam.aspect, cam.fov)
    cam.position.set(0, 0, dist)
    cam.lookAt(0, 0, 0)
  })
  return (
    <group ref={g}>
      <group ref={inner} position={[-f.c[0], -f.c[1], -f.c[2]]}>
        <WatchModel key={part} product={product} quality="high" time="pose" parts={[part]} />
      </group>
    </group>
  )
}

export default function PartPreview({ product, part, className }) {
  const track = useRef(null)
  return (
    <View className={className} index={3} ref={track} role="img" aria-label={`Close-up of the ${part}`}>
      <DepthClear track={track} priority={2} />
      <PerspectiveCamera makeDefault fov={26} position={[0, 0, 12]} near={0.05} far={100} />
      <StudioEnv />
      <StudioLights />
      <PreviewRig product={product} part={part} />
    </View>
  )
}
