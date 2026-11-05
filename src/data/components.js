// The fifteen components of a Velora watch, in assembly order (front to back, then strap).
// Material text adapts to the watch being inspected.

const metalName = (m) =>
  ({
    steel: '904L steel',
    velor: '18k Velor gold',
    titanium: 'grade 5 titanium',
    platinum: 'platinum 950',
    ceramic: 'plum zirconia ceramic',
  })[m] || '904L steel'

export function componentInfo(id, product) {
  const m = product.model
  const metal = metalName(m.metal)
  const strap = m.strap?.type || 'bracelet'
  const water = product.specs.water
  const hands = metalName(m.handMetal === 'plum' ? 'steel' : m.handMetal || m.metal)
  const info = {
    crystal: {
      name: 'Sapphire Crystal Glass',
      fn: 'Seals the dial under a scratch-proof window. The domed edge keeps the dial readable even at a steep angle.',
      material: 'Synthetic sapphire, 9 on the Mohs scale, with anti-reflective coating on both faces.',
    },
    bezel: {
      name: 'Bezel',
      fn:
        m.bezel === 'diver'
          ? 'Frames the crystal and turns one way only, so a diver can track elapsed time without risk of over-reading it.'
          : m.bezel === 'tachy'
            ? 'Frames the crystal and carries the tachymeter scale for reading speed over a known distance.'
            : 'Frames the crystal and gives the case its silhouette. It also clamps the crystal onto its gasket.',
      material:
        m.bezel === 'diver' || m.bezel === 'tachy'
          ? `${metal[0].toUpperCase() + metal.slice(1)} ring with a plum ceramic insert, numerals filled with luminous paint.`
          : m.bezel === 'dodeca'
            ? `${metal[0].toUpperCase() + metal.slice(1)}, twelve facets polished by hand on tin discs.`
            : `${metal[0].toUpperCase() + metal.slice(1)}, mirror-polished.`,
    },
    dial: {
      name: 'Watch Dial',
      fn: 'The face of the watch. It carries the scales, the name and every printed detail, in 46 production steps.',
      material:
        m.dial.pattern === 'skeleton'
          ? 'Open-worked brass chapter ring, lacquered and pad-printed.'
          : `Solid brass base, ${{ weave: 'Lumen-weave engraving', guilloche: 'rose-engine guilloché', sunburst: 'sunburst brushing', grain: 'fine grain' }[m.dial.pattern]}, lacquered and pad-printed.`,
    },
    hands: {
      name: 'Hour and Minute Hands',
      fn: 'Show the hours and minutes. They are driven by the motion works, a small reduction gear sitting under the dial.',
      material: `Diamond-cut ${hands}${m.dial.lume ? ', filled with luminous paint' : ''}.`,
    },
    seconds: {
      name: 'Second Hand',
      fn: 'The visible pulse of the movement. It advances in eight tiny steps every second, which reads as a smooth sweep.',
      material: 'Lacquered steel, balanced by a counterweight so it never drags on the gear train.',
    },
    markers: {
      name: 'Hour Markers',
      fn: 'Applied indices that catch light, so the hour reads at a glance in any lighting.',
      material: m.markers === 'roman' ? 'Polished gold pearls set at each hour, with printed Roman numerals.' : `Faceted ${hands}, riveted to the dial by hand${m.dial.lume ? ' and filled with luminous paint' : ''}.`,
    },
    movement: {
      name: 'Watch Movement',
      fn: 'The engine. The mainspring stores energy, the escapement releases it in measured steps and the balance wheel keeps the rhythm.',
      material: `${product.movement.name}. Rhodium-plated brass plates with perlage and Velora-wave finishing, ${product.movement.jewels} jewels.`,
    },
    rotor: {
      name: 'Automatic Rotor',
      fn: 'Swings with every movement of your wrist and winds the mainspring, so the watch keeps running while worn.',
      material: '18k Velor gold oscillating weight, engraved, turning on ceramic ball bearings.',
    },
    gears: {
      name: 'Main Gear Assembly',
      fn: 'The going train. It carries energy from the barrel to the escapement and divides it into seconds, minutes and hours.',
      material: 'Gold-plated copper-beryllium wheels with polished steel pinions, pivoting in synthetic rubies.',
    },
    case: {
      name: 'Watch Case',
      fn: 'Houses the movement and protects it from shocks, dust and water.',
      material: `${metal[0].toUpperCase() + metal.slice(1)}${m.metal === 'ceramic' ? ', milled from a single block and polished for 40 hours' : ', alternating polished and satin-brushed surfaces'}.`,
    },
    crown: {
      name: 'Crown',
      fn: m.pushers
        ? 'Winds the watch and sets the time. The two pushers beside it start, stop and reset the chronograph.'
        : 'Winds the watch and sets the time' + (m.complications?.date ? ' and date.' : '.') + (m.crownGuards ? ' It screws down for water resistance.' : ''),
      material: `${m.metal === 'ceramic' ? '18k Velor gold' : metal[0].toUpperCase() + metal.slice(1)}, engraved with the V emblem, sealed by a double gasket.`,
    },
    gaskets: {
      name: 'Gaskets',
      fn: 'Seal the crystal, crown and case back so water and dust stay out.',
      material: `Fluoroelastomer O-rings, pressure-tested to ${water}.`,
    },
    caseback: {
      name: 'Case Back',
      fn: 'Closes the case and shows the movement through a sapphire window. It carries the serial number.',
      material: `${metal[0].toUpperCase() + metal.slice(1)}, screwed down, with a sapphire exhibition window.`,
    },
    bracelet:
      strap === 'bracelet'
        ? {
            name: 'Bracelet Links',
            fn: 'Articulated links that taper toward the clasp, so the bracelet drapes around the wrist.',
            material: `${metal[0].toUpperCase() + metal.slice(1)}, polished centre links between satin-brushed outer links.`,
          }
        : {
            name: 'Strap',
            fn: 'Holds the watch to the wrist and tapers toward the buckle for comfort.',
            material: strap === 'leather' ? 'Alligator leather, hand-stitched and lined with calfskin.' : 'Vulcanised natural rubber, moulded with a ribbed underside to let skin breathe.',
          },
    clasp:
      strap === 'bracelet'
        ? {
            name: 'Clasp',
            fn: 'Folds shut under the wrist and adds up to 5 mm of length without tools.',
            material: `${metal[0].toUpperCase() + metal.slice(1)} folding clasp, secured by a double push-button.`,
          }
        : {
            name: 'Buckle',
            fn: 'Fastens the strap. The tang buckle is the most comfortable closure for a slim strap.',
            material: `${m.metal === 'ceramic' ? '18k Velor gold' : metal[0].toUpperCase() + metal.slice(1)}, polished.`,
          },
  }
  return info[id]
}

export const PART_ORDER = ['crystal', 'bezel', 'dial', 'hands', 'seconds', 'markers', 'movement', 'rotor', 'gears', 'case', 'crown', 'gaskets', 'caseback', 'bracelet', 'clasp']
