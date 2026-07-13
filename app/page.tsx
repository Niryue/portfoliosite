"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture, useTexture, useGLTF, Sparkles, FlyControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import { EffectComposer, SelectiveBloom, Selection, Select } from "@react-three/postprocessing";
import { useRouter } from "next/navigation";


function VideoPlane() {
  const texture = useVideoTexture("/videos/mainpg.mp4");
  
  useEffect(() => {
    const video = texture.image;

    if (video instanceof HTMLVideoElement) {
      video.playbackRate = 0.5; // Half speed
    }
  }, [texture]);
  return (
    <mesh
      position={[0, 0, 0]}>
      <planeGeometry args={[4, 2.25]} />
      <meshBasicMaterial map={texture} toneMapped={false} fog={false}/>
    </mesh>
  );
}

function TexturePlane({ texturePath, position, scale, opacity, phase, hovered }) {
  const texture = useTexture(texturePath);
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % (Math.PI * 2);

  ref.current.position.y =
      position[1] + Math.sin(t * 2 + phase) * 0.03;
  });

  return (//make later a glow effect only appear when mouse hovers
    <mesh
      ref={ref}
      position={position}
      scale={scale}
    >
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        fog={false}
        color="white"
        opacity={hovered ? opacity : 0}
      />

    </mesh>
  );
}

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

function Floor() {
  return (
    <mesh
      position={[0, -5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
      color="#ffffff"
      roughness={0.5}/>
    </mesh>
  );
}

function Pillar({ position }) {
  const { scene } = useGLTF("/models/pillar.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        }
      });
    }, [clonedScene]);
  
  const ref = useRef();

  useFrame(() => {
    ref.current.position.z += 0.006;

    // Reset pillar when it goes past the camera
      if (ref.current.position.z > 5) {
        ref.current.position.z = -25;
      }
    });
   return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={[0.8, 1, 0.8]}
      position={position}
      rotation={[0, 0, 0]}
    />
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

// restricted camera movement based on mouse position
function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const intensity = 0.15;

    const targetX = pointer.x * intensity;
    const targetY = pointer.y * intensity;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.position.z = 3;

    camera.lookAt(0, 0, 0);
  });

  return null;
}
//free cam
// function Freecam() {
//   const { camera, gl } = useThree();

//   return (
//     <FlyControls
//       args={[camera, gl.domElement]}
//       movementSpeed={5}
//       rollSpeed={0.5}
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
          <VideoPlane />
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
            <Pillar key={i} position={pos} />
          ))}
          <SceneFog />
          <TexturePlane texturePath="/images/Portfolio.png" position={[0.47, 0.5, 0.1]} scale={0.7} opacity={1} phase={0} hovered={true}/>
          <TexturePlane texturePath="/images/whiteblur.png" position={[0.47, 0.5, 0.1]} scale={0.7} opacity={0.55} phase={0} hovered={hovered === "Portfolio"}/>
          <TexturePlane texturePath="/images/Name.png" position={[-0.7, 0.32, 0.1]} scale={0.7} opacity={1} phase={Math.PI} hovered={true}/>
          <TexturePlane texturePath="/images/whiteblur.png" position={[-0.7, 0.32, 0.1]} scale={0.7} opacity={0.55} phase={Math.PI} hovered={hovered === "Name"}/>
          <HoverArea hovered={hovered} setHovered={setHovered} whiteAnim={whiteAnim} setWhiteAnim={setWhiteAnim} />

          <WhiteAnimPlane whiteAnim={whiteAnim} setWhiteAnim={setWhiteAnim} />
      </Canvas>
    </main>
  );
}
