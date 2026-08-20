"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import Floor from "@/components/Floor";
import SceneFog from "@/components/SceneFog";
import CameraRig from "@/components/CameraRig";
import KehanAbout from "@/components/KehanAbout";
import WaterFloor from "@/components/waterFloor/index";
import ShadowCatcher from "@/components/waterFloor/components/ShadowCatcher/index";
import WaterDepthIntersection from "@/components/waterFloor/components/WaterDepthIntersection/index";
import WaterSparkles from "@/components/waterFloor/components/WaterSparkles/index";
import WaterWaveSimulation from "@/components/waterFloor/components/WaterWaveSimulation/index";
import Freecam from "@/components/Freecam";
import SkyBox from "@/components/Sky";
import AboutModel from "@/components/AboutModel";
import AboutModelWaterInteraction from "@/components/AboutModelWaterInteraction";
import SkyDome from "@/components/skyDome/SkyDome";

export default function AboutPage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}> 
      <Canvas
          shadows 
          camera={{ position: [0, 0.5, 2.7], fov: 40 }}
          style={{ background: "#e0ecff" }}>
      {/* <CameraRig position={[-1, 19, -0.2]} where={[0, 19, 0.3]} /> */}
      <Freecam />
      {/* <Floor color="#eaffd1" position={[0, -1, 0]} /> */}
      <SceneFog color="#08002f" density={0.014} />
      <directionalLight 
          color="#2e3ba2"
          position={[0, 100, 100]} 
          intensity={5} 
          castShadow
          shadow-bias={-0.0005}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-130}
          shadow-camera-right={130}
          shadow-camera-top={130}
          shadow-camera-bottom={-130} />

      <ambientLight 
      color="#312944"
      intensity={1} />
      <KehanAbout position={[2, 17.9, 2.5]} />
      <WaterFloor />
      <ShadowCatcher />
      <WaterDepthIntersection />
      <WaterSparkles />
      <WaterWaveSimulation />
      {/* <SkyBox /> */}
      <SkyDome />
      <AboutModel position={[0, 0, 0]} />
      <AboutModelWaterInteraction position={[0, 0, 0]} />
{/* 
      <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
      </EffectComposer> */}

    </Canvas>
    </main>
  )
}
