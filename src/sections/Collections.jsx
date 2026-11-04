import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { collections, products } from '../data/products'
import ProductCard from '../components/ProductCard'
import { RevealHeading } from '../components/Reveal'

const TABS = [{ id: 'all', short: 'All watches', blurb: 'Ten references across five collections. Every one of them can be turned, tilted and opened up right here.' }, ...collections]

export default function Collections() {
  const [tab, setTab] = useState('all')
  const list = tab === 'all' ? products : products.filter((p) => p.collection === tab)
  const current = TABS.find((t) => t.id === tab)
  return (
    <section className="section collections" id="collections" data-bg="#C6F0E4" aria-labelledby="collections-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <RevealHeading id="collections-title" className="h1">
              Watch Collections
            </RevealHeading>
          </div>
          <div style={{ display: 'grid', gap: 18 }}>
            <AnimatePresence mode="wait">
              <motion.p key={tab} className="collection-blurb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                {current.blurb}
              </motion.p>
            </AnimatePresence>
            <LayoutGroup>
              <div className="tabs" role="tablist" aria-label="Filter by collection">
                {TABS.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-controls="collection-grid" onClick={() => setTab(t.id)}>
                    {tab === t.id && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span>{t.id === 'all' ? t.short : t.name}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>
        </div>
        <motion.div id="collection-grid" className="grid-products" role="tabpanel" layout>
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
