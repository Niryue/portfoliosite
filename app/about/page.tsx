"use client";

import { Canvas } from "@react-three/fiber";
import Floor from "@/components/Floor";
import SceneFog from "@/components/SceneFog";
import CameraRig from "@/components/CameraRig";

export default function AboutPage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}> 
      <Canvas
          shadows 
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ background: "#e0ecff" }}>
      <CameraRig />
      <Floor color="#ffffff" />
      <SceneFog color="#e0ecff" />
      <directionalLight 
          position={[100, 20, 30]} 
          intensity={20} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20} />

      <ambientLight intensity={2} />
    </Canvas>
    </main>
  )
}
