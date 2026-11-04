import * as THREE from 'three'
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { memo, clamp01, easeInOut, TAU } from '../kit'
import { makeDims, explodeConfig, LOOP_CENTER, PART_IDS } from './config'
import { watchMaterials, applyGlass } from '../materials'
import {
  buildCase,
  buildBezel,
  buildCrystal,
  buildMarkers,
  buildHands,
  buildSeconds,
  buildMovement,
  buildGears,
  buildRotor,
  buildCrown,
  buildGaskets,
  buildCaseback,
  buildBracelet,
  buildClasp,
  gearLayout,
} from './geometry'

const PartCtx = createContext(() => 0)
const HIGHLIGHT = new THREE.Color('#8A176E')
const HOVER = new THREE.Color('#A7E8D7')

/* ------------------------------------------------------------------ */
/*  Interaction: a tiny registry shared between DOM and the 3D tree    */
/* ------------------------------------------------------------------ */
export function createInteraction() {
  return {
    selected: { current: null },
    hovered: { current: null },
    parts: new Map(),
    pick: null,
  }
}

function useHighlight(ref, id, interaction) {
  const entries = useRef([])
  useEffect(() => {
    if (!interaction) return
    const g = ref.current
    const list = []
    g.traverse((o) => {
      if ((o.isMesh || o.isInstancedMesh) && o.material && !o.userData.noHighlight) {
        const orig = o.material
        const m = orig.clone()
        if (orig.userData.glass) applyGlass(m)
        m.userData.baseOpacity = orig.opacity
        m.userData.baseTransparent = orig.transparent
        m.userData.baseDepthWrite = orig.depthWrite
        m.userData.glass = orig.userData.glass
        if (m.emissive) m.userData.baseEmissive = m.emissive.clone()
        m.userData.baseEI = m.emissiveIntensity ?? 0
        o.material = m
        list.push({ o, m, orig })
      }
    })
    entries.current = list
    interaction.parts.set(id, g)
    return () => {
      list.forEach(({ o, m, orig }) => {
        o.material = orig
        m.dispose()
      })
      interaction.parts.delete(id)
      entries.current = []
    }
  }, [interaction, id, ref])

  const state = useRef({ e: 0, o: 1 })
  useFrame((st, dt) => {
    if (!interaction || !entries.current.length) return
    const sel = interaction.selected.current
    const hov = interaction.hovered.current
    const isSel = sel === id
    const tE = isSel ? 0.55 + 0.22 * Math.sin(st.clock.elapsedTime * 3.2) : hov === id ? 0.35 : 0
    const tO = sel && !isSel ? 0.14 : 1
    const s = state.current
    const a = 1 - Math.exp(-dt * 8)
    s.e += (tE - s.e) * a
    s.o += (tO - s.o) * a
    const color = isSel ? HIGHLIGHT : HOVER
    entries.current.forEach(({ m }) => {
      if (m.emissive) {
        m.emissive.copy(m.userData.baseEmissive).lerp(color, Math.min(1, s.e * 1.5))
        m.emissiveIntensity = m.userData.baseEI + s.e
      }
      const op = m.userData.baseOpacity * s.o
      m.opacity = op
      const tr = m.userData.baseTransparent || s.o < 0.995
      if (m.transparent !== tr) {
        m.transparent = tr
        m.needsUpdate = true
      }
      m.depthWrite = m.userData.glass ? false : s.o > 0.6 && m.userData.baseDepthWrite
    })
  })
}

function Part({ id, cfg, explodeRef, interaction, children }) {
  const ref = useRef()
  const delay = cfg?.delay ?? 0
  const getT = useMemo(
    () => () => {
      const e = explodeRef ? explodeRef.current : 0
      return easeInOut(clamp01((e - delay) / 0.5))
    },
    [explodeRef, delay],
  )
  useFrame(() => {
    if (!cfg?.off || !ref.current) return
    const t = getT()
    ref.current.position.set(cfg.off[0] * t, cfg.off[1] * t, cfg.off[2] * t)
  })
  useHighlight(ref, id, interaction)
  return (
    <group ref={ref} userData={{ part: id }}>
      <PartCtx.Provider value={getT}>{children}</PartCtx.Provider>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */
function CasePart({ P }) {
  const { d, m, mats, gk, seg } = P
  const g = useMemo(() => memo(`${gk}:case`, () => buildCase(d, m, seg)), [gk, d, m, seg])
  return (
    <group>
      <mesh geometry={g.middle} material={mats.case} />
      {g.lug &&
        [0, Math.PI].map((rz) => (
          <group key={rz} rotation-z={rz}>
            <mesh geometry={g.lug} material={mats.case} position-x={g.lugX} />
            <mesh geometry={g.lug} material={mats.case} position-x={-g.lugX} />
          </group>
        ))}
      {g.integrated && [0, Math.PI].map((rz) => <mesh key={rz} geometry={g.integrated} material={mats.case} rotation-z={rz} />)}
      {g.guards && <mesh geometry={g.guards} material={mats.case} />}
    </group>
  )
}

function BezelPart({ P }) {
  const { d, m, mats, gk, seg } = P
  const g = useMemo(() => memo(`${gk}:bezel`, () => buildBezel(d, m, seg)), [gk, d, m, seg])
  const knurlRef = useRef()
  useLayoutEffect(() => {
    const inst = knurlRef.current
    if (!inst) return
    const o = new THREE.Object3D()
    for (let i = 0; i < g.knurlCount; i++) {
      const a = (i / g.knurlCount) * TAU
      o.position.set(Math.cos(a) * d.R * 0.995, Math.sin(a) * d.R * 0.995, d.T * 0.255)
      o.rotation.set(0, 0, a + Math.PI / 2)
      o.updateMatrix()
      inst.setMatrixAt(i, o.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  }, [g, d])
  const ringMat = m.metal === 'ceramic' ? mats.case : mats.case
  return (
    <group>
      <mesh geometry={g.ring} material={ringMat} />
      {g.insert && <mesh geometry={g.insert} material={mats.insert} />}
      {g.knurl && <instancedMesh ref={knurlRef} args={[g.knurl, mats.caseBrushed, g.knurlCount]} />}
      {g.pip && <mesh geometry={g.pip} material={mats.lume} position={[0, d.R * 0.89, d.T * 0.33]} />}
    </group>
  )
}

function CrystalPart({ P }) {
  const { d, mats, gk, seg } = P
  const g = useMemo(() => memo(`${gk}:crystal`, () => buildCrystal(d, seg)), [gk, d, seg])
  return <mesh geometry={g} material={mats.crystal} renderOrder={10} />
}

function DialPart({ P }) {
  const { d, mats, gk, seg } = P
  const g = useMemo(() => memo(`${gk}:dial`, () => new THREE.CircleGeometry(d.Rd, seg)), [gk, d, seg])
  return <mesh geometry={g} material={mats.dial} position-z={d.z.dial} />
}

function MarkersPart({ P }) {
  const { d, m, mats, gk } = P
  const g = useMemo(() => memo(`${gk}:markers`, () => buildMarkers(d, m)), [gk, d, m])
  const metalMat = mats.hands.metalness > 0.5 ? mats.hands : mats.trim
  return (
    <group>
      {g.items.map((it, i) => (
        <group key={i} position={it.pos} rotation-z={it.rot}>
          <mesh geometry={g[it.geo]} material={metalMat} />
          {it.lume && g[it.lume] && <mesh geometry={g[it.lume]} material={mats.lume} position-z={0.012 * d.k} />}
        </group>
      ))}
    </group>
  )
}

function handAngles(time) {
  const now = new Date()
  let h
  let mi
  let s
  if (time === 'pose') {
    h = 10
    mi = 9
    s = now.getSeconds() + now.getMilliseconds() / 1000
  } else {
    h = now.getHours() % 12
    mi = now.getMinutes()
    s = now.getSeconds() + now.getMilliseconds() / 1000
  }
  const beat = Math.floor(s * 8) / 8
  return {
    hour: ((h + mi / 60 + s / 3600) / 12) * TAU,
    minute: ((mi + s / 60) / 60) * TAU,
    second: (beat / 60) * TAU,
  }
}

function HandsPart({ P }) {
  const { d, m, mats, gk, time } = P
  const g = useMemo(() => memo(`${gk}:hands`, () => buildHands(d, m)), [gk, d, m])
  const hRef = useRef()
  const mRef = useRef()
  const z = d.z.dial
  const k = d.k
  useFrame(() => {
    const a = handAngles(time)
    if (hRef.current) hRef.current.rotation.z = -a.hour
    if (mRef.current) mRef.current.rotation.z = -a.minute
  })
  const c = m.complications || {}
  const subs = c.chrono
    ? [
        [0.42 * d.Rd, 0, 0.3],
        [0, -0.42 * d.Rd, -0.9],
      ]
    : []
  return (
    <group>
      <mesh geometry={g.pivot} material={mats.hands} position-z={z + 0.04 * k} />
      <group ref={hRef} position-z={z + 0.058 * k}>
        <mesh geometry={g.hour} material={mats.hands} />
        {g.hourLume && <mesh geometry={g.hourLume} material={mats.lume} position-z={0.0095 * k} />}
      </group>
      <group ref={mRef} position-z={z + 0.082 * k}>
        <mesh geometry={g.minute} material={mats.hands} />
        {g.minLume && <mesh geometry={g.minLume} material={mats.lume} position-z={0.0095 * k} />}
      </group>
      {subs.map(([x, y, rot], i) => (
        <mesh key={i} geometry={g.sub} material={mats.seconds} position={[x, y, z + 0.012 * k]} rotation-z={rot} />
      ))}
    </group>
  )
}

function SecondsPart({ P }) {
  const { d, m, mats, gk, time } = P
  const g = useMemo(() => memo(`${gk}:seconds`, () => buildSeconds(d, m)), [gk, d, m])
  const ref = useRef()
  const runRef = useRef()
  const z = d.z.dial
  const k = d.k
  useFrame(() => {
    const a = handAngles(time)
    if (ref.current) ref.current.rotation.z = -a.second
    if (runRef.current) runRef.current.rotation.z = -a.second
  })
  if (g.sub) {
    return (
      <group position={[g.sub[0], g.sub[1], z + 0.012 * k]}>
        <group ref={ref}>
          <mesh geometry={g.needle} material={mats.seconds} />
        </group>
        <mesh geometry={g.cap} material={mats.seconds} position-z={0.008 * k} />
      </group>
    )
  }
  return (
    <group>
      <group ref={ref} position-z={z + 0.104 * k}>
        <mesh geometry={g.needle} material={mats.seconds} />
      </group>
      <mesh geometry={g.cap} material={mats.seconds} position-z={z + 0.116 * k} />
      {g.running && (
        <group ref={runRef} position={[-0.42 * d.Rd, 0, z + 0.012 * k]}>
          <mesh geometry={g.running} material={mats.seconds} />
        </group>
      )}
    </group>
  )
}

function Instances({ geo, material, points, z, rotate = 0 }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const inst = ref.current
    if (!inst) return
    const o = new THREE.Object3D()
    points.forEach((p, i) => {
      o.position.set(p[0], p[1], p[2] ?? z)
      o.rotation.set(0, 0, rotate * i)
      o.updateMatrix()
      inst.setMatrixAt(i, o.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }, [points, z, rotate])
  return <instancedMesh ref={ref} args={[geo, material, points.length]} />
}

function MovementPart({ P }) {
  const { d, m, mats, gk, animate } = P
  const g = useMemo(() => memo(`${gk}:movement`, () => buildMovement(d, m)), [gk, d, m])
  const balRef = useRef()
  const springRef = useRef()
  const ratchetRef = useRef()
  const cageRef = useRef()
  const tbBalRef = useRef()
  const L = useMemo(() => gearLayout(d), [d])
  useFrame((st) => {
    if (!animate) return
    const t = st.clock.elapsedTime
    const osc = Math.sin(t * TAU * 2.5)
    if (balRef.current) balRef.current.rotation.z = osc * 2.3
    if (springRef.current) springRef.current.scale.setScalar(1 + osc * 0.05)
    if (ratchetRef.current) ratchetRef.current.rotation.z = t * 0.06
    if (cageRef.current) cageRef.current.rotation.z = (-t * TAU) / 12
    if (tbBalRef.current) tbBalRef.current.rotation.z = osc * 2.2
  })
  const k = d.k
  return (
    <group>
      <mesh geometry={g.plate} material={mats.plate} />
      <mesh geometry={g.bridges} material={mats.bridge} />
      <Instances geo={g.jewel} material={mats.jewel} points={g.jewelPts} z={g.jewelZ} />
      <Instances geo={g.screw} material={mats.screw} points={g.screwPts} z={g.jewelZ} />
      <group position={[L.barrel.p[0], L.barrel.p[1], g.ratchetZ]}>
        <mesh ref={ratchetRef} geometry={g.ratchet} material={mats.steelPolished} />
      </group>
      {g.balance && (
        <group position={[g.balance.p[0], g.balance.p[1], g.balance.z]}>
          <group ref={balRef}>
            <mesh geometry={g.balance.rim} material={mats.gold} />
            <mesh geometry={g.balance.bar} material={mats.gold} />
            <mesh geometry={g.balance.bar} material={mats.gold} rotation-z={Math.PI / 2} />
          </group>
          <mesh geometry={g.balance.staff} material={mats.steelPolished} />
          <mesh ref={springRef} geometry={g.balance.spring} material={mats.steelPolished} position-z={-0.03 * k} userData={{ noPick: true }} />
        </group>
      )}
      {g.tourbillon && (
        <group position={[g.tourbillon.p[0], g.tourbillon.p[1], g.tourbillon.z]}>
          <group ref={cageRef}>
            <mesh geometry={g.tourbillon.ring} material={mats.trim} />
            {[0, 1, 2].map((i) => (
              <group key={i} rotation-z={(i / 3) * TAU}>
                <mesh geometry={g.tourbillon.arm} material={mats.trim} position-y={g.tourbillon.arm.parameters.height / 2} />
              </group>
            ))}
            <group ref={tbBalRef} position-z={0.02 * k}>
              <mesh geometry={g.tourbillon.bal} material={mats.gold} />
              <mesh geometry={g.tourbillon.balBar} material={mats.gold} />
            </group>
            <mesh geometry={g.tourbillon.spring} material={mats.steelPolished} position-z={0.035 * k} />
            <mesh geometry={g.jewel} material={mats.jewel} position-z={0.04 * k} />
          </group>
        </group>
      )}
    </group>
  )
}

function GearsPart({ P }) {
  const { d, mats, gk, animate } = P
  const g = useMemo(() => memo(`${gk}:gears`, () => buildGears(d)), [gk, d])
  const refs = useRef([])
  useFrame((st) => {
    if (!animate) return
    const t = st.clock.elapsedTime
    g.gears.forEach((gr, i) => {
      const r = refs.current[i]
      if (r) r.rotation.z = t * gr.w * 0.8
    })
  })
  const z = d.z.gears
  const k = d.k
  const jewelPts = useMemo(() => g.gears.map((gr) => [gr.p[0], gr.p[1], z + 0.03 * k]), [g, z, k])
  return (
    <group>
      {g.gears.map((gr, i) => (
        <group key={gr.id} position={[gr.p[0], gr.p[1], z]} ref={(el) => (refs.current[i] = el)}>
          <mesh geometry={gr.geo} material={mats.gold} />
          <mesh geometry={g.pinion} material={mats.steelPolished} position-z={-0.03 * k} />
        </group>
      ))}
      <Instances geo={g.jewel} material={mats.jewel} points={jewelPts} />
    </group>
  )
}

function RotorPart({ P }) {
  const { d, mats, gk, animate } = P
  const g = useMemo(() => memo(`${gk}:rotor`, () => buildRotor(d)), [gk, d])
  const ref = useRef()
  useFrame((st) => {
    if (!animate || !ref.current) return
    const t = st.clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * 0.7) * 1.5 + t * 0.3
  })
  const k = d.k
  return (
    <group position-z={d.z.rotor}>
      <group ref={ref}>
        <mesh geometry={g.plate} material={mats.rotor} />
        <mesh geometry={g.rim} material={mats.gold} position-z={-0.012 * k} />
      </group>
      <mesh geometry={g.hub} material={mats.gold} />
      <mesh geometry={g.jewel} material={mats.jewel} />
    </group>
  )
}

function CrownPart({ P }) {
  const { d, m, mats, gk } = P
  const g = useMemo(() => memo(`${gk}:crown`, () => buildCrown(d, m)), [gk, d, m])
  const metalMat = m.metal === 'ceramic' ? mats.trim : mats.case
  return (
    <group>
      <mesh geometry={g.tube} material={mats.steelPolished} />
      <mesh geometry={g.crown} material={metalMat} />
      <mesh geometry={g.cap} material={mats.trim} />
      {g.pusher &&
        g.pusherAngles.map((a) => (
          <group key={a} rotation-z={a}>
            <group position={[g.pusherR, 0, d.z.crown]}>
              <mesh geometry={g.pusher} material={metalMat} />
              <mesh geometry={g.pusherCap} material={metalMat} />
            </group>
          </group>
        ))}
    </group>
  )
}

function GasketsPart({ P }) {
  const { d, mats, gk } = P
  const getT = useContext(PartCtx)
  const g = useMemo(() => memo(`${gk}:gaskets`, () => buildGaskets(d)), [gk, d])
  const refs = useRef({})
  useFrame(() => {
    const t = getT()
    ;['front', 'back', 'crown'].forEach((id) => {
      const r = refs.current[id]
      if (!r) return
      const o = g[id].off
      r.position.set(o[0] * t, o[1] * t, o[2] * t)
    })
  })
  return (
    <group>
      <group ref={(el) => (refs.current.front = el)}>
        <mesh geometry={g.front.geo} material={mats.gasket} position-z={g.front.z} />
      </group>
      <group ref={(el) => (refs.current.back = el)}>
        <mesh geometry={g.back.geo} material={mats.gasket} position-z={g.back.z} />
      </group>
      <group ref={(el) => (refs.current.crown = el)}>
        <mesh geometry={g.crown.geo} material={mats.gasket} position={g.crown.pos} />
      </group>
    </group>
  )
}

function CasebackPart({ P }) {
  const { d, mats, gk, seg } = P
  const g = useMemo(() => memo(`${gk}:caseback`, () => buildCaseback(d, seg)), [gk, d, seg])
  return (
    <group>
      <mesh geometry={g.ring} material={mats.case} />
      <mesh geometry={g.engr} material={mats.caseback} />
      <mesh geometry={g.bead} material={mats.trim} />
      <mesh geometry={g.glass} material={mats.crystal} renderOrder={10} />
    </group>
  )
}

function BraceletPart({ P }) {
  const { d, m, gk } = P
  const br = useMemo(() => memo(`${gk}:bracelet`, () => buildBracelet(d, m)), [gk, d, m])
  return br.type === 'bracelet' ? <Links P={P} br={br} /> : <Strap P={P} br={br} />
}

function Links({ P, br }) {
  const { d, mats } = P
  const getT = useContext(PartCtx)
  const outerRef = useRef()
  const centerRef = useRef()
  const last = useRef(-1)
  const C = useMemo(() => LOOP_CENTER(d), [d])
  useFrame(() => {
    const t = getT()
    if (Math.abs(t - last.current) < 1e-4) return
    last.current = t
    const tmp = new THREE.Vector3()
    const T = new THREE.Matrix4()
    const apply = (inst, list) => {
      if (!inst) return
      list.forEach(({ M, c }, i) => {
        tmp.copy(c).sub(C).multiplyScalar(1 + 0.42 * t).add(C)
        tmp.y += Math.sign(c.y) * 0.95 * d.k * t
        tmp.sub(c)
        T.makeTranslation(tmp.x, tmp.y, tmp.z).multiply(M)
        inst.setMatrixAt(i, T)
      })
      inst.instanceMatrix.needsUpdate = true
    }
    apply(outerRef.current, br.base.outer)
    apply(centerRef.current, br.base.center)
  })
  return (
    <group>
      <instancedMesh ref={outerRef} args={[br.outerGeo, mats.caseBrushed, br.base.outer.length]} frustumCulled={false} />
      <instancedMesh ref={centerRef} args={[br.centerGeo, mats.case, br.base.center.length]} frustumCulled={false} />
    </group>
  )
}

function Strap({ P, br }) {
  const { d, mats } = P
  const getT = useContext(PartCtx)
  const up = useRef()
  const lo = useRef()
  const C = useMemo(() => LOOP_CENTER(d), [d])
  useFrame(() => {
    const t = getT()
    const s = 1 + 0.25 * t
    ;[
      [up.current, 1],
      [lo.current, -1],
    ].forEach(([g, sg]) => {
      if (!g) return
      g.scale.setScalar(s)
      g.position.set(C.x * (1 - s), C.y * (1 - s) + sg * 1.3 * d.k * t, C.z * (1 - s))
    })
  })
  return (
    <group>
      <group ref={up}>
        <mesh geometry={br.upper} material={mats.strap} />
      </group>
      <group ref={lo}>
        <mesh geometry={br.lower} material={mats.strap} position-z={0} />
      </group>
    </group>
  )
}

function ClaspPart({ P }) {
  const { d, m, mats, gk } = P
  const br = useMemo(() => memo(`${gk}:bracelet`, () => buildBracelet(d, m)), [gk, d, m])
  const g = useMemo(() => memo(`${gk}:clasp`, () => buildClasp(d, br)), [gk, d, br])
  if (g.frame) {
    return (
      <group>
        <mesh geometry={g.frame} material={mats.trim} />
        <mesh geometry={g.tang} material={mats.trim} />
      </group>
    )
  }
  return (
    <group>
      <mesh geometry={g.body} material={mats.case} />
      <mesh geometry={g.plate} material={mats.trimBrushed} />
      {g.btns.map((b, i) => (
        <mesh key={i} geometry={b} material={mats.case} />
      ))}
    </group>
  )
}

const PARTS = {
  case: CasePart,
  bezel: BezelPart,
  crystal: CrystalPart,
  dial: DialPart,
  markers: MarkersPart,
  hands: HandsPart,
  seconds: SecondsPart,
  movement: MovementPart,
  gears: GearsPart,
  rotor: RotorPart,
  crown: CrownPart,
  gaskets: GasketsPart,
  caseback: CasebackPart,
  bracelet: BraceletPart,
  clasp: ClaspPart,
}

/* ------------------------------------------------------------------ */
/*  The watch                                                          */
/* ------------------------------------------------------------------ */
export function WatchModel({ product, quality = 'high', explodeRef, interaction, parts = PART_IDS, time = 'live', animate = true, hidden }) {
  const d = useMemo(() => makeDims(product.model), [product])
  const mats = useMemo(() => watchMaterials(product, quality), [product, quality])
  const cfg = useMemo(() => explodeConfig(d), [d])
  const P = useMemo(
    () => ({ d, m: product.model, mats, gk: `${product.id}:${quality}`, seg: quality === 'high' ? 128 : 72, time, animate, product }),
    [d, product, mats, quality, time, animate],
  )
  return (
    <group>
      {parts.map((id) => {
        const C = PARTS[id]
        if (!C) return null
        return (
          <group key={id} visible={!hidden || !hidden.includes(id)}>
            <Part id={id} cfg={cfg[id]} explodeRef={explodeRef} interaction={interaction}>
              <C P={P} />
            </Part>
          </group>
        )
      })}
    </group>
  )
}

export { makeDims }
