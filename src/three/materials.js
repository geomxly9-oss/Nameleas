import * as THREE from 'three'
import { memo } from './kit'
import { dialTextures, perlageTexture, wavesTexture, rotorTexture, casebackTexture, bezelInsertTexture, strapTexture, sunburstAnisotropy } from './textures'

const METALS = {
  steel: { color: '#e8eeec', roughness: 0.13 },
  velor: { color: '#f1bfc8', roughness: 0.15 },
  titanium: { color: '#c3cac8', roughness: 0.24 },
  platinum: { color: '#eef1f1', roughness: 0.11 },
  plum: { color: '#64165D', lacquer: true },
}

export function metal(name, { brushed = false, map = null, bump = null } = {}) {
  const key = `metal:${name}:${brushed}:${map?.uuid || ''}:${bump?.uuid || ''}`
  return memo(key, () => {
    if (name === 'ceramic') return ceramic()
    const def = METALS[name] || METALS.steel
    if (def.lacquer) {
      return new THREE.MeshPhysicalMaterial({ color: def.color, metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 })
    }
    const m = new THREE.MeshPhysicalMaterial({
      color: def.color,
      metalness: 1,
      roughness: brushed ? def.roughness + 0.2 : def.roughness,
      envMapIntensity: 1.15,
    })
    if (brushed) {
      m.anisotropy = 0.7
    }
    if (map) m.map = map
    if (bump) {
      m.bumpMap = bump
      m.bumpScale = 0.6
    }
    return m
  })
}

export function ceramic(color = '#64165D') {
  return memo(`ceramic:${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      specularIntensity: 1,
      envMapIntensity: 1.4,
    }),
  )
}

/* Sapphire: reflections only, added on top of what is behind it.
   Alpha follows reflection brightness so it also works over the transparent canvas. */
function glassShader(shader) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `#include <dithering_fragment>
     gl_FragColor.rgb *= opacity;
     gl_FragColor.a = clamp(max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)), 0.0, 1.0);`,
  )
}
export function applyGlass(m) {
  m.onBeforeCompile = glassShader
  m.customProgramCacheKey = () => 'velora-glass'
  return m
}

export const glass = () =>
  memo('glass', () => {
    const m = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      metalness: 0,
      roughness: 0.02,
      ior: 1.77,
      specularIntensity: 1,
      specularColor: new THREE.Color('#e6fff7'),
      envMapIntensity: 0.75,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    })
    m.userData.glass = true
    return applyGlass(m)
  })

export const lume = (color = '#C6F0E4') =>
  memo(`lume:${color}`, () =>
    new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color('#A7E8D7'), emissiveIntensity: 0.25, roughness: 0.5 }),
  )

export const lacquer = (color) =>
  memo(`lacquer:${color}`, () => new THREE.MeshPhysicalMaterial({ color, metalness: 0.1, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }))

export const rubber = (color = '#64165D') =>
  memo(`rubber:${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.62, metalness: 0, sheen: 0.4, sheenColor: new THREE.Color('#A7E8D7'), sheenRoughness: 0.6 }))

export const jewel = () =>
  memo('jewel', () =>
    new THREE.MeshPhysicalMaterial({ color: '#8A176E', metalness: 0, roughness: 0.05, clearcoat: 1, ior: 1.76, specularIntensity: 1, emissive: new THREE.Color('#8A176E'), emissiveIntensity: 0.25, envMapIntensity: 2 }),
  )

export const flamedScrew = () =>
  memo('screw', () => new THREE.MeshPhysicalMaterial({ color: '#7a1f71', metalness: 0.9, roughness: 0.2, clearcoat: 0.6 }))

/* Build every material a given watch needs. Cached per product. */
export function watchMaterials(product, quality = 'high') {
  return memo(`mats:${product.id}:${quality}`, () => {
    const m = product.model
    const size = quality === 'high' ? 1024 : 512
    const dialTex = dialTextures(product, size)
    const caseMetal = m.metal
    const trim = m.trimMetal || (m.metal === 'ceramic' ? 'velor' : m.metal)

    const dial = new THREE.MeshPhysicalMaterial({
      map: dialTex.map,
      roughness: m.dial.pattern === 'sunburst' ? 0.32 : m.dial.pattern === 'grain' ? 0.55 : 0.38,
      metalness: m.dial.pattern === 'sunburst' ? 0.55 : 0.15,
      clearcoat: m.dial.pattern === 'grain' ? 0 : 0.35,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.75,
      alphaTest: m.dial.pattern === 'skeleton' || m.complications?.tourbillon ? 0.5 : 0,
      side: THREE.DoubleSide,
    })
    if (dialTex.bumpMap) {
      dial.bumpMap = dialTex.bumpMap
      dial.bumpScale = 1.2
    }
    if (m.dial.pattern === 'sunburst') {
      dial.anisotropy = 0.85
      dial.anisotropyMap = sunburstAnisotropy()
    }

    const perlage = perlageTexture()
    const waves = wavesTexture()
    const rotorMap = rotorTexture()

    const strap = m.strap || { type: 'bracelet' }
    let strapMat = null
    if (strap.type === 'leather' || strap.type === 'rubber') {
      const t = strapTexture(strap.type, strap.color, strap.stitch || strap.color).clone()
      t.needsUpdate = true
      strapMat = strap.type === 'leather'
        ? new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color('#C6F0E4'), sheenRoughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4 })
        : new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.6, sheen: 0.35, sheenColor: new THREE.Color('#A7E8D7') })
    }

    const insert = ['diver', 'tachy'].includes(m.bezel)
      ? new THREE.MeshPhysicalMaterial({ roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4 })
      : null

    const handMetal = m.handMetal || trim

    return {
      case: metal(caseMetal),
      caseBrushed: caseMetal === 'ceramic' ? ceramic() : metal(caseMetal, { brushed: true }),
      trim: metal(trim),
      trimBrushed: metal(trim, { brushed: true }),
      hands: handMetal === 'plum' ? metal('plum') : metal(handMetal),
      seconds: lacquer(m.dial.seconds || '#8A176E'),
      lume: lume(),
      dial,
      crystal: glass(),
      plate: new THREE.MeshPhysicalMaterial({ color: '#d9dfde', metalness: 1, roughness: 0.38, map: perlage, bumpMap: perlage, bumpScale: 0.4 }),
      bridge: new THREE.MeshPhysicalMaterial({ color: '#e4eae9', metalness: 1, roughness: 0.22, map: waves }),
      gold: metal('velor'),
      steelPolished: metal('steel'),
      rotor: new THREE.MeshPhysicalMaterial({ color: '#f3c6cd', metalness: 1, roughness: 0.2, map: rotorMap }),
      jewel: jewel(),
      screw: flamedScrew(),
      gasket: memo('gasket', () => new THREE.MeshPhysicalMaterial({ color: '#4a0f45', roughness: 0.75, metalness: 0, sheen: 0.3 })),
      caseback: (() => {
        const mm = (caseMetal === 'ceramic' ? ceramic() : metal(caseMetal)).clone()
        mm.map = casebackTexture(product)
        if (caseMetal !== 'ceramic') mm.roughness = 0.2
        return mm
      })(),
      insert: insert && (() => {
        const tex = bezelInsertTexture(product, 0.83, 0.95)
        insert.map = tex
        return insert
      })(),
      strap: strapMat,
    }
  })
}
