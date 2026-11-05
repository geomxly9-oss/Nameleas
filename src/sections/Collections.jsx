import { useCallback, useState } from 'react'
import { WATCHES } from '../data/gallery'
import PhotoCard from '../components/PhotoCard'
import PhotoViewer from '../components/PhotoViewer'
import { RevealHeading } from '../components/Reveal'

export default function Collections() {
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  return (
    <section className="section collections" id="collections" data-bg="#C6F0E4" aria-labelledby="collections-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <RevealHeading id="collections-title" className="h1">
              Watch Collections
            </RevealHeading>
          </div>
          <p className="collection-blurb">Thirteen watches from independent houses. Drag any of them to spin it a full 360°, or open it larger.</p>
        </div>
        <div id="collection-grid" className="grid-photos">
          {WATCHES.map((w, i) => (
            <PhotoCard key={w.src} watch={w} index={i} feature={i === 0} onOpen={setOpen} />
          ))}
        </div>
        <p className="collections__credit">Photographs and trademarks belong to their makers.</p>
      </div>
      <PhotoViewer watches={WATCHES} index={open} onClose={close} onIndex={setOpen} />
    </section>
  )
}
