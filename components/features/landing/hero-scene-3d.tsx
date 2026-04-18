"use client"

import { Suspense, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useGLTF, ContactShadows, Sparkles as R3FSparkles } from "@react-three/drei"
import {
  Box3,
  Color,
  Group,
  MathUtils,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from "three"
import type { MotionValue } from "framer-motion"

type PieceConfig = {
  id: string
  url: string
  target: [number, number, number]
  finalPos: [number, number, number]
  offset: [number, number, number]
  rotationY?: number
  appearAt: number
  settleAt: number
  color: string
  roughness?: number
  metalness?: number
}

// Room is 7w × 5d. Origin at centre. Walls at x=±3.5, z=±2.5.
// North wall (-z): wardrobe (left) + tv_stand (right) — separated so tv doesn't clip wardrobe.
// West wall (-x): bed + nightstand.
// Centre-south: sofa facing tv, coffee table between them, rug underneath living zone.
// Corners: plant (SE), floor lamp (SW).
const PIECES: PieceConfig[] = [
  {
    id: "rug",
    url: "/furniture_models/area_rug.glb",
    target: [3.0, 0.02, 2.0],
    finalPos: [0.8, 0.001, 0.8],
    offset: [0, -1.5, 0],
    rotationY: 0,
    appearAt: 0.05,
    settleAt: 0.35,
    color: "#b87a6e",
    roughness: 0.95,
  },
  {
    id: "bed",
    url: "/furniture_models/queen_bed.glb",
    target: [1.6, 0.5, 2.0],
    finalPos: [-2.4, 0, -0.9],
    offset: [-4, 2, -3],
    rotationY: Math.PI / 2,
    appearAt: 0.08,
    settleAt: 0.35,
    color: "#c9a37a",
    roughness: 0.7,
  },
  {
    id: "nightstand",
    url: "/furniture_models/nightstand.glb",
    target: [0.45, 0.5, 0.4],
    finalPos: [-3.2, 0, 0.35],
    offset: [-4, 1.5, -3],
    rotationY: 0,
    appearAt: 0.15,
    settleAt: 0.42,
    color: "#8b6f4e",
    roughness: 0.65,
  },
  {
    id: "wardrobe",
    url: "/furniture_models/large_wardrobe.glb",
    target: [1.4, 1.5, 0.55],
    finalPos: [-0.6, 0, -2.2],
    offset: [-3, 3, -3],
    rotationY: 0,
    appearAt: 0.22,
    settleAt: 0.5,
    color: "#6b4f3a",
    roughness: 0.6,
  },
  {
    id: "tv_stand",
    url: "/furniture_models/tv_stand.glb",
    target: [1.3, 0.45, 0.4],
    finalPos: [2.2, 0, -2.25],
    offset: [3, 1.5, -5],
    rotationY: 0,
    appearAt: 0.3,
    settleAt: 0.58,
    color: "#3d3d42",
    roughness: 0.5,
    metalness: 0.2,
  },
  {
    id: "sofa",
    url: "/furniture_models/3_seat_sofa.glb",
    target: [2.0, 0.75, 0.85],
    finalPos: [1.5, 0, 1.7],
    offset: [-4, 2, 4],
    rotationY: Math.PI,
    appearAt: 0.38,
    settleAt: 0.62,
    color: "#5b7c99",
    roughness: 0.85,
  },
  {
    id: "coffee_table",
    url: "/furniture_models/coffee_table.glb",
    target: [0.9, 0.35, 0.55],
    finalPos: [1.5, 0, 0.6],
    offset: [0, 2.5, 5],
    rotationY: 0,
    appearAt: 0.45,
    settleAt: 0.68,
    color: "#d9b98a",
    roughness: 0.55,
  },
  {
    id: "plant",
    url: "/furniture_models/indoor_plant.glb",
    target: [0.55, 1.1, 0.55],
    finalPos: [3.1, 0, 2.0],
    offset: [5, 2, 4],
    rotationY: 0,
    appearAt: 0.52,
    settleAt: 0.75,
    color: "#4a7c3a",
    roughness: 0.9,
  },
  {
    id: "floor_lamp",
    url: "/furniture_models/floor_lamp.glb",
    target: [0.4, 1.5, 0.4],
    finalPos: [-0.2, 0, 1.9],
    offset: [-5, 3, 3],
    rotationY: 0,
    appearAt: 0.58,
    settleAt: 0.8,
    color: "#f5e6b8",
    roughness: 0.4,
    metalness: 0.1,
  },
]

PIECES.forEach((p) => useGLTF.preload(p.url))

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function GLTFPiece({ config, progressRef }: { config: PieceConfig; progressRef: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(config.url)
  const groupRef = useRef<Group>(null)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)
    const tint = new Color(config.color)
    clone.traverse((child: Object3D) => {
      if ("material" in child && child.material) {
        const painted = new MeshStandardMaterial({
          color: tint,
          roughness: config.roughness ?? 0.7,
          metalness: config.metalness ?? 0,
        })
        ;(child as unknown as { material: MeshStandardMaterial }).material = painted
      }
      if ("castShadow" in child) (child as unknown as { castShadow: boolean }).castShadow = true
      if ("receiveShadow" in child) (child as unknown as { receiveShadow: boolean }).receiveShadow = true
    })
    const box = new Box3().setFromObject(clone)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)

    const sx = size.x > 0.001 ? config.target[0] / size.x : 1
    const sy = size.y > 0.001 ? config.target[1] / size.y : 1
    const sz = size.z > 0.001 ? config.target[2] / size.z : 1

    clone.position.set(-center.x * sx, -box.min.y * sy, -center.z * sz)
    return { clone, scale: [sx, sy, sz] as [number, number, number] }
  }, [scene, config.target, config.color, config.roughness, config.metalness])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const p = progressRef.current
    const span = Math.max(0.001, config.settleAt - config.appearAt)
    const localT = MathUtils.clamp((p - config.appearAt) / span, 0, 1)
    const eased = easeOutCubic(localT)

    const [fx, fy, fz] = config.finalPos
    const [ox, oy, oz] = config.offset
    g.position.x = fx + ox * (1 - eased)
    g.position.y = fy + oy * (1 - eased)
    g.position.z = fz + oz * (1 - eased)

    g.rotation.y = (config.rotationY ?? 0) + (1 - eased) * Math.PI * 0.5
    const s = 0.2 + 0.8 * eased
    g.scale.setScalar(s)

    g.visible = p >= config.appearAt - 0.02
  })

  return (
    <group ref={groupRef}>
      <primitive object={prepared.clone} scale={prepared.scale} />
    </group>
  )
}

function RoomFloor({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = progressRef.current
    const t = MathUtils.clamp(p / 0.2, 0, 1)
    ref.current.scale.setScalar(0.6 + 0.4 * easeOutCubic(t))
    const mat = ref.current.children[0] as unknown as { material?: { opacity?: number; transparent?: boolean } }
    if (mat?.material) {
      mat.material.opacity = 0.2 + 0.55 * easeOutCubic(t)
      mat.material.transparent = true
    }
  })
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.5, 5.4]} />
        <meshStandardMaterial color="#efe8dd" roughness={0.9} metalness={0.0} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function CameraRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  useFrame((state) => {
    const p = progressRef.current
    const eased = easeOutCubic(MathUtils.clamp(p, 0, 1))

    const startRadius = 11
    const endRadius = 8.5
    const radius = MathUtils.lerp(startRadius, endRadius, eased)

    const startAngle = Math.PI * 0.1
    const endAngle = Math.PI * 0.35
    const angle = MathUtils.lerp(startAngle, endAngle, eased)

    const startHeight = 9
    const endHeight = 5.5
    const height = MathUtils.lerp(startHeight, endHeight, eased)

    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.z = Math.cos(angle) * radius
    state.camera.position.y = height
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function HeroScene3D({ progress }: { progress: MotionValue<number> }) {
  const progressRef = useRef(0)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 7, 11], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ invalidate }) => {
        progress.on("change", (v) => {
          progressRef.current = v
          invalidate()
        })
      }}
      frameloop="always"
    >
      <fog attach="fog" args={["#fafaf7", 14, 24]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-5, 6, -4]} intensity={0.35} />

      <CameraRig progressRef={progressRef} />

      <Suspense fallback={null}>
        <RoomFloor progressRef={progressRef} />
        {PIECES.map((p) => (
          <GLTFPiece key={p.id} config={p} progressRef={progressRef} />
        ))}
        <ContactShadows position={[0, 0.005, 0]} opacity={0.35} scale={10} blur={2.5} far={3} />
        <R3FSparkles
          count={60}
          scale={[8, 3, 6]}
          position={[0, 1.6, 0]}
          size={3}
          speed={0.3}
          opacity={0.6}
          color="#f5d5a0"
        />
        <R3FSparkles
          count={30}
          scale={[10, 4, 7]}
          position={[0, 2.2, 0]}
          size={1.5}
          speed={0.15}
          opacity={0.4}
          color="#ffffff"
        />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  )
}
