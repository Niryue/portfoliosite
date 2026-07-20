"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import TexturePlane from "@/components/TexturePlane";
import VideoPlane from "@/components/VideoPlane";
import CameraRig from "@/components/CameraRig";
// import Freecam from "@/components/Freecam";
import Floor from "@/components/Floor";
import MovingPillar from "@/components/MovingPillar";
import SparklesParticle from "@/components/SparklesParticle";
import WhiteAnimPlane from "@/components/WhiteAnimPlane";
import HoverArea from "@/components/HoverArea";
import SceneFog from "@/components/SceneFog";

export default function Home() {
  const pillars = [
    [-8, -5, -5],
    [8, -5, -5],
    [-8, -5, -15],
    [8, -5, -15],
    [-8, -5, -25],
    [8, -5, -25],
  ];
  const [hovered, setHovered] = useState(null);
  const [whiteAnim, setWhiteAnim] = useState(false);

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <Canvas 
      shadows 
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ background: "#e0ecff" }}>
          <CameraRig />

          {/* <Freecam /> */}
          <SparklesParticle scale={3}
          count={35}
          />

          <VideoPlane 
          texturePath="/videos/mainpg.mp4" 
          position={[0, 0, 0]} 
          args={[4, 2.25]} 
          playbackRate={0.5} />

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

          <Floor />

          {pillars.map((pos, i) => (
            <MovingPillar key={i} position={pos} />
          ))}
          <SceneFog />
          <TexturePlane 
          texturePath="/images/Portfolio.png" 
          position={[0.47, 0.5, 0.1]} 
          scale={0.7} 
          opacity={1} 
          phase={0} 
          hovered={true}/>
          <TexturePlane 
          texturePath="/images/whiteblur.png" 
          position={[0.47, 0.5, 0.1]} 
          scale={0.7} 
          opacity={0.55} 
          phase={0} 
          hovered={hovered === "Portfolio"}/>
          <TexturePlane 
          texturePath="/images/Name.png" 
          position={[-0.7, 0.32, 0.1]} 
          scale={0.7} 
          opacity={1} 
          phase={Math.PI} 
          hovered={true}/>
          <TexturePlane 
          texturePath="/images/whiteblur.png" 
          position={[-0.7, 0.32, 0.1]} 
          scale={0.7} 
          opacity={0.55} 
          phase={Math.PI} 
          hovered={hovered === "Name"}/>

          <HoverArea modelPath="/models/portfolioHover.glb"
          modelName="Portfolio" 
          clickPath="/portfolio"
          position={[0.22, -0.11, 0.05]} 
          scale={0.56} 
          rotation={[0, Math.PI/2, 0.15]}
          setHovered={setHovered} 
          setWhiteAnim={setWhiteAnim} />

          <HoverArea modelPath="/models/nameHover.glb"
          modelName="Name" 
          clickPath="/about"
          position={[-0.59, -0.52, 0.05]} 
          scale={1.2} 
          rotation={[0, Math.PI/2, 0.05]}
          setHovered={setHovered} 
          setWhiteAnim={setWhiteAnim} />

          <WhiteAnimPlane whiteAnim={whiteAnim} setWhiteAnim={setWhiteAnim} />
      </Canvas>
    </main>
  );
}
