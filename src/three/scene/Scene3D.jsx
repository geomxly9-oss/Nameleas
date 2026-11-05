import * as THREE from 'three'
import { useEffect, useLayoutEffect } from 'react'
import { Canvas, advance, useThree } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { onTick } from '../../lib/ticker'
import { buildStudioScene } from '../textures'
import { getStudioHDR } from '../hdr'

/* Drive R3F from the shared GSAP ticker, after Lenis has updated the scroll. */
function FrameDriver() {
  useEffect(() => onTick((time) => advance(time * 1000, true), 10), [])
  return null
}

/* One shared studio environment (PMREM) for every view: a real photographed
   studio HDRI with the brand's magenta and aqua rim lights added on top. */
let envTexture = null
function getEnv(gl) {
  if (!envTexture) {
    const pm = new THREE.PMREMGenerator(gl)
    const hdr = getStudioHDR()
    envTexture = pm.fromScene(buildStudioScene(hdr), 0.02).texture
    pm.dispose()
  }
  return envTexture
}

export function StudioEnv({ intensity = 1 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    scene.environment = getEnv(gl)
    scene.environmentIntensity = intensity
  }, [gl, scene, intensity])
  return null
}

export function StudioLights({ rim = '#8A176E', key = 0.85 }) {
  return (
    <>
      <ambientLight intensity={0.04} />
      <directionalLight position={[-5, 7, 9]} intensity={key} />
      <directionalLight position={[6, -3, 5]} intensity={0.35} color="#A7E8D7" />
      <directionalLight position={[2, 4, -8]} intensity={1.1} color={rim} />
    </>
  )
}

export default function Scene3D() {
  return (
    <Canvas
      className="gl-canvas"
      frameloop="never"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined}
      eventPrefix="client"
      camera={{ position: [0, 0, 16], fov: 26 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1.0
        gl.setClearColor(0x000000, 0)
      }}
    >
      <FrameDriver />
      <View.Port />
    </Canvas>
  )
}
