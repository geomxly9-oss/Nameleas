import * as THREE from 'three'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'

// CC0 studio HDRI (Poly Haven, via @pmndrs/assets), bundled so it works offline.
// Decoded in memory rather than fetched, because some hosts' content security
// policy blocks fetch() of data: URLs.
let hdr = null
let pending = null

function decode(dataUrl) {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const loader = new EXRLoader()
  const texData = loader.parse(bytes.buffer)
  const tex = new THREE.DataTexture()
  if (typeof loader._applyTexData === 'function') {
    loader._applyTexData(tex, texData)
  } else {
    tex.image = { width: texData.width, height: texData.height, data: texData.data }
    tex.format = texData.format
    tex.type = texData.type
    tex.colorSpace = texData.colorSpace ?? THREE.LinearSRGBColorSpace
    tex.minFilter = tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    tex.flipY = texData.flipY ?? false
  }
  tex.needsUpdate = true
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

export function preloadStudioHDR() {
  if (hdr || pending) return pending || Promise.resolve(hdr)
  pending = import('@pmndrs/assets/hdri/studio.exr.js')
    .then((m) => {
      hdr = decode(m.default)
      return hdr
    })
    .catch(() => null)
  return pending
}

export const getStudioHDR = () => hdr
