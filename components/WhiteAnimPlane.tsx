"use client";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

type WhiteAnimPlaneProps = {
  whiteAnim: boolean;
  setWhiteAnim: (value: boolean) => void;
};

export default function WhiteAnimPlane({ whiteAnim, setWhiteAnim }: WhiteAnimPlaneProps) {
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