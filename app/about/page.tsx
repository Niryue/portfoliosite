"use client";

import { Canvas } from "@react-three/fiber";
import Floor from "@/components/Floor";
import SceneFog from "@/components/SceneFog";
import CameraRig from "@/components/CameraRig";
import KehanAbout from "@/components/KehanAbout";
import WaterFloor from "@/components/waterFloor/index";
import SeabedFloor from "@/components/waterFloor/components/SeabedFloor/index";
import ShadowCatcher from "@/components/waterFloor/components/ShadowCatcher/index";
import WaterDepthIntersection from "@/components/waterFloor/components/WaterDepthIntersection/index";
import WaterSparkles from "@/components/waterFloor/components/WaterSparkles/index";
import WaterWaveSimulation from "@/components/waterFloor/components/WaterWaveSimulation/index";
import Freecam from "@/components/Freecam";
import SkyBox from "@/components/Sky";

export default function AboutPage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}> 
      <Canvas
          shadows 
          camera={{ position: [0, 0.5, 2.7], fov: 50 }}
          style={{ background: "#e0ecff" }}>
      <CameraRig where={[0, 0.25, 0]} />
      {/* <Freecam /> */}
      {/* <Floor color="#eaffd1" position={[0, -1, 0]} /> */}
      <SceneFog color="#629eff" />
      <directionalLight 
          position={[5, 10, 5]} 
          intensity={5} 
          castShadow
          shadow-bias={-0.0003}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20} />

      <ambientLight intensity={1} />
      <KehanAbout position={[0, -1, 0]} />
      <WaterFloor />
      <SeabedFloor />
      <ShadowCatcher />
      <WaterDepthIntersection />
      <WaterSparkles />
      <WaterWaveSimulation />
      <SkyBox />
    </Canvas>
    </main>
  )
}
