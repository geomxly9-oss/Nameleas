import { useEffect, useRef } from 'react'
import { onTick } from '../lib/ticker'
import { stage } from '../three/scene/Stage'
import { clamp01 } from '../three/kit'

const STEPS = [
  {
    title: 'The dial',
    text: 'Every Regalis dial starts as a blank of solid brass. An engraver cuts the Lumen weave on a 1950s rose engine, one ring at a time, before the dial is lacquered and fired eleven times.',
    fact: ['18 h', 'of hand engraving for a single dial'],
  },
  {
    title: 'The case',
    text: 'Cases are stamped, milled, then finished by hand. Satin brushing on the flanks, a mirror polish on the twelve facets of the bezel, and a crisp line where the two meet.',
    fact: ['140', 'finishing operations on every case'],
  },
  {
    title: 'The bracelet',
    text: 'Five-piece links, each joined by a screwed pin, taper from 20 to 16 millimetres toward a folding clasp. You can lengthen it at the table without a single tool.',
    fact: ['5 mm', 'of adjustment hidden inside the clasp'],
  },
]

const ranges = [
  [0, 0.37],
  [0.37, 0.71],
  [0.71, 1.01],
]

export default function Craftsmanship() {
  const steps = useRef([])
  const bars = useRef([])
  useEffect(
    () =>
      onTick(() => {
        const p = stage.p.craft
        ranges.forEach(([a, b], i) => {
          const fadeIn = i === 0 ? 1 : clamp01((p - a) / 0.035)
          const fadeOut = i === ranges.length - 1 ? 1 : 1 - clamp01((p - (b - 0.035)) / 0.035)
          const w = Math.min(fadeIn, fadeOut)
          const el = steps.current[i]
          if (el) {
            el.style.opacity = w
            el.style.visibility = w > 0.01 ? 'visible' : 'hidden'
            el.style.transform = `translateY(${(1 - w) * (p < a + 0.035 ? 20 : -20)}px)`
          }
          const bar = bars.current[i]
          if (bar) bar.style.transform = `scaleX(${clamp01((p - a) / (b - a))})`
        })
      }, 6),
    [],
  )
  return (
    <div className="pin-wrap">
      <section className="craft theme-dark" id="craft" data-bg="#64165D" aria-labelledby="craft-title">
        <div className="craft__grid">
          <div className="craft__copy">
            <div>
              <p className="kicker">Our craftsmanship</p>
              <h2 id="craft-title" className="h2" style={{ marginTop: 14 }}>
                Finished by hand, inspected under a loupe.
              </h2>
            </div>
            <div className="craft__steps">
              {STEPS.map((s, i) => (
                <article key={s.title} className="craft__step" ref={(el) => (steps.current[i] = el)} style={i === 0 ? { opacity: 1, visibility: 'visible' } : undefined}>
                  <span className="craft__step-n">Step {i + 1} of 3</span>
                  <h3 className="h3">{s.title}</h3>
                  <p className="body">{s.text}</p>
                  <div className="craft__fact">
                    <b>{s.fact[0]}</b>
                    <span>{s.fact[1]}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="craft__progress" aria-hidden="true">
              {STEPS.map((s, i) => (
                <i key={s.title}>
                  <b ref={(el) => (bars.current[i] = el)} />
                </i>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
