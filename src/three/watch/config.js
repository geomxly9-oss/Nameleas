import * as THREE from 'three'

/* All geometry is built in "centimetre" units: 1 unit = 10 mm. */
export function makeDims(model) {
  const R = model.diameter / 20
  const T = model.thickness / 10
  const k = R / 2.05
  const Rd = R * 0.83
  const Rm = Rd * 0.96
  const W0 = R * 0.96
  const lugEnd = model.lugs === 'integrated' ? R + 0.3 * k : R + 0.42 * k
  const z = {
    cbBack: -T * 0.5,
    cbTop: -T * 0.36,
    case0: -T * 0.38,
    case1: T * 0.2,
    bezel0: T * 0.185,
    bezel1: T * 0.335,
    crystal0: T * 0.29,
    crystal1: T * 0.43,
    dial: T * 0.06,
    plate0: -T * 0.15,
    plate1: -T * 0.065,
    gears: -T * 0.035,
    bridges0: -T * 0.24,
    bridges1: -T * 0.15,
    rotor: -T * 0.29,
    crown: -T * 0.09,
  }
  return { R, T, k, Rd, Rm, W0, W1: W0 * 0.8, lugEnd, z }
}

/* The wrist loop the bracelet / strap follows (lies in the YZ plane). */
export function braceletCurve(d) {
  const k = d.k
  const y0 = d.lugEnd - 0.03 * k
  const pts = [
    [y0, -0.2],
    [y0 + 0.5 * k, -0.42],
    [3.28 * k, -1.05],
    [3.32 * k, -2.1],
    [2.98 * k, -3.28],
    [2.08 * k, -4.13],
    [0.78 * k, -4.52],
    [-0.78 * k, -4.52],
    [-2.08 * k, -4.13],
    [-2.98 * k, -3.28],
    [-3.32 * k, -2.1],
    [-3.28 * k, -1.05],
    [-(y0 + 0.5 * k), -0.42],
    [-y0, -0.2],
  ].map(([y, zz], i, arr) => new THREE.Vector3(0, y, i === 0 || i === arr.length - 1 ? zz * d.T : zz * k))
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

export const LOOP_CENTER = (d) => new THREE.Vector3(0, 0, -2.35 * d.k)

/* Exploded-view offsets (at t = 1) and stagger delays. */
export function explodeConfig(d) {
  const k = d.k
  return {
    crystal: { off: [0, 0, 4.7 * k], delay: 0.0 },
    gaskets: { off: null, delay: 0.04 },
    bezel: { off: [0, 0, 3.25 * k], delay: 0.07 },
    seconds: { off: [0, 0, 2.6 * k], delay: 0.11 },
    hands: { off: [0, 0, 2.05 * k], delay: 0.15 },
    markers: { off: [0, 0, 1.5 * k], delay: 0.19 },
    dial: { off: [0, 0, 0.98 * k], delay: 0.23 },
    case: { off: [0, 0, 0], delay: 0 },
    gears: { off: [0, 0, -0.95 * k], delay: 0.27 },
    movement: { off: [0, 0, -1.8 * k], delay: 0.31 },
    rotor: { off: [0, 0, -2.6 * k], delay: 0.35 },
    caseback: { off: [0, 0, -3.8 * k], delay: 0.39 },
    crown: { off: [1.9 * k, 0, 0], delay: 0.43 },
    bracelet: { off: null, delay: 0.47 },
    clasp: { off: [0, -0.4 * k, -1.9 * k], delay: 0.5 },
  }
}

/* Close-up framing per component: centre (assembled space) + size to fit */
export function partFraming(id, d, model) {
  const { R, T, k, Rd, Rm, z } = d
  switch (id) {
    case 'crystal':
      return { c: [0, 0, T * 0.36], s: 2 * Rd, tilt: 0.55 }
    case 'bezel':
      return { c: [0, 0, T * 0.26], s: 2 * R, tilt: 0.5 }
    case 'dial':
      return { c: [0, 0, z.dial], s: 2 * Rd, tilt: 0.2 }
    case 'hands':
      return { c: [0, 0, z.dial + 0.08], s: 1.9 * Rd, tilt: 0.25 }
    case 'seconds':
      return { c: [0, 0, z.dial + 0.1], s: 1.9 * Rd, tilt: 0.25 }
    case 'markers':
      return { c: [0, 0, z.dial], s: 2 * Rd, tilt: 0.45 }
    case 'movement':
      return { c: [0, 0, (z.plate0 + z.bridges0) / 2], s: 2 * Rm, tilt: -0.5, back: true }
    case 'gears':
      return { c: [0, 0, z.gears], s: 2 * Rm, tilt: 0.45 }
    case 'rotor':
      return { c: [0, 0, z.rotor], s: 2 * Rm, tilt: -0.4, back: true }
    case 'case':
      return { c: [0, 0, 0], s: 2 * d.lugEnd, tilt: 0.5 }
    case 'crown':
      return { c: [R + 0.2 * k, 0, z.crown], s: model.pushers ? 1.6 * k : 0.85 * k, tilt: 0.3, side: true }
    case 'gaskets':
      return { c: [0, 0, 0], s: 2 * R, tilt: 0.9 }
    case 'caseback':
      return { c: [0, 0, z.cbBack], s: 2 * R, tilt: -0.3, back: true }
    case 'bracelet':
      return { c: [0, 2.95 * k, -1.5 * k], s: 3.0 * k, tilt: 0.2, side: true }
    case 'clasp':
      return { c: [0, 0, -4.5 * k], s: 2.6 * k, tilt: 0.3, back: true }
    default:
      return { c: [0, 0, 0], s: 6, tilt: 0.3 }
  }
}

export const PART_IDS = ['crystal', 'bezel', 'dial', 'hands', 'seconds', 'markers', 'movement', 'rotor', 'gears', 'case', 'crown', 'gaskets', 'caseback', 'bracelet', 'clasp']
