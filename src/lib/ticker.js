import gsap from 'gsap'

// One clock for everything: Lenis scroll -> ScrollTrigger -> WebGL render.
// Keeping them in a single ordered tick avoids 3D views "swimming" against the DOM.
const subs = []
let started = false

export function onTick(fn, priority = 0) {
  const entry = { fn, priority }
  subs.push(entry)
  subs.sort((a, b) => a.priority - b.priority)
  if (!started) {
    started = true
    // Absorb long stalls (shader compilation, first texture uploads) instead of
    // fast-forwarding every animation past them.
    gsap.ticker.lagSmoothing(500, 33)
    gsap.ticker.add((time, dt) => {
      for (let i = 0; i < subs.length; i++) subs[i].fn(time, dt)
    })
  }
  return () => {
    const i = subs.indexOf(entry)
    if (i >= 0) subs.splice(i, 1)
  }
}

/* Resolves once the main thread is rendering smoothly: a run of short frames
   after the initial burst of geometry, texture and shader work. */
export function whenStable({ frames = 6, maxFrameMs = 70, timeout = 9000 } = {}) {
  return new Promise((resolve) => {
    let last = performance.now()
    let good = 0
    const start = last
    const off = onTick(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      good = dt < maxFrameMs ? good + 1 : 0
      if (good >= frames || now - start > timeout) {
        off()
        resolve()
      }
    }, 100)
  })
}
