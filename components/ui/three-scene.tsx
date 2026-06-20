"use client"

import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useGameStore } from "@/store/game-store"
import { useRewardStore } from "@/store/reward-store"
import { useEcosystemStore } from "@/store/ecosystem-store"

// Deterministic seed-based random offset generator
const getOffset = (index: number, seed: number): number => {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Curated palette of cozy, stylized colors
const THEME_COLORS = {
  sand: "#A1887F",
  soil: "#6D5345",
  rock: "#78909C",
  rockDark: "#455A64",
  wood: "#5D4037",
  waterLight: "#80DEEA",
  waterDark: "#0288D1",
  waterDeep: "#01579B",
  foam: "#E0F7FA",
  leafSpring: { base: "#1B5E20", mid: "#4CAF50", light: "#81C784" },
  leafSummer: { base: "#0B4224", mid: "#2E7D32", light: "#81C784" },
  leafAutumn: { base: "#5D1000", mid: "#E65100", light: "#FFA726" },
  leafWinter: { base: "#006064", mid: "#80DEEA", light: "#FFFFFF" },
  leafGolden: { base: "#FF6F00", mid: "#FFB300", light: "#FFE082" }
}

const SKY_FOG_COLORS = {
  sunny: "#E0F2FE", // Soft light blue
  cloudy: "#E2E8F0", // Slate grey
  rain: "#94A3B8", // Dark slate
  wind: "#CFE2FE", // Pale cyan
  night: "#020617" // Deep dark blue
}

// Wind Sway Component: sways children groups organically in useFrame
interface WindSwayGroupProps {
  children: React.ReactNode
  speedMultiplier?: number
  ampMultiplier?: number
  baseRotation?: [number, number, number]
  position?: [number, number, number]
  scale?: [number, number, number] | number
}

function WindSwayGroup({
  children,
  speedMultiplier = 1,
  ampMultiplier = 1,
  baseRotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1
}: WindSwayGroupProps) {
  const groupRef = React.useRef<THREE.Group>(null)
  const weather = useEcosystemStore((state) => state.weather)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    let speed = 1.2
    let amp = 0.015
    if (weather === "wind") {
      speed = 3.5
      amp = 0.05
    } else if (weather === "rain") {
      speed = 2.0
      amp = 0.025
    } else if (weather === "night") {
      speed = 0.6
      amp = 0.008
    }

    const sway = Math.sin(t * speed * speedMultiplier) * amp * ampMultiplier
    groupRef.current.rotation.z = baseRotation[2] + sway
    groupRef.current.rotation.x = baseRotation[0] + sway * 0.25
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={baseRotation as any}
      scale={typeof scale === "number" ? [scale, scale, scale] : scale}
    >
      {children}
    </group>
  )
}

// Foliage Cluster: 5 intersecting flat-shaded dodecahedrons representing layered volume
interface FoliageClusterProps {
  scale: number
  season: string
  golden: boolean
}

function FoliageCluster({ scale, season, golden }: FoliageClusterProps) {
  const colors = React.useMemo(() => {
    if (golden) return THEME_COLORS.leafGolden
    if (season === "winter") return THEME_COLORS.leafWinter
    if (season === "autumn") return THEME_COLORS.leafAutumn
    if (season === "summer") return THEME_COLORS.leafSummer
    return THEME_COLORS.leafSpring
  }, [season, golden])

  if (scale <= 0.02) return null

  return (
    <group scale={[scale, scale, scale]}>
      {/* Base Dark Backing */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color={colors.base} roughness={0.95} flatShading />
      </mesh>
      {/* Midtone Volume */}
      <mesh castShadow position={[0.12, 0.22, 0.12]}>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={colors.mid} roughness={0.9} flatShading />
      </mesh>
      {/* Highlight Cap */}
      <mesh castShadow position={[-0.12, 0.36, -0.06]}>
        <dodecahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color={colors.light} roughness={0.8} flatShading />
      </mesh>
      {/* Side fluff 1 */}
      <mesh castShadow position={[-0.25, 0.1, 0.15]}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={colors.base} roughness={0.95} flatShading />
      </mesh>
      {/* Side fluff 2 */}
      <mesh castShadow position={[0.25, 0.15, -0.15]}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={colors.mid} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

// Falling Leaf Particle System
interface FallingLeavesProps {
  count: number
  season: string
}

function FallingLeaves({ count, season }: FallingLeavesProps) {
  const leavesRef = React.useRef<THREE.Group>(null)

  const leafColor = React.useMemo(() => {
    if (season === "winter") return THEME_COLORS.leafWinter.mid
    if (season === "autumn") return THEME_COLORS.leafAutumn.mid
    if (season === "summer") return THEME_COLORS.leafSummer.mid
    return THEME_COLORS.leafSpring.mid
  }, [season])

  const particles = React.useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: -1.2 + getOffset(i, 42) * 2.4,
        y: 1.5 + getOffset(i, 52) * 1.5,
        z: -1.2 + getOffset(i, 62) * 2.4,
        speed: 0.015 + getOffset(i, 72) * 0.015,
        swaySpeed: 1.5 + getOffset(i, 82) * 2.0,
        swayAmp: 0.1 + getOffset(i, 92) * 0.15,
        rotSpeed: 0.5 + getOffset(i, 102) * 1.5,
        key: `fall-leaf-${i}`
      })
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!leavesRef.current) return
    const t = state.clock.getElapsedTime()
    leavesRef.current.children.forEach((mesh, idx) => {
      const p = particles[idx]
      mesh.position.y -= p.speed
      mesh.position.x += Math.sin(t * p.swaySpeed) * p.swayAmp * 0.04
      mesh.rotation.x += p.rotSpeed * 0.02
      mesh.rotation.y += p.rotSpeed * 0.015

      // Reset when leaf hits the grass platform (y = 0.05)
      if (mesh.position.y < 0.05) {
        mesh.position.y = 2.5 + getOffset(idx, 112) * 1.0
        mesh.position.x = -1.2 + getOffset(idx, 122) * 2.4
        mesh.position.z = -1.2 + getOffset(idx, 132) * 2.4
      }
    })
  })

  return (
    <group ref={leavesRef}>
      {particles.map((p) => (
        <mesh key={p.key} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.07, 0.02, 0.04]} />
          <meshStandardMaterial color={leafColor} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// Branch-attached Flower blooming component
interface FlowerMeshProps {
  unlocked: boolean
  scale?: number
  position?: [number, number, number]
}

function FlowerMesh({ unlocked, scale = 1.0, position = [0, 0, 0] }: FlowerMeshProps) {
  const meshRef = React.useRef<THREE.Group>(null)
  const currentScale = React.useRef(0)

  useFrame(() => {
    if (!meshRef.current) return
    const targetScale = unlocked ? scale : 0
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.08)
    meshRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current)
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Stem */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 4]} />
        <meshStandardMaterial color="#689F38" roughness={0.9} />
      </mesh>
      {/* Petals */}
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.16]} />
          <meshStandardMaterial color="#FF80AB" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.16]} />
          <meshStandardMaterial color="#FF80AB" roughness={0.6} />
        </mesh>
        {/* Center */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.05, 5, 5]} />
          <meshStandardMaterial color="#FFF9C4" roughness={0.5} emissive="#FFB300" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// Scattered Grass & Flower Meshes (Swaying)
interface GroundPlantsProps {
  gx: number
  gz: number
  height: number
  color: string
}

function GrassBlade({ gx, gz, height, color }: GroundPlantsProps) {
  const meshRef = React.useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    // Soft grass sway
    meshRef.current.rotation.z = Math.sin(t * 2.0 + gx * 2) * 0.06
    meshRef.current.rotation.x = Math.cos(t * 1.8 + gz * 2) * 0.04
  })

  return (
    <mesh ref={meshRef} position={[gx, height / 2, gz]} castShadow>
      <coneGeometry args={[0.035, height, 3]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  )
}

// 3D Stylized Flower on ground
interface GroundFlowerProps {
  fx: number
  fz: number
  scale: number
  color: string
}

function GroundFlower({ fx, fz, scale, color }: GroundFlowerProps) {
  const groupRef = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Soft flower sway
    groupRef.current.rotation.z = Math.sin(t * 1.8 + fx) * 0.04
    groupRef.current.rotation.x = Math.cos(t * 1.6 + fz) * 0.03
  })

  return (
    <group ref={groupRef} position={[fx, 0.05, fz]} scale={[scale, scale, scale]}>
      {/* Stem */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 4]} />
        <meshStandardMaterial color="#689F38" roughness={0.9} />
      </mesh>
      {/* Center Yellow Bulb */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05, 5, 5]} />
        <meshStandardMaterial color="#FFF9C4" roughness={0.5} />
      </mesh>
      {/* Petals */}
      <group position={[0, 0.2, 0]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 5
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.07, 0, Math.sin(angle) * 0.07]}
              rotation={[0, -angle, 0.2]}
            >
              <boxGeometry args={[0.07, 0.02, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.6} flatShading />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// 3D Butterfly (Level 2+)
interface ButterflyProps {
  index: number
  color: string
  speed: number
  radius: number
  heightOffset: number
}

function Butterfly({ index, color, speed, radius, heightOffset }: ButterflyProps) {
  const butterRef = React.useRef<THREE.Group>(null)
  const wingL = React.useRef<THREE.Mesh>(null)
  const wingR = React.useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!butterRef.current) return

    // Flight Orbit Path
    const currentAngle = t * speed + index * 2.5
    const bx = Math.sin(currentAngle) * (radius + Math.sin(t * 1.5) * 0.3)
    const bz = Math.cos(currentAngle) * (radius + Math.cos(t * 1.5) * 0.3)
    const by = heightOffset + Math.sin(t * 3.2 + index) * 0.2

    butterRef.current.position.set(bx, by, bz)
    butterRef.current.rotation.y = currentAngle + Math.PI / 2

    // Flapping wings
    if (wingL.current && wingR.current) {
      const flap = Math.sin(t * 25 + index) * 0.8
      wingL.current.rotation.z = flap
      wingR.current.rotation.z = -flap
    }
  })

  return (
    <group ref={butterRef} scale={[0.3, 0.3, 0.3]}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 4]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      {/* Left Wing */}
      <mesh ref={wingL} position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
      {/* Right Wing */}
      <mesh ref={wingR} position={[0.12, 0, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
    </group>
  )
}

// 8. Animated Waterfall stream with tumbling foam particles
interface WaterfallFlowProps {
  unlocked: boolean
}

function WaterfallFlow({ unlocked }: WaterfallFlowProps) {
  const foamGroupRef = React.useRef<THREE.Group>(null)

  const foams = React.useMemo(() => {
    const list = []
    for (let i = 0; i < 5; i++) {
      list.push({
        offsetY: getOffset(i, 44) * 3.2,
        speed: 0.04 + getOffset(i, 54) * 0.03,
        scale: 0.15 + getOffset(i, 64) * 0.1,
        offsetX: -0.1 + getOffset(i, 74) * 0.2,
        offsetZ: -0.05 + getOffset(i, 84) * 0.1,
        key: `foam-${i}`
      })
    }
    return list
  }, [])

  useFrame(() => {
    if (!unlocked || !foamGroupRef.current) return
    foamGroupRef.current.children.forEach((mesh, idx) => {
      const f = foams[idx]
      mesh.position.y -= f.speed
      // Reset at bottom
      if (mesh.position.y < -3.1) {
        mesh.position.y = -0.05
      }
    })
  })

  if (!unlocked) return null

  return (
    <group position={[0, 0, 3.19]}>
      {/* Main Column of Water */}
      <mesh position={[0, -1.6, 0]} rotation={[0.08, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 3.2, 5]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#01579B"
          emissiveIntensity={0.35}
          roughness={0.2}
          flatShading
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Animated cascading foam chunks */}
      <group ref={foamGroupRef}>
        {foams.map((f) => (
          <mesh key={f.key} position={[f.offsetX * 1.5, -f.offsetY, f.offsetZ]} scale={[f.scale * 1.2, f.scale * 1.2, f.scale * 1.2]}>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.8} flatShading />
          </mesh>
        ))}
      </group>
      {/* Splash Splash Ring */}
      <group position={[0, -3.1, 0.05]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 8]} />
          <meshStandardMaterial color="#E0F7FA" roughness={0.9} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// 3D Low-poly drifting clouds
interface CloudParticle {
  x: number
  y: number
  z: number
  scale: [number, number, number]
  speed: number
}

function FloatingClouds() {
  const groupRef = React.useRef<THREE.Group>(null)
  
  const clouds = React.useMemo(() => {
    const list: CloudParticle[] = []
    for (let i = 0; i < 4; i++) {
      list.push({
        x: -7 + getOffset(i, 15) * 14,
        y: 2.2 + getOffset(i, 25) * 1.8,
        z: -5 + getOffset(i, 35) * 7,
        scale: [
          1.1 + getOffset(i, 45) * 0.7,
          0.6 + getOffset(i, 55) * 0.4,
          0.8 + getOffset(i, 65) * 0.5
        ],
        speed: 0.003 + getOffset(i, 75) * 0.004
      })
    }
    return list
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((mesh, idx) => {
      const c = clouds[idx]
      mesh.position.x += c.speed
      // Wrap around
      if (mesh.position.x > 8.5) {
        mesh.position.x = -8.5
      }
    })
  })

  return (
    <group ref={groupRef}>
      {clouds.map((c, idx) => (
        <group key={`cloud-${idx}`} position={[c.x, c.y, c.z]} scale={c.scale}>
          {/* Main puff */}
          <mesh castShadow>
            <dodecahedronGeometry args={[0.8, 1]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.88} />
          </mesh>
          {/* Side puff 1 */}
          <mesh position={[-0.55, -0.1, 0.1]} castShadow>
            <dodecahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.88} />
          </mesh>
          {/* Side puff 2 */}
          <mesh position={[0.55, -0.12, -0.1]} castShadow>
            <dodecahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.88} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 3D Stylized mushroom on ground
interface MushroomProps {
  mx: number
  mz: number
  scale: number
}

function Mushroom({ mx, mz, scale }: MushroomProps) {
  return (
    <group position={[mx, 0.04, mz]} scale={[scale, scale, scale]}>
      {/* Stalk */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.16, 4]} />
        <meshStandardMaterial color="#FFF9C4" roughness={0.8} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.16, 0]}>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#FF1744" roughness={0.6} flatShading />
      </mesh>
    </group>
  )
}

// Magic Sparkles for Crystals
function CrystalSparkles() {
  const groupRef = React.useRef<THREE.Group>(null)
  
  const sparkles = React.useMemo(() => {
    const list = []
    for (let i = 0; i < 5; i++) {
      list.push({
        x: -0.2 + getOffset(i, 115) * 0.4,
        y: 0.1 + getOffset(i, 125) * 0.5,
        z: -0.2 + getOffset(i, 135) * 0.4,
        speed: 0.003 + getOffset(i, 145) * 0.004,
        scale: 0.025 + getOffset(i, 155) * 0.025,
        key: `sparkle-${i}`
      })
    }
    return list
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((mesh, idx) => {
      const s = sparkles[idx]
      mesh.position.y += s.speed
      // Reset at height threshold
      if (mesh.position.y > 0.75) {
        mesh.position.y = 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {sparkles.map((s) => (
        <mesh key={s.key} position={[s.x, s.y, s.z]} scale={[s.scale, s.scale, s.scale]}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#E1BEE7" emissive="#BA68C8" emissiveIntensity={2.0} />
        </mesh>
      ))}
    </group>
  )
}

// Fluffy clouds hugging the bottom of the floating island
function BaseClouds() {
  const groupRef = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Slow drift rotation around the island base
    groupRef.current.rotation.y = t * 0.01
  })

  return (
    <group ref={groupRef} position={[0, -2.4, 0]}>
      {/* Cloud Puff 1 */}
      <mesh position={[-2.4, 0, 1.8]} scale={[1.6, 0.8, 1.2]} castShadow>
        <dodecahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.85} />
      </mesh>
      {/* Cloud Puff 2 */}
      <mesh position={[2.4, -0.2, -1.8]} scale={[1.7, 0.9, 1.3]} castShadow>
        <dodecahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.85} />
      </mesh>
      {/* Cloud Puff 3 */}
      <mesh position={[-1.8, -0.1, -2.4]} scale={[1.5, 0.8, 1.1]} castShadow>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.85} />
      </mesh>
      {/* Cloud Puff 4 */}
      <mesh position={[1.8, 0.1, 2.4]} scale={[1.6, 0.85, 1.2]} castShadow>
        <dodecahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

// 3D Secondary tree/sapling for forest density (Level 8+)
interface SecondaryTreeProps {
  position: [number, number, number]
  scale: number
  season: string
  golden: boolean
}

function SecondaryTree({ position, scale, season, golden }: SecondaryTreeProps) {
  const colors = React.useMemo(() => {
    if (golden) return THEME_COLORS.leafGolden
    if (season === "winter") return THEME_COLORS.leafWinter
    if (season === "autumn") return THEME_COLORS.leafAutumn
    if (season === "summer") return THEME_COLORS.leafSummer
    return THEME_COLORS.leafSpring
  }, [season, golden])

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 0.45, 5]} />
        <meshStandardMaterial color={THEME_COLORS.wood} roughness={0.9} flatShading />
      </mesh>
      {/* Foliage Cluster */}
      <group position={[0, 0.52, 0]} scale={[0.42, 0.42, 0.42]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color={colors.base} roughness={0.95} flatShading />
        </mesh>
        <mesh castShadow position={[0.1, 0.15, 0.1]}>
          <dodecahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color={colors.mid} roughness={0.9} flatShading />
        </mesh>
        <mesh castShadow position={[-0.1, 0.25, -0.05]}>
          <dodecahedronGeometry args={[0.32, 1]} />
          <meshStandardMaterial color={colors.light} roughness={0.8} flatShading />
        </mesh>
      </group>
    </group>
  )
}

// Small stylized ground stones
function GroundStones() {
  return (
    <group>
      {/* Stone 1 */}
      <mesh position={[-1.3, 0.05, 1.3]} rotation={[0.2, 0.5, 0.1]} castShadow receiveShadow scale={[0.2, 0.14, 0.26]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={THEME_COLORS.rock} roughness={0.8} flatShading />
      </mesh>
      {/* Stone 2 */}
      <mesh position={[1.4, 0.04, -1.1]} rotation={[-0.3, 0.2, 0.4]} castShadow receiveShadow scale={[0.16, 0.11, 0.22]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={THEME_COLORS.rockDark} roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

// Ground Bush Component
interface GroundBushProps {
  position: [number, number, number]
  scale?: number
  level: number
  index: number
}

function GroundBush({ position, scale = 1.0, level, index }: GroundBushProps) {
  const meshRef = React.useRef<THREE.Group>(null)
  const growth = Math.min(0.45 + level * 0.08, 1.25) * scale
  const weather = useEcosystemStore((state) => state.weather)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    let speed = 1.0
    let amp = 0.015
    if (weather === "wind") {
      speed = 2.8
      amp = 0.045
    }
    meshRef.current.rotation.z = Math.sin(t * speed + index) * amp
  })

  return (
    <group ref={meshRef} position={position} scale={[growth, growth, growth]}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.15, 0.05, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#1B5E20" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-0.15, 0.08, -0.05]} castShadow>
        <dodecahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#388E3C" roughness={0.9} flatShading />
      </mesh>
      {level >= 5 && (
        <mesh position={[0, 0.3, 0]} scale={[0.38, 0.38, 0.38]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#FF4081" roughness={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Fallen mossy log on grass
interface FallenLogProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
}

function FallenLog({ position, rotation, scale = 1.0 }: FallenLogProps) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 5]} />
        <meshStandardMaterial color="#4E342E" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-0.402, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 5]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.9} />
      </mesh>
      <mesh position={[0.402, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 5]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.9} />
      </mesh>
      <group position={[0.1, 0.12, 0.05]} scale={[0.45, 0.45, 0.45]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.1, 4]} />
          <meshStandardMaterial color="#FFF9C4" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <dodecahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#FF3D00" flatShading />
        </mesh>
      </group>
      <group position={[-0.18, 0.1, -0.08]} scale={[0.35, 0.35, 0.35]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.1, 4]} />
          <meshStandardMaterial color="#FFF9C4" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <dodecahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#FFEA00" flatShading />
        </mesh>
      </group>
    </group>
  )
}

// Stepping stones pathway
function SteppingStones() {
  const stones = [
    { pos: [0, 0.012, 2.3], rot: [0.1, 0.3, 0.05], size: [0.38, 0.28, 0.03] },
    { pos: [0.3, 0.012, 1.8], rot: [-0.15, -0.2, 0.08], size: [0.34, 0.26, 0.03] },
    { pos: [0.1, 0.012, 1.3], rot: [0.05, 0.4, -0.06], size: [0.36, 0.28, 0.03] },
    { pos: [-0.2, 0.012, 0.8], rot: [-0.08, -0.1, 0.04], size: [0.32, 0.24, 0.03] }
  ]

  return (
    <group>
      {stones.map((s, idx) => (
        <mesh
          key={`step-${idx}`}
          position={s.pos as [number, number, number]}
          rotation={[0, s.rot[1], 0]}
          scale={[s.size[0], s.size[2], s.size[1]]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#90A4AE" roughness={0.88} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// Jumping Fish Component
interface JumpingFishProps {
  index: number
  baseX: number
  baseZ: number
  jumpRadius: number
  color: string
}

function JumpingFish({ index, baseX, baseZ, jumpRadius, color }: JumpingFishProps) {
  const fishRef = React.useRef<THREE.Group>(null)
  const splashRef = React.useRef<THREE.Mesh>(null)
  const [splashScale, setSplashScale] = React.useState(0)

  const jumpDuration = 1.6
  const waitDuration = 6.0 + index * 4.0
  const totalCycle = jumpDuration + waitDuration

  useFrame((state) => {
    if (!fishRef.current) return
    const t = state.clock.getElapsedTime()
    const cycleTime = (t + index * 2.3) % totalCycle

    if (cycleTime < jumpDuration) {
      const progress = cycleTime / jumpDuration
      const maxHeight = 2.0
      const y = -3.2 + Math.sin(progress * Math.PI) * maxHeight

      const angle = index * 1.5
      const dx = Math.cos(angle) * jumpRadius
      const dz = Math.sin(angle) * jumpRadius

      const x = baseX - dx + progress * (dx * 2)
      const z = baseZ - dz + progress * (dz * 2)

      fishRef.current.position.set(x, y, z)
      fishRef.current.visible = true
      fishRef.current.rotation.y = angle + Math.PI / 2
      
      const pitch = (0.5 - progress) * Math.PI * 0.4
      fishRef.current.rotation.x = pitch

      const tailMesh = fishRef.current.children[1] as THREE.Mesh
      if (tailMesh) {
        tailMesh.rotation.y = Math.sin(t * 30) * 0.4
      }

      if (progress < 0.08 || progress > 0.92) {
        const splashProg = progress < 0.08 ? (progress / 0.08) : ((1.0 - progress) / 0.08)
        setSplashScale((1.0 - splashProg) * 0.6)
        if (splashRef.current) {
          splashRef.current.position.set(x, -3.18, z)
          splashRef.current.visible = true
        }
      } else {
        if (splashRef.current) {
          splashRef.current.visible = false
        }
      }
    } else {
      fishRef.current.visible = false
      if (splashRef.current) {
        splashRef.current.visible = false
      }
    }
  })

  return (
    <group>
      <group ref={fishRef} scale={[0.18, 0.18, 0.18]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.25, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.4} flatShading />
        </mesh>
        <mesh position={[0, 0, -0.35]}>
          <boxGeometry args={[0.03, 0.18, 0.2]} />
          <meshStandardMaterial color="#FF7043" roughness={0.4} flatShading />
        </mesh>
        <mesh position={[0, 0.18, 0.05]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.03, 0.15, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </group>
      <mesh ref={splashRef} rotation={[-Math.PI / 2, 0, 0]} scale={[splashScale, splashScale, splashScale]} visible={false}>
        <ringGeometry args={[0.5, 0.7, 8]} />
        <meshStandardMaterial color="#E0F7FA" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Hopping Rabbit on Grass
interface HoppingRabbitProps {
  level: number
  index: number
  baseX: number
  baseZ: number
  color: string
}

function HoppingRabbit({ level, index, baseX, baseZ, color }: HoppingRabbitProps) {
  const rabbitRef = React.useRef<THREE.Group>(null)

  const hopDuration = 0.6
  const hopsPerCycle = 3
  const restDuration = 5.0 + index * 3.0
  const activeHopTime = hopDuration * hopsPerCycle
  const totalCycle = activeHopTime + restDuration

  useFrame((state) => {
    if (!rabbitRef.current) return
    const t = state.clock.getElapsedTime()
    const cycleTime = (t + index * 4.1) % totalCycle

    if (level < 3) {
      rabbitRef.current.visible = false
      return
    }
    rabbitRef.current.visible = true

    if (cycleTime < activeHopTime) {
      const currentHop = Math.floor(cycleTime / hopDuration)
      const hopProgress = (cycleTime % hopDuration) / hopDuration
      const height = Math.sin(hopProgress * Math.PI) * 0.22
      const y = 0.05 + height
      const slowAngle = (t * 0.06 + index * 1.8) % (Math.PI * 2)
      const cumulativeHops = currentHop + hopProgress
      const stepLength = 0.15
      const dist = cumulativeHops * stepLength
      const x = baseX + Math.cos(slowAngle) * dist
      const z = baseZ + Math.sin(slowAngle) * dist

      rabbitRef.current.position.set(x, y, z)
      rabbitRef.current.rotation.y = -slowAngle + Math.PI / 2

      const earsL = rabbitRef.current.children[2] as THREE.Mesh
      const earsR = rabbitRef.current.children[3] as THREE.Mesh
      if (earsL && earsR) {
        earsL.rotation.x = -0.2 - Math.sin(hopProgress * Math.PI) * 0.4
        earsR.rotation.x = -0.2 - Math.sin(hopProgress * Math.PI) * 0.4
      }
    } else {
      const slowAngle = (t * 0.06 + index * 1.8) % (Math.PI * 2)
      const dist = hopsPerCycle * 0.15
      rabbitRef.current.position.set(
        baseX + Math.cos(slowAngle) * dist,
        0.05,
        baseZ + Math.sin(slowAngle) * dist
      )
      rabbitRef.current.rotation.x = Math.sin(t * 15) * 0.02

      const earsL = rabbitRef.current.children[2] as THREE.Mesh
      const earsR = rabbitRef.current.children[3] as THREE.Mesh
      if (earsL && earsR) {
        earsL.rotation.x = -0.2
        earsR.rotation.x = -0.2
      }
    }
  })

  return (
    <group ref={rabbitRef} scale={[0.18, 0.18, 0.18]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.22, 0.25, 0.36]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.33, 0.12]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.05, 0.46, 0.08]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.46, 0.08]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, -0.2]} castShadow>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Flying Birds in sky
interface FlyingBirdsProps {
  count: number
  level: number
}

function FlyingBirds({ count, level }: FlyingBirdsProps) {
  const groupRef = React.useRef<THREE.Group>(null)

  const birds = React.useMemo(() => {
    const list = []
    for (let i = 0; i < count; i++) {
      list.push({
        index: i,
        speed: 0.65 + getOffset(i, 48) * 0.3,
        orbitRadius: 4.8 + getOffset(i, 58) * 1.5,
        height: 2.8 + getOffset(i, 68) * 1.2,
        offsetAngle: getOffset(i, 78) * Math.PI * 2,
        wingFlapSpeed: 18 + getOffset(i, 88) * 10,
        color: i % 2 === 0 ? "#81D4FA" : "#FFF59D",
        scale: 0.16 + getOffset(i, 98) * 0.06
      })
    }
    return list
  }, [count])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    groupRef.current.children.forEach((birdGroup, idx) => {
      const b = birds[idx]
      const angle = t * b.speed + b.offsetAngle
      const x = Math.sin(angle) * b.orbitRadius
      const z = Math.cos(angle) * b.orbitRadius
      const y = b.height + Math.sin(t * 1.8 + idx) * 0.15

      birdGroup.position.set(x, y, z)
      birdGroup.rotation.y = angle + Math.PI / 2

      const wingL = birdGroup.children[1] as THREE.Mesh
      const wingR = birdGroup.children[2] as THREE.Mesh

      if (wingL && wingR) {
        const flap = Math.sin(t * b.wingFlapSpeed) * 0.6
        wingL.rotation.z = flap
        wingR.rotation.z = -flap
      }
    })
  })

  if (level < 2) return null

  return (
    <group ref={groupRef}>
      {birds.map((b, idx) => (
        <group key={`flying-bird-${idx}`} scale={[b.scale, b.scale, b.scale]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.14, 0.4]} />
            <meshStandardMaterial color={b.color} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[-0.18, 0.02, 0.05]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.26, 0.02, 0.22]} />
            <meshStandardMaterial color={b.color} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0.18, 0.02, 0.05]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.26, 0.02, 0.22]} />
            <meshStandardMaterial color={b.color} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshStandardMaterial color="#FF8F00" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Duck swimming in central pond
interface PondDuckProps {
  unlocked: boolean
}

function PondDuck({ unlocked }: PondDuckProps) {
  const duckRef = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!unlocked || !duckRef.current) return
    const t = state.clock.getElapsedTime()
    const swimSpeed = 0.5
    const theta = t * swimSpeed
    const dx = Math.sin(theta) * 0.45
    const dz = 0.3 + Math.cos(theta * 2) * 0.22
    
    duckRef.current.position.set(dx, 0.032, dz)

    const dt = 0.01
    const nextTheta = theta + dt
    const nextDx = Math.sin(nextTheta) * 0.45
    const nextDz = 0.3 + Math.cos(nextTheta * 2) * 0.22
    const heading = Math.atan2(nextDx - dx, nextDz - dz)

    duckRef.current.rotation.y = heading
    duckRef.current.rotation.x = Math.sin(t * 4) * 0.08
  })

  if (!unlocked) return null

  return (
    <group ref={duckRef} scale={[0.15, 0.15, 0.15]}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.22, 0.44]} />
        <meshStandardMaterial color="#FFF59D" roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0.18]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#CDDC39" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.18, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.14, 4]} />
        <meshStandardMaterial color="#FF9800" />
      </mesh>
    </group>
  )
}

// 6. Floating Island Base & Water plane
interface IslandBaseProps {
  level: number
  completedMissionCount: number
  season: string
  weather: string
  waterfallUnlocked: boolean
  pondUnlocked: boolean
  crystalsUnlocked: boolean
  flowersUnlocked: boolean
}

// Config for organic compound island nodes (octagons and decagon)
const ISLAND_NODES = [
  // Central core (decagon for round low-poly shape)
  { x: 0, z: 0, radius: 3.1, segments: 10, rot: 0 },
  // Front peninsula (under waterfall and river pathway)
  { x: 0, z: 1.8, radius: 1.4, segments: 8, rot: 0.2 },
  // Back-left ridge
  { x: -2.3, z: -1.7, radius: 1.7, segments: 8, rot: 0.5 },
  // Back-right ridge
  { x: 2.1, z: -1.9, radius: 1.5, segments: 8, rot: -0.3 },
  // Left peninsula
  { x: -2.6, z: 0.4, radius: 1.4, segments: 8, rot: 0.8 },
  // Right peninsula
  { x: 2.5, z: 0.3, radius: 1.3, segments: 8, rot: -0.4 },
  // Front-left filler
  { x: -1.5, z: 2.0, radius: 1.1, segments: 7, rot: 0.1 },
  // Front-right filler
  { x: 1.6, z: 1.8, radius: 1.0, segments: 7, rot: -0.2 }
]

// Containment check to verify if a coordinate lies within the organic island boundaries
const isPointOnIsland = (x: number, z: number) => {
  // Check central decagon core
  const distToCenter = Math.sqrt(x * x + z * z)
  if (distToCenter < 3.0) return true

  // Check extension nodes
  for (const node of ISLAND_NODES) {
    const dx = x - node.x
    const dz = z - node.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < node.radius - 0.05) {
      return true
    }
  }
  return false
}

function IslandBase({
  level,
  completedMissionCount,
  season,
  weather,
  waterfallUnlocked,
  pondUnlocked,
  crystalsUnlocked,
  flowersUnlocked
}: IslandBaseProps) {
  const waterRef = React.useRef<THREE.Mesh>(null)

  // Gently rotate and wave water
  useFrame((state) => {
    if (!waterRef.current) return
    const t = state.clock.getElapsedTime()
    waterRef.current.position.y = -3.2 + Math.sin(t * 0.7) * 0.04
    waterRef.current.rotation.y = t * 0.015
  })

  // Seasonal colors for Grass surface
  const grassColor = React.useMemo(() => {
    if (season === "winter") return "#ECEFF1"
    if (season === "autumn") return "#D84315"
    if (season === "summer") return "#2E7D32"
    if (season === "spring") return "#7CB342"
    return "#7CB342"
  }, [season])

  // Scattered Grass Blades (Scaled up count for larger area)
  const grassCount = React.useMemo(() => {
    return 25 + Math.min(completedMissionCount, 30)
  }, [completedMissionCount])

  // Filtered Grass Blades
  const grassBlades = React.useMemo(() => {
    const blades = []
    let seedOffset = 0
    while (blades.length < grassCount && seedOffset < 150) {
      const i = seedOffset
      const angle = getOffset(i, 25) * Math.PI * 2
      const radius = 0.4 + getOffset(i, 35) * 4.0
      const gx = Math.cos(angle) * radius
      const gz = Math.sin(angle) * radius
      
      if (isPointOnIsland(gx, gz)) {
        const height = 0.08 + getOffset(i, 45) * 0.15
        const bladeColor = season === "winter" ? "#B0BEC5" : season === "autumn" ? "#E65100" : "#689F38"
        blades.push({ x: gx, z: gz, h: height, color: bladeColor, key: `grass-${blades.length}` })
      }
      seedOffset++
    }
    return blades
  }, [grassCount, season])

  // Scattered Flowers on Grass (Filtered)
  const flowerList = React.useMemo(() => {
    if (!flowersUnlocked) return []
    const flowers = []
    const count = 10 + Math.min(level, 15)
    let seedOffset = 0
    while (flowers.length < count && seedOffset < 100) {
      const i = seedOffset
      const angle = getOffset(i, 55) * Math.PI * 2
      const radius = 0.6 + getOffset(i, 65) * 3.8
      const fx = Math.cos(angle) * radius
      const fz = Math.sin(angle) * radius
      
      // Avoid placing flowers directly inside the pond/tree center
      if (Math.abs(fx) < 0.6 && Math.abs(fz) < 0.6) {
        seedOffset++
        continue
      }
      if (isPointOnIsland(fx, fz)) {
        flowers.push({ x: fx, z: fz, key: `flower-island-${flowers.length}` })
      }
      seedOffset++
    }
    return flowers
  }, [flowersUnlocked, level])

  // Scattered Mushrooms on Grass (Filtered)
  const mushroomList = React.useMemo(() => {
    if (level < 4) return []
    const mushrooms = []
    const count = 5 + Math.min(level, 8)
    let seedOffset = 0
    while (mushrooms.length < count && seedOffset < 100) {
      const i = seedOffset
      const angle = getOffset(i, 85) * Math.PI * 2
      const radius = 0.8 + getOffset(i, 95) * 3.6
      const mx = Math.cos(angle) * radius
      const mz = Math.sin(angle) * radius
      
      // Avoid placing mushrooms directly inside the pond/tree center
      if (Math.abs(mx) < 0.6 && Math.abs(mz) < 0.6) {
        seedOffset++
        continue
      }
      if (isPointOnIsland(mx, mz)) {
        mushrooms.push({ x: mx, z: mz, key: `mushroom-island-${mushrooms.length}` })
      }
      seedOffset++
    }
    return mushrooms
  }, [level])

  return (
    <group>
      {/* 1. Organic Tapered Soil Cliff Bases */}
      {ISLAND_NODES.map((node, idx) => (
        <mesh
          key={`cliff-${idx}`}
          castShadow
          receiveShadow
          position={[node.x, -1.93, node.z]}
          rotation={[0, node.rot, 0]}
        >
          <cylinderGeometry args={[node.radius, node.radius * 0.35, 3.8, node.segments]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* 2. Organic Platform Border Rim (Slightly larger radius * 1.04, Y = -0.12) */}
      {ISLAND_NODES.map((node, idx) => (
        <mesh
          key={`border-${idx}`}
          castShadow
          receiveShadow
          position={[node.x, -0.12, node.z]}
          rotation={[0, node.rot, 0]}
        >
          <cylinderGeometry args={[node.radius * 1.04, node.radius * 1.04, 0.2, node.segments]} />
          <meshStandardMaterial color={grassColor} roughness={0.8} flatShading />
        </mesh>
      ))}

      {/* 3. Organic Surface Grass Layers */}
      {ISLAND_NODES.map((node, idx) => (
        <mesh
          key={`grass-${idx}`}
          receiveShadow
          position={[node.x, -0.03, node.z]}
          rotation={[0, node.rot, 0]}
        >
          <cylinderGeometry args={[node.radius, node.radius, 0.1, node.segments]} />
          <meshStandardMaterial color={grassColor} roughness={0.85} flatShading />
        </mesh>
      ))}

      {/* Waterfall cascade (Level 15+ / waterfall unlocked) */}
      {waterfallUnlocked && (
        <WaterfallFlow unlocked={waterfallUnlocked} />
      )}

      {/* Stepping stones pathway (Unlocks at level 2) */}
      {level >= 2 && <SteppingStones />}

      {/* Mossy fallen log (Always present) */}
      <FallenLog position={[-2.4, 0.05, -1.8]} rotation={[0.2, 0.8, 0.1]} />

      {/* Evergreen and progress-based Ground Bushes */}
      <GroundBush position={[-2.8, 0.04, 2.0]} level={level} index={0} />
      {level >= 2 && <GroundBush position={[3.0, 0.04, -2.2]} level={level} index={1} />}
      {level >= 5 && <GroundBush position={[2.5, 0.04, 2.5]} level={level} index={2} />}
      {level >= 8 && <GroundBush position={[-3.2, 0.04, -2.4]} level={level} index={3} />}

      {/* Scattered Grass Blades */}
      {grassBlades.map((g) => (
        <GrassBlade key={g.key} gx={g.x} gz={g.z} height={g.h} color={g.color} />
      ))}

      {/* Scattered Flowers on Island */}
      {flowerList.map((f, idx) => {
        const colors = ["#FF80AB", "#FFF59D", "#CE93D8"]
        const col = colors[idx % colors.length]
        return (
          <GroundFlower key={f.key} fx={f.x} fz={f.z} scale={0.65 + getOffset(idx, 75) * 0.3} color={col} />
        )
      })}

      {/* Scattered Mushrooms on Island */}
      {mushroomList.map((m, idx) => (
        <Mushroom key={m.key} mx={m.x} mz={m.z} scale={0.65 + getOffset(idx, 105) * 0.4} />
      ))}

      {/* Ground stones (Level 4+ / stones scattered) */}
      {level >= 4 && <GroundStones />}

      {/* Secondary Trees (Level 8+ / stage >= 5) */}
      {level >= 8 && (
        <group>
          <SecondaryTree position={[-2.4, 0, 1.2]} scale={0.62} season={season} golden={level >= 15} />
          <SecondaryTree position={[2.0, 0, 1.8]} scale={0.52} season={season} golden={level >= 15} />
        </group>
      )}

      {/* River connecting central pond to waterfall (Dynamically scaled for larger island) */}
      {waterfallUnlocked && (
        <mesh
          position={[0, 0.005, pondUnlocked ? 2.19 : 1.59]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.42, pondUnlocked ? 1.99 : 3.19]} />
          <meshStandardMaterial color="#00E5FF" roughness={0.15} flatShading />
        </mesh>
      )}

      {/* Embedded Central Pond (wonder-pond) */}
      {pondUnlocked && (
        <group position={[0, 0.01, 0.3]}>
          {/* Stone rim */}
          <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 0.95, 0.05, 8]} />
            <meshStandardMaterial color="#90A4AE" roughness={0.9} flatShading />
          </mesh>
          {/* Water */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.82, 0.82, 0.03, 8]} />
            <meshStandardMaterial color="#00E5FF" roughness={0.1} emissive="#00E5FF" emissiveIntensity={0.15} />
          </mesh>
          {/* Lotus */}
          <mesh position={[0.25, 0.035, -0.25]} scale={[0.15, 0.15, 0.15]}>
            <sphereGeometry args={[0.5, 4, 4]} />
            <meshStandardMaterial color="#FF80AB" />
          </mesh>
        </group>
      )}

      {/* Crystals decoration (wonder-crystal) */}
      {crystalsUnlocked && (
        <group position={[2.5, 0.1, -2.5]}>
          {/* Shard 1 */}
          <mesh position={[-0.1, 0.2, 0]} rotation={[0.2, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.01, 0.08, 0.45, 4]} />
            <meshStandardMaterial color="#BA68C8" emissive="#BA68C8" emissiveIntensity={0.2} roughness={0.3} flatShading />
          </mesh>
          {/* Shard 2 */}
          <mesh position={[0.1, 0.3, 0.1]} rotation={[-0.1, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.01, 0.1, 0.6, 4]} />
            <meshStandardMaterial color="#E1BEE7" emissive="#E1BEE7" emissiveIntensity={0.25} roughness={0.3} flatShading />
          </mesh>
          <pointLight position={[0, 0.4, 0]} color="#BA68C8" intensity={0.5} distance={1.8} decay={2} />
          {/* Magic sparkling particles */}
          <CrystalSparkles />
        </group>
      )}

      <mesh ref={waterRef} position={[0, -3.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[18, 18, 0.2, 8]} />
        <meshStandardMaterial
          color="#0288D1"
          roughness={0.4}
          transparent
          opacity={0.8}
          flatShading
        />
      </mesh>
    </group>
  )
}

// 7. Wildlife & Creatures
interface CreaturesProps {
  level: number
  butterflyUnlocked: boolean
  bluebirdUnlocked: boolean
  beeUnlocked: boolean
  squirrelUnlocked: boolean
  owlUnlocked: boolean
}

function Creatures({
  level,
  butterflyUnlocked,
  bluebirdUnlocked,
  beeUnlocked,
  squirrelUnlocked,
  owlUnlocked
}: CreaturesProps) {
  return (
    <group>
      {/* 2. Bluebird perched on Branch (Level 5+) */}
      {bluebirdUnlocked && level >= 5 && (
        <group position={[0.7, 1.2, 0.2]} scale={[0.3, 0.3, 0.3]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#0288D1" roughness={0.6} />
          </mesh>
          <mesh position={[0.25, 0.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshStandardMaterial color="#FFA000" />
          </mesh>
        </group>
      )}

      {/* 3. Squirrel (Level 12+) */}
      {squirrelUnlocked && level >= 12 && (
        <group position={[0.2, 0.08, 0.3]} scale={[0.22, 0.22, 0.22]}>
          {/* Body */}
          <mesh castShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.6, 5]} />
            <meshStandardMaterial color="#D84315" roughness={0.8} flatShading />
          </mesh>
          {/* Tail */}
          <mesh position={[0, 0.5, -0.2]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#BF360C" roughness={0.7} flatShading />
          </mesh>
        </group>
      )}

      {/* 4. Owl (Level 20+) */}
      {owlUnlocked && level >= 20 && (
        <group position={[-0.35, 1.85, -0.15]} scale={[0.26, 0.26, 0.26]}>
          {/* Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.28, 0.6, 5]} />
            <meshStandardMaterial color="#5D4037" roughness={0.9} flatShading />
          </mesh>
          {/* Big glowing yellow eyes */}
          <mesh position={[-0.1, 0.14, 0.22]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#FFF9C4" emissive="#FFF9C4" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.1, 0.14, 0.22]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#FFF9C4" emissive="#FFF9C4" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}

      {/* 5. Bumblebee hovering (Level 8+) */}
      {beeUnlocked && level >= 8 && (
        <group position={[-1.0, 0.28, 1.0]} scale={[0.18, 0.18, 0.18]}>
          <mesh>
            <sphereGeometry args={[0.3, 5, 5]} />
            <meshStandardMaterial color="#FFEB3B" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.05, 0]} scale={[1, 0.1, 0.6]}>
            <sphereGeometry args={[0.25, 4, 4]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// 8. Dynamic Ecosystem Decorations (Fairy lights, Lantern, Fireflies)
interface EcosystemDecorationsProps {
  weather: string
  lanternActive: boolean
  lightsActive: boolean
  firefliesUnlocked: boolean
}

function EcosystemDecorations({
  weather,
  lanternActive,
  lightsActive,
  firefliesUnlocked
}: EcosystemDecorationsProps) {
  // Fireflies bobbing positions
  const fireflyRefs = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!fireflyRefs.current) return
    const t = state.clock.getElapsedTime()
    // Oscillate firefly container
    fireflyRefs.current.position.y = Math.sin(t * 1.1) * 0.15
  })

  const isNight = weather === "night"

  return (
    <group>
      {/* Lantern (deco-lantern) */}
      {lanternActive && (
        <group position={[-1.2, 0, 1.2]}>
          {/* Post */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 4]} />
            <meshStandardMaterial color="#37474F" roughness={0.9} />
          </mesh>
          <mesh position={[0.12, 1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 4]} />
            <meshStandardMaterial color="#37474F" />
          </mesh>
          {/* Lantern body */}
          <mesh position={[0.2, 1.22, 0]} castShadow>
            <boxGeometry args={[0.12, 0.16, 0.12]} />
            <meshStandardMaterial color="#FFF59D" emissive="#FFB300" emissiveIntensity={isNight ? 1.5 : 0.2} roughness={0.2} />
          </mesh>
          {isNight && (
            <pointLight position={[0.2, 1.22, 0]} color="#FFD54F" intensity={1.8} distance={3.5} decay={2} castShadow />
          )}
        </group>
      )}

      {/* Fairy Lights wrapped around lower branches (deco-lights) */}
      {lightsActive && (
        <group>
          {/* Small glowing fairy light points */}
          {[
            { pos: [-0.4, 0.45, 0.2], col: "#FF1744" },
            { pos: [-0.15, 0.52, -0.35], col: "#FFEA00" },
            { pos: [0.35, 0.48, 0.22], col: "#00E676" },
            { pos: [0.55, 0.58, -0.25], col: "#2979FF" },
            { pos: [0.05, 0.65, 0.4], col: "#D500F9" }
          ].map((light, idx) => (
            <group key={`fairy-${idx}`} position={light.pos as [number, number, number]}>
              <mesh>
                <sphereGeometry args={[0.045, 4, 4]} />
                <meshStandardMaterial color={light.col} emissive={light.col} emissiveIntensity={isNight ? 2.5 : 0.6} />
              </mesh>
              {isNight && (
                <pointLight color={light.col} intensity={0.45} distance={1.2} decay={2} />
              )}
            </group>
          ))}
        </group>
      )}

      {/* Night fireflies particles (Level 7+ & Night weather) */}
      {firefliesUnlocked && isNight && (
        <group ref={fireflyRefs}>
          {[
            [-0.7, 0.5, 0.6],
            [1.2, 0.6, -0.8],
            [0.6, 0.4, 1.1],
            [-1.1, 0.7, -0.6]
          ].map((pos, idx) => (
            <mesh key={`firefly-p-${idx}`} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.035, 4, 4]} />
              <meshStandardMaterial color="#EEFF41" emissive="#EEFF41" emissiveIntensity={2.5} />
              <pointLight color="#EEFF41" intensity={0.4} distance={1.0} decay={2} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// 9. Weather Particle System (Rain, Wind, Snow)
interface WeatherParticlesProps {
  weather: string
  season: string
}

function WeatherParticles({ weather, season }: WeatherParticlesProps) {
  const particlesRef = React.useRef<THREE.Group>(null)

  // Rain falling speed animation
  useFrame((state) => {
    if (!particlesRef.current) return
    const children = particlesRef.current.children
    const t = state.clock.getElapsedTime()

    // Rain / Snow falling
    if (weather === "rain") {
      children.forEach((mesh, idx) => {
        mesh.position.y -= 0.18 + (idx % 3) * 0.02
        if (mesh.position.y < -3.2) {
          // Reset to top
          mesh.position.y = 4.5
          mesh.position.x = -4.0 + getOffset(idx, 80) * 8.0
          mesh.position.z = -4.0 + getOffset(idx, 90) * 8.0
        }
      })
    } else if (season === "winter") {
      // Snow drifting
      children.forEach((mesh, idx) => {
        mesh.position.y -= 0.035 + (idx % 3) * 0.008
        mesh.position.x += Math.sin(t * 1.5 + idx) * 0.004
        if (mesh.position.y < -3.2) {
          mesh.position.y = 4.5
          mesh.position.x = -4.0 + getOffset(idx, 80) * 8.0
          mesh.position.z = -4.0 + getOffset(idx, 90) * 8.0
        }
      })
    } else if (weather === "wind") {
      // Wind lines drifting across the screen horizontally
      children.forEach((mesh, idx) => {
        mesh.position.x += 0.06 + (idx % 3) * 0.015
        mesh.position.y = 0.5 + Math.sin(t * 2 + idx) * 0.06
        if (mesh.position.x > 5.0) {
          mesh.position.x = -5.0
          mesh.position.z = -3.0 + getOffset(idx, 99) * 6.0
        }
      })
    }
  })

  // Initialize rain / snow particles with deterministic coordinates
  const particles = React.useMemo(() => {
    const list = []
    const count = weather === "rain" ? 30 : season === "winter" ? 25 : weather === "wind" ? 5 : 0

    for (let i = 0; i < count; i++) {
      const rx = -4.0 + getOffset(i, 80) * 8.0
      const ry = -2.5 + getOffset(i, 85) * 7.0
      const rz = -4.0 + getOffset(i, 90) * 8.0
      list.push({ x: rx, y: ry, z: rz, key: `particle-${i}` })
    }
    return list
  }, [weather, season])

  if (particles.length === 0) return null

  return (
    <group ref={particlesRef}>
      {particles.map((p, idx) => {
        if (weather === "rain") {
          return (
            <mesh key={p.key} position={[p.x, p.y, p.z]}>
              <cylinderGeometry args={[0.008, 0.008, 0.35, 4]} />
              <meshStandardMaterial color="#80DEEA" roughness={0.5} transparent opacity={0.6} />
            </mesh>
          )
        } else if (season === "winter") {
          return (
            <mesh key={p.key} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.04 + getOffset(idx, 95) * 0.04, 4, 4]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
          )
        } else if (weather === "wind") {
          return (
            <mesh key={p.key} position={[p.x, p.y, p.z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 1.2, 4]} />
              <meshStandardMaterial color="#E0F7FA" roughness={0.8} transparent opacity={0.3} />
            </mesh>
          )
        }
        return null
      })}
    </group>
  )
}

// Sprout Particles for Stage 2 (Glowing rising pollen)
interface SproutParticlesProps {
  count?: number
}

function SproutParticles({ count = 8 }: SproutParticlesProps) {
  const groupRef = React.useRef<THREE.Group>(null)

  const particles = React.useMemo(() => {
    const list = []
    for (let i = 0; i < count; i++) {
      const angle = getOffset(i, 110) * Math.PI * 2
      const radius = 0.05 + getOffset(i, 120) * 0.32
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 0.05 + getOffset(i, 130) * 0.8
      const speed = 0.004 + getOffset(i, 140) * 0.005
      const size = 0.015 + getOffset(i, 150) * 0.02
      const color = i % 2 === 0 ? "#EEFF41" : "#AEEA00"
      list.push({ x, y, z, speed, size, color, seed: i * 12 })
    }
    return list
  }, [count])

  useFrame((state) => {
    if (!groupRef.current) return
    const children = groupRef.current.children
    const t = state.clock.getElapsedTime()
    children.forEach((mesh, idx) => {
      const p = particles[idx]
      if (!p) return
      mesh.position.y += p.speed
      mesh.position.x = p.x + Math.sin(t * 1.4 + p.seed) * 0.05
      mesh.position.z = p.z + Math.cos(t * 1.1 + p.seed) * 0.05
      if (mesh.position.y > 0.8) {
        mesh.position.y = 0.05
      }
      const scale = 0.8 + Math.sin(t * 2.5 + p.seed) * 0.3
      mesh.scale.set(scale, scale, scale)
    })
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

// 5. Procedural 3D Tree
interface TreeProps {
  level: number
  completedMissionCount: number
  season: string
  weather: string
  flowersUnlocked: boolean
  goldenLeavesActive: boolean
  nestUnlocked: boolean
}

function Tree({
  level,
  completedMissionCount,
  season,
  weather,
  flowersUnlocked,
  goldenLeavesActive,
  nestUnlocked
}: TreeProps) {
  // We use LERP in useFrame to smooth growth variables
  const animLevel = React.useRef(level)
  const animMissions = React.useRef(completedMissionCount)

  useFrame(() => {
    animLevel.current = THREE.MathUtils.lerp(animLevel.current, level, 0.04)
    animMissions.current = THREE.MathUtils.lerp(animMissions.current, completedMissionCount, 0.04)
  })

  const gameLevel = level
  const gameMissions = completedMissionCount

  // Determine stage (1 to 7)
  let stage = 1
  if (gameLevel === 2) stage = 2
  else if (gameLevel >= 3 && gameLevel <= 4) stage = 3
  else if (gameLevel >= 5 && gameLevel <= 6) stage = 4
  else if (gameLevel >= 7 && gameLevel <= 9) stage = 5
  else if (gameLevel >= 10 && gameLevel <= 14) stage = 6
  else if (gameLevel >= 15) stage = 7

  // Helper values for tree scale sways
  const growthFactor = React.useMemo(() => {
    return 0.6 + stage * 0.08 + Math.min(gameMissions * 0.003, 0.18)
  }, [stage, gameMissions])

  // Foliage cluster helper
  const renderLeafCluster = (minStage: number, missionOffset: number, baseScale: number) => {
    if (stage < minStage) return null
    // Growth based on completed mission count
    const scale = baseScale * (stage > minStage ? 1.0 : Math.min(0.3 + (gameMissions - missionOffset) * 0.15, 1.0))
    return <FoliageCluster scale={scale} season={season} golden={goldenLeavesActive} />
  }

  // Branch length calculation
  const getBranchLength = (minStage: number, missionOffset: number, baseLength: number): number => {
    if (stage < minStage) return 0
    if (stage > minStage) return baseLength
    return baseLength * Math.min(0.2 + (gameMissions - missionOffset) * 0.15, 1.0)
  }

  // Trunk segment width
  const getTrunkWidth = (segmentIndex: number): number => {
    const baseWidths = [0.22, 0.18, 0.14, 0.1, 0.07]
    const factor = 0.5 + stage * 0.1 + Math.min(gameMissions * 0.005, 0.2)
    return baseWidths[segmentIndex - 1] * factor
  }

  const woodColor = THEME_COLORS.wood

  // Level 1: Seed
  if (stage === 1) {
    return (
      <group position={[0, 0, 0]}>
        {/* Soil detail mound */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.05, 8]} />
          <meshStandardMaterial color={THEME_COLORS.soil} roughness={0.9} flatShading />
        </mesh>
        {/* Seed Mesh */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={THEME_COLORS.sand} roughness={0.7} flatShading />
        </mesh>
      </group>
    )
  }

  // Level 2: Sprout
  if (stage === 2) {
    return (
      <group position={[0, 0, 0]}>
        {/* Soil detail mound */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.4, 0.45, 0.05, 8]} />
          <meshStandardMaterial color={THEME_COLORS.soil} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.25, 0.32, 0.04, 6]} />
          <meshStandardMaterial color="#4E342E" roughness={0.95} flatShading />
        </mesh>

        {/* Small pebbles on the mound */}
        <group>
          {/* Pebble 1 */}
          <mesh position={[-0.2, 0.04, 0.15]} rotation={[0.2, 0.5, 0.1]} castShadow>
            <dodecahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial color="#90A4AE" roughness={0.8} flatShading />
          </mesh>
          {/* Pebble 2 */}
          <mesh position={[0.22, 0.04, -0.1]} rotation={[-0.4, 0.2, 0.3]} castShadow>
            <dodecahedronGeometry args={[0.035, 0]} />
            <meshStandardMaterial color="#78909C" roughness={0.85} flatShading />
          </mesh>
          {/* Pebble 3 */}
          <mesh position={[-0.1, 0.035, -0.22]} rotation={[0.1, -0.3, 0.5]} castShadow>
            <dodecahedronGeometry args={[0.03, 0]} />
            <meshStandardMaterial color="#B0BEC5" roughness={0.8} flatShading />
          </mesh>
        </group>

        {/* Companion Tiny Pink Flower Sprout */}
        <group position={[0.15, 0.04, 0.1]} scale={[0.6, 0.6, 0.6]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.015, 0.1, 4]} />
            <meshStandardMaterial color="#8BC34A" roughness={0.6} flatShading />
          </mesh>
          {/* Petals */}
          <group position={[0, 0.1, 0]}>
            <mesh rotation={[0.2, 0, 0]}>
              <dodecahedronGeometry args={[0.035, 0]} />
              <meshStandardMaterial color="#EC407A" roughness={0.5} flatShading />
            </mesh>
          </group>
        </group>

        {/* Magic Glowing Particles */}
        <SproutParticles count={8} />

        {/* Sprout Stem */}
        <WindSwayGroup speedMultiplier={1.8} ampMultiplier={1.2} baseRotation={[0, 0, 0]}>
          {/* Segment 1: Lower stem curved forward/left */}
          <group position={[0, 0.04, 0]} rotation={[0.08, 0, -0.05]}>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.048, 0.24, 5]} />
              <meshStandardMaterial color="#8BC34A" roughness={0.65} flatShading />
            </mesh>

            {/* Segment 2: Upper stem curved back/right */}
            <group position={[0, 0.22, 0]} rotation={[-0.15, 0, 0.18]}>
              <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.034, 0.042, 0.24, 5]} />
                <meshStandardMaterial color="#9CCC65" roughness={0.6} flatShading />
              </mesh>

              {/* Redesigned Leaves & Bud at the top */}
              <group position={[0, 0.24, 0]}>
                {/* Tiny glowing yellow flower bud in the center */}
                <mesh position={[0, 0.03, 0]} castShadow>
                  <dodecahedronGeometry args={[0.045, 0]} />
                  <meshStandardMaterial color="#FFEB3B" roughness={0.4} emissive="#FBC02D" emissiveIntensity={0.25} flatShading />
                </mesh>

                {/* Leaf 1 (Left) - organic dodecahedron shape */}
                <group position={[-0.08, 0.01, 0]} rotation={[0.4, -0.3, 0.9]} scale={[1.4, 0.5, 0.9]}>
                  <mesh castShadow>
                    <dodecahedronGeometry args={[0.07, 0]} />
                    <meshStandardMaterial color="#8BC34A" roughness={0.55} flatShading />
                  </mesh>
                </group>

                {/* Leaf 2 (Right) - organic dodecahedron shape, slightly smaller */}
                <group position={[0.08, 0.02, -0.03]} rotation={[-0.3, 0.4, -0.9]} scale={[1.2, 0.45, 0.8]}>
                  <mesh castShadow>
                    <dodecahedronGeometry args={[0.06, 0]} />
                    <meshStandardMaterial color="#AED581" roughness={0.5} flatShading />
                  </mesh>
                </group>
                
                {/* Back Leaf (Mini leaf pointing back) */}
                <group position={[0, 0.025, -0.08]} rotation={[-0.8, 0, 0]} scale={[0.7, 0.35, 1.1]}>
                  <mesh castShadow>
                    <dodecahedronGeometry args={[0.05, 0]} />
                    <meshStandardMaterial color="#7CB342" roughness={0.6} flatShading />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </WindSwayGroup>
      </group>
    )
  }

  // Stage 3-7: Segmented Trunk Skeleton
  const h1 = 0.7 * growthFactor
  const h2 = 0.6 * growthFactor
  const h3 = 0.5 * growthFactor
  const h4 = 0.45 * growthFactor
  const h5 = 0.4 * growthFactor

  return (
    <group position={[0, 0, 0]}>
      {/* Nest Milestone (Level 10+) */}
      {nestUnlocked && (
        <group position={[-0.15, h1 + h2 * 0.6, 0.05]} scale={[0.4, 0.4, 0.4]}>
          <mesh castShadow>
            <torusGeometry args={[0.3, 0.1, 5, 12]} />
            <meshStandardMaterial color={THEME_COLORS.wood} roughness={0.95} flatShading />
          </mesh>
          {/* Eggs */}
          <mesh position={[0.05, 0.05, 0]} scale={[0.8, 1, 0.8]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#B2EBF2" roughness={0.5} />
          </mesh>
          <mesh position={[-0.05, 0.05, 0.05]} scale={[0.8, 1, 0.8]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#B2EBF2" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* TRUNK SEGMENT 1 */}
      <WindSwayGroup speedMultiplier={0.4} ampMultiplier={0.5} baseRotation={[0, 0, 0]}>
        <mesh position={[0, h1 / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[getTrunkWidth(2), getTrunkWidth(1), h1, 5]} />
          <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
        </mesh>

        {/* Branch L1 */}
        {stage >= 3 && (
          <WindSwayGroup
            position={[0, h1 * 0.75, 0]}
            baseRotation={[0, 0, Math.PI / 4]}
            speedMultiplier={1.1}
            ampMultiplier={1.0}
          >
            <mesh position={[0, getBranchLength(3, 2, 0.6) / 2, 0]} castShadow>
              <cylinderGeometry args={[getTrunkWidth(3) * 0.7, getTrunkWidth(2) * 0.7, getBranchLength(3, 2, 0.6), 5]} />
              <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
            </mesh>
            {/* Twig L1A */}
            <WindSwayGroup
              position={[0, getBranchLength(3, 2, 0.6), 0]}
              baseRotation={[0, 0, Math.PI / 6]}
              speedMultiplier={1.5}
              ampMultiplier={1.2}
            >
              <mesh position={[0, getBranchLength(3, 2, 0.35) / 2, 0]} castShadow>
                <cylinderGeometry args={[getTrunkWidth(4) * 0.5, getTrunkWidth(3) * 0.5, getBranchLength(3, 2, 0.35), 4]} />
                <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
              </mesh>
              <group position={[0, getBranchLength(3, 2, 0.35), 0]}>
                {renderLeafCluster(3, 2, 0.7)}
              </group>
            </WindSwayGroup>

            {/* Twig L1B (Stage >= 4) */}
            {stage >= 4 && (
              <WindSwayGroup
                position={[0, getBranchLength(4, 5, 0.6) * 0.65, 0]}
                baseRotation={[0, 0, -Math.PI / 3]}
                speedMultiplier={1.3}
                ampMultiplier={1.1}
              >
                <mesh position={[0, getBranchLength(4, 5, 0.3) / 2, 0]} castShadow>
                  <cylinderGeometry args={[getTrunkWidth(4) * 0.4, getTrunkWidth(3) * 0.5, getBranchLength(4, 5, 0.3), 4]} />
                  <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                </mesh>
                <group position={[0, getBranchLength(4, 5, 0.3), 0]}>
                  {renderLeafCluster(4, 5, 0.55)}
                </group>
              </WindSwayGroup>
            )}
            {/* Hanging Vine L1 (Level 15+ / stage >= 7) */}
            {stage >= 7 && (
              <mesh position={[0, getBranchLength(3, 2, 0.6) * 0.55, 0.05]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.6, 3]} />
                <meshStandardMaterial color="#33691E" roughness={0.9} />
              </mesh>
            )}
            {/* Flower L1 */}
            <FlowerMesh unlocked={flowersUnlocked && stage >= 5} scale={0.7} position={[0, getBranchLength(3, 2, 0.6), 0]} />
          </WindSwayGroup>
        )}

        {/* Branch R1 */}
        {stage >= 3 && (
          <WindSwayGroup
            position={[0, h1 * 0.75, 0]}
            baseRotation={[0, 0, -Math.PI / 4]}
            speedMultiplier={1.1}
            ampMultiplier={1.0}
          >
            <mesh position={[0, getBranchLength(3, 4, 0.6) / 2, 0]} castShadow>
              <cylinderGeometry args={[getTrunkWidth(3) * 0.7, getTrunkWidth(2) * 0.7, getBranchLength(3, 4, 0.6), 5]} />
              <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
            </mesh>
            {/* Twig R1A */}
            <WindSwayGroup
              position={[0, getBranchLength(3, 4, 0.6), 0]}
              baseRotation={[0, 0, -Math.PI / 6]}
              speedMultiplier={1.5}
              ampMultiplier={1.2}
            >
              <mesh position={[0, getBranchLength(3, 4, 0.35) / 2, 0]} castShadow>
                <cylinderGeometry args={[getTrunkWidth(4) * 0.5, getTrunkWidth(3) * 0.5, getBranchLength(3, 4, 0.35), 4]} />
                <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
              </mesh>
              <group position={[0, getBranchLength(3, 4, 0.35), 0]}>
                {renderLeafCluster(3, 4, 0.7)}
              </group>
            </WindSwayGroup>

            {/* Twig R1B (Stage 4+) */}
            {stage >= 4 && (
              <WindSwayGroup
                position={[0, getBranchLength(4, 7, 0.6) * 0.65, 0]}
                baseRotation={[0, 0, Math.PI / 3]}
                speedMultiplier={1.3}
                ampMultiplier={1.1}
              >
                <mesh position={[0, getBranchLength(4, 7, 0.3) / 2, 0]} castShadow>
                  <cylinderGeometry args={[getTrunkWidth(4) * 0.4, getTrunkWidth(3) * 0.5, getBranchLength(4, 7, 0.3), 4]} />
                  <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                </mesh>
                <group position={[0, getBranchLength(4, 7, 0.3), 0]}>
                  {renderLeafCluster(4, 7, 0.55)}
                </group>
              </WindSwayGroup>
            )}
            {/* Hanging Vine R1 (Level 15+ / stage >= 7) */}
            {stage >= 7 && (
              <mesh position={[0, getBranchLength(3, 4, 0.6) * 0.55, 0.05]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.6, 3]} />
                <meshStandardMaterial color="#33691E" roughness={0.9} />
              </mesh>
            )}
            {/* Flower R1 */}
            <FlowerMesh unlocked={flowersUnlocked && stage >= 5} scale={0.7} position={[0, getBranchLength(3, 4, 0.6), 0]} />
          </WindSwayGroup>
        )}

        {/* TRUNK SEGMENT 2 */}
        <WindSwayGroup position={[0, h1, 0]} speedMultiplier={0.6} ampMultiplier={0.65} baseRotation={[0.02, 0, -0.01]}>
          <mesh position={[0, h2 / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[getTrunkWidth(3), getTrunkWidth(2), h2, 5]} />
            <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
          </mesh>

          {/* Peeking Forest Face */}
          <group position={[0, h2 * 0.4, 0.13]}>
            <mesh position={[-0.07, 0, 0]}>
              <sphereGeometry args={[0.025, 4, 4]} />
              <meshStandardMaterial color="#1B301D" />
            </mesh>
            <mesh position={[0.07, 0, 0]}>
              <sphereGeometry args={[0.025, 4, 4]} />
              <meshStandardMaterial color="#1B301D" />
            </mesh>
            <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
              <meshStandardMaterial color="#1B301D" />
            </mesh>
          </group>

          {/* TRUNK SEGMENT 3 */}
          <WindSwayGroup position={[0, h2, 0]} speedMultiplier={0.8} ampMultiplier={0.8} baseRotation={[-0.01, 0, 0.02]}>
            <mesh position={[0, h3 / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[getTrunkWidth(4), getTrunkWidth(3), h3, 5]} />
              <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
            </mesh>

            {/* Branch L2 (Stage >= 4) */}
            {stage >= 4 && (
              <WindSwayGroup
                position={[0, h3 * 0.35, 0]}
                baseRotation={[0, 0, Math.PI / 3.5]}
                speedMultiplier={1.3}
                ampMultiplier={1.1}
              >
                <mesh position={[0, getBranchLength(4, 8, 0.55) / 2, 0]} castShadow>
                  <cylinderGeometry args={[getTrunkWidth(4) * 0.65, getTrunkWidth(3) * 0.6, getBranchLength(4, 8, 0.55), 4]} />
                  <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                </mesh>
                {/* Twigs L2 */}
                <WindSwayGroup
                  position={[0, getBranchLength(4, 8, 0.55), 0]}
                  baseRotation={[0, 0, Math.PI / 6]}
                  speedMultiplier={1.6}
                  ampMultiplier={1.2}
                >
                  <group position={[0, getBranchLength(4, 10, 0.3), 0]}>
                    {renderLeafCluster(4, 10, 0.65)}
                  </group>
                </WindSwayGroup>
                <WindSwayGroup
                  position={[0, getBranchLength(4, 8, 0.55) * 0.7, 0]}
                  baseRotation={[0, 0, -Math.PI / 4]}
                  speedMultiplier={1.4}
                  ampMultiplier={1.1}
                >
                  <group position={[0, getBranchLength(4, 12, 0.28), 0]}>
                    {renderLeafCluster(4, 12, 0.6)}
                  </group>
                </WindSwayGroup>
                <FlowerMesh unlocked={flowersUnlocked && stage >= 6} scale={0.65} position={[0, getBranchLength(4, 8, 0.55), 0]} />
              </WindSwayGroup>
            )}

            {/* Branch R2 (Stage >= 4) */}
            {stage >= 4 && (
              <WindSwayGroup
                position={[0, h3 * 0.35, 0]}
                baseRotation={[0, 0, -Math.PI / 3.5]}
                speedMultiplier={1.3}
                ampMultiplier={1.1}
              >
                <mesh position={[0, getBranchLength(4, 9, 0.55) / 2, 0]} castShadow>
                  <cylinderGeometry args={[getTrunkWidth(4) * 0.65, getTrunkWidth(3) * 0.6, getBranchLength(4, 9, 0.55), 4]} />
                  <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                </mesh>
                {/* Twigs R2 */}
                <WindSwayGroup
                  position={[0, getBranchLength(4, 9, 0.55), 0]}
                  baseRotation={[0, 0, -Math.PI / 6]}
                  speedMultiplier={1.6}
                  ampMultiplier={1.2}
                >
                  <group position={[0, getBranchLength(4, 11, 0.3), 0]}>
                    {renderLeafCluster(4, 11, 0.65)}
                  </group>
                </WindSwayGroup>
                <WindSwayGroup
                  position={[0, getBranchLength(4, 9, 0.55) * 0.7, 0]}
                  baseRotation={[0, 0, Math.PI / 4]}
                  speedMultiplier={1.4}
                  ampMultiplier={1.1}
                >
                  <group position={[0, getBranchLength(4, 13, 0.28), 0]}>
                    {renderLeafCluster(4, 13, 0.6)}
                  </group>
                </WindSwayGroup>
                <FlowerMesh unlocked={flowersUnlocked && stage >= 6} scale={0.65} position={[0, getBranchLength(4, 9, 0.55), 0]} />
              </WindSwayGroup>
            )}

            {/* TRUNK SEGMENT 4 */}
            {stage >= 5 && (
              <WindSwayGroup position={[0, h3, 0]} speedMultiplier={0.9} ampMultiplier={0.95} baseRotation={[0, 0, -0.02]}>
                <mesh position={[0, h4 / 2, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[getTrunkWidth(5), getTrunkWidth(4), h4, 5]} />
                  <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                </mesh>

                {/* Branch L3 */}
                <WindSwayGroup
                  position={[0, h4 * 0.4, 0]}
                  baseRotation={[0, 0, Math.PI / 3.2]}
                  speedMultiplier={1.4}
                  ampMultiplier={1.15}
                >
                  <mesh position={[0, getBranchLength(5, 14, 0.5) / 2, 0]} castShadow>
                    <cylinderGeometry args={[getTrunkWidth(5) * 0.6, getTrunkWidth(4) * 0.6, getBranchLength(5, 14, 0.5), 4]} />
                    <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                  </mesh>
                  {/* Twigs L3 */}
                  <group position={[0, getBranchLength(5, 14, 0.5), 0]}>
                    {renderLeafCluster(5, 16, 0.65)}
                  </group>
                  <WindSwayGroup
                    position={[0, getBranchLength(5, 14, 0.5) * 0.7, 0]}
                    baseRotation={[0, 0, -Math.PI / 5]}
                  >
                    <group position={[0, getBranchLength(5, 18, 0.25), 0]}>
                      {renderLeafCluster(5, 18, 0.55)}
                    </group>
                  </WindSwayGroup>
                  <FlowerMesh unlocked={flowersUnlocked && stage >= 6} scale={0.6} position={[0, getBranchLength(5, 14, 0.5), 0]} />
                </WindSwayGroup>

                {/* Branch R3 */}
                <WindSwayGroup
                  position={[0, h4 * 0.4, 0]}
                  baseRotation={[0, 0, -Math.PI / 3.2]}
                  speedMultiplier={1.4}
                  ampMultiplier={1.15}
                >
                  <mesh position={[0, getBranchLength(5, 15, 0.5) / 2, 0]} castShadow>
                    <cylinderGeometry args={[getTrunkWidth(5) * 0.6, getTrunkWidth(4) * 0.6, getBranchLength(5, 15, 0.5), 4]} />
                    <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                  </mesh>
                  {/* Twigs R3 */}
                  <group position={[0, getBranchLength(5, 15, 0.5), 0]}>
                    {renderLeafCluster(5, 17, 0.65)}
                  </group>
                  <WindSwayGroup
                    position={[0, getBranchLength(5, 15, 0.5) * 0.7, 0]}
                    baseRotation={[0, 0, Math.PI / 5]}
                  >
                    <group position={[0, getBranchLength(5, 19, 0.25), 0]}>
                      {renderLeafCluster(5, 19, 0.55)}
                    </group>
                  </WindSwayGroup>
                  <FlowerMesh unlocked={flowersUnlocked && stage >= 6} scale={0.6} position={[0, getBranchLength(5, 15, 0.5), 0]} />
                </WindSwayGroup>

                {/* TRUNK SEGMENT 5 (CROWN) */}
                {stage >= 6 && (
                  <WindSwayGroup position={[0, h4, 0]} speedMultiplier={1.1} ampMultiplier={1.1} baseRotation={[0.01, 0, 0.02]}>
                    <mesh position={[0, h5 / 2, 0]} castShadow receiveShadow>
                      <cylinderGeometry args={[getTrunkWidth(5) * 0.7, getTrunkWidth(5), h5, 4]} />
                      <meshStandardMaterial color={woodColor} roughness={0.9} flatShading />
                    </mesh>

                    {/* Crown Left Twig */}
                    <WindSwayGroup position={[0, h5, 0]} baseRotation={[0, 0, Math.PI / 5]} speedMultiplier={1.6} ampMultiplier={1.3}>
                      <group position={[0, getBranchLength(6, 20, 0.35), 0]}>
                        {renderLeafCluster(6, 20, 0.8)}
                      </group>
                    </WindSwayGroup>

                    {/* Crown Center Twig */}
                    <WindSwayGroup position={[0, h5, 0]} baseRotation={[0, 0, 0]} speedMultiplier={1.4} ampMultiplier={1.2}>
                      <group position={[0, getBranchLength(6, 22, 0.38), 0]}>
                        {renderLeafCluster(6, 22, 0.9)}
                      </group>
                      <FlowerMesh unlocked={flowersUnlocked && stage >= 7} scale={0.65} position={[0, getBranchLength(6, 22, 0.38) + 0.15, 0]} />
                    </WindSwayGroup>

                    {/* Crown Right Twig */}
                    <WindSwayGroup position={[0, h5, 0]} baseRotation={[0, 0, -Math.PI / 5]} speedMultiplier={1.6} ampMultiplier={1.3}>
                      <group position={[0, getBranchLength(6, 24, 0.35), 0]}>
                        {renderLeafCluster(6, 24, 0.8)}
                      </group>
                    </WindSwayGroup>
                  </WindSwayGroup>
                )}
              </WindSwayGroup>
            )}
          </WindSwayGroup>
        </WindSwayGroup>
      </WindSwayGroup>
    </group>
  )
}

// Floating Island parent wrapper to synchronize hover sway of all child meshes
interface FloatingIslandProps {
  children: React.ReactNode
}

function FloatingIsland({ children }: FloatingIslandProps) {
  const islandSwayRef = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!islandSwayRef.current) return
    const t = state.clock.getElapsedTime()
    islandSwayRef.current.position.y = Math.sin(t * 0.9) * 0.08
  })

  return <group ref={islandSwayRef}>{children}</group>
}

// 10. Main 3D Scene Composition
interface ThreeSceneProps {
  level: number
  completedMissionCount: number
  season: string
  weather: string
  unlockedRewardKeys: string[]
  customLeavesEnabled: boolean
  activeDecorations: string[]
}

export function ThreeScene({
  level,
  completedMissionCount,
  season,
  weather,
  unlockedRewardKeys,
  customLeavesEnabled,
  activeDecorations
}: ThreeSceneProps) {
  // Reward unlocks
  const flowersUnlocked = level >= 7 || unlockedRewardKeys.includes("reward-flowers")
  const nestUnlocked = level >= 10 || unlockedRewardKeys.includes("reward-nest")
  const waterfallUnlocked = level >= 15 || unlockedRewardKeys.includes("reward-waterfall")
  const firefliesUnlocked = level >= 7 || unlockedRewardKeys.includes("reward-fireflies")
  const goldenLeavesActive = level >= 15 || customLeavesEnabled

  // Creature unlocks
  const butterflyUnlocked = level >= 2
  const bluebirdUnlocked = level >= 5
  const beeUnlocked = level >= 8
  const squirrelUnlocked = level >= 12
  const owlUnlocked = level >= 20

  // Decor items
  const lanternActive = activeDecorations.includes("deco-lantern")
  const lightsActive = activeDecorations.includes("deco-lights")
  const pondUnlocked = activeDecorations.includes("wonder-pond")
  const crystalsUnlocked = activeDecorations.includes("wonder-crystal")

  const isNight = weather === "night"
  const fogColor = SKY_FOG_COLORS[weather as keyof typeof SKY_FOG_COLORS] || SKY_FOG_COLORS.sunny

  // Calculate dynamic count of falling leaf particles
  const leafFallCount = React.useMemo(() => {
    if (level < 3) return 0
    return Math.min(2 + Math.floor(level / 3), 7)
  }, [level])

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      shadows
      camera={{ position: [0, 3.2, 6.8], fov: 42 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* Fog effect to blend island into CSS gradient sky */}
      <fog attach="fog" args={[fogColor, 7.8, 15.5]} />

      {/* Lighting setup */}
      <ambientLight intensity={isNight ? 0.25 : 0.75} color={isNight ? "#1A237E" : "#E0F2FE"} />
      <hemisphereLight
        args={[isNight ? "#0C1B33" : "#E3F2FD", "#6D5345", isNight ? 0.18 : 0.7]}
      />
      <directionalLight
        castShadow
        position={[4, 7.5, 4]}
        intensity={isNight ? 0.45 : 1.6}
        color={isNight ? "#90CAF9" : "#FFF9C4"}
        shadow-bias={-0.0005}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-camera-far={18}
      />

      {/* Fluffy drifting clouds in the sky */}
      <FloatingClouds />

      {/* Fluffy base clouds below the floating island base */}
      {level >= 2 && <BaseClouds />}

      {/* Floating composite island base wrapped in FloatingIsland for unified sway */}
      <FloatingIsland>
        {/* Rocky irregular boulders jutting from soil cliff sides (Repositioned for larger island) */}
        <group>
          {/* Boulder 1 (Front Left) */}
          <mesh position={[-3.2, -0.9, 1.9]} rotation={[0.4, 0.8, -0.2]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color={THEME_COLORS.rock} roughness={0.8} flatShading />
          </mesh>
          {/* Boulder 2 (Back Right) */}
          <mesh position={[3.3, -1.1, -1.6]} rotation={[-0.5, 0.3, 0.4]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color={THEME_COLORS.rockDark} roughness={0.85} flatShading />
          </mesh>
          {/* Boulder 3 (Back Left) */}
          <mesh position={[-1.7, -1.7, -2.6]} rotation={[0.6, -0.4, 0.8]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.85, 0]} />
            <meshStandardMaterial color={THEME_COLORS.rock} roughness={0.8} flatShading />
          </mesh>
          {/* Boulder 4 (Front Right) */}
          <mesh position={[2.7, -0.7, 2.7]} rotation={[0.1, 0.2, 0.3]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.65, 0]} />
            <meshStandardMaterial color={THEME_COLORS.rockDark} roughness={0.85} flatShading />
          </mesh>
        </group>

        {/* Small satellite floating islets to give custom fantasy feel (Repositioned) */}
        <group>
          {/* Islet 1 (Left) - Square */}
          <group position={[-6.2, -0.7, 2.2]} rotation={[0.2, -0.5, 0.1]}>
            <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.42, 0.18, 0.82, 4]} />
              <meshStandardMaterial color={THEME_COLORS.soil} roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.43, 0.43, 0.05, 4]} />
              <meshStandardMaterial
                color={
                  season === "winter"
                    ? "#ECEFF1"
                    : season === "autumn"
                      ? "#D84315"
                      : "#7CB342"
                }
                roughness={0.8}
                flatShading
              />
            </mesh>
          </group>

          {/* Islet 2 (Right) - Square */}
          <group position={[6.0, -1.3, -2.8]} rotation={[-0.3, 0.4, -0.1]}>
            <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.3, 0.12, 0.6, 4]} />
              <meshStandardMaterial color={THEME_COLORS.rock} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 0.31, 0]} rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.31, 0.31, 0.04, 4]} />
              <meshStandardMaterial
                color={
                  season === "winter"
                    ? "#ECEFF1"
                    : season === "autumn"
                      ? "#E65100"
                      : "#689F38"
                }
                roughness={0.8}
                flatShading
              />
            </mesh>
          </group>
        </group>

        {/* Waterfall Component */}
        <WaterfallFlow unlocked={waterfallUnlocked} />

        {/* Island Base details */}
        <IslandBase
          level={level}
          completedMissionCount={completedMissionCount}
          season={season}
          weather={weather}
          waterfallUnlocked={waterfallUnlocked}
          pondUnlocked={pondUnlocked}
          crystalsUnlocked={crystalsUnlocked}
          flowersUnlocked={flowersUnlocked}
        />

        {/* Procedural Tree & Creatures - offset back to accommodate central pond */}
        <group position={[0, 0, pondUnlocked ? -0.85 : 0]}>
          <Tree
            level={level}
            completedMissionCount={completedMissionCount}
            season={season}
            weather={weather}
            flowersUnlocked={flowersUnlocked}
            goldenLeavesActive={goldenLeavesActive}
            nestUnlocked={nestUnlocked}
          />

          {/* Milestone Wildlife */}
          <Creatures
            level={level}
            butterflyUnlocked={false} // butterflies are custom-rendered below for multiple support
            bluebirdUnlocked={bluebirdUnlocked}
            beeUnlocked={beeUnlocked}
            squirrelUnlocked={squirrelUnlocked}
            owlUnlocked={owlUnlocked}
          />

          {/* Fairy Lights wrapped around lower branches (deco-lights) */}
          {lightsActive && (
            <group>
              {[
                { pos: [-0.4, 0.45, 0.2], col: "#FF1744" },
                { pos: [-0.15, 0.52, -0.35], col: "#FFEA00" },
                { pos: [0.35, 0.48, 0.22], col: "#00E676" },
                { pos: [0.55, 0.58, -0.25], col: "#2979FF" },
                { pos: [0.05, 0.65, 0.4], col: "#D500F9" }
              ].map((light, idx) => (
                <group key={`fairy-${idx}`} position={light.pos as [number, number, number]}>
                  <mesh>
                    <sphereGeometry args={[0.045, 4, 4]} />
                    <meshStandardMaterial color={light.col} emissive={light.col} emissiveIntensity={isNight ? 2.5 : 0.6} />
                  </mesh>
                  {isNight && (
                    <pointLight color={light.col} intensity={0.45} distance={1.2} decay={2} />
                  )}
                </group>
              ))}
            </group>
          )}
        </group>

        {/* Custom decorations */}
        <EcosystemDecorations
          weather={weather}
          lanternActive={lanternActive}
          lightsActive={false}
          firefliesUnlocked={firefliesUnlocked}
        />

        {/* Land-based wildlife that hovers/hops on the island */}
        <HoppingRabbit level={level} index={0} baseX={-2.2} baseZ={-0.8} color="#ECEFF1" />
        <HoppingRabbit level={level} index={1} baseX={1.8} baseZ={1.5} color="#D7CCC8" />
        <PondDuck unlocked={pondUnlocked} />
      </FloatingIsland>

      {/* Falling leaves particle overlay */}
      {leafFallCount > 0 && <FallingLeaves count={leafFallCount} season={season} />}

      {/* Milestone Wildlife Butterflies */}
      {butterflyUnlocked && (
        <group>
          {/* Butterfly 1 */}
          <Butterfly index={0} color="#E040FB" speed={0.8} radius={2.2} heightOffset={1.4} />
          {/* Butterfly 2 (Level 5+) */}
          {level >= 5 && (
            <Butterfly index={1} color="#00E5FF" speed={0.65} radius={1.8} heightOffset={1.8} />
          )}
          {/* Butterfly 3 (Level 10+) */}
          {level >= 10 && (
            <Butterfly index={2} color="#FFD54F" speed={0.9} radius={2.6} heightOffset={1.1} />
          )}
        </group>
      )}

      {/* Particles (Rain, Wind, Snow) */}
      <WeatherParticles weather={weather} season={season} />

      {/* Animated Wildlife overlays (not bound rigidly to island sway) */}
      <FlyingBirds count={3} level={level} />
      <JumpingFish index={0} baseX={-5.2} baseZ={-3.2} jumpRadius={1.3} color="#FF7043" />
      <JumpingFish index={1} baseX={5.8} baseZ={4.2} jumpRadius={1.6} color="#00E5FF" />

      {/* Orbit Controls (damping enabled for smooth camera pan, scaled limits for larger island) */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4.2}
        maxDistance={12.5}
        target={[0, 1.25, 0]}
        maxPolarAngle={Math.PI / 2 + 0.05}
        dampingFactor={0.06}
        enableDamping={true}
        autoRotate={true}
        autoRotateSpeed={0.2}
      />
    </Canvas>
  )
}

export default ThreeScene
