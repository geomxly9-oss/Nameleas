import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

/* Headline that rises line by line from behind a mask as it enters the viewport. */
export function RevealHeading({ as: Tag = 'h2', className = '', children, delay = 0, start = 'top 85%', ...rest }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      let split
      const run = () => {
        split = SplitText.create(ref.current, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.09,
          delay,
          scrollTrigger: { trigger: ref.current, start, once: true },
        })
      }
      document.fonts?.ready ? document.fonts.ready.then(run) : run()
      return () => split?.revert()
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/* Simple fade-up for supporting blocks, used sparingly. */
export function Reveal({ as: Tag = 'div', className = '', children, y = 28, delay = 0, ...rest }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      gsap.from(ref.current, { y, opacity: 0, duration: 1.1, delay, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } })
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
