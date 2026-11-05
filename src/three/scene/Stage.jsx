import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { View, PerspectiveCamera } from '@react-three/drei'
import { WatchModel, createInteraction } from '../watch/Watch'
import { makeDims } from '../watch/config'
import { StudioEnv, StudioLights } from './Scene3D'
import { clamp01, easeInOut, easeOut, lerp, seg } from '../kit'

const FOV = 26
const D = 20

/* Shared, mutable stage state written by ScrollTriggers and DOM handlers */
export const stage = {
  intro: 0,
  p: { featured: 0, craftEntry: 0, craft: 0, compEntry: 0, comp: 0, exit: 0 },
  assemble: 0,
  userYaw: 0,
  userPitch: 0,
  userVel: 0,
  dragging: false,
  dark: 0,
  explode: { current: 0 },
  interaction: createInteraction(),
  anchors: {},
}

const KEYS = ['x', 'y', 'z', 'rx', 'ry', 's', 'px', 'py', 'pz']
const mix = (a, b, t) => {
  const o = {}
  for (const k of KEYS) o[k] = lerp(a[k], b[k], t)
  return o
}

function Particles() {
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const n = 360
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1))
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#8A176E') },
        uOpacity: { value: 0.5 },
        uScale: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute float seed;
        uniform float uTime;
        uniform float uScale;
        varying float vA;
        void main() {
          vec3 p = position;
          float t = uTime * (0.08 + seed * 0.1);
          p.y = mod(p.y + t * 3.0 + 7.0, 14.0) - 7.0;
          p.x += sin(uTime * 0.3 + seed * 30.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float size = mix(1.5, 5.5, seed * seed);
          gl_PointSize = size * uScale * (20.0 / -mv.z);
          vA = 0.35 + 0.65 * fract(seed * 7.13);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor * a * uOpacity * vA, a * uOpacity * vA);
        }`,
    })
    m.blending = THREE.CustomBlending
    m.blendSrc = THREE.OneFactor
    m.blendDst = THREE.OneMinusSrcAlphaFactor
    m.blendSrcAlpha = THREE.OneFactor
    m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor
    return { geo: g, mat: m }
  }, [])
  const light = useMemo(() => new THREE.Color('#8A176E'), [])
  const dark = useMemo(() => new THREE.Color('#C6F0E4'), [])
  const gl = useThree((s) => s.gl)
  useFrame((st) => {
    mat.uniforms.uTime.value = st.clock.elapsedTime
    mat.uniforms.uColor.value.copy(light).lerp(dark, stage.dark)
    mat.uniforms.uScale.value = gl.getPixelRatio()
    const vis = (1 - stage.p.exit) * (0.35 + 0.45 * stage.dark) * clamp01(stage.intro * 1.5)
    mat.uniforms.uOpacity.value = vis
    if (ref.current) ref.current.visible = vis > 0.005
  })
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

function StagePicker() {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    const it = stage.interaction
    const ray = new THREE.Raycaster()
    it.pick = (nx, ny) => {
      ray.setFromCamera({ x: nx, y: ny }, camera)
      const hits = ray.intersectObjects([...it.parts.values()], true)
      for (const h of hits) {
        let o = h.object
        if (o.userData.noPick) continue
        while (o && !o.userData.part) o = o.parent
        if (o) return o.userData.part
      }
      return null
    }
    return () => {
      it.pick = null
    }
  }, [camera])
  return null
}

function Rig({ product }) {
  const outer = useRef()
  const pivot = useRef()
  const cam = useThree((s) => s.camera)
  const d = useMemo(() => makeDims(product.model), [product])
  const spin = useRef(-0.55)
  const anchor = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const P = stage.p
    const aspect = cam.aspect
    const H0 = 2 * D * Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const W0 = H0 * aspect
    const portrait = aspect < 0.85
    const fit = (frac, h) => (frac * Math.min(H0, W0 * (portrait ? 1.45 : 1.25))) / h

    // continuous turntable while resting on the hero
    const spinW = 1 - seg(P.featured, 0, 0.06)
    spin.current += dt * 0.34 * spinW

    // user drag on the exploded view (with inertia)
    if (!stage.dragging) {
      stage.userYaw += stage.userVel * dt
      stage.userVel *= Math.exp(-dt * 2.6)
    }
    if (P.compEntry < 0.3 && P.comp === 0) {
      stage.userYaw *= 0.9
      stage.userPitch *= 0.9
    }

    const heroS = fit(portrait ? 0.5 : 0.62, 7.0)
    const hero = { x: 0, y: portrait ? 0.07 * H0 : 0.012 * H0, z: 0, rx: 0.12, ry: spin.current, s: heroS, px: 0, py: 0, pz: 0 }
    const featured = {
      x: portrait ? 0 : 0.2 * W0,
      y: portrait ? 0.2 * H0 : -0.01 * H0,
      z: 0,
      rx: 0.18,
      ry: -0.62 + 0.4 * P.featured,
      s: portrait ? fit(0.42, 7) : fit(0.74, 7),
      px: 0,
      py: 0,
      pz: 0,
    }
    const dialS = (portrait ? Math.min(0.72 * W0, 0.3 * H0) : 0.72 * H0) / (2 * d.Rd)
    const craft1 = { x: portrait ? 0 : 0.2 * W0, y: portrait ? 0.31 * H0 : 0, z: 0, rx: 0.05, ry: -0.2 + 0.25 * seg(P.craft, 0, 0.28), s: dialS, px: 0, py: 0, pz: 0 }
    const craft2 = {
      x: portrait ? 0 : 0.2 * W0,
      y: portrait ? 0.27 * H0 : 0,
      z: 0,
      rx: 0.16,
      ry: -1.22 + 0.2 * seg(P.craft, 0.4, 0.62),
      s: heroS * (portrait ? 1.25 : 1.85),
      px: d.R * 0.75,
      py: 0,
      pz: 0,
    }
    const craft3 = {
      x: portrait ? 0 : 0.19 * W0,
      y: portrait ? 0.25 * H0 : -0.02 * H0,
      z: 0,
      rx: 0.38,
      ry: 2.45 + 0.25 * seg(P.craft, 0.75, 1),
      s: heroS * (portrait ? 1.05 : 1.45),
      px: 0,
      py: 0,
      pz: -3.1 * d.k,
    }
    const compS = portrait ? (0.45 * H0) / 11 : fit(0.78, 12.2)
    const comp = {
      x: portrait ? 0 : -0.1 * W0,
      y: portrait ? 0.03 * H0 : -0.1 * H0,
      z: 0,
      rx: (portrait ? 1.0 : 0.3) + stage.userPitch,
      ry: (portrait ? -0.3 : -0.82) + 0.5 * P.comp + stage.userYaw,
      s: compS,
      px: 0,
      py: 0,
      pz: -0.2,
    }
    const exit = { ...comp, y: comp.y + 1.25 * H0 }

    let pose = hero
    pose = mix(pose, featured, easeInOut(P.featured))
    pose = mix(pose, craft1, easeInOut(P.craftEntry))
    pose = mix(pose, craft2, easeInOut(seg(P.craft, 0.28, 0.46)))
    pose = mix(pose, craft3, easeInOut(seg(P.craft, 0.62, 0.8)))
    pose = mix(pose, comp, easeInOut(P.compEntry))
    pose = mix(pose, exit, easeInOut(P.exit))

    // intro: rise and turn into place
    const it = easeOut(clamp01(stage.intro))
    const g = outer.current
    if (!g) return
    g.position.set(pose.x, pose.y - (1 - it) * 0.12 * H0, pose.z)
    g.rotation.set(pose.rx, pose.ry - (1 - it) * 1.6, 0)
    g.scale.setScalar(pose.s * lerp(0.82, 1, it))
    g.visible = P.exit < 0.999
    pivot.current.position.set(-pose.px, -pose.py, -pose.pz)

    stage.explode.current = seg(P.comp, 0.06, 0.58) * (1 - stage.assemble)

    // screen anchor of the dial centre, used by DOM callouts
    anchor.set(0, 0, d.z.dial)
    pivot.current.localToWorld(anchor)
    anchor.project(cam)
    stage.anchors.dial = [anchor.x, anchor.y]
  })

  return (
    <group ref={outer}>
      <group ref={pivot}>
        <WatchModel product={product} quality="high" time="live" explodeRef={stage.explode} interaction={stage.interaction} />
      </group>
    </group>
  )
}

export default function StageView({ product }) {
  return (
    <View className="stage-view" index={1}>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, D]} near={0.5} far={120} />
      <StudioEnv />
      <StudioLights />
      <StagePicker />
      <Particles />
      <Rig product={product} />
    </View>
  )
}
