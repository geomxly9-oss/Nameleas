import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onTick } from './ticker'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null
let started = false

export function initScroll() {
  if (started) return lenis
  started = true
  if (!prefersReducedMotion()) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
    lenis.on('scroll', ScrollTrigger.update)
    onTick((time) => lenis.raf(time * 1000), -10)
  }
  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollToTarget(target, { offset = 0, immediate = false, duration = 1.6 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate, duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  let y = 0
  if (typeof target === 'number') y = target
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    y = el.getBoundingClientRect().top + window.scrollY + offset
  }
  window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function stopScroll(stop) {
  if (!lenis) {
    document.documentElement.style.overflow = stop ? 'hidden' : ''
    return
  }
  if (stop) lenis.stop()
  else lenis.start()
}

export function currentScroll() {
  return lenis ? lenis.scroll : window.scrollY
}
