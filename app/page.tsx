"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture, useTexture, useGLTF, Sparkles, FlyControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import { EffectComposer, SelectiveBloom, Selection, Select } from "@react-three/postprocessing";
import { useRouter } from "next/navigation";
import TexturePlane from "@/components/TexturePlane";
import VideoPlane from "@/components/VideoPlane";
import CameraRig from "@/components/CameraRig";
import Freecam from "@/components/Freecam";
import Floor from "@/components/Floor";
import MovingPillar from "@/components/MovingPillar";

function WhiteAnimPlane({ whiteAnim, setWhiteAnim }) {
  const texture = useTexture("/images/white.png");
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (whiteAnim) {
      materialRef.current.opacity = Math.min(
        materialRef.current.opacity + delta / 1,
        1
      );
    }
  });
  return (
  <mesh
    scale={5}
    position={[0, 0, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        fog={false}
         toneMapped={false}
        color={new THREE.Color(10, 10, 10)}
        opacity={0}
      />

    </mesh>
  );
}


function HoverArea({ hovered, setHovered, whiteAnim, setWhiteAnim }) {
  const { scene: portfolioHover } = useGLTF("/models/portfolioHover.glb");
  const { scene: nameHover } = useGLTF("/models/nameHover.glb");
  const router = useRouter();

  function clickEventHandler(path) {

    setTimeout(() => {
      router.push(path);
    }, 1000); // Wait 2 seconds
  }

  useEffect(() => {
      [portfolioHover, nameHover].forEach((scene) => {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0;
          }
        });
      });
    }, [portfolioHover, nameHover]);

  return (
    <group>
      <primitive
        object={portfolioHover}
        onClick={() => {
          setWhiteAnim(true);
          clickEventHandler("/portfolio");
        }}
        onPointerOver={() => setHovered("Portfolio")}
        onPointerOut={() => setHovered(null)}
        position={[0.22, -0.11, 0.05]}
        scale={0.56}
        rotation={[0, Math.PI/2, 0.15]}
        rotation-order="ZYX"
      >
      </primitive>

      <primitive
        object={nameHover}
        onClick={() => {
          setWhiteAnim(true);
          clickEventHandler("/about");
        }}
        onPointerOver={() => setHovered("Name")}
        onPointerOut={() => setHovered(null)}
        position={[-0.59, -0.52, 0.05]}
        scale={1.2}
        rotation={[0, Math.PI/2, 0.05]}
        rotation-order="ZYX"
      >
      </primitive>
    </group>
  );
}


function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#e0ecff", 0.06);
  }, [scene]);

  return null;
}
// function Dust() { Sparkles particle
//   return (
//     <Sparkles
//       count={500}
//       size={10}
//       speed={0.2}
//       opacity={0.15}
//       color="yellow"
//       scale={[1, 0.5, 0.02]}
//       position={[0, 0, -0.1]}
//     />
//   );
// }



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

          <HoverArea hovered={hovered} setHovered={setHovered} whiteAnim={whiteAnim} setWhiteAnim={setWhiteAnim} />

          <WhiteAnimPlane whiteAnim={whiteAnim} setWhiteAnim={setWhiteAnim} />
      </Canvas>
    </main>
  );
}
