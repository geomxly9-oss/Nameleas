import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { latheZ, planarUV, extrude, gearShape, roundedSection, sweep, frameMatrix, TAU, lerp } from '../kit'
import { braceletCurve } from './config'

const SWAP_YZX = new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1)

/* ------------------------------------------------------------------ */
/*  CASE                                                               */
/* ------------------------------------------------------------------ */
export function buildCase(d, m, seg) {
  const { R, T, Rd, k } = d
  const Rin = Rd * 1.012
  const middle = latheZ(
    [
      [Rin, -T * 0.36],
      [R * 0.9, -T * 0.38],
      [R * 0.975, -T * 0.345],
      [R * 0.997, -T * 0.24],
      [R, -T * 0.08],
      [R * 0.997, T * 0.08],
      [R * 0.985, T * 0.18],
      [R * 0.955, T * 0.205],
      [Rin, T * 0.205],
      [Rin, -T * 0.36],
    ],
    seg,
    0.35,
  )
  const out = { middle }
  if (m.lugs === 'integrated') {
    const s = new THREE.Shape()
    const w0 = d.W0 / 2 + 0.22 * k
    const w1 = d.W0 / 2 + 0.03 * k
    s.moveTo(-w0, R * 0.72)
    s.lineTo(w0, R * 0.72)
    s.lineTo(w1, d.lugEnd)
    s.lineTo(-w1, d.lugEnd)
    s.closePath()
    const g = extrude(s, T * 0.34, { bevel: 0.045 * k, bevelSegments: 1 })
    g.translate(0, 0, -T * 0.13)
    out.integrated = g
  } else {
    const y0 = R * 0.78
    const y1 = d.lugEnd
    const s = new THREE.Shape()
    s.moveTo(y0, -T * 0.33)
    s.lineTo(y0, T * 0.15)
    s.bezierCurveTo(R * 0.97, T * 0.17, y1 - 0.14 * k, T * 0.08, y1, -T * 0.05)
    s.lineTo(y1, -T * 0.21)
    s.quadraticCurveTo(y1 - 0.06 * k, -T * 0.31, R * 1.0, -T * 0.33)
    s.lineTo(y0, -T * 0.33)
    const w = (m.lugs === 'sport' ? 0.34 : 0.3) * k
    const g = extrude(s, w - 0.06 * k, { bevel: 0.03 * k, curveSegments: 16, bevelSegments: 3 })
    g.applyMatrix4(SWAP_YZX)
    out.lug = g
    out.lugX = d.W0 / 2 + w / 2 + 0.01
  }
  if (m.crownGuards) {
    const shapes = [1, -1].map((sg) => {
      const s = new THREE.Shape()
      s.moveTo(R * 0.95, sg * 0.44 * k)
      s.quadraticCurveTo(R + 0.2 * k, sg * 0.42 * k, R + 0.22 * k, sg * 0.2 * k)
      s.lineTo(R * 0.95, sg * 0.17 * k)
      s.closePath()
      return s
    })
    const g = extrude(shapes, T * 0.28, { bevel: 0.03 * k })
    g.translate(0, 0, d.z.crown)
    out.guards = g
  }
  return out
}

/* ------------------------------------------------------------------ */
/*  BEZEL                                                              */
/* ------------------------------------------------------------------ */
export function buildBezel(d, m, seg) {
  const { R, T, Rd, k } = d
  const ri = Rd * 0.965
  const out = {}
  switch (m.bezel) {
    case 'dodeca': {
      const s = new THREE.Shape()
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + TAU / 24
        const x = Math.cos(a) * R * 1.0
        const y = Math.sin(a) * R * 1.0
        if (i === 0) s.moveTo(x, y)
        else s.lineTo(x, y)
      }
      s.closePath()
      const h = new THREE.Path()
      h.absarc(0, 0, ri, 0, TAU, true)
      s.holes.push(h)
      const g = extrude(s, T * 0.09, { bevel: 0.04 * k, bevelSegments: 1, curveSegments: 96 })
      g.translate(0, 0, T * 0.265)
      out.ring = g
      break
    }
    case 'stepped':
      out.ring = latheZ(
        [
          [ri, T * 0.2],
          [R * 0.99, T * 0.185],
          [R, T * 0.235],
          [R * 0.94, T * 0.255],
          [R * 0.94, T * 0.295],
          [R * 0.87, T * 0.305],
          [R * 0.87, T * 0.335],
          [ri, T * 0.33],
          [ri, T * 0.2],
        ],
        seg,
        0.3,
      )
      break
    case 'diver':
    case 'tachy': {
      out.ring = latheZ(
        [
          [Rd * 0.98, T * 0.2],
          [R * 0.99, T * 0.185],
          [R * 1.0, T * 0.24],
          [R * 0.985, T * 0.315],
          [R * 0.955, T * 0.322],
          [Rd * 0.98, T * 0.322],
          [Rd * 0.98, T * 0.2],
        ],
        seg,
        0.3,
      )
      const insert = new THREE.RingGeometry(R * 0.83, R * 0.95, seg, 1)
      insert.translate(0, 0, T * 0.324)
      out.insert = insert
      if (m.bezel === 'diver') {
        out.knurl = new THREE.BoxGeometry(0.035 * k, 0.05 * k, T * 0.1)
        out.knurlCount = 120
        out.pip = new THREE.SphereGeometry(0.035 * k, 16, 12)
      }
      break
    }
    default:
      out.ring = latheZ(
        [
          [ri, T * 0.22],
          [R * 0.985, T * 0.185],
          [R * 0.997, T * 0.22],
          [R * 0.965, T * 0.3],
          [R * 0.89, T * 0.335],
          [ri, T * 0.31],
          [ri, T * 0.22],
        ],
        seg,
        0.3,
      )
  }
  return out
}

export function buildCrystal(d, seg) {
  const { T, Rd } = d
  return latheZ(
    [
      [Rd * 0.985, T * 0.29],
      [Rd * 0.978, T * 0.38],
      [Rd * 0.92, T * 0.412],
      [Rd * 0.6, T * 0.426],
      [0.0001, T * 0.43],
    ],
    seg,
    0.9,
  )
}

/* ------------------------------------------------------------------ */
/*  MARKERS                                                            */
/* ------------------------------------------------------------------ */
export function markerHours(m) {
  const c = m.complications || {}
  const skip = new Set()
  if (c.date) skip.add(3)
  if (c.smallSeconds || c.moonphase || c.tourbillon) skip.add(6)
  if (c.chrono) [3, 6, 9].forEach((h) => skip.add(h))
  const out = []
  for (let h = 0; h < 12; h++) if (!skip.has(h)) out.push(h)
  return out
}

export function buildMarkers(d, m) {
  const { Rd, k } = d
  const out = { items: [] }
  const thick = 0.018 * k
  const z0 = d.z.dial + thick / 2 + 0.006 * k
  const hours = markerHours(m)
  const rect = (w, l) => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, -l / 2)
    s.lineTo(w / 2, -l / 2)
    s.lineTo(w / 2, l / 2)
    s.lineTo(-w / 2, l / 2)
    s.closePath()
    return s
  }
  const place = (h, r, dx = 0) => {
    const a = (h / 12) * TAU
    const x = Math.sin(a) * r + Math.cos(a) * dx
    const y = Math.cos(a) * r - Math.sin(a) * dx
    return { pos: [x, y, z0], rot: -a }
  }
  switch (m.markers) {
    case 'roman': {
      out.geo = new THREE.SphereGeometry(0.017 * Rd, 16, 10, 0, TAU, 0, Math.PI / 2)
      out.geo.rotateX(Math.PI / 2)
      for (let h = 0; h < 12; h++) out.items.push({ ...place(h, Rd * 0.925), pos: [Math.sin((h / 12) * TAU) * Rd * 0.925, Math.cos((h / 12) * TAU) * Rd * 0.925, d.z.dial + 0.002], geo: 'geo' })
      break
    }
    case 'dot': {
      out.geo = new THREE.CylinderGeometry(0.058 * Rd, 0.058 * Rd, thick, 32).rotateX(Math.PI / 2)
      out.lumeGeo = new THREE.CylinderGeometry(0.044 * Rd, 0.044 * Rd, thick * 0.4, 32).rotateX(Math.PI / 2)
      out.baton = extrude(rect(0.07 * Rd, 0.16 * Rd), thick * 0.6, { bevel: 0.006 * k, bevelSegments: 1 })
      out.batonLume = new THREE.BoxGeometry(0.04 * Rd, 0.12 * Rd, thick * 0.4)
      const tri = new THREE.Shape()
      tri.moveTo(0, -0.08 * Rd)
      tri.lineTo(0.075 * Rd, 0.07 * Rd)
      tri.lineTo(-0.075 * Rd, 0.07 * Rd)
      tri.closePath()
      out.tri = extrude(tri, thick * 0.6, { bevel: 0.006 * k, bevelSegments: 1 })
      const triL = new THREE.Shape()
      triL.moveTo(0, -0.045 * Rd)
      triL.lineTo(0.045 * Rd, 0.05 * Rd)
      triL.lineTo(-0.045 * Rd, 0.05 * Rd)
      triL.closePath()
      out.triLume = new THREE.ShapeGeometry(triL)
      hours.forEach((h) => {
        if (h === 0) out.items.push({ ...place(h, Rd * 0.78), geo: 'tri', lume: 'triLume' })
        else if (h % 3 === 0) out.items.push({ ...place(h, Rd * 0.78), geo: 'baton', lume: 'batonLume' })
        else out.items.push({ ...place(h, Rd * 0.8), geo: 'geo', lume: 'lumeGeo' })
      })
      break
    }
    case 'dagger': {
      const s = new THREE.Shape()
      const l = 0.12 * Rd
      const w = 0.05 * Rd
      s.moveTo(0, -l / 2)
      s.lineTo(w / 2, l * 0.12)
      s.lineTo(0, l / 2)
      s.lineTo(-w / 2, l * 0.12)
      s.closePath()
      out.geo = extrude(s, thick * 0.7, { bevel: 0.006 * k, bevelSegments: 1 })
      hours.forEach((h) => out.items.push({ ...place(h, Rd * 0.885), geo: 'geo' }))
      break
    }
    default: {
      out.geo = extrude(rect(0.048 * Rd, 0.145 * Rd), thick, { bevel: 0.008 * k, bevelSegments: 1 })
      out.lumeGeo = m.dial.lume ? new THREE.BoxGeometry(0.02 * Rd, 0.1 * Rd, thick) : null
      hours.forEach((h) => {
        if (h === 0) {
          out.items.push({ ...place(h, Rd * 0.785, -0.038 * Rd), geo: 'geo', lume: out.lumeGeo && 'lumeGeo' })
          out.items.push({ ...place(h, Rd * 0.785, 0.038 * Rd), geo: 'geo', lume: out.lumeGeo && 'lumeGeo' })
        } else out.items.push({ ...place(h, Rd * 0.785), geo: 'geo', lume: out.lumeGeo && 'lumeGeo' })
      })
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/*  HANDS                                                              */
/* ------------------------------------------------------------------ */
function dauphine(len, w, tail, b, h) {
  const O = [
    [0, -tail],
    [w / 2, 0],
    [0, len],
    [-w / 2, 0],
  ]
  const B = [0, 0, b + h]
  const pos = []
  const tri = (a, c, e) => pos.push(...a, ...c, ...e)
  const top = O.map(([x, y]) => [x, y, b])
  const bot = O.map(([x, y]) => [x, y, 0])
  tri(top[0], top[1], B)
  tri(B, top[1], top[2])
  tri(B, top[2], top[3])
  tri(top[0], B, top[3])
  tri(bot[0], bot[3], bot[2])
  tri(bot[0], bot[2], bot[1])
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    tri(bot[i], bot[j], top[j])
    tri(bot[i], top[j], top[i])
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

function handShape(style, len, w, tail) {
  const s = new THREE.Shape()
  if (style === 'leaf') {
    s.moveTo(0, -tail)
    s.quadraticCurveTo(w * 0.55, -tail * 0.3, w * 0.5, len * 0.3)
    s.quadraticCurveTo(w * 0.42, len * 0.75, 0, len)
    s.quadraticCurveTo(-w * 0.42, len * 0.75, -w * 0.5, len * 0.3)
    s.quadraticCurveTo(-w * 0.55, -tail * 0.3, 0, -tail)
  } else if (style === 'sword' || style === 'skeleton') {
    s.moveTo(-w * 0.2, -tail)
    s.lineTo(w * 0.2, -tail)
    s.lineTo(w * 0.5, len * 0.22)
    s.lineTo(w * 0.42, len * 0.86)
    s.lineTo(0, len)
    s.lineTo(-w * 0.42, len * 0.86)
    s.lineTo(-w * 0.5, len * 0.22)
    s.closePath()
    if (style === 'skeleton') {
      const h = new THREE.Path()
      h.moveTo(-w * 0.26, len * 0.26)
      h.lineTo(w * 0.26, len * 0.26)
      h.lineTo(w * 0.22, len * 0.66)
      h.lineTo(-w * 0.22, len * 0.66)
      h.closePath()
      s.holes.push(h)
    }
  } else {
    // baton
    s.moveTo(-w / 2, -tail)
    s.lineTo(w / 2, -tail)
    s.lineTo(w / 2, len - w * 0.7)
    s.lineTo(0, len)
    s.lineTo(-w / 2, len - w * 0.7)
    s.closePath()
  }
  return s
}

function lumeShape(style, len, w) {
  const s = new THREE.Shape()
  if (style === 'skeleton') {
    s.moveTo(-w * 0.32, len * 0.7)
    s.lineTo(w * 0.32, len * 0.7)
    s.lineTo(0, len * 0.94)
    s.closePath()
  } else if (style === 'sword') {
    s.moveTo(-w * 0.28, len * 0.25)
    s.lineTo(w * 0.28, len * 0.25)
    s.lineTo(w * 0.24, len * 0.82)
    s.lineTo(0, len * 0.92)
    s.lineTo(-w * 0.24, len * 0.82)
    s.closePath()
  } else {
    s.moveTo(-w * 0.22, len * 0.22)
    s.lineTo(w * 0.22, len * 0.22)
    s.lineTo(w * 0.22, len * 0.88)
    s.lineTo(-w * 0.22, len * 0.88)
    s.closePath()
  }
  return s
}

export function buildHands(d, m) {
  const { Rd, k } = d
  const style = m.hands
  const t = 0.012 * k
  const make = (len, w, tail) => {
    if (style === 'dauphine') return dauphine(len, w, tail, 0.005 * k, 0.014 * k)
    const g = extrude(handShape(style, len, w, tail), t, { bevel: 0.003 * k, bevelSegments: 1, curveSegments: 10 })
    return g
  }
  const hourDims = [0.56 * Rd, (style === 'dauphine' ? 0.1 : style === 'leaf' ? 0.1 : 0.075) * Rd, 0.1 * Rd]
  const minDims = [0.87 * Rd, (style === 'dauphine' ? 0.08 : style === 'leaf' ? 0.08 : 0.06) * Rd, 0.12 * Rd]
  const out = {
    hour: make(...hourDims),
    minute: make(...minDims),
    pivot: new THREE.CylinderGeometry(0.05 * Rd, 0.05 * Rd, 0.03 * k, 24).rotateX(Math.PI / 2),
    hub: new THREE.CylinderGeometry(0.03 * Rd, 0.034 * Rd, 0.02 * k, 24).rotateX(Math.PI / 2),
  }
  const lumeOn = m.dial.lume || style === 'skeleton' || style === 'sword'
  if (lumeOn && style !== 'dauphine' && style !== 'leaf') {
    out.hourLume = new THREE.ShapeGeometry(lumeShape(style, hourDims[0], hourDims[1]))
    out.minLume = new THREE.ShapeGeometry(lumeShape(style, minDims[0], minDims[1]))
  }
  // subdial hands (chronograph counters)
  out.sub = new THREE.ExtrudeGeometry(handShape('baton', 0.14 * Rd, 0.022 * Rd, 0.03 * Rd), { depth: 0.006 * k, bevelEnabled: false })
  return out
}

export function buildSeconds(d, m) {
  const { Rd, k } = d
  const c = m.complications || {}
  const t = 0.008 * k
  if (c.smallSeconds) {
    const s = new THREE.Shape()
    const l = 0.17 * Rd
    s.moveTo(-0.008 * Rd, -0.04 * Rd)
    s.lineTo(0.008 * Rd, -0.04 * Rd)
    s.lineTo(0.004 * Rd, l)
    s.lineTo(-0.004 * Rd, l)
    s.closePath()
    return { needle: extrude(s, t, {}), sub: [0, -0.45 * Rd], cap: new THREE.CylinderGeometry(0.018 * Rd, 0.018 * Rd, 0.012 * k, 20).rotateX(Math.PI / 2) }
  }
  const len = 0.93 * Rd
  const tail = 0.24 * Rd
  const w = 0.014 * Rd
  const needle = new THREE.Shape()
  needle.moveTo(-w, -tail)
  needle.lineTo(w, -tail)
  needle.lineTo(w * 0.5, len)
  needle.lineTo(-w * 0.5, len)
  needle.closePath()
  const cw = new THREE.Shape()
  cw.absarc(0, -tail * 0.72, 0.045 * Rd, 0, TAU, false)
  const shapes = [needle, cw]
  if (m.dial.lume || m.bezel === 'diver') {
    const lol = new THREE.Shape()
    lol.absarc(0, len * 0.76, 0.032 * Rd, 0, TAU, false)
    shapes.push(lol)
  }
  const out = {
    needle: extrude(shapes, t, { curveSegments: 20 }),
    cap: new THREE.CylinderGeometry(0.026 * Rd, 0.026 * Rd, 0.016 * k, 24).rotateX(Math.PI / 2),
  }
  if (c.chrono) out.running = extrude(handShape('baton', 0.14 * Rd, 0.014 * Rd, 0.03 * Rd), 0.005 * k, {})
  return out
}

/* ------------------------------------------------------------------ */
/*  MOVEMENT                                                           */
/* ------------------------------------------------------------------ */
export function gearLayout(d) {
  const Rm = d.Rm
  const P = (x, y) => [x * Rm, y * Rm]
  return {
    center: { p: P(0, 0), r: 0.3 * Rm, teeth: 64, w: 0.25 },
    barrel: { p: P(0.39, 0.47), r: 0.33 * Rm, teeth: 72, w: -0.227 },
    third: { p: P(-0.43, 0.3), r: 0.24 * Rm, teeth: 54, w: -0.3125 },
    fourth: { p: P(-0.58, -0.11), r: 0.22 * Rm, teeth: 48, w: 0.341 },
    escape: { p: P(-0.415, -0.4), r: 0.13 * Rm, teeth: 15, w: -0.58, pointed: true },
    balance: { p: P(-0.3, -0.66), r: 0.2 * Rm },
  }
}

export function buildMovement(d, m) {
  const { Rm, k, z } = d
  const L = gearLayout(d)
  const tb = m.complications?.tourbillon
  // main plate
  const s = new THREE.Shape()
  s.absarc(0, 0, Rm, 0, TAU, false)
  const holes = []
  if (!tb) holes.push([L.balance.p[0], L.balance.p[1], 0.25 * Rm])
  if (m.skeleton) {
    ;[
      [0.55, -0.35, 0.2],
      [0.15, -0.62, 0.15],
      [0.62, 0.2, 0.17],
      [-0.1, 0.64, 0.16],
      [-0.68, 0.22, 0.14],
      [0.08, 0.3, 0.12],
    ].forEach(([x, y, r]) => holes.push([x * Rm, y * Rm, r * Rm]))
  }
  holes.forEach(([x, y, r]) => {
    const h = new THREE.Path()
    h.absarc(x, y, r, 0, TAU, true)
    s.holes.push(h)
  })
  const plate = planarUV(extrude(s, z.plate1 - z.plate0, { curveSegments: 40 }), Rm)
  plate.translate(0, 0, (z.plate0 + z.plate1) / 2)

  // bridges (back side)
  const bridges = []
  const barrel = new THREE.Shape()
  barrel.absarc(L.barrel.p[0], L.barrel.p[1], 0.34 * Rm, 0, TAU, false)
  bridges.push(barrel)
  const train = new THREE.Shape()
  const a0 = (150 / 180) * Math.PI
  const a1 = (255 / 180) * Math.PI
  train.absarc(0, 0, 0.84 * Rm, a0, a1, false)
  train.absarc(0, 0, 0.38 * Rm, a1, a0, true)
  train.closePath()
  bridges.push(train)
  if (!tb) {
    const cock = new THREE.Shape()
    const [bx, by] = L.balance.p
    const ca = Math.atan2(by, bx)
    const edge = [Math.cos(ca) * Rm * 0.98, Math.sin(ca) * Rm * 0.98]
    const perp = [-Math.sin(ca), Math.cos(ca)]
    const wd = 0.16 * Rm
    cock.moveTo(edge[0] + perp[0] * wd, edge[1] + perp[1] * wd)
    cock.lineTo(bx + perp[0] * 0.06 * Rm, by + perp[1] * 0.06 * Rm)
    cock.absarc(bx, by, 0.065 * Rm, ca + Math.PI / 2, ca + (3 * Math.PI) / 2, false)
    cock.lineTo(edge[0] - perp[0] * wd, edge[1] - perp[1] * wd)
    cock.closePath()
    bridges.push(cock)
  }
  const bridgeGeo = planarUV(extrude(bridges, z.bridges1 - z.bridges0, { bevel: 0.012 * k, bevelSegments: 1, curveSegments: 32 }), Rm)
  bridgeGeo.translate(0, 0, (z.bridges0 + z.bridges1) / 2)

  // jewels & screws (back)
  const jewelPts = [L.barrel.p, L.third.p, L.fourth.p, L.escape.p]
  if (!tb) jewelPts.push(L.balance.p)
  const screwPts = [
    [L.barrel.p[0] + 0.22 * Rm, L.barrel.p[1] - 0.12 * Rm],
    [L.barrel.p[0] - 0.24 * Rm, L.barrel.p[1] + 0.06 * Rm],
    [Math.cos(a0 + 0.12) * 0.62 * Rm, Math.sin(a0 + 0.12) * 0.62 * Rm],
    [Math.cos(a1 - 0.12) * 0.62 * Rm, Math.sin(a1 - 0.12) * 0.62 * Rm],
    [Math.cos(3.6) * 0.8 * Rm, Math.sin(3.6) * 0.8 * Rm],
  ]

  const out = {
    plate,
    bridges: bridgeGeo,
    jewel: new THREE.CylinderGeometry(0.032 * k, 0.032 * k, 0.02 * k, 16).rotateX(Math.PI / 2),
    jewelPts,
    jewelZ: z.bridges0 - 0.012 * k,
    screw: new THREE.CylinderGeometry(0.04 * k, 0.04 * k, 0.025 * k, 16).rotateX(Math.PI / 2),
    screwPts,
    ratchet: extrude(gearShape({ teeth: 40, r: 0.27 * Rm, tooth: 0.022 * Rm, spokes: 0, axle: 0.04 * Rm, pointed: true }), 0.02 * k, { curveSegments: 6 }),
    ratchetZ: z.bridges0 - 0.02 * k,
  }
  if (!tb) {
    const rb = L.balance.r
    out.balance = {
      p: L.balance.p,
      z: (z.plate0 + z.plate1) / 2,
      rim: new THREE.TorusGeometry(rb, 0.018 * k, 10, 48),
      bar: new THREE.BoxGeometry(rb * 2, 0.03 * k, 0.018 * k),
      staff: new THREE.CylinderGeometry(0.012 * k, 0.012 * k, 0.16 * k, 10).rotateX(Math.PI / 2),
      spring: hairspring(0.03 * Rm, rb * 0.72, 9, 0.004 * k),
    }
  } else {
    const rc = 0.2 * d.Rd
    out.tourbillon = {
      p: [0, -0.42 * d.Rd],
      z: d.z.dial - 0.045 * k,
      ring: new THREE.TorusGeometry(rc, 0.014 * k, 10, 64),
      arm: new THREE.BoxGeometry(0.025 * k, rc, 0.016 * k),
      bal: new THREE.TorusGeometry(rc * 0.58, 0.01 * k, 8, 40),
      balBar: new THREE.BoxGeometry(rc * 1.16, 0.016 * k, 0.01 * k),
      spring: hairspring(0.015 * Rm, rc * 0.4, 7, 0.0025 * k),
    }
  }
  return out
}

function hairspring(r0, r1, turns, tube) {
  const pts = []
  const n = turns * 48
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const a = f * turns * TAU
    const r = lerp(r0, r1, f)
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, n, tube, 4, false)
}

export function buildGears(d) {
  const { Rm, k } = d
  const L = gearLayout(d)
  const th = 0.026 * k
  const gears = ['barrel', 'center', 'third', 'fourth', 'escape'].map((id) => {
    const g = L[id]
    const geo = extrude(
      gearShape({
        teeth: g.teeth,
        r: g.r,
        tooth: (id === 'barrel' ? 0.018 : 0.024) * Rm,
        rim: 0.045 * Rm,
        hub: 0.07 * Rm,
        axle: 0.016 * Rm,
        spokes: id === 'escape' ? 4 : 5,
        spokeWidth: 0.035 * Rm,
        pointed: !!g.pointed,
      }),
      th,
      { curveSegments: 8 },
    )
    return { id, geo, p: g.p, w: g.w }
  })
  return {
    gears,
    pinion: extrude(gearShape({ teeth: 10, r: 0.065 * Rm, tooth: 0.018 * Rm, spokes: 0, axle: 0.012 * Rm }), th * 1.6, { curveSegments: 4 }),
    jewel: new THREE.CylinderGeometry(0.028 * k, 0.028 * k, 0.012 * k, 14).rotateX(Math.PI / 2),
  }
}

export function buildRotor(d) {
  const { Rm, k } = d
  const s = new THREE.Shape()
  s.absarc(0, 0, Rm * 0.97, 0, Math.PI, false)
  s.absarc(0, 0, Rm * 0.17, Math.PI, 0, true)
  s.closePath()
  const plate = planarUV(extrude(s, 0.03 * k, { curveSegments: 48 }), Rm)
  // mirror U so engraving reads from the back
  const uv = plate.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
  const rimS = new THREE.Shape()
  rimS.absarc(0, 0, Rm * 0.97, 0, Math.PI, false)
  rimS.absarc(0, 0, Rm * 0.86, Math.PI, 0, true)
  rimS.closePath()
  const rim = extrude(rimS, 0.06 * k, { curveSegments: 48, bevel: 0.008 * k, bevelSegments: 1 })
  return {
    plate,
    rim,
    hub: new THREE.CylinderGeometry(0.15 * Rm, 0.15 * Rm, 0.07 * k, 32).rotateX(Math.PI / 2),
    jewel: new THREE.CylinderGeometry(0.04 * k, 0.04 * k, 0.08 * k, 16).rotateX(Math.PI / 2),
  }
}

/* ------------------------------------------------------------------ */
/*  CROWN, GASKETS, CASE BACK                                          */
/* ------------------------------------------------------------------ */
export function buildCrown(d, m) {
  const { R, k } = d
  const rc = (m.crownGuards ? 0.27 : 0.24) * k
  const len = 0.3 * k
  const s = new THREE.Shape()
  const n = 120
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU
    const r = rc * (0.94 + 0.06 * Math.cos(a * 24))
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const crown = extrude(s, len - 0.06 * k, { bevel: 0.03 * k, bevelSegments: 3, curveSegments: 4 })
  crown.rotateY(Math.PI / 2)
  crown.translate(R + 0.06 * k + len / 2, 0, d.z.crown)
  const cap = new THREE.CylinderGeometry(rc * 0.72, rc * 0.72, 0.012 * k, 40)
  cap.rotateZ(-Math.PI / 2)
  cap.translate(R + 0.07 * k + len, 0, d.z.crown)
  const tube = new THREE.CylinderGeometry(rc * 0.55, rc * 0.6, 0.12 * k, 24)
  tube.rotateZ(-Math.PI / 2)
  tube.translate(R + 0.02 * k, 0, d.z.crown)
  const out = { crown, cap, tube }
  if (m.pushers) {
    const p = new THREE.CylinderGeometry(0.11 * k, 0.11 * k, 0.3 * k, 24)
    p.rotateZ(-Math.PI / 2)
    const pc = new THREE.CylinderGeometry(0.13 * k, 0.13 * k, 0.07 * k, 24)
    pc.rotateZ(-Math.PI / 2)
    pc.translate(0.17 * k, 0, 0)
    out.pusher = p
    out.pusherCap = pc
    out.pusherAngles = [0.68, -0.68]
    out.pusherR = R + 0.1 * k
  }
  return out
}

export function buildGaskets(d) {
  const { R, Rd, k, T } = d
  return {
    front: { geo: new THREE.TorusGeometry(Rd * 0.985, 0.02 * k, 10, 96), z: T * 0.27, off: [0, 0, 3.95 * k] },
    back: { geo: new THREE.TorusGeometry(R * 0.82, 0.024 * k, 10, 96), z: -T * 0.37, off: [0, 0, -3.25 * k] },
    crown: { geo: new THREE.TorusGeometry(0.15 * k, 0.018 * k, 8, 32).rotateY(Math.PI / 2), pos: [R + 0.1 * k, 0, d.z.crown], off: [1.25 * k, 0, 0] },
  }
}

export function buildCaseback(d, seg) {
  const { R, k, z } = d
  const Rw = R * 0.6
  const ring = latheZ(
    [
      [Rw, z.cbBack],
      [R * 0.93, z.cbBack],
      [R * 0.97, z.cbBack + 0.04 * k],
      [R * 0.97, z.cbTop],
      [Rw, z.cbTop],
      [Rw, z.cbBack],
    ],
    seg,
    0.3,
  )
  const engr = new THREE.RingGeometry(Rw * 1.05, R * 0.92, seg, 1)
  engr.rotateY(Math.PI)
  engr.translate(0, 0, z.cbBack - 0.002)
  const glass = new THREE.CircleGeometry(Rw, seg)
  glass.rotateY(Math.PI)
  glass.translate(0, 0, z.cbBack + 0.02 * k)
  const bead = new THREE.TorusGeometry(Rw, 0.022 * k, 10, seg)
  bead.translate(0, 0, z.cbBack - 0.004)
  return { ring, engr, glass, bead }
}

/* ------------------------------------------------------------------ */
/*  BRACELET / STRAP                                                   */
/* ------------------------------------------------------------------ */
export function buildBracelet(d, m) {
  const curve = braceletCurve(d)
  const L = curve.getLength()
  const k = d.k
  const type = m.strap?.type || 'bracelet'
  const out = { curve, L, type }

  if (type === 'bracelet') {
    const style = m.strap.style || 'sport'
    const pitch = (style === 'royal' ? 0.52 : 0.58) * k
    const thk = (style === 'royal' ? 0.23 : 0.25) * k
    const claspLen = 2.5 * k
    const half = L / 2 - claspLen / 2
    const n = Math.floor(half / pitch)
    const pieces =
      style === 'royal'
        ? [
            { x: -0.31, w: 0.36, c: false, raise: 0 },
            { x: 0, w: 0.22, c: true, raise: 0.022 * k },
            { x: 0.31, w: 0.36, c: false, raise: 0 },
          ]
        : [
            { x: -0.335, w: 0.31, c: false, raise: 0 },
            { x: 0, w: 0.33, c: true, raise: 0.028 * k },
            { x: 0.335, w: 0.31, c: false, raise: 0 },
          ]
    const outerW = pieces[0].w * d.W0
    const centerW = pieces[1].w * d.W0
    // pillow-shaped links: generous radii read as polished, hand-finished metal
    out.outerGeo = new RoundedBoxGeometry(outerW, thk, pitch * 0.95, 4, thk * 0.4)
    out.centerGeo = new RoundedBoxGeometry(centerW, thk * 1.1, pitch * 0.95, 4, Math.min(thk * 0.48, centerW * 0.45))
    const base = { outer: [], center: [], centers: [] }
    const F = new THREE.Matrix4()
    const loc = new THREE.Matrix4()
    const S = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      const s = pitch * (i + 0.5)
      ;[s / L, 1 - s / L].forEach((u) => {
        const f = Math.min(1, (Math.min(u, 1 - u) * L) / half)
        const W = lerp(d.W0, d.W1, f)
        const sc = W / d.W0
        frameMatrix(curve, u, F)
        const c = new THREE.Vector3().setFromMatrixPosition(F)
        pieces.forEach((pc) => {
          S.makeScale(sc, 1, 1)
          loc.makeTranslation(pc.x * W, pc.raise, 0).multiply(S)
          const M = F.clone().multiply(loc)
          ;(pc.c ? base.center : base.outer).push({ M, c })
        })
      })
    }
    out.base = base
    out.claspLen = claspLen
    out.thk = thk
  } else {
    const gap = 0.012
    const thk = (type === 'leather' ? 0.3 : 0.34) * k
    const mk = (u0, u1) =>
      sweep(curve, {
        u0,
        u1,
        segments: 90,
        tile: d.W0 * 2,
        sectionAt: (f) => {
          const u = lerp(u0, u1, f)
          const e = Math.min(1, Math.min(u, 1 - u) * 2.1)
          const W = lerp(d.W0 * 0.985, d.W1, e)
          const t = lerp(thk, thk * 0.78, e)
          return roundedSection(W, t, t * 0.45, 4)
        },
      })
    out.upper = mk(0, 0.5 + gap)
    out.lower = mk(0.5 - gap, 1)
    out.thk = thk
    out.claspLen = 0.6 * k
  }
  return out
}

export function buildClasp(d, br) {
  const k = d.k
  const { curve, L } = br
  if (br.type === 'bracelet') {
    const cu = br.claspLen / 2 / L
    const body = sweep(curve, {
      u0: 0.5 - cu,
      u1: 0.5 + cu,
      segments: 40,
      sectionAt: () => roundedSection(d.W1 * 1.03, br.thk * 1.15, 0.07 * k, 4),
    })
    const F = frameMatrix(curve, 0.5)
    const plate = new RoundedBoxGeometry(d.W1 * 0.42, 0.035 * k, br.claspLen * 0.42, 2, 0.015 * k)
    plate.applyMatrix4(new THREE.Matrix4().makeTranslation(0, br.thk * 0.6 + 0.012 * k, 0))
    plate.applyMatrix4(F)
    const btn = new THREE.CylinderGeometry(0.06 * k, 0.06 * k, 0.07 * k, 16).rotateZ(Math.PI / 2)
    const btns = [-1, 1].flatMap((sx) =>
      [0.5 - cu * 0.6, 0.5 + cu * 0.6].map((u) => {
        const g = btn.clone()
        g.applyMatrix4(new THREE.Matrix4().makeTranslation(sx * (d.W1 * 0.52 + 0.02 * k), 0, 0))
        g.applyMatrix4(frameMatrix(curve, u))
        return g
      }),
    )
    return { body, plate, btns }
  }
  // tang buckle
  const F = frameMatrix(curve, 0.5)
  const w = d.W1 + 0.2 * k
  const l = 0.55 * k
  const r = 0.12 * k
  const y = br.thk * 0.75
  const path = new THREE.CurvePath()
  const pts = []
  const corner = (cx, cz, a0) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2)
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r))
    }
  }
  corner(w / 2 - r, l / 2 - r, 0)
  corner(-w / 2 + r, l / 2 - r, Math.PI / 2)
  corner(-w / 2 + r, -l / 2 + r, Math.PI)
  corner(w / 2 - r, -l / 2 + r, (3 * Math.PI) / 2)
  void path
  const loop = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  const frame = new THREE.TubeGeometry(loop, 64, 0.045 * k, 10, true)
  frame.applyMatrix4(F)
  const tang = new THREE.CylinderGeometry(0.025 * k, 0.025 * k, l * 0.95, 10).rotateX(Math.PI / 2)
  tang.applyMatrix4(new THREE.Matrix4().makeTranslation(0, y + 0.02 * k, 0))
  tang.applyMatrix4(F)
  return { frame, tang }
}
