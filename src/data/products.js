// VELORA TIME — catalogue
// Every product carries its own 3D configuration (`model`) used by the procedural watch renderer.

export const COLORS = {
  mint: '#C6F0E4',
  aqua: '#A7E8D7',
  plum: '#64165D',
  magenta: '#8A176E',
}

export const collections = [
  {
    id: 'classic',
    name: 'Classic Collection',
    short: 'Classic',
    line: 'Aurelle',
    blurb: 'Dress watches cut close to the wrist. Engine-turned dials, Roman numerals, hand-stitched straps.',
  },
  {
    id: 'royal',
    name: 'Royal Collection',
    short: 'Royal',
    line: 'Regalis',
    blurb: 'Our flagship. A twelve-facet bezel and an integrated bracelet that flows out of the case.',
  },
  {
    id: 'sport',
    name: 'Sport Collection',
    short: 'Sport',
    line: 'Tidal',
    blurb: 'Titanium and ceramic tool watches, tested to 300 metres and built for a life outdoors.',
  },
  {
    id: 'skeleton',
    name: 'Skeleton Collection',
    short: 'Skeleton',
    line: 'Lucent',
    blurb: 'Dials removed, plates cut away. The going train and balance on full display.',
  },
  {
    id: 'limited',
    name: 'Limited Edition',
    short: 'Limited Edition',
    line: 'Nocturne',
    blurb: 'Numbered series, each piece signed by the watchmaker who assembled it.',
  },
]

const calibres = {
  'VT-28': { name: 'Calibre VT-28', type: 'Self-winding mechanical', reserve: '72 hours', frequency: '28,800 vph (4 Hz)', jewels: 31, parts: 214, functions: 'Hours, minutes, central seconds, date' },
  'VT-28S': { name: 'Calibre VT-28S', type: 'Self-winding mechanical', reserve: '72 hours', frequency: '28,800 vph (4 Hz)', jewels: 31, parts: 221, functions: 'Hours, minutes, small seconds' },
  'VT-31M': { name: 'Calibre VT-31M', type: 'Self-winding mechanical', reserve: '70 hours', frequency: '28,800 vph (4 Hz)', jewels: 35, parts: 268, functions: 'Hours, minutes, moon phase (one-day error in 122 years)' },
  'VT-52C': { name: 'Calibre VT-52C', type: 'Self-winding column-wheel chronograph', reserve: '60 hours', frequency: '36,000 vph (5 Hz)', jewels: 41, parts: 327, functions: 'Hours, minutes, small seconds, flyback chronograph, tachymeter' },
  'VT-28SQ': { name: 'Calibre VT-28SQ', type: 'Self-winding mechanical, skeletonised', reserve: '72 hours', frequency: '28,800 vph (4 Hz)', jewels: 31, parts: 209, functions: 'Hours, minutes, central seconds' },
  'VT-90T': { name: 'Calibre VT-90T', type: 'Self-winding flying tourbillon', reserve: '80 hours', frequency: '21,600 vph (3 Hz)', jewels: 34, parts: 251, functions: 'Hours, minutes, one-minute flying tourbillon' },
}

const base = (o) => ({ ...o, movement: calibres[o.calibre] })

export const products = [
  // ------------------------------------------------------------------ ROYAL
  base({
    id: 'regalis-41-plum',
    name: 'Regalis 41',
    variant: 'Plum dial, steel',
    collection: 'royal',
    ref: 'VT-4102.ST.PL',
    price: 18900,
    stock: 'in',
    availability: 'In stock. Ships from Geneva in 3 working days.',
    calibre: 'VT-28',
    tagline: 'The flagship, in steel with a plum Lumen-weave dial.',
    description: [
      'Regalis is the watch Velora is built around. A twelve-facet bezel catches light at every angle, and the bracelet leaves the case without a seam, so the whole piece reads as one sculpted line.',
      'Its dial is engraved with our Lumen weave, a pattern of undulating rings cut on a 1950s rose engine in our Val-de-Travers atelier, then lacquered in deep plum.',
    ],
    specs: { diameter: '41 mm', thickness: '10.8 mm', material: 'Steel 904L', bezel: 'Twelve-facet, polished', crystal: 'Sapphire, anti-reflective both sides', dial: 'Plum lacquer, Lumen-weave engraving', water: '100 m', strap: 'Integrated steel bracelet, five-piece links', clasp: 'Folding clasp with 5 mm micro-adjust' },
    model: {
      diameter: 41, thickness: 10.8, metal: 'steel', bezel: 'dodeca', lugs: 'integrated', markers: 'baton', hands: 'baton', handMetal: 'steel',
      dial: { color: '#64165D', glow: '#C6F0E4', pattern: 'weave', print: '#C6F0E4', line1: 'AUTOMATIC', line2: 'Chronomètre', seconds: '#A7E8D7', lume: true },
      complications: { date: true },
      strap: { type: 'bracelet', style: 'royal' },
    },
  }),
  base({
    id: 'regalis-41-velor',
    name: 'Regalis 41',
    variant: 'Aqua dial, Velor gold',
    collection: 'royal',
    ref: 'VT-4102.VG.AQ',
    price: 61500,
    stock: 'order',
    availability: 'Made to order. Delivered in 10 weeks.',
    calibre: 'VT-28',
    tagline: 'Solid 18k Velor gold, our rose alloy with a violet blush.',
    description: [
      'Cast in Velor gold, an 18-carat alloy we developed with a Neuchâtel foundry. It carries a faint violet note that deepens with years of wear.',
      'The aqua dial is cut with the same Lumen weave as the steel Regalis and finished with applied gold indices.',
    ],
    specs: { diameter: '41 mm', thickness: '10.8 mm', material: '18k Velor gold', bezel: 'Twelve-facet, polished', crystal: 'Sapphire, anti-reflective both sides', dial: 'Aqua lacquer, Lumen-weave engraving', water: '100 m', strap: 'Integrated 18k Velor gold bracelet', clasp: 'Folding clasp in Velor gold' },
    model: {
      diameter: 41, thickness: 10.8, metal: 'velor', bezel: 'dodeca', lugs: 'integrated', markers: 'baton', hands: 'baton', handMetal: 'velor',
      dial: { color: '#A7E8D7', glow: '#ffffff', pattern: 'weave', print: '#64165D', line1: 'AUTOMATIC', line2: 'Chronomètre', seconds: '#8A176E' },
      complications: { date: true },
      strap: { type: 'bracelet', style: 'royal' },
    },
  }),
  // ------------------------------------------------------------------ CLASSIC
  base({
    id: 'aurelle-39-small-seconds',
    name: 'Aurelle 39',
    variant: 'Small seconds, steel',
    collection: 'classic',
    ref: 'VT-1390.ST.MT',
    price: 9800,
    stock: 'in',
    availability: 'In stock. Ships from Geneva in 3 working days.',
    calibre: 'VT-28S',
    tagline: 'A slim dress watch with a rose-engine dial and small seconds.',
    description: [
      'Aurelle keeps everything we know about proportion in 39 millimetres. Leaf hands, printed Roman numerals and a small seconds at six.',
      'The mint dial is engine-turned in a rosette at its centre and ringed with fine azurage, so it changes tone as your wrist turns.',
    ],
    specs: { diameter: '39 mm', thickness: '9.4 mm', material: 'Steel 904L', bezel: 'Polished, slim', crystal: 'Box sapphire', dial: 'Mint, rose-engine guilloché', water: '50 m', strap: 'Plum alligator, hand-stitched', clasp: 'Tang buckle in steel' },
    model: {
      diameter: 39, thickness: 9.4, metal: 'steel', bezel: 'polished', lugs: 'classic', markers: 'roman', hands: 'leaf', handMetal: 'plum',
      dial: { color: '#C6F0E4', glow: '#ffffff', pattern: 'guilloche', print: '#64165D', line1: 'AUTOMATIC', seconds: '#64165D', subColor: '#b7e6d8' },
      complications: { smallSeconds: true },
      strap: { type: 'leather', color: '#64165D', stitch: '#C6F0E4' },
    },
  }),
  base({
    id: 'aurelle-40-moonphase',
    name: 'Aurelle 40',
    variant: 'Moon phase, Velor gold',
    collection: 'classic',
    ref: 'VT-1400.VG.PL',
    price: 24500,
    stock: 'in',
    availability: 'In stock. Two pieces at the Geneva boutique.',
    calibre: 'VT-31M',
    tagline: 'An astronomical moon phase on a plum sunburst dial.',
    description: [
      'The moon disc is painted by hand in aqua lacquer and driven by a 135-tooth wheel, accurate to one day in 122 years.',
      'A stepped bezel and dauphine hands in Velor gold give the case a softer, older silhouette.',
    ],
    specs: { diameter: '40 mm', thickness: '10.2 mm', material: '18k Velor gold', bezel: 'Stepped, polished', crystal: 'Box sapphire', dial: 'Plum sunburst', water: '50 m', strap: 'Magenta alligator, hand-stitched', clasp: 'Tang buckle in Velor gold' },
    model: {
      diameter: 40, thickness: 10.2, metal: 'velor', bezel: 'stepped', lugs: 'classic', markers: 'baton', hands: 'dauphine', handMetal: 'velor',
      dial: { color: '#64165D', glow: '#A7E8D7', pattern: 'sunburst', print: '#C6F0E4', line1: 'AUTOMATIC', line2: 'Phase de lune', seconds: '#C6F0E4' },
      complications: { moonphase: true },
      strap: { type: 'leather', color: '#8A176E', stitch: '#C6F0E4' },
    },
  }),
  // ------------------------------------------------------------------ SPORT
  base({
    id: 'tidal-42-diver',
    name: 'Tidal 42',
    variant: 'Diver, titanium',
    collection: 'sport',
    ref: 'VT-3420.TI.PL',
    price: 11400,
    stock: 'in',
    availability: 'In stock. Ships from Geneva in 3 working days.',
    calibre: 'VT-28',
    tagline: 'A 300-metre diver in grade 5 titanium with a plum ceramic bezel.',
    description: [
      'Tidal is built for the water first. A unidirectional bezel in plum ceramic, a screw-down crown with guards and 300 metres of water resistance.',
      'Grade 5 titanium keeps it at 98 grams on its rubber strap. Every index is filled with aqua-glowing luminous paint.',
    ],
    specs: { diameter: '42 mm', thickness: '12.1 mm', material: 'Grade 5 titanium', bezel: 'Unidirectional, plum ceramic insert', crystal: 'Sapphire, 3 mm', dial: 'Mint grained', water: '300 m', strap: 'Plum vulcanised rubber', clasp: 'Titanium tang buckle' },
    model: {
      diameter: 42, thickness: 12.1, metal: 'titanium', bezel: 'diver', bezelColor: '#64165D', bezelPrint: '#C6F0E4', lugs: 'sport', crownGuards: true, markers: 'dot', hands: 'sword', handMetal: 'steel',
      dial: { color: '#C6F0E4', glow: '#ffffff', pattern: 'grain', print: '#64165D', line1: 'AUTOMATIC', line2: '300 m / 1000 ft', seconds: '#8A176E', lume: true },
      complications: { date: true },
      strap: { type: 'rubber', color: '#64165D' },
    },
  }),
  base({
    id: 'tidal-42-chrono',
    name: 'Tidal Chronograph 42',
    variant: 'Flyback, steel',
    collection: 'sport',
    ref: 'VT-3520.ST.MT',
    price: 14900,
    stock: 'in',
    availability: 'In stock. Ships from Geneva in 3 working days.',
    calibre: 'VT-52C',
    tagline: 'A column-wheel flyback chronograph with a ceramic tachymeter.',
    description: [
      'Press the lower pusher mid-timing and the chronograph resets and restarts in one movement. That is the flyback, made for timing laps and approach legs.',
      'Plum subdials on a mint dial, a fixed ceramic tachymeter and a five-link steel bracelet.',
    ],
    specs: { diameter: '42 mm', thickness: '13.4 mm', material: 'Steel 904L', bezel: 'Fixed plum ceramic tachymeter', crystal: 'Sapphire, anti-reflective', dial: 'Mint sunburst, plum subdials', water: '100 m', strap: 'Steel bracelet, five-piece links', clasp: 'Folding clasp with 5 mm micro-adjust' },
    model: {
      diameter: 42, thickness: 13.4, metal: 'steel', bezel: 'tachy', bezelColor: '#64165D', bezelPrint: '#C6F0E4', lugs: 'sport', pushers: true, markers: 'baton', hands: 'baton', handMetal: 'steel',
      dial: { color: '#C6F0E4', glow: '#ffffff', pattern: 'sunburst', print: '#64165D', subColor: '#64165D', subPrint: '#C6F0E4', seconds: '#8A176E', lume: true },
      complications: { chrono: true },
      strap: { type: 'bracelet', style: 'sport' },
    },
  }),
  // ------------------------------------------------------------------ SKELETON
  base({
    id: 'lucent-40-steel',
    name: 'Lucent 40',
    variant: 'Skeleton, steel',
    collection: 'skeleton',
    ref: 'VT-5400.ST.SQ',
    price: 46500,
    stock: 'order',
    availability: 'Made to order. Delivered in 14 weeks.',
    calibre: 'VT-28SQ',
    tagline: 'No dial. The movement is the face.',
    description: [
      'We cut away 61 percent of the main plate and bridges by hand, then bevel every inner angle so the light runs along the edges.',
      'What remains is a chapter ring, the hands, and the full going train in Velor gold, visible from both sides.',
    ],
    specs: { diameter: '40 mm', thickness: '9.8 mm', material: 'Steel 904L', bezel: 'Polished', crystal: 'Sapphire front and back', dial: 'Open-worked, aqua chapter ring', water: '50 m', strap: 'Steel bracelet, five-piece links', clasp: 'Folding clasp' },
    model: {
      diameter: 40, thickness: 9.8, metal: 'steel', bezel: 'polished', lugs: 'classic', markers: 'dagger', hands: 'skeleton', handMetal: 'steel', skeleton: true,
      dial: { color: '#A7E8D7', pattern: 'skeleton', print: '#64165D', seconds: '#8A176E' },
      complications: {},
      strap: { type: 'bracelet', style: 'sport' },
    },
  }),
  base({
    id: 'lucent-40-velor',
    name: 'Lucent 40',
    variant: 'Skeleton, Velor gold',
    collection: 'skeleton',
    ref: 'VT-5400.VG.SQ',
    price: 89000,
    stock: 'order',
    availability: 'Made to order. Delivered in 16 weeks.',
    calibre: 'VT-28SQ',
    tagline: 'Open-worked in Velor gold on a magenta alligator strap.',
    description: [
      'The same hand-skeletonised calibre as the steel Lucent, framed in 18k Velor gold.',
      'A plum chapter ring and gold dagger indices sit above the movement, so the time stays legible over all that detail.',
    ],
    specs: { diameter: '40 mm', thickness: '9.8 mm', material: '18k Velor gold', bezel: 'Polished', crystal: 'Sapphire front and back', dial: 'Open-worked, plum chapter ring', water: '50 m', strap: 'Magenta alligator, hand-stitched', clasp: 'Tang buckle in Velor gold' },
    model: {
      diameter: 40, thickness: 9.8, metal: 'velor', bezel: 'polished', lugs: 'classic', markers: 'dagger', hands: 'skeleton', handMetal: 'velor', skeleton: true,
      dial: { color: '#64165D', pattern: 'skeleton', print: '#C6F0E4', seconds: '#A7E8D7' },
      complications: {},
      strap: { type: 'leather', color: '#8A176E', stitch: '#C6F0E4' },
    },
  }),
  // ------------------------------------------------------------------ LIMITED
  base({
    id: 'nocturne-41-tourbillon',
    name: 'Nocturne Tourbillon 41',
    variant: 'Plum ceramic, 88 pieces',
    collection: 'limited',
    ref: 'VT-9410.CE.LE',
    price: 245000,
    stock: 'limited',
    edition: 88,
    remaining: 12,
    availability: '12 of 88 pieces remain. Allocated by private appointment.',
    calibre: 'VT-90T',
    tagline: 'A flying tourbillon in a case of solid plum ceramic.',
    description: [
      'The tourbillon cage turns once a minute at six o’clock, held from below only, with no upper bridge to hide it.',
      'The case is milled from a single block of plum ceramic, then polished for 40 hours. Each of the 88 pieces carries the signature of its watchmaker on the case back.',
    ],
    specs: { diameter: '41 mm', thickness: '11.6 mm', material: 'Plum ceramic', bezel: 'Plum ceramic, polished', crystal: 'Box sapphire', dial: 'Mint sunburst with tourbillon aperture', water: '50 m', strap: 'Plum rubber with alligator inlay', clasp: 'Folding clasp in Velor gold' },
    model: {
      diameter: 41, thickness: 11.6, metal: 'ceramic', bezel: 'polished', lugs: 'classic', markers: 'baton', hands: 'dauphine', handMetal: 'velor', trimMetal: 'velor',
      dial: { color: '#C6F0E4', glow: '#ffffff', pattern: 'sunburst', print: '#64165D', line1: 'TOURBILLON VOLANT', seconds: '#8A176E' },
      complications: { tourbillon: true },
      strap: { type: 'rubber', color: '#64165D' },
    },
  }),
  base({
    id: 'nocturne-39-jubilee',
    name: 'Nocturne 1907 Jubilee',
    variant: 'Platinum, 119 pieces',
    collection: 'limited',
    ref: 'VT-9390.PT.LE',
    price: 128000,
    stock: 'limited',
    edition: 119,
    remaining: 31,
    availability: '31 of 119 pieces remain.',
    calibre: 'VT-31M',
    tagline: 'One piece for every year since 1907, in platinum.',
    description: [
      'Made to mark 119 years of Velora. A platinum Aurelle case with a magenta guilloché dial and our moon phase.',
      'The rotor is engraved with the plan of the original 1907 workshop in Les Verrières.',
    ],
    specs: { diameter: '39 mm', thickness: '10.4 mm', material: 'Platinum 950', bezel: 'Stepped, polished', crystal: 'Box sapphire', dial: 'Magenta, rose-engine guilloché', water: '50 m', strap: 'Plum alligator, hand-stitched', clasp: 'Platinum tang buckle' },
    model: {
      diameter: 39, thickness: 10.4, metal: 'platinum', bezel: 'stepped', lugs: 'classic', markers: 'roman', hands: 'leaf', handMetal: 'platinum',
      dial: { color: '#8A176E', glow: '#C6F0E4', pattern: 'guilloche', print: '#C6F0E4', line1: 'AUTOMATIC', seconds: '#C6F0E4' },
      complications: { moonphase: true },
      strap: { type: 'leather', color: '#64165D', stitch: '#A7E8D7' },
    },
  }),
]

export const HERO_ID = 'regalis-41-plum'
export const LIMITED_ID = 'nocturne-41-tourbillon'
export const MOVEMENT_ID = 'lucent-40-steel'

export const getProduct = (id) => products.find((p) => p.id === id)
export const byCollection = (cid) => products.filter((p) => p.collection === cid)
export const getCollection = (cid) => collections.find((c) => c.id === cid)
