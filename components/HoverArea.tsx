"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


type HoverAreaProps = {
    modelPath: string;
    modelName: string;
    position: [number, number, number];
    scale: number;
    rotation: [number, number, number];
    hovered: string | null;
    setHovered: (value: string | null) => void;
    whiteAnim: boolean;
    setWhiteAnim: (value: boolean) => void;
};

// export default function HoverArea({ hovered, setHovered, whiteAnim, setWhiteAnim } : HoverAreaProps) {
//   const { scene: portfolioHover } = useGLTF("/models/portfolioHover.glb");
//   const { scene: nameHover } = useGLTF("/models/nameHover.glb");
//   const router = useRouter();

//   function clickEventHandler(path) {

//     setTimeout(() => {
//       router.push(path);
//     }, 1000); // Wait 2 seconds
//   }

//   useEffect(() => {
//       [portfolioHover, nameHover].forEach((scene) => {
//         scene.traverse((child) => {
//           if (child.isMesh) {
//             child.material.transparent = true;
//             child.material.opacity = 0;
//           }
//         });
//       });
//     }, [portfolioHover, nameHover]);

//   return (
//     <group>
//       <primitive
//         object={portfolioHover}
//         onClick={() => {
//           setWhiteAnim(true);
//           clickEventHandler("/portfolio");
//         }}
//         onPointerOver={() => setHovered("Portfolio")}
//         onPointerOut={() => setHovered(null)}
//         position={[0.22, -0.11, 0.05]}
//         scale={0.56}
//         rotation={[0, Math.PI/2, 0.15]}
//         rotation-order="ZYX"
//       >
//       </primitive>

//       <primitive
//         object={nameHover}
//         onClick={() => {
//           setWhiteAnim(true);
//           clickEventHandler("/about");
//         }}
//         onPointerOver={() => setHovered("Name")}
//         onPointerOut={() => setHovered(null)}
//         position={[-0.59, -0.52, 0.05]}
//         scale={1.2}
//         rotation={[0, Math.PI/2, 0.05]}
//         rotation-order="ZYX"
//       >
//       </primitive>
//     </group>
//   );
// }
export default function HoverArea({ modelPath, 
    modelName, 
    clickPath,
    position, 
    scale, 
    rotation, 
    setHovered, 
    setWhiteAnim } : HoverAreaProps) {
  const { scene } = useGLTF(modelPath);
  const router = useRouter();

  function clickEventHandler(clickPath) {

    setTimeout(() => {
      router.push(clickPath);
    }, 1000); // Wait 2 seconds
  }

  useEffect(() => {
      [scene].forEach((scene) => {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0;
          }
        });
      });
    }, [scene]);

  return (
      <primitive
        object={scene}
        onClick={() => {
          setWhiteAnim(true);
          clickEventHandler(clickPath);
        }}
        onPointerOver={() => setHovered(modelName)}
        onPointerOut={() => setHovered(null)}
        position={position}
        scale={scale}
        rotation={rotation}
        rotation-order="ZYX"
      >
      </primitive>
  );
}
// <HoverArea modelPath="/models/portfolioHover.glb"
// modelName="Portfolio" 
// clickPath="/portfolio"
// position={[0.22, -0.11, 0.05]} 
// scale={0.56} 
// rotation={[0, Math.PI/2, 0.15]}
// setHovered={setHovered} 
// setWhiteAnim={setWhiteAnim} />

// <HoverArea modelPath="/models/nameHover.glb"
// modelName="Name" 
// clickPath="/about"
// position={[-0.59, -0.52, 0.05]} 
// scale={1.2} 
// rotation={[0, Math.PI/2, 0.05]}
// setHovered={setHovered} 
// setWhiteAnim={setWhiteAnim} />