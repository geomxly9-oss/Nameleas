import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/*  Shared caches                                                      */
/* ------------------------------------------------------------------ */
const cache = new Map()
export function memo(key, factory) {
  if (!cache.has(key)) cache.set(key, factory())
  return cache.get(key)
}

/* ------------------------------------------------------------------ */
/*  Small math helpers                                                 */
/* ------------------------------------------------------------------ */
export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const seg = (v, a, b) => clamp01((v - a) / (b - a))
export const TAU = Math.PI * 2

export function mixHex(a, b, t) {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return '#' + ca.lerp(cb, t).getHexString()
}

export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/*  Surface of revolution around the Z axis with crisp creases.        */
/*  profile: [[r, z], ...] traversed counter-clockwise in (r,z) space   */
/*  so normals face outward.                                           */
/* ------------------------------------------------------------------ */
export function latheZ(profile, segments = 96, crease = 0.5) {
  const n = profile.length
  const segN = []
  const segLen = []
  for (let i = 0; i < n - 1; i++) {
    const [r0, z0] = profile[i]
    const [r1, z1] = profile[i + 1]
    const dr = r1 - r0
    const dz = z1 - z0
    const len = Math.hypot(dr, dz) || 1e-6
    segN.push([dz / len, -dr / len])
    segLen.push(len)
  }
  const total = segLen.reduce((a, b) => a + b, 0)
  const angleBetween = (a, b) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1])))
  const vertNormal = (i, segIndex) => {
    // normal for profile vertex i when used by segment segIndex
    const own = segN[segIndex]
    const otherIndex = i === segIndex ? segIndex - 1 : segIndex + 1
    const other = segN[otherIndex]
    if (!other) return own
    if (angleBetween(own, other) > crease) return own
    const x = own[0] + other[0]
    const y = own[1] + other[1]
    const l = Math.hypot(x, y) || 1
    return [x / l, y / l]
  }

  const pos = []
  const nor = []
  const uv = []
  const idx = []
  let vAcc = 0
  for (let s = 0; s < n - 1; s++) {
    const rows = [s, s + 1]
    const base = pos.length / 3
    rows.forEach((pi, rowIdx) => {
      const [r, z] = profile[pi]
      const [nr, nz] = vertNormal(pi, s)
      const v = (vAcc + (rowIdx ? segLen[s] : 0)) / total
      for (let j = 0; j <= segments; j++) {
        const th = (j / segments) * TAU
        const c = Math.cos(th)
        const sn = Math.sin(th)
        pos.push(r * c, r * sn, z)
        nor.push(nr * c, nr * sn, nz)
        uv.push(j / segments, v)
      }
    })
    vAcc += segLen[s]
    const row = segments + 1
    for (let j = 0; j < segments; j++) {
      const a0 = base + j
      const a1 = base + j + 1
      const b0 = base + row + j
      const b1 = base + row + j + 1
      idx.push(a0, a1, b1, a0, b1, b0)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/* ------------------------------------------------------------------ */
/*  Planar UV remap (x,y) -> [0,1] for a disc of radius `radius`       */
/* ------------------------------------------------------------------ */
export function planarUV(geometry, radius, cx = 0, cy = 0) {
  const p = geometry.attributes.position
  const uv = new Float32Array(p.count * 2)
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = (p.getX(i) - cx) / (2 * radius) + 0.5
    uv[i * 2 + 1] = (p.getY(i) - cy) / (2 * radius) + 0.5
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geometry
}

export function extrude(shapes, depth, { bevel = 0, curveSegments = 12, bevelSegments = 2 } = {}) {
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth,
    curveSegments,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

/* ------------------------------------------------------------------ */
/*  Gear outline                                                       */
/* ------------------------------------------------------------------ */
export function gearShape({ teeth, r, tooth = 0.035, axle = 0.03, spokes = 5, rim = 0.05, hub = 0.08, pointed = false, spokeWidth = 0.035 }) {
  const s = new THREE.Shape()
  const root = r - tooth
  const step = TAU / teeth
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step
    const pts = pointed
      ? [
          [root, a0],
          [r, a0 + step * 0.62],
          [root, a0 + step * 0.72],
        ]
      : [
          [root, a0],
          [r, a0 + step * 0.16],
          [r, a0 + step * 0.46],
          [root, a0 + step * 0.62],
        ]
    pts.forEach(([rad, a], k) => {
      const x = Math.cos(a) * rad
      const y = Math.sin(a) * rad
      if (i === 0 && k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
  }
  s.closePath()

  const rimIn = root - rim
  if (spokes > 0 && rimIn > hub + 0.02) {
    for (let k = 0; k < spokes; k++) {
      const da = spokeWidth / 2 / rimIn
      const dh = spokeWidth / 2 / hub
      const a0 = (k / spokes) * TAU
      const a1 = ((k + 1) / spokes) * TAU
      const h = new THREE.Path()
      h.moveTo(Math.cos(a0 + da) * rimIn, Math.sin(a0 + da) * rimIn)
      h.absarc(0, 0, rimIn, a0 + da, a1 - da, false)
      h.lineTo(Math.cos(a1 - dh) * hub, Math.sin(a1 - dh) * hub)
      h.absarc(0, 0, hub, a1 - dh, a0 + dh, true)
      h.closePath()
      s.holes.push(h)
    }
  }
  if (axle > 0) {
    const h = new THREE.Path()
    h.absarc(0, 0, axle, 0, TAU, true)
    s.holes.push(h)
  }
  return s
}

/* ------------------------------------------------------------------ */
/*  Rounded rectangle cross-section (for straps / clasps)              */
/* ------------------------------------------------------------------ */
export function roundedSection(w, h, r, seg = 4) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4)
  const pts = []
  const corners = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ]
  corners.forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) })
    }
  })
  return pts
}

/* ------------------------------------------------------------------ */
/*  Sweep a cross-section along a curve lying in the YZ plane.         */
/*  Local frame: X = world X (width), N = X × T (outward), T tangent.  */
/* ------------------------------------------------------------------ */
export function sweep(curve, { u0 = 0, u1 = 1, segments = 64, sectionAt, offset = 0, caps = true, tile = 1 }) {
  // sectionAt(f) -> [{x, y, nx, ny}] in absolute units (x across width, y along outward normal)
  const pos = []
  const nor = []
  const uv = []
  const idx = []
  const X = new THREE.Vector3(1, 0, 0)
  const N = new THREE.Vector3()
  const p = new THREE.Vector3()
  const T = new THREE.Vector3()
  const L = curve.getLength()
  const rings = []
  let secLen = 0
  for (let i = 0; i <= segments; i++) {
    const f = i / segments
    const u = u0 + (u1 - u0) * f
    curve.getPointAt(u, p)
    curve.getTangentAt(u, T)
    N.crossVectors(X, T).normalize()
    const section = sectionAt(f)
    secLen = section.length
    let minX = Infinity
    let maxX = -Infinity
    section.forEach((s) => {
      minX = Math.min(minX, s.x)
      maxX = Math.max(maxX, s.x)
    })
    const w = maxX - minX || 1
    const ring = []
    for (let j = 0; j < secLen; j++) {
      const s = section[j]
      const sy = s.y + offset
      pos.push(p.x + X.x * s.x + N.x * sy, p.y + X.y * s.x + N.y * sy, p.z + X.z * s.x + N.z * sy)
      nor.push(X.x * s.nx + N.x * s.ny, X.y * s.nx + N.y * s.ny, X.z * s.nx + N.z * s.ny)
      uv.push((u * L) / tile, (s.x - minX) / w)
      ring.push(pos.length / 3 - 1)
    }
    rings.push({ ring, p: p.clone(), T: T.clone(), N: N.clone(), section })
  }
  for (let i = 0; i < segments; i++) {
    const a = rings[i].ring
    const b = rings[i + 1].ring
    for (let j = 0; j < secLen; j++) {
      const j1 = (j + 1) % secLen
      idx.push(a[j], b[j], b[j1], a[j], b[j1], a[j1])
    }
  }
  if (caps) {
    ;[0, segments].forEach((ri) => {
      const r = rings[ri]
      const dir = ri === 0 ? -1 : 1
      const nrm = r.T.clone().multiplyScalar(dir)
      const start = pos.length / 3
      pos.push(r.p.x + r.N.x * offset, r.p.y + r.N.y * offset, r.p.z + r.N.z * offset)
      nor.push(nrm.x, nrm.y, nrm.z)
      uv.push(0.5, 0.5)
      r.section.forEach((s) => {
        const sy = s.y + offset
        pos.push(r.p.x + X.x * s.x + r.N.x * sy, r.p.y + X.y * s.x + r.N.y * sy, r.p.z + X.z * s.x + r.N.z * sy)
        nor.push(nrm.x, nrm.y, nrm.z)
        uv.push(0.5, 0.5)
      })
      const pa = new THREE.Vector3()
      const pb = new THREE.Vector3()
      const pc = new THREE.Vector3()
      for (let j = 0; j < secLen; j++) {
        const a = start + 1 + j
        const b = start + 1 + ((j + 1) % secLen)
        pa.fromArray(pos, a * 3)
        pb.fromArray(pos, b * 3)
        pc.fromArray(pos, start * 3)
        const cr = pb.sub(pa).cross(pc.sub(pa))
        if (cr.dot(nrm) >= 0) idx.push(a, b, start)
        else idx.push(b, a, start)
      }
    })
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/* Orthonormal frame on a YZ-plane curve: columns (X, N, -T) */
export function frameMatrix(curve, u, out = new THREE.Matrix4()) {
  const p = curve.getPointAt(u)
  const T = curve.getTangentAt(u)
  const X = new THREE.Vector3(1, 0, 0)
  const N = new THREE.Vector3().crossVectors(X, T).normalize()
  const Tm = T.clone().negate()
  out.makeBasis(X, N, Tm)
  out.setPosition(p)
  return out
}
