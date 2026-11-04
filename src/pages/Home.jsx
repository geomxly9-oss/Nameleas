import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLocation } from 'react-router'
import StageView, { stage } from '../three/scene/Stage'
import Hero from '../sections/Hero'
import Featured from '../sections/Featured'
import Craftsmanship from '../sections/Craftsmanship'
import Components3D from '../sections/Components3D'
import Collections from '../sections/Collections'
import Movement from '../sections/Movement'
import BrandStory from '../sections/BrandStory'
import LimitedEdition from '../sections/LimitedEdition'
import Newsletter from '../sections/Newsletter'
import { getProduct, HERO_ID } from '../data/products'
import { onTick } from '../lib/ticker'
import { scrollToTarget } from '../lib/scroll'
import { useUI } from '../store/ui'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const MINT = new THREE.Color('#C6F0E4')

/* Scroll choreography: pins, stage progress and the page background. */
function useScrollScene(root) {
  useGSAP(
    () => {
      const P = stage.p
      Object.keys(P).forEach((k) => (P[k] = 0))
      stage.assemble = 0
      const set = (key) => (s) => (P[key] = s.progress)
      const track = (key, trigger, start, end) => ScrollTrigger.create({ trigger, start, end, onUpdate: set(key), onRefresh: set(key) })

      track('featured', '#featured', 'top bottom', 'top 15%')
      track('craftEntry', '#craft', 'top 65%', 'top top')
      ScrollTrigger.create({ trigger: '#craft', start: 'top top', end: '+=300%', pin: true, onUpdate: set('craft'), onRefresh: set('craft') })
      track('compEntry', '#components', 'top 75%', 'top top')
      ScrollTrigger.create({ trigger: '#components', start: 'top top', end: '+=260%', pin: true, onUpdate: set('comp'), onRefresh: set('comp') })
      track('exit', '#collections', 'top bottom', 'top 35%')

      // Background colour: each section blends its colour in as it arrives.
      const bgs = [...root.current.querySelectorAll('[data-bg]')].map((el) => ({
        color: new THREE.Color(el.dataset.bg),
        st: ScrollTrigger.create({ trigger: el, start: 'top 72%', end: 'top 22%' }),
      }))
      const bgEl = document.querySelector('.page-bg')
      const glowEl = document.querySelector('.page-bg__glow')
      const header = document.getElementById('site-header')
      const c = new THREE.Color()
      const off = onTick(() => {
        c.copy(MINT)
        bgs.forEach((b) => {
          const t = b.st.progress
          if (t > 0) c.lerp(b.color, t)
        })
        if (bgEl) bgEl.style.backgroundColor = `#${c.getHexString()}`
        const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
        const dark = THREE.MathUtils.clamp((0.42 - lum) / 0.3, 0, 1)
        stage.dark = dark
        if (glowEl) glowEl.style.setProperty('--glow', String(Math.max(0, 1 - stage.p.featured * 1.4)))
        if (header) header.dataset.theme = dark > 0.5 ? 'dark' : 'light'
      }, 4)

      const refresh = () => ScrollTrigger.refresh()
      document.fonts?.ready?.then(refresh)
      const t = setTimeout(refresh, 600)
      return () => {
        off()
        clearTimeout(t)
        if (bgEl) bgEl.style.backgroundColor = ''
        if (header) header.dataset.theme = 'light'
        stage.dark = 0
      }
    },
    { scope: root },
  )
}

export default function Home() {
  const root = useRef(null)
  const location = useLocation()
  const ready = useUI((s) => s.ready)
  useScrollScene(root)

  useEffect(() => {
    const id = location.state?.scrollTo
    if (!id || !ready) return
    const t = setTimeout(() => scrollToTarget(`#${id}`, { duration: 1.2 }), 500)
    return () => clearTimeout(t)
  }, [location.state, ready])

  return (
    <main id="main" ref={root}>
      <StageView product={getProduct(HERO_ID)} />
      <Hero />
      <Featured />
      <Craftsmanship />
      <Components3D />
      <Collections />
      <Movement />
      <BrandStory />
      <LimitedEdition />
      <Newsletter />
    </main>
  )
}
