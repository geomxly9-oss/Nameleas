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
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.add((time, dt) => {
      for (let i = 0; i < subs.length; i++) subs[i].fn(time, dt)
    })
  }
  return () => {
    const i = subs.indexOf(entry)
    if (i >= 0) subs.splice(i, 1)
  }
}
