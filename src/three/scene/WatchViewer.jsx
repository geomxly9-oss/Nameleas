import * as THREE from 'three'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { View, PerspectiveCamera } from '@react-three/drei'
import { WatchModel } from '../watch/Watch'
import { StudioEnv, StudioLights } from './Scene3D'

const FOV = 26

export function fitDistance(h, w, aspect, fov = FOV) {
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2))
  return Math.max(h / (2 * t), w / (2 * t * aspect))
}

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a))

/* Mutable control state shared between DOM handlers and the render loop */
export function makeControls(o = {}) {
  return {
    yaw: o.yaw ?? -0.55,
    pitch: o.pitch ?? 0.16,
    vel: 0,
    autoRotate: o.autoRotate ?? 0.3,
    dragging: false,
    targetYaw: null,
    targetPitch: null,
    zoom: 1,
    targetZoom: 1,
    tiltX: 0,
    tiltY: 0,
    pan: [0, 0],
  }
}

function Rig({ ctl, fit, children }) {
  const group = useRef()
  const cam = useThree((s) => s.camera)
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const c = ctl.current
    const a = 1 - Math.exp(-dt * 5)
    if (!c.dragging) {
      if (c.targetYaw != null) {
        const diff = wrapAngle(c.targetYaw - c.yaw)
        c.yaw += diff * a
        if (Math.abs(diff) < 0.002) c.targetYaw = null
      } else {
        c.yaw += c.vel * dt + c.autoRotate * dt
        c.vel *= Math.exp(-dt * 2.8)
      }
      if (c.targetPitch != null) {
        c.pitch += (c.targetPitch - c.pitch) * a
        if (Math.abs(c.targetPitch - c.pitch) < 0.002) c.targetPitch = null
      }
    }
    c.zoom += (c.targetZoom - c.zoom) * a
    const g = group.current
    if (g) {
      g.rotation.x += (c.pitch + c.tiltY * 0.16 - g.rotation.x) * (c.dragging ? 1 : a * 1.6)
      g.rotation.y = c.yaw + c.tiltX * 0.22
    }
    const dist = fitDistance(fit[0], fit[1], cam.aspect, cam.fov) / c.zoom
    cam.position.z += (dist - cam.position.z) * (1 - Math.exp(-dt * 6))
    cam.position.x = c.pan[0]
    cam.position.y = c.pan[1]
    cam.lookAt(c.pan[0], c.pan[1], 0)
  })
  return <group ref={group}>{children}</group>
}

function Picker({ interaction, ctl }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    if (!interaction) return
    const ray = new THREE.Raycaster()
    interaction.pick = (nx, ny) => {
      ray.setFromCamera({ x: nx, y: ny }, camera)
      const objs = [...interaction.parts.values()].filter((o) => o.visible !== false)
      const hits = ray.intersectObjects(objs, true)
      for (const h of hits) {
        let o = h.object
        if (o.userData.noPick) continue
        if (o.material && o.material.opacity < 0.3) continue
        while (o && !o.userData.part) o = o.parent
        if (o) return o.userData.part
      }
      return null
    }
    return () => {
      interaction.pick = null
    }
  }, [interaction, camera, ctl])
  return null
}

/*
 * A DOM-tracked 3D viewport with drag-to-rotate, inertia and optional part picking.
 */
const WatchViewer = forwardRef(function WatchViewer(
  {
    product,
    className = '',
    style,
    quality = 'card',
    time = 'pose',
    initial,
    fit = [7.6, 5.8],
    interaction,
    explodeRef,
    parts,
    hidden,
    onPick,
    onHover,
    draggable = true,
    rim,
    envIntensity = 1,
    children,
    index = 1,
    yOffset = 0,
    ...rest
  },
  ref,
) {
  const ctl = useRef(null)
  if (!ctl.current) ctl.current = makeControls(initial)
  useImperativeHandle(ref, () => ctl.current, [])
  const drag = useRef({ x: 0, y: 0, sx: 0, sy: 0, t: 0, id: null })
  const [grab, setGrab] = useState(false)

  const ndc = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]
  }

  const onPointerDown = (e) => {
    if (!draggable) return
    if (e.button !== undefined && e.button !== 0) return
    const c = ctl.current
    c.dragging = true
    c.vel = 0
    c.targetYaw = null
    drag.current = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), id: e.pointerId }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    setGrab(true)
  }
  const onPointerMove = (e) => {
    const c = ctl.current
    const dr = drag.current
    if (c.dragging && dr.id === e.pointerId) {
      const now = performance.now()
      const dx = e.clientX - dr.x
      const dy = e.clientY - dr.y
      const dt = Math.max(1, now - dr.t) / 1000
      c.yaw += dx * 0.009
      if (e.pointerType !== 'touch') c.pitch = THREE.MathUtils.clamp(c.pitch + dy * 0.005, -0.9, 1.1)
      c.vel = THREE.MathUtils.clamp((dx * 0.009) / dt, -9, 9)
      dr.x = e.clientX
      dr.y = e.clientY
      dr.t = now
    } else if (interaction?.pick && onHover && e.pointerType !== 'touch') {
      const [nx, ny] = ndc(e)
      onHover(interaction.pick(nx, ny))
    }
  }
  const end = (e) => {
    const c = ctl.current
    if (!c.dragging) return
    c.dragging = false
    setGrab(false)
    const dr = drag.current
    const moved = Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy)
    if (moved < 6 && interaction?.pick && onPick) {
      c.vel = 0
      const [nx, ny] = ndc(e)
      onPick(interaction.pick(nx, ny))
    }
  }

  return (
    <View
      className={`watch-view ${grab ? 'is-grabbing' : ''} ${className}`}
      style={style}
      index={index}
      data-cursor={draggable ? 'drag' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={() => onHover && onHover(null)}
      {...rest}
    >
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, 18]} near={0.5} far={200} />
      <StudioEnv intensity={envIntensity} />
      <StudioLights rim={rim} />
      <Picker interaction={interaction} ctl={ctl} />
      <Rig ctl={ctl} fit={fit}>
        <group position-y={yOffset}>
          <WatchModel product={product} quality={quality} time={time} interaction={interaction} explodeRef={explodeRef} parts={parts} hidden={hidden} />
        </group>
      </Rig>
      {children}
    </View>
  )
})

export default WatchViewer
