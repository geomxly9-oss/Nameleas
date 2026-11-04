import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { RevealHeading, Reveal } from '../components/Reveal'
import { prefersReducedMotion } from '../lib/scroll'

const MILESTONES = [
  ['1907', 'Élise Varenne opens a two-bench workshop in Les Verrières, repairing pocket watches for farmers in the Val-de-Travers.'],
  ['1954', 'Our first self-winding calibre. Its bidirectional rotor is still the basis of every Velora movement.'],
  ['1978', 'Regalis is drawn: a twelve-facet bezel and a bracelet that flows out of the case.'],
  ['2007', 'Velor gold, our own 18-carat alloy with a violet blush, is cast for the centenary.'],
  ['2026', 'The Lucent skeleton series, cut away by hand to show the movement from both sides.'],
]

export default function BrandStory() {
  const root = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo('.story__year', { yPercent: 20 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section className="section story" id="story" data-bg="#A7E8D7" ref={root} aria-labelledby="story-title">
      <div className="wrap">
        <p className="kicker" style={{ marginBottom: 22 }}>
          Brand story
        </p>
        <RevealHeading id="story-title" className="story__quote">
          We have made watches in the same valley since 1907, and we still set every dial <em>by hand</em>.
        </RevealHeading>
        <div className="story__cols">
          <div>
            <div className="story__year" aria-hidden="true">
              1907
            </div>
            <Reveal as="p" className="lead" style={{ marginTop: 28 }}>
              Velora is still independent and still family-run. Forty-two watchmakers, engravers and polishers work under one roof, and every watch leaves with the name of the person who assembled it.
            </Reveal>
          </div>
          <ol className="timeline" aria-label="Milestones">
            {MILESTONES.map(([y, t]) => (
              <Reveal as="li" key={y}>
                <b>{y}</b>
                <p>{t}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
