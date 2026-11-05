import * as THREE from 'three'
import { memo, mixHex, rng, TAU } from '../kit'

export const FONT_DISPLAY = '"Bodoni Moda Variable", "Bodoni Moda", Didot, serif'
export const FONT_TEXT = '"Archivo Variable", "Archivo", Helvetica, sans-serif'

function makeCanvas(w, h = w) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function toTex(c, { srgb = true, wrap = false } = {}) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

/* Text with manual letter spacing (portable across browsers) */
function spaced(ctx, text, x, y, spacing, align = 'center') {
  const chars = [...text]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx, y)
    cx += widths[i] + spacing
  })
  ctx.textAlign = prevAlign
}

/* Text along a circle, centred on angle `at` (0 = top, clockwise). */
function arcText(ctx, text, radius, at, { spacing = 0, inward = false } = {}) {
  const chars = [...text]
  const widths = chars.map((ch) => ctx.measureText(ch).width + spacing)
  const total = widths.reduce((a, b) => a + b, 0) - spacing
  let a = at - (total / radius) / 2 * (inward ? -1 : 1)
  ctx.save()
  chars.forEach((ch, i) => {
    const w = widths[i]
    const mid = a + ((w - spacing) / 2 / radius) * (inward ? -1 : 1)
    ctx.save()
    ctx.rotate(mid)
    ctx.translate(0, inward ? radius : -radius)
    if (inward) ctx.rotate(Math.PI)
    ctx.textAlign = 'center'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    a += (w / radius) * (inward ? -1 : 1)
  })
  ctx.restore()
}

/* The VELORA mark: a dial ring with two hands at 10:10 forming a V */
export function drawMark(ctx, x, y, r, color, lw) {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.stroke()
  const a1 = (-60 * Math.PI) / 180 - Math.PI / 2 + Math.PI / 2 // 10 o'clock
  const ang = (deg) => ((deg - 90) * Math.PI) / 180
  ;[ang(-60), ang(60)].forEach((a) => {
    ctx.beginPath()
    ctx.moveTo(0, r * 0.18)
    ctx.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78)
    ctx.stroke()
  })
  void a1
  ctx.beginPath()
  ctx.arc(0, r * 0.18, lw * 1.1, 0, TAU)
  ctx.fill()
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/*  DIAL                                                               */
/* ------------------------------------------------------------------ */
const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

function drawPattern(ctx, U, d, bump) {
  const light = bump ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)'
  const dark = bump ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.10)'
  ctx.save()
  switch (d.pattern) {
    case 'sunburst': {
      if (bump) break
      const n = 900
      ctx.lineWidth = U * 0.0035
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU
        ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(a) * U, Math.sin(a) * U)
        ctx.stroke()
      }
      break
    }
    case 'guilloche': {
      // rose-engine rosette in the centre, azurage rings outside
      ctx.save()
      ctx.beginPath()
      ctx.arc(0, 0, U * 0.66, 0, TAU)
      ctx.clip()
      const n = 84
      ctx.lineWidth = U * (bump ? 0.006 : 0.0032)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU
        ctx.strokeStyle = i % 2 ? light : dark
        ctx.beginPath()
        ctx.arc(Math.cos(a) * U * 0.17, Math.sin(a) * U * 0.17, U * 0.5, 0, TAU)
        ctx.stroke()
      }
      ctx.restore()
      ctx.lineWidth = U * 0.003
      for (let r = U * 0.67; r < U * 0.86; r += U * 0.008) {
        ctx.strokeStyle = Math.round(r / (U * 0.008)) % 2 ? light : dark
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, TAU)
        ctx.stroke()
      }
      ctx.strokeStyle = d.print
      ctx.globalAlpha = 0.5
      ctx.lineWidth = U * 0.004
      ctx.beginPath()
      ctx.arc(0, 0, U * 0.665, 0, TAU)
      ctx.stroke()
      break
    }
    case 'weave': {
      // "Lumen weave": concentric undulating rings, hand-engraved look
      const rings = 40
      for (let k = 0; k < rings; k++) {
        const r0 = U * (0.05 + k * 0.0205)
        ;[
          [light, 0],
          [dark, U * 0.006],
        ].forEach(([col, off]) => {
          ctx.strokeStyle = col
          ctx.lineWidth = U * (bump ? 0.009 : 0.0045)
          ctx.beginPath()
          for (let j = 0; j <= 480; j++) {
            const th = (j / 480) * TAU
            const r = r0 + off + U * 0.0095 * Math.sin(th * 16 + k * 0.85)
            const x = Math.cos(th) * r
            const y = Math.sin(th) * r
            if (j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        })
      }
      break
    }
    case 'grain': {
      const rand = rng(7)
      for (let i = 0; i < 26000; i++) {
        const a = rand() * TAU
        const r = Math.sqrt(rand()) * U
        ctx.fillStyle = rand() > 0.5 ? light : dark
        const s = U * 0.004 * (0.5 + rand())
        ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, s, s)
      }
      break
    }
    default:
      break
  }
  ctx.restore()
}

function minuteTrack(ctx, U, d, r0 = 0.895, r1 = 0.955) {
  ctx.save()
  ctx.strokeStyle = d.print
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU
    const five = i % 5 === 0
    ctx.lineWidth = U * (five ? 0.009 : 0.0045)
    ctx.beginPath()
    ctx.moveTo(Math.sin(a) * U * (five ? r0 - 0.012 : r0), -Math.cos(a) * U * (five ? r0 - 0.012 : r0))
    ctx.lineTo(Math.sin(a) * U * r1, -Math.cos(a) * U * r1)
    ctx.stroke()
  }
  ctx.lineWidth = U * 0.003
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(0, 0, U * r1, 0, TAU)
  ctx.stroke()
  ctx.restore()
}

function subdial(ctx, U, cx, cy, r, d, { fill, labels = ['60', '15', '30', '45'] } = {}) {
  ctx.save()
  ctx.translate(cx, cy)
  if (fill) {
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, TAU)
    ctx.fill()
  }
  // azurage
  ctx.lineWidth = U * 0.0025
  for (let rr = r * 0.2; rr < r * 0.98; rr += U * 0.0065) {
    ctx.strokeStyle = Math.round(rr / (U * 0.0065)) % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'
    ctx.beginPath()
    ctx.arc(0, 0, rr, 0, TAU)
    ctx.stroke()
  }
  ctx.strokeStyle = d.subPrint || d.print
  ctx.fillStyle = d.subPrint || d.print
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU
    const five = i % 5 === 0
    ctx.lineWidth = U * (five ? 0.006 : 0.003)
    ctx.beginPath()
    ctx.moveTo(Math.sin(a) * r * (five ? 0.78 : 0.85), -Math.cos(a) * r * (five ? 0.78 : 0.85))
    ctx.lineTo(Math.sin(a) * r * 0.97, -Math.cos(a) * r * 0.97)
    ctx.stroke()
  }
  ctx.font = `600 ${U * 0.045}px ${FONT_TEXT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  labels.forEach((t, i) => {
    if (!t) return
    const a = (i / labels.length) * TAU
    ctx.fillText(t, Math.sin(a) * r * 0.58, -Math.cos(a) * r * 0.58)
  })
  ctx.lineWidth = U * 0.004
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.stroke()
  ctx.restore()
}

function moonphase(ctx, U, cx, cy, d) {
  ctx.save()
  ctx.translate(cx, cy)
  const r = U * 0.2
  ctx.beginPath()
  ctx.arc(0, 0, r, Math.PI, 0)
  ctx.closePath()
  ctx.clip()
  const sky = ctx.createLinearGradient(0, -r, 0, 0)
  sky.addColorStop(0, '#3a0b37')
  sky.addColorStop(1, '#64165D')
  ctx.fillStyle = sky
  ctx.fillRect(-r, -r, r * 2, r)
  const rand = rng(11)
  ctx.fillStyle = '#C6F0E4'
  for (let i = 0; i < 26; i++) {
    const x = (rand() * 2 - 1) * r
    const y = -rand() * r
    ctx.beginPath()
    ctx.arc(x, y, U * 0.004 * (0.5 + rand()), 0, TAU)
    ctx.fill()
  }
  const mg = ctx.createRadialGradient(-U * 0.03, -U * 0.12, U * 0.01, -U * 0.02, -U * 0.1, U * 0.07)
  mg.addColorStop(0, '#e9fff7')
  mg.addColorStop(1, '#A7E8D7')
  ctx.fillStyle = mg
  ctx.beginPath()
  ctx.arc(-U * 0.02, -U * 0.1, U * 0.062, 0, TAU)
  ctx.fill()
  // humps
  ctx.fillStyle = d.color
  ;[-1, 1].forEach((s) => {
    ctx.beginPath()
    ctx.arc(s * r * 0.62, 0, r * 0.4, 0, TAU)
    ctx.fill()
  })
  ctx.restore()
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = d.print
  ctx.lineWidth = U * 0.005
  ctx.beginPath()
  ctx.arc(0, 0, r, Math.PI, 0)
  ctx.stroke()
  ctx.restore()
}

function drawDial(ctx, S, m, bump = false) {
  const U = S / 2
  const d = m.dial
  const c = m.complications || {}
  ctx.save()
  ctx.translate(U, U)

  if (bump) {
    ctx.fillStyle = '#808080'
    ctx.fillRect(-U, -U, S, S)
    drawPattern(ctx, U, d, true)
    ctx.restore()
    return
  }

  const skeleton = d.pattern === 'skeleton'
  if (!skeleton) {
    const g = ctx.createRadialGradient(-U * 0.1, -U * 0.3, U * 0.05, 0, 0, U)
    g.addColorStop(0, mixHex(d.color, d.glow || '#ffffff', 0.12))
    g.addColorStop(0.65, d.color)
    g.addColorStop(1, mixHex(d.color, '#000000', 0.3))
    ctx.fillStyle = g
    ctx.fillRect(-U, -U, S, S)
    drawPattern(ctx, U, d, false)
  } else {
    // chapter ring only
    ctx.fillStyle = d.color
    ctx.beginPath()
    ctx.arc(0, 0, U, 0, TAU)
    ctx.arc(0, 0, U * 0.8, 0, TAU, true)
    ctx.fill()
    ctx.lineWidth = U * 0.006
    ctx.strokeStyle = d.print
    ctx.beginPath()
    ctx.arc(0, 0, U * 0.8, 0, TAU)
    ctx.stroke()
  }

  minuteTrack(ctx, U, d)

  ctx.fillStyle = d.print
  ctx.strokeStyle = d.print
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  // Printed numerals
  if (m.markers === 'roman') {
    ctx.font = `500 ${U * 0.13}px ${FONT_DISPLAY}`
    ROMAN.forEach((t, i) => {
      if (c.smallSeconds && i === 6) return
      if (c.moonphase && i === 6) return
      const a = (i / 12) * TAU
      ctx.save()
      ctx.rotate(a)
      ctx.translate(0, -U * 0.72)
      if (i > 3 && i < 9) ctx.rotate(Math.PI)
      ctx.fillText(t, 0, 0)
      ctx.restore()
    })
  }

  // Brand
  if (!skeleton) {
    const ly = c.tourbillon ? -U * 0.5 : -U * 0.43
    drawMark(ctx, 0, ly - U * 0.1, U * 0.05, d.print, U * 0.008)
    ctx.font = `500 ${U * 0.085}px ${FONT_DISPLAY}`
    spaced(ctx, 'VELORA', 0, ly + U * 0.01, U * 0.018)
    ctx.font = `600 ${U * 0.03}px ${FONT_TEXT}`
    spaced(ctx, 'TIME', 0, ly + U * 0.075, U * 0.022)
  } else {
    ctx.save()
    ctx.font = `500 ${U * 0.055}px ${FONT_DISPLAY}`
    arcText(ctx, 'VELORA', U * 0.84, 0, { spacing: U * 0.012 })
    ctx.restore()
  }

  // Lower texts
  const lowerY = c.tourbillon ? -U * 0.2 : c.smallSeconds || c.moonphase || c.chrono ? U * 0.18 : U * 0.36
  if (!skeleton && d.line1) {
    ctx.font = `600 ${U * 0.034}px ${FONT_TEXT}`
    spaced(ctx, d.line1, 0, lowerY, U * 0.014)
    if (d.line2) {
      ctx.font = `italic 500 ${U * 0.04}px ${FONT_DISPLAY}`
      spaced(ctx, d.line2, 0, lowerY + U * 0.055, U * 0.004)
    }
  }
  ctx.font = `600 ${U * 0.026}px ${FONT_TEXT}`
  spaced(ctx, 'SWISS MADE', 0, U * 0.975, U * 0.01)

  // Complications
  if (c.smallSeconds) subdial(ctx, U, 0, U * 0.45, U * 0.19, d, { fill: d.subColor })
  if (c.moonphase) moonphase(ctx, U, 0, U * 0.52, d)
  if (c.chrono) {
    const f = d.subColor
    subdial(ctx, U, -U * 0.42, 0, U * 0.17, d, { fill: f })
    subdial(ctx, U, U * 0.42, 0, U * 0.17, d, { fill: f, labels: ['30', '', '15', ''] })
    subdial(ctx, U, 0, U * 0.42, U * 0.17, d, { fill: f, labels: ['12', '3', '6', '9'] })
  }
  if (c.date) {
    ctx.save()
    const x0 = U * 0.6
    const w = U * 0.16
    const h = U * 0.12
    ctx.fillStyle = d.dateBg || '#C6F0E4'
    ctx.fillRect(x0, -h / 2, w, h)
    ctx.lineWidth = U * 0.008
    ctx.strokeStyle = d.print
    ctx.strokeRect(x0, -h / 2, w, h)
    ctx.fillStyle = d.dateInk || '#64165D'
    ctx.font = `600 ${U * 0.085}px ${FONT_TEXT}`
    ctx.textAlign = 'center'
    ctx.fillText(String(new Date().getDate()), x0 + w / 2, U * 0.006)
    ctx.restore()
  }
  if (c.tourbillon) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(0, U * 0.42, U * 0.25, 0, TAU)
    ctx.fill()
    ctx.restore()
    ctx.lineWidth = U * 0.012
    ctx.strokeStyle = d.print
    ctx.beginPath()
    ctx.arc(0, U * 0.42, U * 0.255, 0, TAU)
    ctx.stroke()
  }
  ctx.restore()
}

export function dialTextures(product, size = 1024) {
  return memo(`dial:${product.id}:${size}`, () => {
    const m = product.model
    const c = makeCanvas(size)
    drawDial(c.getContext('2d'), size, m)
    const out = { map: toTex(c) }
    if (['weave', 'guilloche', 'grain'].includes(m.dial.pattern)) {
      const b = makeCanvas(size / 2)
      drawDial(b.getContext('2d'), size / 2, m, true)
      out.bumpMap = toTex(b, { srgb: false })
    }
    return out
  })
}

/* Thumbnail data-URL of a dial (used in cart & checkout) */
export function dialThumb(product, size = 256) {
  return memo(`thumb:${product.id}:${size}`, () => {
    const c = makeCanvas(size)
    const ctx = c.getContext('2d')
    drawDial(ctx, size, product.model)
    return c.toDataURL('image/png')
  })
}

/* Radial anisotropy direction map — gives sunburst dials their moving beam */
export function sunburstAnisotropy(size = 256) {
  return memo(`aniso:${size}`, () => {
    const data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size - 0.5
        const v = (y + 0.5) / size - 0.5
        const l = Math.hypot(u, v) || 1
        // tangential direction (perpendicular to the brushing rays)
        const dx = -v / l
        const dy = u / l
        const i = (y * size + x) * 4
        data[i] = (dx * 0.5 + 0.5) * 255
        data[i + 1] = (dy * 0.5 + 0.5) * 255
        data[i + 2] = 255
        data[i + 3] = 255
      }
    }
    const t = new THREE.DataTexture(data, size, size)
    t.needsUpdate = true
    return t
  })
}

/* ------------------------------------------------------------------ */
/*  Movement finishing                                                 */
/* ------------------------------------------------------------------ */
export function perlageTexture() {
  return memo('perlage', () => {
    const S = 512
    const c = makeCanvas(S)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#9a9a9a'
    ctx.fillRect(0, 0, S, S)
    const r = 22
    for (let y = -r; y < S + r; y += r * 0.9) {
      for (let x = -r; x < S + r; x += r * 0.9) {
        const ox = x + ((y / (r * 0.9)) % 2 ? r * 0.45 : 0)
        const g = ctx.createRadialGradient(ox - r * 0.3, y - r * 0.3, 1, ox, y, r)
        g.addColorStop(0, '#e6e6e6')
        g.addColorStop(0.5, '#a8a8a8')
        g.addColorStop(0.75, '#d4d4d4')
        g.addColorStop(1, '#7a7a7a')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(ox, y, r, 0, TAU)
        ctx.fill()
      }
    }
    const t = toTex(c, { wrap: true })
    t.repeat.set(5, 5)
    return t
  })
}

export function wavesTexture() {
  // "Velora waves" — our take on striped bridge decoration
  return memo('waves', () => {
    const S = 512
    const c = makeCanvas(S)
    const ctx = c.getContext('2d')
    ctx.translate(S / 2, S / 2)
    ctx.rotate(-0.5)
    ctx.translate(-S, -S)
    const band = S / 7
    for (let i = 0; i < 16; i++) {
      const g = ctx.createLinearGradient(0, i * band, 0, (i + 1) * band)
      g.addColorStop(0, '#8d8d8d')
      g.addColorStop(0.45, '#f2f2f2')
      g.addColorStop(0.55, '#e0e0e0')
      g.addColorStop(1, '#8d8d8d')
      ctx.fillStyle = g
      ctx.fillRect(0, i * band, S * 2, band)
    }
    return toTex(c)
  })
}

export function rotorTexture() {
  return memo('rotor', () => {
    const S = 1024
    const c = makeCanvas(S)
    const ctx = c.getContext('2d')
    // waves
    ctx.save()
    ctx.translate(S / 2, S / 2)
    ctx.rotate(-0.35)
    const band = S / 9
    for (let i = -10; i < 10; i++) {
      const g = ctx.createLinearGradient(0, i * band, 0, (i + 1) * band)
      g.addColorStop(0, '#b9b9b9')
      g.addColorStop(0.5, '#ffffff')
      g.addColorStop(1, '#b9b9b9')
      ctx.fillStyle = g
      ctx.fillRect(-S, i * band, S * 2, band)
    }
    ctx.restore()
    // engraving
    ctx.save()
    ctx.translate(S / 2, S / 2)
    ctx.fillStyle = 'rgba(60,20,55,0.75)'
    ctx.font = `600 ${S * 0.034}px ${FONT_TEXT}`
    ctx.textBaseline = 'middle'
    ;['VELORA TIME', 'CALIBRE VT-28', 'VAL-DE-TRAVERS'].forEach((t, i) => {
      ctx.save()
      ctx.rotate(-Math.PI / 2 + (i - 1) * 0.55)
      arcText(ctx, t, S * 0.4, Math.PI / 2, { spacing: S * 0.008 })
      ctx.restore()
    })
    void spaced
    drawMark(ctx, 0, -S * 0.2, S * 0.05, 'rgba(60,20,55,0.75)', S * 0.006)
    ctx.restore()
    return toTex(c)
  })
}

export function casebackTexture(product) {
  return memo(`caseback:${product.id}`, () => {
    const S = 1024
    const c = makeCanvas(S)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, S, S)
    // circular brushing
    ctx.translate(S / 2, S / 2)
    ctx.lineWidth = 1
    for (let r = S * 0.2; r < S * 0.5; r += 2) {
      ctx.strokeStyle = `rgba(0,0,0,${0.02 + ((r * 7) % 5) * 0.008})`
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, TAU)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(70,40,65,0.85)'
    ctx.font = `600 ${S * 0.03}px ${FONT_TEXT}`
    ctx.textBaseline = 'middle'
    const s = product.specs
    const items = ['VELORA TIME', s.material.toUpperCase(), `WATER RESISTANT ${s.water.toUpperCase()}`, 'SAPPHIRE CRYSTAL', 'SWISS MADE', `N° ${product.serial || '0427'}`]
    items.forEach((t, i) => {
      arcText(ctx, t, S * 0.42, (i / items.length) * TAU, { spacing: S * 0.006 })
    })
    return toTex(c)
  })
}

export function bezelInsertTexture(product, inner, outer) {
  return memo(`insert:${product.id}`, () => {
    const S = 1024
    const U = S / 2
    const m = product.model
    const c = makeCanvas(S)
    const ctx = c.getContext('2d')
    const fi = inner / outer
    ctx.translate(U, U)
    ctx.fillStyle = m.bezelColor || '#64165D'
    ctx.beginPath()
    ctx.arc(0, 0, U, 0, TAU)
    ctx.arc(0, 0, U * fi, 0, TAU, true)
    ctx.fill()
    ctx.fillStyle = m.bezelPrint || '#C6F0E4'
    ctx.strokeStyle = m.bezelPrint || '#C6F0E4'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    const mid = U * (fi + 1) / 2
    if (m.bezel === 'diver') {
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU
        if (i === 0) continue
        if (i % 10 === 0) {
          ctx.save()
          ctx.rotate(a)
          ctx.translate(0, -mid)
          ctx.font = `600 ${U * 0.085}px ${FONT_TEXT}`
          ctx.fillText(String(i), 0, 0)
          ctx.restore()
        } else if (i < 15 || i % 5 === 0) {
          ctx.lineWidth = U * (i % 5 === 0 ? 0.018 : 0.008)
          ctx.beginPath()
          ctx.moveTo(Math.sin(a) * U * (fi + 0.02), -Math.cos(a) * U * (fi + 0.02))
          ctx.lineTo(Math.sin(a) * U * (i % 5 === 0 ? 0.97 : fi + 0.07), -Math.cos(a) * U * (i % 5 === 0 ? 0.97 : fi + 0.07))
          ctx.stroke()
        }
      }
      // triangle at 12
      ctx.beginPath()
      ctx.moveTo(0, -U * (fi + 0.03))
      ctx.lineTo(U * 0.05, -U * 0.97)
      ctx.lineTo(-U * 0.05, -U * 0.97)
      ctx.closePath()
      ctx.fill()
    } else {
      // tachymeter
      const vals = [500, 400, 300, 250, 200, 180, 160, 140, 120, 110, 100, 90, 80, 75, 70, 65]
      ctx.font = `600 ${U * 0.05}px ${FONT_TEXT}`
      vals.forEach((n) => {
        const a = ((3600 / n) / 60) * TAU
        ctx.save()
        ctx.rotate(a)
        ctx.translate(0, -mid)
        ctx.fillText(String(n), 0, 0)
        ctx.restore()
      })
      for (let s = 7.2; s < 60; s += 0.5) {
        const a = (s / 60) * TAU
        ctx.lineWidth = U * 0.005
        ctx.beginPath()
        ctx.moveTo(Math.sin(a) * U * 0.95, -Math.cos(a) * U * 0.95)
        ctx.lineTo(Math.sin(a) * U * 0.985, -Math.cos(a) * U * 0.985)
        ctx.stroke()
      }
      ctx.font = `600 ${U * 0.04}px ${FONT_TEXT}`
      ctx.save()
      ctx.rotate(Math.PI * 0.08)
      arcText(ctx, 'TACHYMETRE', mid, Math.PI * 1.5, { spacing: U * 0.01 })
      ctx.restore()
    }
    return toTex(c)
  })
}

/* Leather / rubber strap tile: u = along strap, v = across */
export function strapTexture(type, color, stitch) {
  return memo(`strap:${type}:${color}:${stitch}`, () => {
    const W = 512
    const H = 256
    const c = makeCanvas(W, H)
    const ctx = c.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, W, H)
    const rand = rng(3)
    if (type === 'leather') {
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
        const s = 1 + rand() * 3
        ctx.fillRect(rand() * W, rand() * H, s, s)
      }
      // alligator-like scales in the centre band
      ctx.strokeStyle = 'rgba(0,0,0,0.22)'
      ctx.lineWidth = 2
      for (let x = 0; x < W; x += 34) {
        for (let y = H * 0.24; y < H * 0.76; y += 30) {
          ctx.beginPath()
          ctx.ellipse(x + (y % 60 ? 17 : 0), y, 15, 12, 0, 0, TAU)
          ctx.stroke()
        }
      }
      ctx.strokeStyle = stitch
      ctx.lineWidth = 4
      ctx.setLineDash([14, 9])
      ;[H * 0.09, H * 0.91].forEach((y) => {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      })
    } else {
      // rubber: transverse ribs
      for (let x = 0; x < W; x += 16) {
        const g = ctx.createLinearGradient(x, 0, x + 16, 0)
        g.addColorStop(0, 'rgba(0,0,0,0.12)')
        g.addColorStop(0.5, 'rgba(255,255,255,0.08)')
        g.addColorStop(1, 'rgba(0,0,0,0.12)')
        ctx.fillStyle = g
        ctx.fillRect(x, H * 0.2, 16, H * 0.6)
      }
    }
    const t = toTex(c, { wrap: true })
    return t
  })
}

/* Room environment for PBR reflections (procedural "light-formers") */
export function buildStudioScene(hdr = null, hdrExposure = 0.36) {
  const scene = new THREE.Scene()
  if (hdr) {
    // photographed studio as the room, so reflections carry real-world detail
    // clamp the hottest light sources so they read as softboxes, not blown-out glare
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { map: { value: hdr }, exposure: { value: hdrExposure }, peak: { value: 2.4 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform float exposure; uniform float peak; varying vec2 vUv; void main() { vec3 c = texture2D(map, vUv).rgb * exposure; gl_FragColor = vec4(min(c, vec3(peak)), 1.0); }',
    })
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(30, 64, 32), mat))
  } else {
    const box = new THREE.BoxGeometry(1, 1, 1)
    const room = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color('#6f7775'), side: THREE.BackSide }))
    room.scale.set(40, 40, 40)
    scene.add(room)
  }
  const plane = new THREE.PlaneGeometry(1, 1)
  const panel = (color, intensity, w, h, pos, look = [0, 0, 0]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    mat.toneMapped = false
    const m = new THREE.Mesh(plane, mat)
    m.scale.set(w, h, 1)
    m.position.set(...pos)
    m.lookAt(...look)
    scene.add(m)
  }
  const flag = (w, h, pos) => {
    const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: '#141016', side: THREE.DoubleSide }))
    m.scale.set(w, h, 1)
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    scene.add(m)
  }
  panel('#ffffff', 1.4, 12, 6, [0, 14, 2]) // top softbox
  panel('#ffffff', 5.5, 1.4, 16, [-10, 2, 7]) // key strip
  panel('#f4fffb', 3.6, 1.0, 16, [10, 0, 5]) // second strip
  panel('#C6F0E4', 0.45, 10, 2.5, [0, -4, 14]) // front fill
  panel('#8A176E', 2.6, 8, 8, [-8, 5, -11]) // magenta rim
  panel('#A7E8D7', 2.0, 6, 6, [8, -4, -10]) // aqua rim
  panel('#C6F0E4', 0.3, 22, 22, [0, -13, 0]) // floor bounce
  panel('#ffffff', 1.6, 3, 0.6, [3, 9, 9]) // catchlight
  panel('#e9fff8', 0.9, 10, 14, [-13, 0, -2]) // left soft wall
  panel('#e9fff8', 0.8, 10, 14, [13, 2, -3]) // right soft wall
  flag(8, 16, [-6, 0, 12]) // dark flags give polished metal its contrast
  flag(6, 16, [7, 2, 11])
  flag(18, 5, [0, -9, 6])
  return scene
}

