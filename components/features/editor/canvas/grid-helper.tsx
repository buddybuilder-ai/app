"use client"

import { Grid } from "@react-three/drei"

export function GridHelper() {
  return (
    <Grid
      position={[0, 0, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#e5e5e5"
      sectionSize={1}
      sectionThickness={1}
      sectionColor="#d4d4d4"
      fadeDistance={30}
      fadeStrength={1}
      infiniteGrid
    />
  )
}
