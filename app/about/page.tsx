"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Leva } from "leva";
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
import SkyDome from "@/components/skyDome/SkyDomeNightForSkyBox";
import GrassField from "@/components/grassField/index";
import { useState } from "react";
import Sparkles from "@/components/SparklesParticle";
import LightModel from "@/components/ImportModel";
import { Light } from "three";




export default function AboutPage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}> 
      <Canvas
          shadows 
          camera={{ position: [0, 0.5, 2.7], fov: 40 }}
          style={{ background: "#e0ecff" }}>
      <Leva hidden={true} />
      {/* <Freecam /> */}
      <CameraRig position={[-1, 19.2, -0.5]} where={[0, 19.2, 0]} />
      {/* <Floor color="#eaffd1" position={[0, -1, 0]} /> */}
      <SceneFog color="#08002f" density={0.014} />
      <directionalLight 
          color="#545d9e"
          position={[30, 100, 100]} 
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
      color="#222442"
      intensity={1} />
      <KehanAbout position={[2, 17.9, 2.5]} />
      <WaterFloor />
      <ShadowCatcher />
      <WaterDepthIntersection />
      <WaterSparkles />
      <WaterWaveSimulation />
      <SkyBox />
      <SkyDome />
      <AboutModel position={[0, 0, 0]} />
      <AboutModelWaterInteraction position={[0, 0, 0]} />
      <GrassField url="/models/GrassFieldPlanes.glb"/>
      <Sparkles
            count={100}
            size={1}
            speed={1}
            opacity={1}
            color={"#ffffff"}
            scale={[10, 10, 10]}
            position={[0, 19, 0]}
          />
      <LightModel position={[0, 0, 0]} path="/models/LightsModel.glb" />
      <pointLight
        position={[1.63, 18.53, 0.67]}
        color={"#f5ab00"}
        intensity={2.5}
        distance={15}
        shadow-bias={-0.005}
      />
      <pointLight
        position={[21.95, 20, 20.07]}
        color={"#ffffff"}
        intensity={12}
        distance={300}
        shadow-bias={-0.0005}
      />
      <pointLight
        position={[72.66, 10.72, 19.9]}
        color={"#ffffff"}
        intensity={12}
        distance={300}
        shadow-bias={-0.0005}
      />
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
